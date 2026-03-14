# taskio

Taskio is now a Next.js App Router full-stack application with a SQLite/Kysely backend and a three-pane productivity UI.

## What is implemented

- Next.js runtime for both UI and backend Route Handlers (`app/api/*`)
- Core screens: Today, Upcoming, Inbox, Project, History, Search, and Settings
- Persistent SQLite backend with Kysely repositories, transactions, and migrations
- FTS5-backed search across title, description, tags, project title, and attachment extraction text
- Item detail pane with field editing, markdown preview, tags, links, attachments, and event history
- Command palette (`cmdk`) plus keyboard shortcuts for navigation and core actions
- Local upload storage + file download route (`/api/files/[key]`)
- Standard envelope API responses (`{ ok, data }` / `{ ok, error }`) with Zod validation
- Split timeline APIs for playback performance: `/api/timeline/structure` + `/api/timeline/summary`
- DB-backed idempotency for retry-prone commands (`project.create`, `item.create`, `item.complete`, `attachment.upload`)
- Migration, integration, and API handler smoke tests

## Scripts

- `npm run dev` runs Next.js in development mode
- `npm run build` builds the Next.js app
- `npm run start` starts the production Next.js server
- `npm run bootstrap:db` initializes/updates local DB schema
- `npm run migrate:up` applies pending migrations
- `npm run migrate:down` rolls back the latest migration
- `npm run migrate:status` shows migration state
- `npm run reindex:fts` rebuilds full-text search documents from canonical tables
- `npm run test` runs Vitest
- `npm run test:integration` runs the single Playwright golden-path timeline integration test
- `npm run test:integration:headed` runs the same integration test in headed mode for local debugging
- `npm run verify` runs tests and production build

## Notes

- File binaries are stored on local disk under `.uploads/` by default.
- Set `DATABASE_URL` to control the SQLite file path (default: `./taskio.db`).
- Legacy `/api/timeline` has been removed; use only `/api/timeline/structure` and `/api/timeline/summary`.
- Integration tests start a real app server and use a dedicated DB at `tmp/integration/taskio.integration.sqlite`.
