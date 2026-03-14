# Project Surface — `spec.md`

**Status:** Draft v1  
**Last updated:** 2026-03-14  
**Audience:** implementation, design, and maintenance  
**Scope:** full codebase specification for a small but extensible TypeScript application for managing simultaneous projects, interruptions, notes, links, files, and time-based work views.

---

## 1. Product summary

This application is a **personal project surface**: a calm, high-signal system for handling simultaneous projects, random interruptions, deadlines, notes, files, and links from one coherent interface.

It is **not** a generic team PM suite, a full document system, or a calendar clone.

The product should feel like:

- one place
- one domain language
- one underlying model
- many views over time

The application must support:

- multiple simultaneous projects
- fast capture of interruptions and new work
- hierarchical organization
- simple, hierarchical tags
- first-class links and file uploads
- markdown descriptions with excellent rendering
- explicit statuses
- clear Today / Upcoming / History / Project views
- graceful grouping, sorting, and ordering
- a pleasant API for both internal and external interaction
- strong visual design without excess chrome or complexity

---

## 2. Goals

### 2.1 Primary goals

1. **Make work legible at a glance.** The user should be able to answer: what matters now, what is due soon, what just arrived, what belongs to which project, and what changed recently.
2. **Unify action and context.** Tasks, notes, links, and files should feel like parts of the same system instead of separate apps duct-taped together.
3. **Treat time as a first-class concern.** Today, upcoming work, due dates, schedule dates, and history must all be native, not bolted on.
4. **Support interruptions explicitly.** New demands like “do this now” and “do this by Friday” should be easy to capture, triage, and compare against the rest of the workload.
5. **Keep the system small.** The architecture should remain understandable for a single developer and not require a heavy backend fleet.
6. **Provide a delightful TypeScript API.** The API should be command-oriented, typed, and expressive.
7. **Make design a feature.** The UI should be elegant, digestible, and stable enough to become an everyday operating surface.

### 2.2 Secondary goals

1. Preserve meaningful history through an event log.
2. Keep local development friction low.
3. Support later expansion to hosted mode without rewriting the domain core.
4. Allow automation and future CLI or browser-extension flows via the same domain contracts.

---

## 3. Non-goals (v1)

The following are explicitly out of scope for v1:

1. Multi-user collaboration or permissions.
2. Real-time shared editing.
3. Complex recurring tasks and calendar synchronization.
4. Rich-text editing beyond Markdown.
5. Server-side fetching of arbitrary remote link metadata.
6. AI-driven workflow automation as a core product dependency.
7. Full offline-first sync across multiple devices.
8. Enterprise-grade file processing pipelines.
9. Native mobile apps.
10. Gantt charts, sprint planning, and complex resource management.

These may be added later, but the v1 codebase must not depend on them.

---

## 4. Product principles

1. **One domain model, many lenses.** The same underlying objects power Today, Upcoming, Project, History, Search, and Saved Views.
2. **Commands over patches.** Mutations should represent intent: `capture`, `schedule`, `block`, `complete`, `tag`, `link`, not just arbitrary field mutation.
3. **Calm density.** The interface should show a lot without feeling noisy.
4. **Form before color.** Status and urgency should still be understandable in grayscale.
5. **Explicit time semantics.** `scheduledAt` and `dueAt` are different things and must remain different.
6. **Markdown as storage, HTML as projection.** Descriptions are stored as Markdown; rendering is safe and stylized.
7. **Accept any file type; preview some file types.** Storage is universal. Rich previews are selective.
8. **Single-user first, extensible later.** The code should not assume future collaboration, but it should not make future collaboration impossible.
9. **Stable layout.** Navigation and working surfaces should not jump around.
10. **Keep the weirdness boxed.** File processing, search indexing, and layout animation should be modular so complexity stays fenced off.

---

## 5. Primary workflows

### 5.1 Capture interruption

1. User triggers quick capture.
2. User enters title, optional project, optional due/schedule date, optional requester, optional link.
3. New item lands in `inbox` or `active` depending on capture mode.
4. Item appears immediately in Today if it is urgent, due, or scheduled for the current day.

### 5.2 Triage inbox

1. User opens Today or Inbox.
2. User reviews newly captured items.
3. User assigns project, tags, status, date, and optional parent item.
4. User reorders items within project or inbox scope.

### 5.3 Work from Today

1. User opens Today.
2. User sees sections such as Needs Triage, Overdue, Today, and In Progress.
3. User completes, schedules, blocks, or defers items inline.
4. User opens item details in right pane without losing context.

### 5.4 Project review

1. User opens a project view.
2. User sees project overview, grouped items, linked notes, and recent history.
3. User manually orders items and collapses or expands hierarchy.
4. User filters by tags, status, kind, or due/scheduled time.

### 5.5 Weekly look-ahead

1. User opens Upcoming.
2. User sees tomorrow, this week, next week, and later buckets.
3. User reschedules, prioritizes, or drags work between buckets.

### 5.6 Historical review

1. User opens History.
2. User sees completed work and meaningful changes over time.
3. User can inspect item-level event history or broader timeline slices.

### 5.7 Reference gathering

1. User adds links and uploads files to an item.
2. Files are stored immediately.
3. Supported file types receive previews and extracted text when available.
4. Search can later surface items based on descriptions, tags, titles, and extracted attachment text.

---

## 6. Domain model

The product has a small set of domain entities. The core distinction is:

- **Projects**: long-lived containers for work
- **Items**: actionable or contextual units inside or outside projects
- **Tags**: cross-cutting classification
- **Links**: external references attached to items
- **Attachments**: uploaded files attached to items
- **Events**: append-only activity/history records
- **Saved Views**: reusable filters/groupings/sorts
- **Preferences**: user-level display and behavior settings

### 6.1 Entity overview

#### 6.1.1 Project

A Project is a durable container representing a stream of work.

Fields:

- `id`
- `slug`
- `title`
- `descriptionMd`
- `status`
- `colorToken`
- `icon`
- `orderKey`
- `createdAt`
- `updatedAt`
- `archivedAt?`
- `deletedAt?`

Project status:

- `active`
- `paused`
- `done`
- `archived`

#### 6.1.2 Item

An Item is the primary unit of work or context.

Kinds:

- `task`
- `note`
- `milestone`

Statuses:

- `inbox`
- `active`
- `blocked`
- `waiting`
- `done`
- `canceled`

Fields:

- `id`
- `projectId?`
- `parentItemId?`
- `kind`
- `title`
- `descriptionMd`
- `status`
- `priority` (`0` none, `1` low, `2` normal, `3` high, `4` urgent)
- `orderKey`
- `scheduledAt?`
- `dueAt?`
- `completedAt?`
- `snoozedUntil?`
- `requestedBy?`
- `isInterruption`
- `sourceKind` (`manual`, `api`, `import`, `share`, `email`, `link`, `upload`)
- `sourceRef?`
- `createdAt`
- `updatedAt`
- `deletedAt?`

#### 6.1.3 Tag

Tags are cross-cutting labels stored as normalized path-like names.

Examples:

- `work/research`
- `people/alex`
- `theme/api`
- `client/acme`

Fields:

- `id`
- `name`
- `displayName`
- `createdAt`

Rules:

- stored normalized to lowercase
- slash-separated path segments
- no leading/trailing slash
- segments match `[a-z0-9-]+`

#### 6.1.4 Link

Links are attached to items as typed external references.

Fields:

- `id`
- `itemId`
- `url`
- `label?`
- `kind?` (e.g. `github`, `doc`, `ticket`, `chat`, `calendar`, `generic`)
- `createdAt`

#### 6.1.5 Attachment

Attachments represent uploaded files.

Fields:

- `id`
- `itemId`
- `storageKey`
- `originalName`
- `mimeType`
- `sizeBytes`
- `sha256`
- `previewStatus`
- `textExtractionStatus`
- `createdAt`
- `deletedAt?`

#### 6.1.6 AttachmentContent

Stores extracted text for searchable file types.

Fields:

- `attachmentId`
- `textContent`
- `contentHash`
- `extractedAt`

#### 6.1.7 ItemEvent

Append-only event log describing meaningful mutations.

Fields:

- `id`
- `itemId`
- `commandId`
- `eventType`
- `payloadJson`
- `occurredAt`

#### 6.1.8 SavedView

Reusable filtered/grouped/sorted query configuration.

Fields:

- `id`
- `name`
- `icon`
- `queryJson`
- `orderKey`
- `createdAt`
- `updatedAt`
- `deletedAt?`

#### 6.1.9 UserPreference

Single-user configuration.

Fields:

- `id`
- `timezone`
- `theme` (`system`, `light`, `dark`)
- `density` (`comfortable`, `compact`)
- `weekStartsOn` (`0`–`6`)
- `defaultProjectId?`
- `todayShowsDone` (`boolean`)
- `reduceMotion` (`boolean`)
- `createdAt`
- `updatedAt`

---

## 7. Time semantics

Time is a core design axis. The following timestamps have distinct meanings and must never be collapsed into one another.

### 7.1 Timestamp definitions

- `createdAt`: when the item entered the system
- `scheduledAt`: when the user intends to see or work on the item
- `dueAt`: external or self-imposed commitment deadline
- `completedAt`: when the item was finished
- `snoozedUntil`: hide item from Today/Inbox until this time unless overdue

### 7.2 Interpretation rules

1. An item can have neither `scheduledAt` nor `dueAt`.
2. `scheduledAt` does not imply hard commitment.
3. `dueAt` implies commitment pressure.
4. `completedAt` is set only when status becomes `done`.
5. `completedAt` is cleared if an item is reopened.
6. `snoozedUntil` suppresses proactive surfacing but must not hide truly overdue work.

### 7.3 Derived time states

Derived states are computed, not stored.

- `isOverdue`: `dueAt < now` and status not terminal
- `isDueToday`: `dueAt` in current local day
- `isScheduledToday`: `scheduledAt` in current local day
- `isUpcoming`: due or scheduled after today within configured window
- `isStale`: active item with no update for configurable threshold (default 14 days)

### 7.4 Timezone strategy

- Timestamps are stored in UTC as integer milliseconds since epoch.
- View calculations are made in the user-configured timezone.
- Day-bucket boundaries are computed server-side for consistency.

---

## 8. Status model and transitions

Statuses are intentionally compact.

### 8.1 Item statuses

- `inbox`: captured but not yet triaged
- `active`: ready to work
- `blocked`: cannot proceed due to dependency or obstacle
- `waiting`: handed off or pending response
- `done`: finished
- `canceled`: explicitly abandoned

### 8.2 Terminal states

Terminal states:

- `done`
- `canceled`

Terminal items remain searchable and appear in History. They do not appear in active Today/Upcoming views unless explicitly included.

### 8.3 Allowed transitions

Allowed status transitions:

- `inbox -> active | blocked | waiting | done | canceled`
- `active -> blocked | waiting | done | canceled | inbox`
- `blocked -> active | waiting | done | canceled`
- `waiting -> active | blocked | done | canceled`
- `done -> active`
- `canceled -> active`

Rules:

- Transition to `done` sets `completedAt = now`.
- Transition from `done` clears `completedAt`.
- `canceled` does not set `completedAt`.
- Inline status changes must emit events.

---

## 9. Hierarchy and grouping

### 9.1 Project hierarchy

Projects are top-level containers.

Items may:

- belong to a project, or
- remain global / unscoped

### 9.2 Item hierarchy

Items may have `parentItemId` for nesting.

Rules:

1. Hierarchy depth target is **3 useful levels**, though technically unbounded.
2. Deep nesting should be discouraged in the UI.
3. Parent-child relations must remain within a single project or both be unscoped.
4. Circular references are forbidden.

### 9.3 Grouping modes

Supported grouping modes:

- none
- by project
- by status
- by kind
- by parent
- by due day
- by scheduled day
- by tag

Not all grouping modes must exist in every screen. The UI should prefer a small set of meaningful groups per screen.

---

## 10. Ordering model

Manual ordering is required, but it should not require full-list renumbering after every drag.

### 10.1 Canonical ordering

Each item and project stores an `orderKey` string.

Properties:

- lexicographically sortable
- generated between neighboring keys when reordering
- stable across refreshes
- allows sparse insertions

### 10.2 Ordering scope

Manual ordering applies in these scopes:

- projects list
- inbox list
- within a project among sibling items
- within parent-child groups
- within saved views only if view sort mode is `manual` and scope is unambiguous

### 10.3 View-specific sorting

Time-centric views do not primarily follow manual order.

Default sorts:

- Today: urgency, due time, scheduled time, priority, manual order
- Upcoming: date bucket, earliest relevant timestamp, priority, manual order
- Project: manual order by default
- History: newest event first
- Search: relevance, then recency

---

## 11. Functional specification

### 11.1 Capture

#### 11.1.1 Quick capture

Quick capture is the fastest entry path and must be available from:

- command palette
- keyboard shortcut
- header action
- API

Input fields:

- title (required)
- project (optional)
- tags (optional)
- due date (optional)
- schedule date (optional)
- requester (optional)
- mark as interruption (optional)
- link URL (optional)

Behavior:

- default status: `inbox`
- if due today or marked urgent, item also appears in Today immediately
- capture should complete in one submit without requiring a secondary form

#### 11.1.2 Full create/edit

The full editor supports:

- title
- description markdown
- kind
- status
- project
- parent item
- tags
- priority
- schedule / due / snooze dates
- requester
- links
- attachments

### 11.2 Projects

Project capabilities:

- create/edit/archive projects
- order projects manually
- set project status
- project description in Markdown
- project color/icon token
- project page with grouped items and recent history

Archived projects:

- hidden from default navigation
- preserved in search/history
- restorable

### 11.3 Tags

Tag capabilities:

- add/remove tags from items
- filter by one or many tags
- show path structure in a tag browser
- create tags on demand
- normalize tags automatically

Tag semantics:

- path strings are the source of truth
- no separate nested tag tree UI in v1
- tag rename is supported and cascades to usages

### 11.4 Links

Links capabilities:

- attach one or more URLs to an item
- optional custom label
- display hostname and path summary
- open in new tab
- copy to clipboard

Security:

- only allow `http`, `https`, and `mailto`
- reject `javascript:` and other unsafe schemes

### 11.5 Attachments / uploads

Requirements:

- accept any file type for storage
- preview and text extraction only for supported types
- show file metadata uniformly
- allow multiple attachments per item
- search extracted text when available

Supported preview types in v1:

- image
- text/plain
- text/markdown
- application/json
- text/csv
- application/pdf (viewer and extraction best effort)

Unsupported types:

- generic file card only
- no inline execution

### 11.6 Markdown descriptions

Markdown requirements:

- GitHub-flavored Markdown support
- links, lists, tables, code fences, blockquotes
- safe rendering
- beautiful typography
- live preview or preview tab
- autosizing editor

v1 editor approach:

- textarea-based editor with Markdown toolbar helpers
- preview pane/tab
- no rich-text WYSIWYG editing in v1

### 11.7 Saved views

Saved Views let the user store common slices of the data.

Example saved views:

- `Work / This Week`
- `Personal / Waiting`
- `Urgent / Research`
- `Blocked / Client ACME`

Saved view supports:

- filters
- grouping
- sorting
- density preference override (optional)

### 11.8 Search

Search requirements:

- title search
- description search
- tag search
- project title search
- extracted attachment text search
- filter by status, tag, project, kind, date window

Search result item should show:

- title
- snippet / highlighted match
- project
- status
- key dates
- attachment/link indicators

### 11.9 History

History requirements:

- item-level event timeline
- global history screen
- completion history
- status change history
- due/schedule change history
- reorder event records optional in aggregate but not mandatory for every micro-move

### 11.10 Command palette

The command palette is a first-class interaction layer.

Capabilities:

- navigate to screens
- create item/project
- schedule or reschedule selected item
- change status
- tag item
- search items/projects/tags
- open recent items

The command palette should be powered by the same command registry as the programmatic API.

---

## 12. Screen specification

### 12.1 Layout model

Desktop layout is a stable three-part workspace:

1. **Left rail**: navigation and saved views
2. **Main pane**: list/timeline working surface
3. **Right pane**: item details / editor / history

Tablet:

- left rail collapsible
- detail pane becomes drawer or overlay

Mobile:

- stacked navigation
- list as primary surface
- detail opens in sheet/page
- drag reorder is optional or simplified

### 12.2 Navigation

Left rail sections:

- Today
- Upcoming
- Inbox
- History
- Projects
- Saved Views
- Tags
- Search trigger
- Settings

Principles:

- navigation labels are short and stable
- counts are subdued, not shouting
- current context is always obvious

### 12.3 Today view

Today is the default home screen.

Sections:

1. `Needs Triage`
2. `Overdue`
3. `Today`
4. `In Progress`

Section definitions:

- **Needs Triage**: `status = inbox` and not snoozed beyond today
- **Overdue**: due date before local now, non-terminal
- **Today**: scheduled today or due today, non-terminal, not already in Overdue
- **In Progress**: active items with no relevant today timestamp

Visual cues:

- overdue items have strongest urgency treatment
- due vs scheduled are visually distinct
- requester/interruption marker is shown when present

### 12.4 Upcoming view

Buckets:

- Tomorrow
- This Week
- Next Week
- Later

Behavior:

- items appear by nearest relevant timestamp (`scheduledAt` if present, else `dueAt`)
- drag/drop between buckets updates `scheduledAt`
- rescheduling must be easy from inline controls

### 12.5 Inbox view

Purpose:

- dedicated triage surface for newly captured or unsorted work

Behavior:

- newest first by default
- fast inline controls to assign project, tags, due date, or activate item
- can switch to manual ordering mode

### 12.6 Project view

Project screen elements:

- project header with title, status, description, counts
- filter bar
- grouped list of items
- project-level recent history summary
- optional hierarchy collapse/expand

Default grouping:

- by parent / hierarchy

Alternative groupings:

- by status
- by due day
- by tag

### 12.7 History view

History is not a debug log. It is a meaningful timeline.

Default groups:

- Today
- Yesterday
- Earlier this week
- Earlier this month

Event cards should summarize:

- what changed
- item title
- project context
- relevant old/new values when helpful

### 12.8 Search view

Search UI includes:

- search field
- filter tokens
- results list
- optional snippet preview

Search should feel like navigation, not raw database dump.

### 12.9 Item detail pane

The detail pane supports:

- title
- status
- project and parent
- tags
- priority
- schedule/due/snooze dates
- requester/interruption marker
- Markdown description
- link list
- attachment list
- recent history

Behavior:

- edits autosave or save explicitly depending on field type
- switching items should be fast and preserve scroll position appropriately
- pane should not reflow the whole app excessively

### 12.10 Settings

Minimal settings page:

- timezone
- theme
- density
- reduce motion
- default project
- upload limits visibility
- export/import actions

---

## 13. Visual design specification

### 13.1 Tone

The UI should feel:

- quiet
- precise
- literate
- stable
- modern but not trendy

Avoid:

- loud color systems
- excessive rounded-card dashboards
- ornamental animation
- hidden controls disguised as “minimalism”

### 13.2 Layout and spacing

Rules:

- generous whitespace around major regions
- compact spacing within dense lists
- stable panel widths on desktop
- list rows align to a clear vertical rhythm

Target spacing tokens:

- `4, 8, 12, 16, 20, 24, 32`

### 13.3 Typography

Guidelines:

- use a clean sans-serif UI face
- use a monospaced face only for timestamps, code, and machine-like fields
- readable line height in detail pane
- subtle but strong hierarchy

Suggested scale:

- display: 28/32
- h1: 22/28
- h2: 18/24
- body: 14/22
- meta: 12/16

### 13.4 Color system

Use tokenized semantic colors, not raw hex scattered through the app.

Core tokens:

- `bg`
- `surface`
- `surfaceElevated`
- `borderMuted`
- `borderStrong`
- `textPrimary`
- `textSecondary`
- `textMuted`
- `accent`
- `danger`
- `warning`
- `success`
- `focusRing`

Status treatment should combine:

- iconography
- contrast
- optional accent border / chip tone

Color alone must not encode meaning.

### 13.5 Density modes

Two density modes:

- `comfortable`
- `compact`

Density affects:

- row height
- padding
- visible metadata count
- detail pane spacing

### 13.6 Motion

Motion is allowed only when it clarifies spatial change.

Allowed uses:

- detail pane open/close
- list reordering
- group expand/collapse
- selection transitions
- drag overlay

Forbidden uses:

- decorative page transitions
- floating cards
- long, slow easing on routine actions

Reduce-motion preference must be honored.

### 13.7 Component inventory

The design system should center on a small reusable set:

- app shell
- nav item
- filter token
- group header
- item row
- item card (optional for certain views)
- status chip
- tag pill
- date badge
- priority dot/chip
- link row
- attachment card
- markdown body
- empty state
- detail pane header
- command palette item
- search result row

---

## 14. Accessibility requirements

1. Full keyboard navigation for primary screens.
2. Visible focus rings.
3. Semantic landmarks for major layout regions.
4. Sufficient contrast in both light and dark modes.
5. No status semantics encoded by color alone.
6. Screen-reader labels for icon-only controls.
7. Drag/drop must have non-pointer alternatives for key actions.
8. Reduced-motion preference must remove non-essential transitions.
9. Markdown-rendered content must preserve semantic structure.
10. Tables in Markdown must remain navigable.

---

## 15. Technical architecture

### 15.1 High-level architecture

The product is a **single Next.js application** with clear boundaries.

Layers:

1. **App shell / routes**: Next.js app router
2. **UI layer**: React components and feature views
3. **Client state layer**: local view state and server-state cache
4. **Contracts layer**: Zod schemas and DTOs
5. **Domain layer**: commands, query services, invariants
6. **Persistence layer**: Drizzle ORM + SQLite/libSQL
7. **Storage layer**: file storage adapter
8. **Search layer**: SQLite FTS + extracted attachment text

### 15.2 Architectural principles

1. Domain logic must not live inside React components.
2. Client components do not access the database directly.
3. Route handlers are thin adapters over domain services.
4. Initial page load should favor server-rendered data where appropriate.
5. Contracts are defined once and reused.
6. File processing is modular and isolated from core CRUD.

### 15.3 Rendering model

- Server components render shells and initial lists when possible.
- Client components handle drag/drop, inline editing, command palette, and interactive filters.
- Server-side data hydration is used to reduce spinner soup.

### 15.4 State model

Use three categories of state:

1. **Persistent domain state**: database-backed entities
2. **Server state cache**: fetched query data and invalidation rules
3. **Ephemeral UI state**: selected item, panel visibility, draft filter state, drag state

Rules:

- persistent data belongs on the server
- server cache belongs to query library
- ephemeral layout state belongs to a tiny client store

---

## 16. Proposed technology choices

The following choices are deliberate and should remain stable unless a strong reason appears.

### 16.1 Core stack

- TypeScript
- React
- Next.js App Router
- Route Handlers for HTTP API surface
- Drizzle ORM
- SQLite in development/local mode
- libSQL/Turso-compatible deployment path for hosted mode

### 16.2 Validation and contracts

- Zod for input/output contracts
- shared DTO schemas in a contracts module
- optional JSON Schema / OpenAPI generation from contracts

### 16.3 State and data fetching

- TanStack Query for server-state caching and mutations
- minimal Zustand store for ephemeral UI state only

### 16.4 Styling and components

- Tailwind CSS
- shadcn/ui as code-distributed component foundation
- Radix primitives for accessibility-sensitive controls
- class-variance-authority or equivalent for variant management
- tailwind-merge and clsx-style utility composition

### 16.5 Interaction and motion

- `cmdk` for command palette
- `dnd-kit` for drag, drop, sort, and reorder
- Motion for layout-aware micro-interactions

### 16.6 Markdown and uploads

- `react-markdown` for rendering
- `remark-gfm` for GFM features
- `rehype-sanitize` or equivalent safe rendering policy
- `react-dropzone` for client file selection/drag-drop

### 16.7 Time and utilities

- `date-fns` for date math
- a small internal time utility layer to avoid leaking library-specific logic everywhere

### 16.8 Testing and quality

- Vitest for unit/integration tests
- Playwright for end-to-end tests
- ESLint + TypeScript strict mode
- Prettier or Biome formatting; choose one and standardize globally

---

## 17. Repository structure

The repository should stay single-app and modular, not monorepo-first.

```text
.
├─ app/
│  ├─ (shell)/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx                # redirect to /today
│  │  ├─ today/page.tsx
│  │  ├─ upcoming/page.tsx
│  │  ├─ inbox/page.tsx
│  │  ├─ history/page.tsx
│  │  ├─ search/page.tsx
│  │  ├─ project/[slug]/page.tsx
│  │  ├─ tag/[tag]/page.tsx
│  │  └─ settings/page.tsx
│  ├─ api/
│  │  ├─ projects/route.ts
│  │  ├─ projects/[projectId]/route.ts
│  │  ├─ items/route.ts
│  │  ├─ items/[itemId]/route.ts
│  │  ├─ items/[itemId]/complete/route.ts
│  │  ├─ items/[itemId]/schedule/route.ts
│  │  ├─ items/[itemId]/status/route.ts
│  │  ├─ items/[itemId]/tags/route.ts
│  │  ├─ items/[itemId]/links/route.ts
│  │  ├─ items/[itemId]/attachments/route.ts
│  │  ├─ items/reorder/route.ts
│  │  ├─ views/[name]/route.ts
│  │  ├─ saved-views/route.ts
│  │  ├─ search/route.ts
│  │  ├─ history/route.ts
│  │  └─ uploads/route.ts
│  └─ globals.css
├─ src/
│  ├─ contracts/
│  │  ├─ common.ts
│  │  ├─ projects.ts
│  │  ├─ items.ts
│  │  ├─ views.ts
│  │  ├─ history.ts
│  │  └─ uploads.ts
│  ├─ features/
│  │  ├─ projects/
│  │  │  ├─ domain/
│  │  │  ├─ server/
│  │  │  ├─ ui/
│  │  │  └─ queries/
│  │  ├─ items/
│  │  │  ├─ domain/
│  │  │  ├─ server/
│  │  │  ├─ ui/
│  │  │  └─ queries/
│  │  ├─ search/
│  │  ├─ history/
│  │  ├─ uploads/
│  │  └─ views/
│  ├─ lib/
│  │  ├─ db/
│  │  │  ├─ client.ts
│  │  │  ├─ schema.ts
│  │  │  ├─ migrations/
│  │  │  └─ fts.ts
│  │  ├─ storage/
│  │  ├─ markdown/
│  │  ├─ time/
│  │  ├─ ids/
│  │  ├─ events/
│  │  ├─ query-client/
│  │  ├─ telemetry/
│  │  └─ utils/
│  ├─ components/
│  │  ├─ shell/
│  │  ├─ items/
│  │  ├─ forms/
│  │  ├─ markdown/
│  │  └─ primitives/
│  └─ styles/
├─ public/
├─ scripts/
│  ├─ seed.ts
│  ├─ backfill-fts.ts
│  └─ export-data.ts
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ e2e/
├─ drizzle.config.ts
├─ package.json
├─ tsconfig.json
└─ README.md
```

### 17.1 Module rules

1. `app/` is routing and page composition only.
2. `src/contracts/` holds request/response and query schema definitions.
3. `src/features/*/domain` holds command handlers, invariants, and read-model composition.
4. `src/features/*/server` holds route adapters, repositories, and feature services.
5. `src/features/*/ui` holds feature-specific components.
6. `src/lib/` holds cross-feature utilities.
7. No cyclic imports between features.

---

## 18. Database schema

SQLite is the default database. The schema should be migration-driven.

### 18.1 ID strategy

Use string IDs with sortable generation semantics (e.g. ULID-style).

Rationale:

- stable across offline-ish local creation
- easy to expose in URLs and logs
- sortable creation order

### 18.2 Tables

#### 18.2.1 `projects`

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description_md TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL,
  color_token TEXT,
  icon TEXT,
  order_key TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  archived_at INTEGER,
  deleted_at INTEGER
);
```

Indexes:

- `idx_projects_status`
- `idx_projects_order_key`
- `idx_projects_deleted_at`

#### 18.2.2 `items`

```sql
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  parent_item_id TEXT REFERENCES items(id),
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  description_md TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 2,
  order_key TEXT NOT NULL,
  scheduled_at INTEGER,
  due_at INTEGER,
  completed_at INTEGER,
  snoozed_until INTEGER,
  requested_by TEXT,
  is_interruption INTEGER NOT NULL DEFAULT 0,
  source_kind TEXT NOT NULL DEFAULT 'manual',
  source_ref TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  CHECK (priority BETWEEN 0 AND 4)
);
```

Indexes:

- `idx_items_project_id`
- `idx_items_parent_item_id`
- `idx_items_status`
- `idx_items_due_at`
- `idx_items_scheduled_at`
- `idx_items_updated_at`
- `idx_items_deleted_at`
- `idx_items_project_parent_order` on `(project_id, parent_item_id, order_key)`

#### 18.2.3 `tags`

```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
```

#### 18.2.4 `item_tags`

```sql
CREATE TABLE item_tags (
  item_id TEXT NOT NULL REFERENCES items(id),
  tag_id TEXT NOT NULL REFERENCES tags(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (item_id, tag_id)
);
```

Indexes:

- `idx_item_tags_tag_id`

#### 18.2.5 `item_links`

```sql
CREATE TABLE item_links (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES items(id),
  url TEXT NOT NULL,
  label TEXT,
  kind TEXT,
  created_at INTEGER NOT NULL
);
```

#### 18.2.6 `attachments`

```sql
CREATE TABLE attachments (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES items(id),
  storage_key TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  preview_status TEXT NOT NULL DEFAULT 'none',
  text_extraction_status TEXT NOT NULL DEFAULT 'none',
  created_at INTEGER NOT NULL,
  deleted_at INTEGER
);
```

Indexes:

- `idx_attachments_item_id`
- `idx_attachments_deleted_at`

#### 18.2.7 `attachment_contents`

```sql
CREATE TABLE attachment_contents (
  attachment_id TEXT PRIMARY KEY REFERENCES attachments(id),
  text_content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  extracted_at INTEGER NOT NULL
);
```

#### 18.2.8 `item_events`

```sql
CREATE TABLE item_events (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES items(id),
  command_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  occurred_at INTEGER NOT NULL
);
```

Indexes:

- `idx_item_events_item_id_occurred_at`
- `idx_item_events_occurred_at`

#### 18.2.9 `saved_views`

```sql
CREATE TABLE saved_views (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  query_json TEXT NOT NULL,
  order_key TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);
```

#### 18.2.10 `user_preferences`

```sql
CREATE TABLE user_preferences (
  id TEXT PRIMARY KEY,
  timezone TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'system',
  density TEXT NOT NULL DEFAULT 'comfortable',
  week_starts_on INTEGER NOT NULL DEFAULT 1,
  default_project_id TEXT REFERENCES projects(id),
  today_shows_done INTEGER NOT NULL DEFAULT 0,
  reduce_motion INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### 18.3 Full-text search

Use SQLite FTS5.

Recommended indexed sources:

- item title
- item description markdown (raw or lightly normalized)
- project title
- tag names
- extracted attachment text

Possible FTS table:

```sql
CREATE VIRTUAL TABLE items_fts USING fts5(
  item_id UNINDEXED,
  title,
  description,
  project_title,
  tag_names,
  attachment_text,
  content=''
);
```

Index maintenance:

- app-level updates on item/tag/project/attachment-content mutation
- backfill script for rebuilds

---

## 19. Contracts and schema definitions

All external and internal request/response DTOs should be defined with Zod.

### 19.1 Rules

1. Every route handler validates input with Zod.
2. Every route handler returns a typed response envelope.
3. UI forms should use the same schemas where practical.
4. Domain layer receives validated input only.

### 19.2 Response envelope

All API responses should follow a small standard envelope:

```ts
export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiError = {
  ok: false;
  error: {
    code:
      | 'BAD_REQUEST'
      | 'NOT_FOUND'
      | 'CONFLICT'
      | 'VALIDATION_ERROR'
      | 'UNSUPPORTED_MEDIA_TYPE'
      | 'PAYLOAD_TOO_LARGE'
      | 'INTERNAL_ERROR';
    message: string;
    details?: unknown;
  };
};
```

### 19.3 Core contract examples

#### Create item

```ts
const CreateItemSchema = z.object({
  title: z.string().min(1).max(240),
  kind: z.enum(['task', 'note', 'milestone']).default('task'),
  projectId: z.string().optional(),
  parentItemId: z.string().optional(),
  descriptionMd: z.string().default(''),
  status: z.enum(['inbox', 'active', 'blocked', 'waiting', 'done', 'canceled']).default('inbox'),
  priority: z.number().int().min(0).max(4).default(2),
  scheduledAt: z.number().int().optional(),
  dueAt: z.number().int().optional(),
  requestedBy: z.string().max(120).optional(),
  isInterruption: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  links: z.array(z.object({
    url: z.string().url(),
    label: z.string().optional(),
    kind: z.string().optional(),
  })).default([]),
});
```

#### Query items

```ts
const ItemQuerySchema = z.object({
  text: z.string().optional(),
  statuses: z.array(z.enum(['inbox', 'active', 'blocked', 'waiting', 'done', 'canceled'])).optional(),
  kinds: z.array(z.enum(['task', 'note', 'milestone'])).optional(),
  projectIds: z.array(z.string()).optional(),
  tagAny: z.array(z.string()).optional(),
  tagAll: z.array(z.string()).optional(),
  dueFrom: z.number().int().optional(),
  dueTo: z.number().int().optional(),
  scheduledFrom: z.number().int().optional(),
  scheduledTo: z.number().int().optional(),
  includeDone: z.boolean().default(false),
  groupBy: z.enum(['none', 'project', 'status', 'kind', 'parent', 'dueDay', 'scheduledDay', 'tag']).default('none'),
  sortBy: z.enum(['manual', 'createdAt', 'updatedAt', 'dueAt', 'scheduledAt', 'priority', 'title']).default('manual'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
  limit: z.number().int().min(1).max(500).default(100),
  cursor: z.string().optional(),
});
```

---

## 20. Domain API specification

The domain API is the primary mental model. It should read like work management, not database administration.

### 20.1 API shape

Use semantic commands and clear read-model queries.

```ts
interface WorkApi {
  capture(input: CaptureInput): Promise<ItemDto>;
  updateItem(itemId: string, input: UpdateItemInput): Promise<ItemDto>;

  schedule(itemId: string, input: ScheduleInput): Promise<ItemDto>;
  defer(itemId: string, until: number): Promise<ItemDto>;
  setStatus(itemId: string, status: ItemStatus, input?: StatusChangeInput): Promise<ItemDto>;
  complete(itemId: string): Promise<ItemDto>;
  cancel(itemId: string): Promise<ItemDto>;

  tag(itemId: string, tags: string[]): Promise<ItemDto>;
  untag(itemId: string, tags: string[]): Promise<ItemDto>;
  addLink(itemId: string, input: AddLinkInput): Promise<LinkDto>;
  attach(itemId: string, input: AttachInput): Promise<AttachmentDto>;
  reorder(input: ReorderInput): Promise<void>;

  createProject(input: CreateProjectInput): Promise<ProjectDto>;
  updateProject(projectId: string, input: UpdateProjectInput): Promise<ProjectDto>;
  archiveProject(projectId: string): Promise<ProjectDto>;

  getTodayView(input?: TodayViewInput): Promise<TodayViewDto>;
  getUpcomingView(input?: UpcomingViewInput): Promise<UpcomingViewDto>;
  getInboxView(input?: InboxViewInput): Promise<InboxViewDto>;
  getProjectView(projectId: string, input?: ProjectViewInput): Promise<ProjectViewDto>;
  getHistory(input?: HistoryQueryInput): Promise<HistoryDto>;
  search(input: SearchInput): Promise<SearchResultsDto>;
}
```

### 20.2 Command rules

Each command:

1. validates input
2. loads necessary state
3. enforces invariants
4. writes entity changes
5. emits item events when relevant
6. refreshes search index as needed
7. returns a DTO suitable for UI/API use

### 20.3 Read-model rules

Read-model services:

- may join multiple tables
- may compute derived sections and badges
- should not mutate state
- should return screen-friendly DTOs instead of raw tables

---

## 21. HTTP API specification

The HTTP API mirrors the domain API but remains pragmatic.

### 21.1 Endpoints

#### Projects

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`
- `PATCH /api/projects/:projectId`
- `DELETE /api/projects/:projectId` (soft archive/delete)

#### Items

- `GET /api/items`
- `POST /api/items`
- `GET /api/items/:itemId`
- `PATCH /api/items/:itemId`
- `DELETE /api/items/:itemId`

#### Item commands

- `POST /api/items/:itemId/complete`
- `POST /api/items/:itemId/status`
- `POST /api/items/:itemId/schedule`
- `POST /api/items/:itemId/defer`
- `POST /api/items/:itemId/tags`
- `POST /api/items/:itemId/links`
- `POST /api/items/reorder`

#### Attachments

- `POST /api/items/:itemId/attachments`
- `GET /api/attachments/:attachmentId`
- `GET /api/attachments/:attachmentId/download`
- `DELETE /api/attachments/:attachmentId`

#### Views

- `GET /api/views/today`
- `GET /api/views/upcoming`
- `GET /api/views/inbox`
- `GET /api/views/project/:projectId`
- `GET /api/views/history`

#### Search and saved views

- `GET /api/search`
- `GET /api/saved-views`
- `POST /api/saved-views`
- `PATCH /api/saved-views/:savedViewId`
- `DELETE /api/saved-views/:savedViewId`

### 21.2 Endpoint behavior

- GET endpoints are query/read-model oriented.
- POST endpoints create resources or represent commands.
- PATCH endpoints allow limited field updates.
- Command endpoints are preferred for semantic state transitions.

### 21.3 Idempotency

For command endpoints likely to be retried, support optional `Idempotency-Key` header.

Recommended for:

- create item
- create project
- attachment upload finalization
- complete item

### 21.4 Error mapping

- validation failure -> `400`
- not found -> `404`
- invariant conflict -> `409`
- payload too large -> `413`
- unsupported media -> `415`
- unexpected server error -> `500`

---

## 22. Query/view DTO specification

Read-model DTOs should be optimized for screens.

### 22.1 Today view DTO

```ts
type TodayViewDto = {
  now: number;
  timezone: string;
  sections: Array<{
    key: 'triage' | 'overdue' | 'today' | 'inProgress';
    label: string;
    count: number;
    items: ItemRowDto[];
  }>;
};
```

### 22.2 Upcoming view DTO

```ts
type UpcomingViewDto = {
  now: number;
  timezone: string;
  buckets: Array<{
    key: 'tomorrow' | 'thisWeek' | 'nextWeek' | 'later';
    label: string;
    items: ItemRowDto[];
  }>;
};
```

### 22.3 Item row DTO

```ts
type ItemRowDto = {
  id: string;
  title: string;
  kind: 'task' | 'note' | 'milestone';
  status: ItemStatus;
  priority: number;
  project?: { id: string; title: string; slug: string };
  tags: string[];
  dueAt?: number;
  scheduledAt?: number;
  requestedBy?: string;
  isInterruption: boolean;
  hasLinks: boolean;
  attachmentCount: number;
  childCount: number;
  isOverdue: boolean;
};
```

Rules:

- DTOs may contain derived booleans to simplify UI rendering.
- The UI should not need to re-derive every property.

---

## 23. File upload and storage specification

### 23.1 Storage abstraction

Create a storage adapter with this interface:

```ts
interface StorageAdapter {
  put(input: {
    key: string;
    body: ArrayBuffer | Buffer | ReadableStream;
    contentType: string;
  }): Promise<void>;

  getSignedReadUrl(key: string, options?: { expiresInSeconds?: number }): Promise<string>;
  delete(key: string): Promise<void>;
}
```

Implementations:

- local filesystem adapter for dev/self-hosted local mode
- S3-compatible adapter for hosted mode

### 23.2 Upload flow

1. User selects or drops file.
2. Client sends metadata or multipart payload.
3. Server validates size and ownership context.
4. File is written to storage.
5. Attachment row is inserted.
6. If supported, preview/extraction runs inline or in deferred best-effort mode.
7. UI shows attachment card immediately with processing status.

### 23.3 File limits

Default limits:

- max file size: `50 MB`
- max files per request: `10`
- configurable in env

### 23.4 Preview and extraction statuses

`previewStatus`:

- `none`
- `pending`
- `ready`
- `failed`

`textExtractionStatus`:

- `none`
- `pending`
- `ready`
- `failed`

### 23.5 Preview rules

- images: image thumbnail/preview
- text-like types: inline text preview with truncation
- pdf: inline viewer if supported and safe
- binary unknown: generic icon card

### 23.6 Text extraction rules

v1 best-effort extraction:

- plain text: direct decode
- markdown: direct decode
- json: direct decode
- csv: direct decode
- pdf: parser best effort, failure tolerated
- others: no extraction

No OCR requirement in v1.

### 23.7 Security rules for files

1. Never execute uploaded content.
2. Only inline-preview allowlisted MIME types.
3. Everything else should download with attachment disposition.
4. Preserve original filename for display, not as storage key.
5. Hash all uploads for dedupe and integrity.

---

## 24. Markdown rendering specification

### 24.1 Storage

Store raw Markdown in database exactly as edited.

### 24.2 Rendering

Use a safe Markdown pipeline.

Features:

- GFM tables
- fenced code blocks
- task lists (display only)
- links
- blockquotes
- headings

### 24.3 Styling

Markdown body should have dedicated prose styles with:

- readable paragraph spacing
- pleasant list spacing
- subtle code block treatment
- table overflow handling
- consistent heading hierarchy

### 24.4 Security

- sanitize rendered output
- no raw HTML by default in v1
- safe external link attributes

---

## 25. Search and indexing specification

### 25.1 Search scope

Search covers:

- item titles
- item descriptions
- tag names
- project titles
- extracted attachment text

### 25.2 Ranking rules

Base ranking should weight:

1. title match highest
2. tag and project match next
3. description match next
4. attachment text match next
5. recent updates as tie-breaker

### 25.3 Search filters

Support filters for:

- project
- status
- kind
- tags any/all
- due window
- scheduled window
- include done

### 25.4 Highlighting

Search results may show snippets with matched fragments.

### 25.5 Reindexing

Reindex on:

- item create/update/delete
- tag add/remove/rename
- project title change
- attachment extraction ready

Provide backfill script for full rebuild.

---

## 26. Eventing and history specification

### 26.1 Event purpose

Item events exist to power:

- history UI
- item activity timeline
- future undo/replay possibilities
- debuggability for state transitions

### 26.2 Event types

Initial event type set:

- `item.created`
- `item.updated`
- `item.statusChanged`
- `item.scheduled`
- `item.dueChanged`
- `item.completed`
- `item.reopened`
- `item.tagAdded`
- `item.tagRemoved`
- `item.linkAdded`
- `item.attachmentAdded`
- `item.moved`
- `item.reordered`

### 26.3 Event payload rules

- payload should contain only the fields needed to explain the change
- payload must be JSON-serializable
- avoid storing entire entity snapshots by default

Example:

```json
{
  "from": "active",
  "to": "blocked",
  "reason": "waiting on vendor reply"
}
```

### 26.4 History UI behavior

- collapse repetitive noise when reasonable
- show strong human-readable labels
- preserve raw event data for future debugging exports

---

## 27. Client state and query specification

### 27.1 Server-state cache

Use a query library for:

- Today view
- Upcoming view
- Inbox view
- Project view
- Search results
- Item details
- Saved views

Cache keys should be explicit and stable.

Examples:

- `['view', 'today', timezone, density]`
- `['project', projectId, query]`
- `['item', itemId]`
- `['search', query]`

### 27.2 Mutations

Mutations should:

- call semantic endpoints
- optimistically update when safe
- invalidate minimal relevant queries
- surface undo where possible

### 27.3 Ephemeral UI store

Use tiny local store for:

- selected item id
- right pane open/closed
- navigation rail collapse state
- density toggle session state
- command palette open state
- draft filters before apply
- current drag state

Do not place canonical domain data here.

---

## 28. Component behavior specification

### 28.1 Item row

Item row shows:

- title
- status
- due/scheduled date badge
- project name if cross-project context
- 1–2 tags max in compact mode
- link and attachment indicators
- interruption/requester hint when present

Interactions:

- click row -> open detail pane
- checkbox or status control -> complete/change status
- keyboard selection supported
- drag handle in reorderable contexts

### 28.2 Group header

Group header shows:

- label
- count
- collapse toggle
- optional bulk actions

### 28.3 Detail pane

Sections:

- header
- metadata strip
- description editor/renderer
- links
- attachments
- history

### 28.4 Filter bar

Elements:

- search field (optional, depending on screen)
- project selector
- tag picker
- status filter
- grouping selector
- sort selector

### 28.5 Empty states

Empty states should be calm and helpful, not cute nonsense.

Each empty state should suggest one useful next action.

---

## 29. Command palette specification

### 29.1 Command categories

- navigation
- item creation
- item actions
- project actions
- search results
- recent items
- saved views

### 29.2 Keyboard shortcuts

Recommended defaults:

- `Cmd/Ctrl + K`: open command palette
- `C`: quick capture
- `E`: edit selected item
- `S`: schedule selected item
- `#`: tag selected item
- `L`: add link to selected item
- `X`: toggle done for selected item
- `J/K`: move list selection
- `G T`: go to Today
- `G U`: go to Upcoming
- `G I`: go to Inbox
- `G H`: go to History

### 29.3 Behavior rules

- command palette should be fast enough to feel instantaneous
- fuzzy match should work on titles, project names, tags, and command labels
- actions should respect current context when possible

---

## 30. Security specification

### 30.1 General rules

1. Validate all untrusted input.
2. Sanitize markdown output.
3. Restrict URL schemes.
4. Parameterize all queries via ORM/query builder.
5. Treat uploaded files as untrusted.
6. Never fetch arbitrary external URLs server-side in v1.

### 30.2 Authentication

v1 modes:

- **local/dev mode**: single-user, no external auth required
- **hosted mode**: session auth added at the app boundary

The domain layer should not care which auth provider exists.

### 30.3 Authorization

Because v1 is single-user, authorization is simple. Still:

- all route handlers must assume a future user scope exists
- repositories should be written so adding `ownerId` later is possible without full redesign

### 30.4 CSRF and cookies

If cookie-based sessions are used in hosted mode:

- use same-site cookies
- use CSRF protection for state-changing requests if needed by auth design

### 30.5 File safety

- safe content-disposition headers
- allowlist inline preview types
- configurable upload size limits
- optional future malware scanning hook

### 30.6 Secret handling

- secrets only from environment
- never expose storage credentials to client
- signed read URLs should be short-lived when applicable

---

## 31. Performance and reliability targets

### 31.1 Performance budgets

For a dataset around:

- `10,000` items
- `2,000` attachments metadata rows
- `500` saved views / tags combined

Targets:

- Today view query p95 local: `< 100 ms`
- project view query p95 local: `< 150 ms`
- search query p95 local: `< 120 ms`
- item mutation roundtrip on local dev: `< 250 ms`
- first contentful shell render: `< 1.5 s` local, `< 2.5 s` hosted median

### 31.2 Reliability expectations

- no silent mutation failures
- every failed mutation surfaces readable error feedback
- database migrations are reversible or repairable
- export path exists for user data safety

### 31.3 Loading states

Rules:

- avoid spinner-only screens when server rendering can provide initial data
- use skeletons sparingly
- preserve stale data during background refetch when appropriate

---

## 32. Error handling specification

### 32.1 Error classes

- validation error
- domain conflict / invariant error
- not found
- storage failure
- extraction failure
- unexpected internal error

### 32.2 UI behavior

- inline form errors for input issues
- toast or banner for command failures
- retry affordance for recoverable actions
- non-blocking failure for attachment text extraction

### 32.3 Logging

Server logs should include:

- request id
- route name
- command name
- entity ids involved
- error code/class

Do not log raw file contents or secrets.

---

## 33. Testing strategy

### 33.1 Unit tests

Unit-test these areas heavily:

- time bucketing logic
- status transition rules
- tag normalization
- order-key generation
- search ranking composition helpers
- markdown sanitation config
- query-to-view grouping logic

### 33.2 Integration tests

Integration tests use a real temporary SQLite database.

Cover:

- create/update item flows
- command handlers and events
- tag joins
- project/archive behavior
- attachment metadata insert and lookup
- FTS updates

### 33.3 End-to-end tests

Playwright tests should cover:

- quick capture
- triage from inbox
- complete/block/reschedule from Today
- project filtering and hierarchy
- upload supported file and preview
- search returning attachment text hits
- history rendering after meaningful actions

### 33.4 Accessibility tests

- automated axe checks on key screens
- keyboard-only navigation tests for list/detail workflow

### 33.5 Visual regression tests

Use snapshots sparingly for:

- Today view
- Project view
- Detail pane
- Markdown rendering examples

---

## 34. Developer experience and code standards

### 34.1 TypeScript rules

- `strict: true`
- no `any` without comment and strong reason
- prefer discriminated unions for domain events and item kinds
- never expose raw database rows directly to UI

### 34.2 Import rules

- use path aliases for `src/*`
- avoid deep relative import spaghetti
- no cross-feature internal imports except through public module entrypoints

### 34.3 Function design

- small pure helpers for time/query logic
- command handlers may be larger but should remain structured
- prefer pure functions for derived view models

### 34.4 React rules

- default to server components where interactivity is unnecessary
- client components only where needed
- no large god-components for whole screens
- colocate feature UI with feature domain, but keep shared primitives central

### 34.5 Styling rules

- design tokens first
- avoid ad hoc one-off utility soups for major components
- shared variants live in utility/component layer

### 34.6 Documentation

Each feature module should include a short internal README describing:

- its responsibilities
- public exports
- important invariants

---

## 35. CI/CD and operational tooling

### 35.1 CI pipeline

On every pull request:

1. install dependencies
2. typecheck
3. lint
4. run unit tests
5. run integration tests
6. run selected Playwright smoke tests

### 35.2 Migration policy

- schema changes require migration files
- destructive schema changes require explicit migration note
- backfill scripts live in `scripts/`

### 35.3 Seed data

Maintain a seed script with:

- 3–5 projects
- items across statuses
- tags with hierarchy
- attachments metadata examples
- history events

This supports visual and end-to-end testing.

---

## 36. Deployment specification

### 36.1 Local mode

- SQLite file on disk
- local uploads directory
- no auth by default
- ideal for personal use and development

### 36.2 Hosted mode

Recommended deployment shape:

- Next.js app deployment
- libSQL/Turso-compatible database or persistent SQLite host
- object storage for attachments
- periodic backups

### 36.3 Environment variables

Minimum env set:

- `DATABASE_URL` or local DB path
- `APP_BASE_URL`
- `UPLOAD_STORAGE_PROVIDER`
- `UPLOAD_LOCAL_DIR` or S3-compatible credentials
- `MAX_UPLOAD_BYTES`
- `SESSION_SECRET` (if auth enabled)

### 36.4 Backups and export

The app must support user-controlled export of:

- projects
- items
- tags
- links
- attachments metadata
- event history

Attachment binary export may be zip-based or folder-based.

---

## 37. Incremental implementation plan

### Phase 1: foundation

- app shell
- database schema and migrations
- projects and items CRUD
- Today / Upcoming / Project views
- tags
- status changes
- quick capture

### Phase 2: detail depth

- markdown editor/renderer
- links
- detail pane
- saved views
- history timeline

### Phase 3: attachments and search

- upload pipeline
- attachment previews
- extracted text storage
- FTS search screen

### Phase 4: polish

- command palette expansion
- drag reorder across more contexts
- density modes
- visual/accessibility polish
- export/import tools

---

## 38. Out of scope and future expansion

Possible future directions after v1:

- recurring tasks
- calendar integration
- email/slack quick-capture bridges
- browser extension share target
- multiple workspaces
- collaboration
- AI summarization over project history
- smarter link metadata on allowlisted domains
- background processing queue for heavy files

These should be added by extending modules, not by violating current boundaries.

---

## 39. MVP acceptance criteria

The MVP is complete when all of the following are true:

1. User can create, edit, complete, cancel, block, and reschedule items.
2. User can create and manage multiple projects.
3. User can assign tags and see tag-filtered results.
4. User can view work in Today, Upcoming, Project, and History screens.
5. User can attach links and upload files to items.
6. User can render Markdown descriptions safely and pleasantly.
7. User can search items by title/description/tags, and attachment text when available.
8. User can manually reorder projects and items in their canonical contexts.
9. User can use keyboard shortcuts and a command palette for core flows.
10. The system remains visually coherent, accessible, and fast enough for daily use.

---

## 40. Example objects

### 40.1 Example project

```json
{
  "id": "01JPC7X0D6V4Y8BQJ6D8F5Y8Z3",
  "slug": "care-search",
  "title": "Care Search",
  "descriptionMd": "Research and implementation work for care search quality.",
  "status": "active",
  "colorToken": "blue",
  "icon": "search",
  "orderKey": "a0",
  "createdAt": 1773475200000,
  "updatedAt": 1773475200000
}
```

### 40.2 Example item

```json
{
  "id": "01JPC82PKT4S7YGN3ZK5Q8V9J1",
  "projectId": "01JPC7X0D6V4Y8BQJ6D8F5Y8Z3",
  "parentItemId": null,
  "kind": "task",
  "title": "Prepare API design notes",
  "descriptionMd": "## Goal\nProduce the typed domain API and route contract notes.",
  "status": "active",
  "priority": 3,
  "orderKey": "a1",
  "scheduledAt": 1773561600000,
  "dueAt": 1773648000000,
  "completedAt": null,
  "snoozedUntil": null,
  "requestedBy": "Alex",
  "isInterruption": true,
  "sourceKind": "manual",
  "sourceRef": null,
  "createdAt": 1773478800000,
  "updatedAt": 1773478800000
}
```

### 40.3 Example saved view

```json
{
  "id": "01JPC8A3C9W4Y2V0A3M2W9QF4N",
  "name": "Urgent This Week",
  "icon": "flame",
  "queryJson": {
    "statuses": ["active", "inbox", "blocked", "waiting"],
    "tagAny": ["theme/api"],
    "groupBy": "project",
    "sortBy": "dueAt",
    "sortDir": "asc",
    "includeDone": false
  },
  "orderKey": "a0"
}
```

---

## 41. Implementation notes and guardrails

1. Resist the temptation to create separate note/task/file systems. Keep the surface unified.
2. Resist calendar-first design. The app is list-first and timeline-aware.
3. Resist giant mutable global client state. The server owns truth.
4. Resist raw HTML markdown support in v1.
5. Resist making uploads “magic.” Any file can be stored; only some get enhanced behavior.
6. Resist status proliferation. Six statuses are enough.
7. Resist design clutter. Density is not the same as noise.

---

## 42. Final architectural thesis

This codebase should behave like a **time-aware, design-led personal operating surface**.

It should be possible to say:

- capture work quickly
- organize it cleanly
- see it clearly now and later
- keep context attached
- inspect how it changed over time
- interact with it through a pleasant API

without turning the product into a monster of separate modules pretending to be one system.

That is the whole game.
