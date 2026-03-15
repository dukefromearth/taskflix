# ADR-0001: Contract-First API and Generated Bindings (Full Cutover)

- Status: Accepted, Implemented
- Date: 2026-03-14
- Last Updated: 2026-03-15
- Deciders: Taskio maintainers
- Type: Architecture / API boundary
- Supersedes: None
- Superseded by: None

## 1) Objective

Maintain a single source of truth for API contracts so server and client behavior is authored, validated, and consumed through one contract system.

## 2) Context

Taskio optimizes for stable contracts, low change radius, and predictable transport behavior.

To keep that bar, the API boundary must guarantee:

- one runtime+type definition for every endpoint contract
- thin transport entrypoints with centralized validation/envelope/error handling
- typed client calls generated/composed from the same contracts
- conformance gates that prevent architecture drift

## 3) Constraints

- Keep current HTTP behavior and URL surface stable unless explicitly documented and approved.
- Keep `Next.js App Router` route filesystem compatibility.
- Preserve envelope contract semantics (`{ ok, data }` / `{ ok, error }`).
- Preserve current domain service boundaries (domain orchestration remains in `src/domain`).
- No compatibility shims, no dual-stack runtime, no temporary adapter layers left in tree after merge.

## 4) Decision

Adopt and enforce a contract-first architecture with generated/composed server and client bindings.

### 4.1 Canonical Contract Layer

Create `src/contracts` as the only place where endpoint contracts are defined.

Contract modules include:

- `src/contracts/primitives.ts`
- `src/contracts/entities.ts`
- `src/contracts/envelope.ts`
- `src/contracts/endpoints/*.ts`
- `src/contracts/registry.ts`

Each endpoint descriptor declares:

- method
- path template
- params schema
- query schema
- body schema
- success schema
- allowed error codes
- idempotency policy metadata (if applicable)

All request/response TypeScript types are inferred from runtime schemas (`z.infer`), never hand-duplicated.

### 4.2 Generated/Composed Server Bindings

Implement a server adapter that consumes endpoint descriptors and returns `Next.js` handlers with:

- request parsing
- schema validation
- standardized envelope mapping
- standardized error mapping
- idempotency policy enforcement hook

Route files remain as stable filesystem entrypoints but become thin exports around generated handlers.

### 4.3 Generated/Composed Client Bindings

Replace handwritten client request shapes with generated typed methods from `src/contracts/registry.ts`.

Client binding responsibilities:

- serialize params/query/body from contract
- deserialize envelope from contract
- surface typed success and typed domain errors

`src/ui/api/client.ts` becomes an adapter over generated bindings, not a contract authoring location.

### 4.4 Repository Invariants

- endpoint contracts are defined only under `src/contracts/**`
- route files in `app/api/**/route.ts` are thin bound exports only
- UI request input typing is contract-derived for contract-covered endpoints
- no compatibility alias layer exists for request/query schema ownership
- architecture conformance rules run as hard gates

## 5) Target Architecture

### Components

- Contract source: `src/contracts/**`
- Server transport adapter: `src/api/http/**`
- Route entrypoints: `app/api/**/route.ts` (thin binding only)
- UI transport adapter: `src/ui/api/**`
- Domain orchestration: `src/domain/taskio-service.ts`

### Interfaces

- `EndpointDescriptor`: canonical endpoint contract object
- `makeRouteHandler(descriptor, impl)`: binds contracts to Next handlers
- `createApiClient(registry, transport)`: binds contracts to typed FE calls

### Data Flow

1. FE invokes generated client method.
2. Client serializes request from descriptor and sends HTTP call.
3. Route entrypoint delegates to generated server binding.
4. Server binding validates request via descriptor schema.
5. Domain service implementation executes use case.
6. Server binding validates/normalizes response and returns envelope.
7. FE binding parses envelope and returns typed result.

## 6) Alternatives Considered

1. Keep current architecture and refactor route helpers only.
Rejected: reduces boilerplate but does not eliminate duplicated contract authoring between BE and FE.

2. Incremental dual-stack migration with compatibility adapters.
Rejected: leaves transitional complexity, violates requirement to end with no signs of prior architecture.

3. Proto/IDL-first stack now (non-TypeScript-native toolchain).
Rejected for now: strong long-term option, but high migration complexity for current single-repo velocity and team size.

## 7) Operating Baseline

1. `src/contracts` defines endpoint contracts, registry, ontology, and transport runtime helpers.
2. `app/api/**/route.ts` exports bound handlers only.
3. `src/ui/api/client.ts` composes typed calls from `contractClient`.
4. Request/query ontology for contract-covered endpoints lives under `src/contracts/ontology/*`.
5. Conformance tests gate route thinness, import boundaries, and transport usage.

## 8) Acceptance Criteria

- Every endpoint has exactly one contract descriptor in `src/contracts/endpoints`.
- No request/query schema exists under `app/api/**` route files.
- FE no longer defines request payload types for API methods manually.
- Contract types used by FE/BE are inferred from the same runtime schemas.
- All existing tests pass.
- New contract conformance tests pass for all endpoints.
- Repository contains no compatibility aliases or migration toggles for old API contract code.

## 9) Risks and Mitigations

Risk: Big-bang cutover increases merge risk.
Mitigation: Freeze API-surface changes during cutover branch and run full verification gates before merge.

Risk: Contract registry mistakes can break multiple endpoints at once.
Mitigation: Add per-endpoint contract tests and snapshot response-shape checks.

Risk: Over-centralization can hide endpoint-specific behavior.
Mitigation: Keep endpoint descriptors explicit and local by domain area (`endpoints/items.ts`, `endpoints/projects.ts`, etc.).

Risk: Build tooling complexity for generated bindings.
Mitigation: Start with composition-based generation in TypeScript runtime (no external codegen binary required).

## 10) Operational and Quality Gates

Required CI gates for this ADR:

- lint
- typecheck
- unit tests
- integration tests
- architecture discovery sanity (`npm run arch:verify`)
- contract conformance suite

## 11) Non-Goals

- Changing domain behavior or business rules.
- Introducing additional transport protocols.
- Changing persistence model or schema as part of this ADR.

## 12) Open Questions

None. This ADR intentionally chooses a decisive full cutover with no backward-compatibility surface.
