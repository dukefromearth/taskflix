module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/domain/errors.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DomainError",
    ()=>DomainError,
    "assert",
    ()=>assert
]);
class DomainError extends Error {
    code;
    constructor(code, message){
        super(message);
        this.code = code;
    }
}
function assert(condition, message) {
    if (!condition) {
        throw new DomainError('validation', message);
    }
}
}),
"[project]/src/domain/status.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canTransitionStatus",
    ()=>canTransitionStatus,
    "isTerminalStatus",
    ()=>isTerminalStatus
]);
const transitions = {
    inbox: [
        'active',
        'blocked',
        'waiting',
        'done',
        'canceled'
    ],
    active: [
        'blocked',
        'waiting',
        'done',
        'canceled',
        'inbox'
    ],
    blocked: [
        'active',
        'waiting',
        'done',
        'canceled'
    ],
    waiting: [
        'active',
        'blocked',
        'done',
        'canceled'
    ],
    done: [
        'active'
    ],
    canceled: [
        'active'
    ]
};
const canTransitionStatus = (from, to)=>{
    if (from === to) {
        return true;
    }
    return transitions[from].includes(to);
};
const isTerminalStatus = (status)=>status === 'done' || status === 'canceled';
}),
"[project]/src/domain/tag.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeTagName",
    ()=>normalizeTagName,
    "toTagDisplayName",
    ()=>toTagDisplayName
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/errors.ts [app-route] (ecmascript)");
;
const SEGMENT = /^[a-z0-9-]+$/;
const normalizeTagName = (input)=>{
    const normalized = input.trim().toLowerCase().replace(/\s*\/\s*/g, '/').replace(/\s+/g, '-').replace(/\/+/g, '/');
    if (!normalized || normalized.startsWith('/') || normalized.endsWith('/')) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('validation', 'Tag must not start or end with "/"');
    }
    const segments = normalized.split('/');
    for (const segment of segments){
        if (!SEGMENT.test(segment)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('validation', `Invalid tag segment: ${segment}`);
        }
    }
    return segments.join('/');
};
const toTagDisplayName = (normalizedName)=>normalizedName.split('/').map((segment)=>segment.replace(/-/g, ' ')).join(' / ');
}),
"[project]/src/domain/time.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildTimelineBuckets",
    ()=>buildTimelineBuckets,
    "clampPlayhead",
    ()=>clampPlayhead,
    "daysFromNowLocal",
    ()=>daysFromNowLocal,
    "getDefaultTimelineWindow",
    ()=>getDefaultTimelineWindow,
    "isBeforeLocalDay",
    ()=>isBeforeLocalDay,
    "isSameLocalDay",
    ()=>isSameLocalDay,
    "normalizeTimelineWindow",
    ()=>normalizeTimelineWindow,
    "timelineBucketIndexForTs",
    ()=>timelineBucketIndexForTs
]);
const ymdInTimezone = (ts, timezone)=>{
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date(ts));
    const year = Number(parts.find((p)=>p.type === 'year')?.value);
    const month = Number(parts.find((p)=>p.type === 'month')?.value);
    const day = Number(parts.find((p)=>p.type === 'day')?.value);
    return {
        year,
        month,
        day
    };
};
const compareYmd = (a, b)=>{
    if (a.year !== b.year) return a.year - b.year;
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
};
const isSameLocalDay = (aTs, bTs, timezone)=>{
    const a = ymdInTimezone(aTs, timezone);
    const b = ymdInTimezone(bTs, timezone);
    return a.year === b.year && a.month === b.month && a.day === b.day;
};
const isBeforeLocalDay = (aTs, dayRefTs, timezone)=>{
    const a = ymdInTimezone(aTs, timezone);
    const day = ymdInTimezone(dayRefTs, timezone);
    return compareYmd(a, day) < 0;
};
const daysFromNowLocal = (ts, nowTs, timezone)=>{
    const a = ymdInTimezone(ts, timezone);
    const b = ymdInTimezone(nowTs, timezone);
    const utcA = Date.UTC(a.year, a.month - 1, a.day);
    const utcB = Date.UTC(b.year, b.month - 1, b.day);
    return Math.floor((utcA - utcB) / 86400000);
};
const clampToRange = (value, min, max)=>Math.min(max, Math.max(min, value));
const STEP_MS = {
    day: 60 * 60 * 1000,
    week: 24 * 60 * 60 * 1000,
    month: 7 * 24 * 60 * 60 * 1000,
    quarter: 7 * 24 * 60 * 60 * 1000,
    year: 30 * 24 * 60 * 60 * 1000,
    all: 90 * 24 * 60 * 60 * 1000
};
const formatBucketLabel = (zoom, ts, timezone)=>{
    if (zoom === 'day') {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: 'numeric'
        }).format(new Date(ts));
    }
    if (zoom === 'year' || zoom === 'all') {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            month: 'short',
            year: '2-digit'
        }).format(new Date(ts));
    }
    return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        month: 'short',
        day: 'numeric'
    }).format(new Date(ts));
};
const getDefaultTimelineWindow = (now)=>({
        // TODO(timezone): This uses UTC day boundaries because this helper does not receive a timezone.
        // We should anchor to user-local midnight once timezone is threaded through default-window callers.
        windowStart: Math.floor(now / 86400000) * 86400000 - 3 * 86400000,
        windowEnd: Math.floor(now / 86400000) * 86400000 + 4 * 86400000
    });
const normalizeTimelineWindow = (windowStart, windowEnd)=>{
    if (windowStart <= windowEnd) return {
        windowStart,
        windowEnd
    };
    return {
        windowStart: windowEnd,
        windowEnd: windowStart
    };
};
const clampPlayhead = (playheadTs, windowStart, windowEnd)=>clampToRange(playheadTs, windowStart, windowEnd);
const buildTimelineBuckets = (input)=>{
    const { zoom, timezone } = input;
    const normalized = normalizeTimelineWindow(input.windowStart, input.windowEnd);
    const step = STEP_MS[zoom];
    const buckets = [];
    let cursor = normalized.windowStart;
    while(cursor < normalized.windowEnd){
        const end = Math.min(cursor + step, normalized.windowEnd);
        buckets.push({
            start: cursor,
            end,
            label: formatBucketLabel(zoom, cursor, timezone)
        });
        cursor = end;
    }
    if (buckets.length === 0) {
        buckets.push({
            start: normalized.windowStart,
            end: normalized.windowEnd,
            label: formatBucketLabel(zoom, normalized.windowStart, timezone)
        });
    }
    return buckets;
};
const timelineBucketIndexForTs = (buckets, ts)=>{
    if (buckets.length === 0) return -1;
    const first = buckets[0];
    const last = buckets[buckets.length - 1];
    if (!first || !last) return -1;
    if (ts <= first.start) return 0;
    if (ts >= last.end) return buckets.length - 1;
    for(let i = 0; i < buckets.length; i += 1){
        const bucket = buckets[i];
        if (!bucket) continue;
        if (ts >= bucket.start && ts < bucket.end) {
            return i;
        }
    }
    return buckets.length - 1;
};
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[project]/src/db/client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "closeDatabaseRuntime",
    ()=>closeDatabaseRuntime,
    "createDatabaseRuntime",
    ()=>createDatabaseRuntime,
    "getDatabaseRuntime",
    ()=>getDatabaseRuntime,
    "resolveDatabasePath",
    ()=>resolveDatabasePath,
    "setDatabaseRuntime",
    ()=>setDatabaseRuntime
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$better$2d$sqlite3$29$__ = __turbopack_context__.i("[externals]/better-sqlite3 [external] (better-sqlite3, cjs, [project]/node_modules/better-sqlite3)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$kysely$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/kysely/dist/esm/kysely.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$dialect$2f$sqlite$2f$sqlite$2d$dialect$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/kysely/dist/esm/dialect/sqlite/sqlite-dialect.js [app-route] (ecmascript)");
;
;
;
;
let runtime;
const resolveDatabasePath = ()=>process.env.DATABASE_URL ?? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), 'taskio.db');
const applyPragmas = (sqlite)=>{
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    sqlite.pragma('synchronous = NORMAL');
};
const createDatabaseRuntime = (databasePath = resolveDatabasePath())=>{
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].mkdirSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname(databasePath), {
        recursive: true
    });
    const sqlite = new __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$better$2d$sqlite3$29$__["default"](databasePath);
    applyPragmas(sqlite);
    const db = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$kysely$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Kysely"]({
        dialect: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$dialect$2f$sqlite$2f$sqlite$2d$dialect$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SqliteDialect"]({
            database: sqlite
        })
    });
    return {
        db,
        sqlite,
        databasePath
    };
};
const getDatabaseRuntime = ()=>{
    if (!runtime) {
        runtime = createDatabaseRuntime();
    }
    return runtime;
};
const setDatabaseRuntime = (next)=>{
    runtime = next;
};
const closeDatabaseRuntime = async ()=>{
    if (!runtime) return;
    await runtime.db.destroy();
    runtime.sqlite.close();
    runtime = undefined;
};
}),
"[project]/src/domain/order-key.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateInitialOrderKey",
    ()=>generateInitialOrderKey,
    "generateOrderKeyBetween",
    ()=>generateOrderKeyBetween
]);
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const BASE = ALPHABET.length;
const charToInt = (char)=>ALPHABET.indexOf(char);
const intToChar = (index)=>ALPHABET[index] ?? '0';
const pad = (key, len)=>key.padEnd(len, '0');
const generateInitialOrderKey = ()=>'h';
const generateOrderKeyBetween = (left, right)=>{
    if (!left && !right) {
        return generateInitialOrderKey();
    }
    if (!left) {
        return `0${right}`;
    }
    if (!right) {
        return `${left}z`;
    }
    let a = left;
    let b = right;
    let length = Math.max(a.length, b.length);
    while(true){
        a = pad(a, length);
        b = pad(b, length);
        const leftDigits = a.split('').map(charToInt);
        const rightDigits = b.split('').map(charToInt);
        let carry = 0;
        const sum = new Array(length).fill(0);
        for(let i = length - 1; i >= 0; i -= 1){
            const digitSum = (leftDigits[i] ?? 0) + (rightDigits[i] ?? 0) + carry;
            sum[i] = digitSum % BASE;
            carry = Math.floor(digitSum / BASE);
        }
        const midpoint = new Array(length).fill(0);
        let remainder = carry;
        for(let i = 0; i < length; i += 1){
            const current = remainder * BASE + (sum[i] ?? 0);
            midpoint[i] = Math.floor(current / 2);
            remainder = current % 2;
        }
        const mid = midpoint.map(intToChar).join('').replace(/0+$/, '');
        if (!mid || mid <= left || mid >= right) {
            length += 1;
            continue;
        }
        return mid;
    }
};
}),
"[project]/src/repositories/mappers.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "toAttachment",
    ()=>toAttachment,
    "toAttachmentContent",
    ()=>toAttachmentContent,
    "toEvent",
    ()=>toEvent,
    "toItem",
    ()=>toItem,
    "toLink",
    ()=>toLink,
    "toProject",
    ()=>toProject,
    "toSavedView",
    ()=>toSavedView,
    "toTag",
    ()=>toTag,
    "toUserPreference",
    ()=>toUserPreference
]);
const toProject = (row)=>({
        id: row.id,
        slug: row.slug,
        title: row.title,
        descriptionMd: row.description_md,
        status: row.status,
        colorToken: row.color_token ?? undefined,
        icon: row.icon ?? undefined,
        orderKey: row.order_key,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        archivedAt: row.archived_at ?? undefined,
        deletedAt: row.deleted_at ?? undefined
    });
const toItem = (row)=>({
        id: row.id,
        projectId: row.project_id ?? undefined,
        parentItemId: row.parent_item_id ?? undefined,
        kind: row.kind,
        title: row.title,
        descriptionMd: row.description_md,
        status: row.status,
        priority: row.priority,
        orderKey: row.order_key,
        scheduledAt: row.scheduled_at ?? undefined,
        dueAt: row.due_at ?? undefined,
        completedAt: row.completed_at ?? undefined,
        snoozedUntil: row.snoozed_until ?? undefined,
        requestedBy: row.requested_by ?? undefined,
        isInterruption: row.is_interruption === 1,
        sourceKind: row.source_kind,
        sourceRef: row.source_ref ?? undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at ?? undefined
    });
const toTag = (row)=>({
        id: row.id,
        name: row.name,
        displayName: row.display_name,
        createdAt: row.created_at
    });
const toLink = (row)=>({
        id: row.id,
        itemId: row.item_id,
        url: row.url,
        label: row.label ?? undefined,
        kind: row.kind,
        createdAt: row.created_at
    });
const toAttachment = (row)=>({
        id: row.id,
        itemId: row.item_id,
        storageKey: row.storage_key,
        originalName: row.original_name,
        mimeType: row.mime_type,
        sizeBytes: row.size_bytes,
        sha256: row.sha256,
        previewStatus: row.preview_status,
        textExtractionStatus: row.text_extraction_status,
        createdAt: row.created_at,
        deletedAt: row.deleted_at ?? undefined
    });
const toAttachmentContent = (row)=>({
        attachmentId: row.attachment_id,
        textContent: row.text_content,
        contentHash: row.content_hash,
        extractedAt: row.extracted_at
    });
const toEvent = (row)=>({
        id: row.id,
        itemId: row.item_id,
        commandId: row.command_id,
        eventType: row.event_type,
        payloadJson: JSON.parse(row.payload_json),
        occurredAt: row.occurred_at
    });
const toSavedView = (row)=>({
        id: row.id,
        name: row.name,
        icon: row.icon ?? undefined,
        queryJson: JSON.parse(row.query_json),
        orderKey: row.order_key,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at ?? undefined
    });
const toUserPreference = (row)=>({
        id: row.id,
        timezone: row.timezone,
        theme: row.theme,
        density: row.density,
        weekStartsOn: row.week_starts_on,
        defaultProjectId: row.default_project_id ?? undefined,
        todayShowsDone: row.today_shows_done === 1,
        reduceMotion: row.reduce_motion === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    });
}),
"[project]/src/repositories/project-repository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProjectRepository",
    ()=>ProjectRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$order$2d$key$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/order-key.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/mappers.ts [app-route] (ecmascript)");
;
;
class ProjectRepository {
    db;
    constructor(db){
        this.db = db;
    }
    async list(input) {
        let query = this.db.selectFrom('projects').selectAll().where('deleted_at', 'is', null).orderBy('order_key', 'asc');
        if (!input?.includeArchived) {
            query = query.where('status', '!=', 'archived');
        }
        const rows = await query.execute();
        return rows.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toProject"]);
    }
    async get(projectId) {
        const row = await this.db.selectFrom('projects').selectAll().where('id', '=', projectId).where('deleted_at', 'is', null).executeTakeFirst();
        return row ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toProject"])(row) : undefined;
    }
    async getBySlug(slug) {
        const row = await this.db.selectFrom('projects').selectAll().where('slug', '=', slug).where('deleted_at', 'is', null).executeTakeFirst();
        return row ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toProject"])(row) : undefined;
    }
    async nextOrderKey() {
        const last = await this.db.selectFrom('projects').select([
            'order_key'
        ]).where('deleted_at', 'is', null).orderBy('order_key', 'desc').executeTakeFirst();
        return last ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$order$2d$key$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateOrderKeyBetween"])(last.order_key, undefined) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$order$2d$key$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateInitialOrderKey"])();
    }
    async insert(project) {
        await this.db.insertInto('projects').values({
            id: project.id,
            slug: project.slug,
            title: project.title,
            description_md: project.descriptionMd,
            status: project.status,
            color_token: project.colorToken ?? null,
            icon: project.icon ?? null,
            order_key: project.orderKey,
            created_at: project.createdAt,
            updated_at: project.updatedAt,
            archived_at: project.archivedAt ?? null,
            deleted_at: project.deletedAt ?? null
        }).execute();
    }
    async update(project) {
        await this.db.updateTable('projects').set({
            slug: project.slug,
            title: project.title,
            description_md: project.descriptionMd,
            status: project.status,
            color_token: project.colorToken ?? null,
            icon: project.icon ?? null,
            order_key: project.orderKey,
            updated_at: project.updatedAt,
            archived_at: project.archivedAt ?? null,
            deleted_at: project.deletedAt ?? null
        }).where('id', '=', project.id).execute();
    }
}
}),
"[project]/src/repositories/item-repository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ItemRepository",
    ()=>ItemRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$order$2d$key$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/order-key.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/mappers.ts [app-route] (ecmascript)");
;
;
class ItemRepository {
    db;
    constructor(db){
        this.db = db;
    }
    async get(itemId) {
        const row = await this.db.selectFrom('items').selectAll().where('id', '=', itemId).where('deleted_at', 'is', null).executeTakeFirst();
        return row ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toItem"])(row) : undefined;
    }
    async listAll() {
        const rows = await this.db.selectFrom('items').selectAll().where('deleted_at', 'is', null).execute();
        return rows.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toItem"]);
    }
    async listByProject(projectId) {
        const rows = await this.db.selectFrom('items').selectAll().where('project_id', '=', projectId).where('deleted_at', 'is', null).execute();
        return rows.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toItem"]);
    }
    async nextOrderKey(projectId, parentItemId) {
        let query = this.db.selectFrom('items').select([
            'order_key'
        ]).where('deleted_at', 'is', null).orderBy('order_key', 'desc').limit(1);
        if (projectId) {
            query = query.where('project_id', '=', projectId);
        } else {
            query = query.where('project_id', 'is', null);
        }
        if (parentItemId) {
            query = query.where('parent_item_id', '=', parentItemId);
        } else {
            query = query.where('parent_item_id', 'is', null);
        }
        const last = await query.executeTakeFirst();
        return last ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$order$2d$key$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateOrderKeyBetween"])(last.order_key, undefined) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$order$2d$key$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateInitialOrderKey"])();
    }
    async insert(item) {
        await this.db.insertInto('items').values({
            id: item.id,
            project_id: item.projectId ?? null,
            parent_item_id: item.parentItemId ?? null,
            kind: item.kind,
            title: item.title,
            description_md: item.descriptionMd,
            status: item.status,
            priority: item.priority,
            order_key: item.orderKey,
            scheduled_at: item.scheduledAt ?? null,
            due_at: item.dueAt ?? null,
            completed_at: item.completedAt ?? null,
            snoozed_until: item.snoozedUntil ?? null,
            requested_by: item.requestedBy ?? null,
            is_interruption: item.isInterruption ? 1 : 0,
            source_kind: item.sourceKind,
            source_ref: item.sourceRef ?? null,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            deleted_at: item.deletedAt ?? null
        }).execute();
    }
    async update(item) {
        await this.db.updateTable('items').set({
            project_id: item.projectId ?? null,
            parent_item_id: item.parentItemId ?? null,
            kind: item.kind,
            title: item.title,
            description_md: item.descriptionMd,
            status: item.status,
            priority: item.priority,
            order_key: item.orderKey,
            scheduled_at: item.scheduledAt ?? null,
            due_at: item.dueAt ?? null,
            completed_at: item.completedAt ?? null,
            snoozed_until: item.snoozedUntil ?? null,
            requested_by: item.requestedBy ?? null,
            is_interruption: item.isInterruption ? 1 : 0,
            source_kind: item.sourceKind,
            source_ref: item.sourceRef ?? null,
            updated_at: item.updatedAt,
            deleted_at: item.deletedAt ?? null
        }).where('id', '=', item.id).execute();
    }
    async childCountByItemIds(itemIds) {
        if (itemIds.length === 0) return new Map();
        const rows = await this.db.selectFrom('items').select(({ fn, ref })=>[
                ref('parent_item_id').as('parent_item_id'),
                fn.count('id').as('count')
            ]).where('parent_item_id', 'in', itemIds).where('deleted_at', 'is', null).groupBy('parent_item_id').execute();
        const output = new Map();
        for (const row of rows){
            if (!row.parent_item_id) continue;
            output.set(row.parent_item_id, row.count);
        }
        return output;
    }
}
}),
"[project]/src/repositories/tag-repository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TagRepository",
    ()=>TagRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/mappers.ts [app-route] (ecmascript)");
;
class TagRepository {
    db;
    constructor(db){
        this.db = db;
    }
    async getByName(name) {
        const row = await this.db.selectFrom('tags').selectAll().where('name', '=', name).executeTakeFirst();
        return row ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toTag"])(row) : undefined;
    }
    async insert(tag) {
        await this.db.insertInto('tags').values({
            id: tag.id,
            name: tag.name,
            display_name: tag.displayName,
            created_at: tag.createdAt
        }).execute();
    }
    async attach(itemId, tagId, createdAt) {
        const result = await this.db.insertInto('item_tags').values({
            item_id: itemId,
            tag_id: tagId,
            created_at: createdAt
        }).onConflict((oc)=>oc.columns([
                'item_id',
                'tag_id'
            ]).doNothing()).executeTakeFirst();
        return Number(result.numInsertedOrUpdatedRows ?? 0) > 0;
    }
    async detach(itemId, tagId) {
        const result = await this.db.deleteFrom('item_tags').where('item_id', '=', itemId).where('tag_id', '=', tagId).executeTakeFirst();
        return Number(result.numDeletedRows ?? 0) > 0;
    }
    async namesForItem(itemId) {
        const rows = await this.db.selectFrom('item_tags').innerJoin('tags', 'tags.id', 'item_tags.tag_id').select([
            'tags.name'
        ]).where('item_tags.item_id', '=', itemId).orderBy('tags.name', 'asc').execute();
        return rows.map((row)=>row.name);
    }
    async listByItemId(itemId) {
        const rows = await this.db.selectFrom('item_tags').innerJoin('tags', 'tags.id', 'item_tags.tag_id').select([
            'tags.id',
            'tags.name',
            'tags.display_name',
            'tags.created_at'
        ]).where('item_tags.item_id', '=', itemId).orderBy('tags.name', 'asc').execute();
        return rows.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toTag"]);
    }
    async namesByItemIds(itemIds) {
        const output = new Map();
        for (const id of itemIds)output.set(id, []);
        if (itemIds.length === 0) return output;
        const rows = await this.db.selectFrom('item_tags').innerJoin('tags', 'tags.id', 'item_tags.tag_id').select([
            'item_tags.item_id',
            'tags.name'
        ]).where('item_tags.item_id', 'in', itemIds).orderBy('tags.name', 'asc').execute();
        for (const row of rows){
            const list = output.get(row.item_id) ?? [];
            list.push(row.name);
            output.set(row.item_id, list);
        }
        return output;
    }
}
}),
"[project]/src/repositories/link-repository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LinkRepository",
    ()=>LinkRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/mappers.ts [app-route] (ecmascript)");
;
class LinkRepository {
    db;
    constructor(db){
        this.db = db;
    }
    async insert(link) {
        await this.db.insertInto('item_links').values({
            id: link.id,
            item_id: link.itemId,
            url: link.url,
            label: link.label ?? null,
            kind: link.kind ?? null,
            created_at: link.createdAt
        }).execute();
    }
    async countByItemIds(itemIds) {
        const output = new Map();
        for (const id of itemIds)output.set(id, 0);
        if (itemIds.length === 0) return output;
        const rows = await this.db.selectFrom('item_links').select(({ fn, ref })=>[
                ref('item_id').as('item_id'),
                fn.count('id').as('count')
            ]).where('item_id', 'in', itemIds).groupBy('item_id').execute();
        for (const row of rows){
            output.set(row.item_id, row.count);
        }
        return output;
    }
    async listByItemId(itemId) {
        const rows = await this.db.selectFrom('item_links').selectAll().where('item_id', '=', itemId).orderBy('created_at', 'desc').execute();
        return rows.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toLink"]);
    }
}
}),
"[project]/src/repositories/attachment-repository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AttachmentRepository",
    ()=>AttachmentRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/mappers.ts [app-route] (ecmascript)");
;
class AttachmentRepository {
    db;
    constructor(db){
        this.db = db;
    }
    async insert(attachment) {
        await this.db.insertInto('attachments').values({
            id: attachment.id,
            item_id: attachment.itemId,
            storage_key: attachment.storageKey,
            original_name: attachment.originalName,
            mime_type: attachment.mimeType,
            size_bytes: attachment.sizeBytes,
            sha256: attachment.sha256,
            preview_status: attachment.previewStatus,
            text_extraction_status: attachment.textExtractionStatus,
            created_at: attachment.createdAt,
            deleted_at: attachment.deletedAt ?? null
        }).execute();
    }
    async get(attachmentId) {
        const row = await this.db.selectFrom('attachments').selectAll().where('id', '=', attachmentId).where('deleted_at', 'is', null).executeTakeFirst();
        return row ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toAttachment"])(row) : undefined;
    }
    async update(attachment) {
        await this.db.updateTable('attachments').set({
            item_id: attachment.itemId,
            storage_key: attachment.storageKey,
            original_name: attachment.originalName,
            mime_type: attachment.mimeType,
            size_bytes: attachment.sizeBytes,
            sha256: attachment.sha256,
            preview_status: attachment.previewStatus,
            text_extraction_status: attachment.textExtractionStatus,
            deleted_at: attachment.deletedAt ?? null
        }).where('id', '=', attachment.id).execute();
    }
    async listByItemIds(itemIds) {
        const output = new Map();
        for (const id of itemIds)output.set(id, []);
        if (itemIds.length === 0) return output;
        const rows = await this.db.selectFrom('attachments').selectAll().where('item_id', 'in', itemIds).where('deleted_at', 'is', null).execute();
        for (const row of rows){
            const list = output.get(row.item_id) ?? [];
            list.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toAttachment"])(row));
            output.set(row.item_id, list);
        }
        return output;
    }
    async listByItemId(itemId) {
        const rows = await this.db.selectFrom('attachments').selectAll().where('item_id', '=', itemId).where('deleted_at', 'is', null).orderBy('created_at', 'desc').execute();
        return rows.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toAttachment"]);
    }
    async countByItemIds(itemIds) {
        const output = new Map();
        for (const id of itemIds)output.set(id, 0);
        if (itemIds.length === 0) return output;
        const rows = await this.db.selectFrom('attachments').select(({ fn, ref })=>[
                ref('item_id').as('item_id'),
                fn.count('id').as('count')
            ]).where('item_id', 'in', itemIds).where('deleted_at', 'is', null).groupBy('item_id').execute();
        for (const row of rows){
            output.set(row.item_id, row.count);
        }
        return output;
    }
    async upsertContent(content) {
        await this.db.insertInto('attachment_contents').values({
            attachment_id: content.attachmentId,
            text_content: content.textContent,
            content_hash: content.contentHash,
            extracted_at: content.extractedAt
        }).onConflict((oc)=>oc.column('attachment_id').doUpdateSet({
                text_content: content.textContent,
                content_hash: content.contentHash,
                extracted_at: content.extractedAt
            })).execute();
    }
    async contentByAttachmentId(attachmentId) {
        const row = await this.db.selectFrom('attachment_contents').selectAll().where('attachment_id', '=', attachmentId).executeTakeFirst();
        return row ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toAttachmentContent"])(row) : undefined;
    }
    async attachmentTextByItemId(itemId) {
        const rows = await this.db.selectFrom('attachments').innerJoin('attachment_contents', 'attachment_contents.attachment_id', 'attachments.id').select([
            'attachment_contents.text_content'
        ]).where('attachments.item_id', '=', itemId).where('attachments.deleted_at', 'is', null).execute();
        return rows.map((row)=>row.text_content).join('\n');
    }
}
}),
"[project]/src/repositories/event-repository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EventRepository",
    ()=>EventRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/mappers.ts [app-route] (ecmascript)");
;
class EventRepository {
    db;
    constructor(db){
        this.db = db;
    }
    async insert(event) {
        await this.db.insertInto('item_events').values({
            id: event.id,
            item_id: event.itemId,
            command_id: event.commandId,
            event_type: event.eventType,
            payload_json: JSON.stringify(event.payloadJson),
            occurred_at: event.occurredAt
        }).execute();
    }
    async listAll(limit = 500) {
        const rows = await this.db.selectFrom('item_events').selectAll().orderBy('occurred_at', 'desc').limit(limit).execute();
        return rows.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toEvent"]);
    }
    async listByProject(projectId, limit = 100) {
        const rows = await this.db.selectFrom('item_events').innerJoin('items', 'items.id', 'item_events.item_id').select('item_events.id as id').select('item_events.item_id as item_id').select('item_events.command_id as command_id').select('item_events.event_type as event_type').select('item_events.payload_json as payload_json').select('item_events.occurred_at as occurred_at').where('items.project_id', '=', projectId).orderBy('item_events.occurred_at', 'desc').limit(limit).execute();
        return rows.map((row)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toEvent"])({
                id: row.id,
                item_id: row.item_id,
                command_id: row.command_id,
                event_type: row.event_type,
                payload_json: row.payload_json,
                occurred_at: row.occurred_at
            }));
    }
    async listByItemId(itemId, limit = 100) {
        const rows = await this.db.selectFrom('item_events').selectAll().where('item_id', '=', itemId).orderBy('occurred_at', 'desc').limit(limit).execute();
        return rows.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toEvent"]);
    }
}
}),
"[project]/src/repositories/saved-view-repository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SavedViewRepository",
    ()=>SavedViewRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$order$2d$key$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/order-key.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/mappers.ts [app-route] (ecmascript)");
;
;
class SavedViewRepository {
    db;
    constructor(db){
        this.db = db;
    }
    async list() {
        const rows = await this.db.selectFrom('saved_views').selectAll().where('deleted_at', 'is', null).orderBy('order_key', 'asc').execute();
        return rows.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toSavedView"]);
    }
    async get(savedViewId) {
        const row = await this.db.selectFrom('saved_views').selectAll().where('id', '=', savedViewId).where('deleted_at', 'is', null).executeTakeFirst();
        return row ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toSavedView"])(row) : undefined;
    }
    async nextOrderKey() {
        const last = await this.db.selectFrom('saved_views').select([
            'order_key'
        ]).where('deleted_at', 'is', null).orderBy('order_key', 'desc').executeTakeFirst();
        return last ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$order$2d$key$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateOrderKeyBetween"])(last.order_key, undefined) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$order$2d$key$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateInitialOrderKey"])();
    }
    async insert(view) {
        await this.db.insertInto('saved_views').values({
            id: view.id,
            name: view.name,
            icon: view.icon ?? null,
            query_json: JSON.stringify(view.queryJson),
            order_key: view.orderKey,
            created_at: view.createdAt,
            updated_at: view.updatedAt,
            deleted_at: view.deletedAt ?? null
        }).execute();
    }
    async update(view) {
        await this.db.updateTable('saved_views').set({
            name: view.name,
            icon: view.icon ?? null,
            query_json: JSON.stringify(view.queryJson),
            order_key: view.orderKey,
            updated_at: view.updatedAt,
            deleted_at: view.deletedAt ?? null
        }).where('id', '=', view.id).execute();
    }
}
}),
"[project]/src/repositories/search-repository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SearchRepository",
    ()=>SearchRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/kysely/dist/esm/raw-builder/sql.js [app-route] (ecmascript)");
;
class SearchRepository {
    db;
    constructor(db){
        this.db = db;
    }
    async upsertItemDocument(itemId) {
        const payload = await this.buildPayload(itemId);
        await this.db.deleteFrom('items_fts').where('item_id', '=', itemId).execute();
        if (!payload) {
            return;
        }
        await this.db.insertInto('items_fts').values({
            item_id: itemId,
            title: payload.title,
            description: payload.description,
            project_title: payload.projectTitle,
            tag_names: payload.tagNames,
            attachment_text: payload.attachmentText
        }).execute();
    }
    async removeItemDocument(itemId) {
        await this.db.deleteFrom('items_fts').where('item_id', '=', itemId).execute();
    }
    async rebuildAll() {
        await this.db.deleteFrom('items_fts').execute();
        const rows = await this.db.selectFrom('items').select([
            'id'
        ]).where('deleted_at', 'is', null).execute();
        for (const row of rows){
            await this.upsertItemDocument(row.id);
        }
    }
    async search(query, limit = 100) {
        const normalizedQuery = query.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
        if (normalizedQuery.length === 0) return [];
        const rows = await this.db.selectFrom('items_fts').select([
            'item_id'
        ]).select(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`bm25(items_fts, 10.0, 4.0, 6.0, 6.0, 2.0)`.as('rank')).where(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$kysely$2f$dist$2f$esm$2f$raw$2d$builder$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`items_fts MATCH ${normalizedQuery}`).orderBy('rank', 'asc').limit(limit).execute();
        return rows.map((row)=>({
                itemId: row.item_id,
                rank: Number(row.rank)
            }));
    }
    async buildPayload(itemId) {
        const item = await this.db.selectFrom('items').select([
            'id',
            'title',
            'description_md',
            'project_id'
        ]).where('id', '=', itemId).where('deleted_at', 'is', null).executeTakeFirst();
        if (!item) return undefined;
        const project = item.project_id ? await this.db.selectFrom('projects').select([
            'title'
        ]).where('id', '=', item.project_id).executeTakeFirst() : undefined;
        const tags = await this.db.selectFrom('item_tags').innerJoin('tags', 'tags.id', 'item_tags.tag_id').select([
            'tags.name'
        ]).where('item_tags.item_id', '=', itemId).execute();
        const attachmentTexts = await this.db.selectFrom('attachments').innerJoin('attachment_contents', 'attachment_contents.attachment_id', 'attachments.id').select([
            'attachment_contents.text_content'
        ]).where('attachments.item_id', '=', itemId).where('attachments.deleted_at', 'is', null).execute();
        return {
            title: item.title,
            description: item.description_md,
            projectTitle: project?.title ?? '',
            tagNames: tags.map((row)=>row.name).join(' '),
            attachmentText: attachmentTexts.map((row)=>row.text_content).join('\n')
        };
    }
}
}),
"[project]/src/repositories/preference-repository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PreferenceRepository",
    ()=>PreferenceRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ulid/dist/index.esm.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/mappers.ts [app-route] (ecmascript)");
;
;
class PreferenceRepository {
    db;
    constructor(db){
        this.db = db;
    }
    async getOrCreateDefault(timezone) {
        const existing = await this.db.selectFrom('user_preferences').selectAll().limit(1).executeTakeFirst();
        if (existing) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toUserPreference"])(existing);
        const now = Date.now();
        await this.db.insertInto('user_preferences').values({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(),
            timezone,
            theme: 'system',
            density: 'comfortable',
            week_starts_on: 1,
            default_project_id: null,
            today_shows_done: 0,
            reduce_motion: 0,
            created_at: now,
            updated_at: now
        }).execute();
        const created = await this.db.selectFrom('user_preferences').selectAll().limit(1).executeTakeFirstOrThrow();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toUserPreference"])(created);
    }
}
}),
"[project]/src/domain/taskio-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TaskioService",
    ()=>TaskioService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ulid/dist/index.esm.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$status$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/status.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tag$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tag.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$time$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/time.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$project$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/project-repository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$item$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/item-repository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$tag$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/tag-repository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$link$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/link-repository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$attachment$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/attachment-repository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$event$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/event-repository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$saved$2d$view$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/saved-view-repository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$search$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/search-repository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$preference$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/preference-repository.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const ALLOWED_LINK_SCHEMES = new Set([
    'http:',
    'https:',
    'mailto:'
]);
const createRepositories = (db)=>({
        projects: new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$project$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProjectRepository"](db),
        items: new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$item$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ItemRepository"](db),
        tags: new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$tag$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TagRepository"](db),
        links: new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$link$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LinkRepository"](db),
        attachments: new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$attachment$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AttachmentRepository"](db),
        events: new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$event$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EventRepository"](db),
        savedViews: new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$saved$2d$view$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SavedViewRepository"](db),
        search: new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$search$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SearchRepository"](db),
        preferences: new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$preference$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PreferenceRepository"](db)
    });
class TaskioService {
    db;
    timezone;
    constructor(options){
        this.db = options?.db ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDatabaseRuntime"])().db;
        this.timezone = options?.timezone ?? process.env.TASKIO_TIMEZONE ?? 'America/New_York';
    }
    async getUserPreference() {
        return createRepositories(this.db).preferences.getOrCreateDefault(this.timezone);
    }
    async listProjects(input) {
        return createRepositories(this.db).projects.list(input);
    }
    async getProject(projectId) {
        const project = await createRepositories(this.db).projects.get(projectId);
        if (!project) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Project not found');
        }
        return project;
    }
    async createProject(input) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assert"])(input.title.trim().length > 0, 'Project title is required');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assert"])(input.slug.trim().length > 0, 'Project slug is required');
        return this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const slug = input.slug.trim().toLowerCase();
            const slugConflict = await repos.projects.getBySlug(slug);
            if (slugConflict) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('conflict', `Project slug already exists: ${slug}`);
            }
            const now = Date.now();
            const project = {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(),
                slug,
                title: input.title.trim(),
                descriptionMd: input.descriptionMd?.trim() ?? '',
                status: input.status ?? 'active',
                colorToken: input.colorToken,
                icon: input.icon,
                orderKey: await repos.projects.nextOrderKey(),
                createdAt: now,
                updatedAt: now
            };
            await repos.projects.insert(project);
            return project;
        });
    }
    async updateProject(projectId, patch) {
        return this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const existing = await repos.projects.get(projectId);
            if (!existing) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Project not found');
            }
            const nextSlug = patch.slug?.trim().toLowerCase() ?? existing.slug;
            if (nextSlug !== existing.slug) {
                const conflict = await repos.projects.getBySlug(nextSlug);
                if (conflict && conflict.id !== projectId) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('conflict', `Project slug already exists: ${nextSlug}`);
                }
            }
            const now = Date.now();
            const updated = {
                ...existing,
                title: patch.title?.trim() ?? existing.title,
                slug: nextSlug,
                descriptionMd: patch.descriptionMd?.trim() ?? existing.descriptionMd,
                status: patch.status ?? existing.status,
                colorToken: patch.colorToken ?? existing.colorToken,
                icon: patch.icon ?? existing.icon,
                updatedAt: now,
                archivedAt: patch.status === 'archived' ? now : existing.archivedAt
            };
            await repos.projects.update(updated);
            const itemRows = await repos.items.listByProject(projectId);
            for (const item of itemRows){
                await repos.search.upsertItemDocument(item.id);
            }
            return updated;
        });
    }
    async deleteProject(projectId) {
        return this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const existing = await repos.projects.get(projectId);
            if (!existing) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Project not found');
            }
            const now = Date.now();
            const archived = {
                ...existing,
                status: 'archived',
                archivedAt: now,
                updatedAt: now
            };
            await repos.projects.update(archived);
            return archived;
        });
    }
    async reorderProjects(input) {
        return this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const target = await repos.projects.get(input.projectId);
            if (!target) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Project not found');
            }
            const left = input.leftProjectId ? await repos.projects.get(input.leftProjectId) : undefined;
            const right = input.rightProjectId ? await repos.projects.get(input.rightProjectId) : undefined;
            const nextOrderKey = await this.generateOrderKeyBetweenProjects(repos, left?.id, right?.id);
            const updated = {
                ...target,
                orderKey: nextOrderKey,
                updatedAt: Date.now()
            };
            await repos.projects.update(updated);
            return updated;
        });
    }
    async createItem(input, commandId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])()) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assert"])(input.title.trim().length > 0, 'Item title is required');
        return this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            if (input.projectId) {
                const project = await repos.projects.get(input.projectId);
                if (!project) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Project not found');
            }
            if (input.parentItemId) {
                const parent = await repos.items.get(input.parentItemId);
                if (!parent) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Parent item not found');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assert"])(parent.projectId === input.projectId, 'Parent and child must stay in same project scope');
            }
            const now = Date.now();
            const item = {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(),
                projectId: input.projectId,
                parentItemId: input.parentItemId,
                kind: input.kind ?? 'task',
                title: input.title.trim(),
                descriptionMd: input.descriptionMd?.trim() ?? '',
                status: input.status ?? 'inbox',
                priority: input.priority ?? 2,
                orderKey: await repos.items.nextOrderKey(input.projectId, input.parentItemId),
                scheduledAt: input.scheduledAt,
                dueAt: input.dueAt,
                completedAt: input.status === 'done' ? now : undefined,
                snoozedUntil: input.snoozedUntil,
                requestedBy: input.requestedBy,
                isInterruption: input.isInterruption ?? false,
                sourceKind: input.sourceKind ?? 'manual',
                sourceRef: input.sourceRef,
                createdAt: now,
                updatedAt: now
            };
            await repos.items.insert(item);
            for (const rawTag of input.tags ?? []){
                const tag = await this.addTagToItemInternal(repos, item.id, rawTag, commandId);
                if (tag) {
                // no-op
                }
            }
            await repos.events.insert({
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(),
                itemId: item.id,
                commandId,
                eventType: 'item.created',
                payloadJson: {
                    status: item.status
                },
                occurredAt: now
            });
            await repos.search.upsertItemDocument(item.id);
            return item;
        });
    }
    async updateItem(itemId, patch, commandId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])()) {
        return this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const existing = await repos.items.get(itemId);
            if (!existing) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Item not found');
            }
            if (patch.projectId) {
                const project = await repos.projects.get(patch.projectId);
                if (!project) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Project not found');
            }
            // TODO(GOTCHA): Parent reassignment currently blocks simple cycles only; deep cyclic checks should be expanded if nested moves become common.
            if (patch.parentItemId) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assert"])(patch.parentItemId !== itemId, 'Item cannot be its own parent');
                const parent = await repos.items.get(patch.parentItemId);
                if (!parent) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Parent item not found');
                const projectId = patch.projectId ?? existing.projectId;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assert"])(parent.projectId === projectId, 'Parent and child must stay in same project scope');
            }
            const now = Date.now();
            const updated = {
                ...existing,
                ...patch,
                title: patch.title?.trim() ?? existing.title,
                descriptionMd: patch.descriptionMd?.trim() ?? existing.descriptionMd,
                updatedAt: now
            };
            if (patch.status !== undefined) {
                this.assertTransition(existing.status, patch.status);
                if (patch.status === 'done') {
                    updated.completedAt = now;
                }
                if (existing.status === 'done' && patch.status !== 'done') {
                    updated.completedAt = undefined;
                }
            }
            await repos.items.update(updated);
            await repos.events.insert({
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(),
                itemId,
                commandId,
                eventType: 'item.updated',
                payloadJson: {
                    patch
                },
                occurredAt: now
            });
            await repos.search.upsertItemDocument(itemId);
            return updated;
        });
    }
    async deleteItem(itemId) {
        await this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const existing = await repos.items.get(itemId);
            if (!existing) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Item not found');
            }
            await repos.items.update({
                ...existing,
                deletedAt: Date.now(),
                updatedAt: Date.now()
            });
            await repos.search.removeItemDocument(itemId);
        });
    }
    async changeItemStatus(itemId, to, commandId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(), reason) {
        return this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const item = await repos.items.get(itemId);
            if (!item) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Item not found');
            }
            this.assertTransition(item.status, to);
            const now = Date.now();
            const updated = {
                ...item,
                status: to,
                updatedAt: now,
                completedAt: to === 'done' ? now : item.status === 'done' ? undefined : item.completedAt
            };
            await repos.items.update(updated);
            await repos.events.insert({
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(),
                itemId,
                commandId,
                eventType: to === 'done' ? 'item.completed' : item.status === 'done' ? 'item.reopened' : 'item.statusChanged',
                payloadJson: {
                    from: item.status,
                    to,
                    reason
                },
                occurredAt: now
            });
            await repos.search.upsertItemDocument(itemId);
            return updated;
        });
    }
    async scheduleItem(itemId, scheduledAt, dueAt, commandId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])()) {
        return this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const item = await repos.items.get(itemId);
            if (!item) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Item not found');
            const updated = {
                ...item,
                scheduledAt,
                dueAt,
                updatedAt: Date.now()
            };
            await repos.items.update(updated);
            await repos.events.insert({
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(),
                itemId,
                commandId,
                eventType: 'item.scheduled',
                payloadJson: {
                    scheduledAt,
                    dueAt
                },
                occurredAt: Date.now()
            });
            await repos.search.upsertItemDocument(itemId);
            return updated;
        });
    }
    async deferItem(itemId, snoozedUntil, commandId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])()) {
        return this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const item = await repos.items.get(itemId);
            if (!item) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Item not found');
            const updated = {
                ...item,
                snoozedUntil,
                updatedAt: Date.now()
            };
            await repos.items.update(updated);
            await repos.events.insert({
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(),
                itemId,
                commandId,
                eventType: 'item.updated',
                payloadJson: {
                    snoozedUntil
                },
                occurredAt: Date.now()
            });
            await repos.search.upsertItemDocument(itemId);
            return updated;
        });
    }
    async addTagToItem(itemId, rawTagName, commandId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])()) {
        return this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const item = await repos.items.get(itemId);
            if (!item) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Item not found');
            const tag = await this.addTagToItemInternal(repos, itemId, rawTagName, commandId);
            if (!tag) {
                const existing = await repos.tags.getByName((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tag$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeTagName"])(rawTagName));
                if (!existing) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Tag not found');
                return existing;
            }
            await repos.search.upsertItemDocument(itemId);
            return tag;
        });
    }
    async removeTagFromItem(itemId, rawTagName, commandId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])()) {
        await this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const item = await repos.items.get(itemId);
            if (!item) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Item not found');
            const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tag$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeTagName"])(rawTagName);
            const tag = await repos.tags.getByName(normalized);
            if (!tag) return;
            const removed = await repos.tags.detach(itemId, tag.id);
            if (!removed) return;
            await repos.events.insert({
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(),
                itemId,
                commandId,
                eventType: 'item.tagRemoved',
                payloadJson: {
                    tag: normalized
                },
                occurredAt: Date.now()
            });
            await repos.search.upsertItemDocument(itemId);
        });
    }
    async addLink(itemId, input, commandId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])()) {
        return this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const item = await repos.items.get(itemId);
            if (!item) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Item not found');
            this.assertSafeUrl(input.url);
            const link = {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(),
                itemId,
                url: input.url,
                label: input.label,
                kind: input.kind ?? 'generic',
                createdAt: Date.now()
            };
            await repos.links.insert(link);
            await repos.events.insert({
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(),
                itemId,
                commandId,
                eventType: 'item.linkAdded',
                payloadJson: {
                    url: input.url,
                    kind: link.kind
                },
                occurredAt: Date.now()
            });
            return link;
        });
    }
    async addAttachment(input, commandId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])()) {
        return this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const item = await repos.items.get(input.itemId);
            if (!item) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Item not found');
            const attachment = {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(),
                itemId: input.itemId,
                storageKey: input.storageKey,
                originalName: input.originalName,
                mimeType: input.mimeType,
                sizeBytes: input.sizeBytes,
                sha256: input.sha256,
                previewStatus: input.previewStatus ?? 'none',
                textExtractionStatus: input.textExtractionStatus ?? 'none',
                createdAt: Date.now()
            };
            await repos.attachments.insert(attachment);
            await repos.events.insert({
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(),
                itemId: input.itemId,
                commandId,
                eventType: 'item.attachmentAdded',
                payloadJson: {
                    attachmentId: attachment.id,
                    mimeType: attachment.mimeType
                },
                occurredAt: Date.now()
            });
            await repos.search.upsertItemDocument(input.itemId);
            return attachment;
        });
    }
    async setAttachmentContent(attachmentId, textContent) {
        return this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const attachment = await repos.attachments.get(attachmentId);
            if (!attachment) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Attachment not found');
            const content = {
                attachmentId,
                textContent,
                contentHash: `h-${textContent.length}`,
                extractedAt: Date.now()
            };
            await repos.attachments.upsertContent(content);
            await repos.attachments.update({
                ...attachment,
                textExtractionStatus: 'ready'
            });
            await repos.search.upsertItemDocument(attachment.itemId);
            return content;
        });
    }
    async reorderItems(input, commandId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])()) {
        return this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const target = await repos.items.get(input.itemId);
            if (!target) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Item not found');
            const left = input.leftItemId ? await repos.items.get(input.leftItemId) : undefined;
            const right = input.rightItemId ? await repos.items.get(input.rightItemId) : undefined;
            const nextKey = await this.generateOrderKeyBetweenItems(repos, left?.id, right?.id);
            const updated = {
                ...target,
                orderKey: nextKey,
                updatedAt: Date.now()
            };
            await repos.items.update(updated);
            await repos.events.insert({
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(),
                itemId: target.id,
                commandId,
                eventType: 'item.reordered',
                payloadJson: {
                    leftItemId: input.leftItemId,
                    rightItemId: input.rightItemId,
                    orderKey: nextKey
                },
                occurredAt: Date.now()
            });
            return updated;
        });
    }
    async createSavedView(input) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assert"])(input.name.trim().length > 0, 'Saved view name is required');
        return this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const now = Date.now();
            const view = {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(),
                name: input.name.trim(),
                icon: input.icon,
                queryJson: input.queryJson,
                orderKey: await repos.savedViews.nextOrderKey(),
                createdAt: now,
                updatedAt: now
            };
            await repos.savedViews.insert(view);
            return view;
        });
    }
    async listSavedViews() {
        return createRepositories(this.db).savedViews.list();
    }
    async updateSavedView(savedViewId, patch) {
        return this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const existing = await repos.savedViews.get(savedViewId);
            if (!existing) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Saved view not found');
            const updated = {
                ...existing,
                name: patch.name?.trim() ? patch.name.trim() : existing.name,
                icon: patch.icon ?? existing.icon,
                queryJson: patch.queryJson ?? existing.queryJson,
                updatedAt: Date.now()
            };
            await repos.savedViews.update(updated);
            return updated;
        });
    }
    async deleteSavedView(savedViewId) {
        await this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const existing = await repos.savedViews.get(savedViewId);
            if (!existing) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Saved view not found');
            await repos.savedViews.update({
                ...existing,
                deletedAt: Date.now(),
                updatedAt: Date.now()
            });
        });
    }
    async getTodayView(now = Date.now()) {
        const preference = await this.getUserPreference();
        const rows = (await this.activeRows(now, preference.todayShowsDone)).filter((row)=>{
            return !row._meta.snoozedUntil || row._meta.snoozedUntil <= now || row.isOverdue;
        });
        const triage = rows.filter((row)=>row.status === 'inbox');
        const overdue = rows.filter((row)=>row.isOverdue && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$status$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTerminalStatus"])(row.status));
        const today = rows.filter((row)=>{
            if (overdue.some((o)=>o.id === row.id)) return false;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$status$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTerminalStatus"])(row.status)) return false;
            return row.dueAt !== undefined && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$time$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSameLocalDay"])(row.dueAt, now, preference.timezone) || row.scheduledAt !== undefined && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$time$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSameLocalDay"])(row.scheduledAt, now, preference.timezone);
        });
        const inProgress = rows.filter((row)=>{
            if (row.status !== 'active') return false;
            if (today.some((t)=>t.id === row.id)) return false;
            if (overdue.some((o)=>o.id === row.id)) return false;
            return true;
        });
        return {
            now,
            timezone: preference.timezone,
            sections: [
                {
                    key: 'triage',
                    label: 'Needs Triage',
                    count: triage.length,
                    items: this.sortTodayRows(this.stripMeta(triage))
                },
                {
                    key: 'overdue',
                    label: 'Overdue',
                    count: overdue.length,
                    items: this.sortTodayRows(this.stripMeta(overdue))
                },
                {
                    key: 'today',
                    label: 'Today',
                    count: today.length,
                    items: this.sortTodayRows(this.stripMeta(today))
                },
                {
                    key: 'inProgress',
                    label: 'In Progress',
                    count: inProgress.length,
                    items: this.sortTodayRows(this.stripMeta(inProgress))
                }
            ]
        };
    }
    async getUpcomingView(now = Date.now()) {
        const preference = await this.getUserPreference();
        const rows = this.stripMeta((await this.activeRows(now, preference.todayShowsDone)).filter((row)=>!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$status$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTerminalStatus"])(row.status)));
        const tomorrow = [];
        const thisWeek = [];
        const nextWeek = [];
        const later = [];
        for (const row of rows){
            const ts = row.scheduledAt ?? row.dueAt;
            if (ts === undefined) continue;
            const days = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$time$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["daysFromNowLocal"])(ts, now, preference.timezone);
            if (days === 1) tomorrow.push(row);
            else if (days >= 2 && days <= 7) thisWeek.push(row);
            else if (days >= 8 && days <= 14) nextWeek.push(row);
            else if (days > 14) later.push(row);
        }
        const sort = (list)=>list.sort((a, b)=>{
                const aTs = a.scheduledAt ?? a.dueAt ?? Number.MAX_SAFE_INTEGER;
                const bTs = b.scheduledAt ?? b.dueAt ?? Number.MAX_SAFE_INTEGER;
                if (aTs !== bTs) return aTs - bTs;
                if (a.priority !== b.priority) return b.priority - a.priority;
                return a.id.localeCompare(b.id);
            });
        return {
            now,
            timezone: preference.timezone,
            buckets: [
                {
                    key: 'tomorrow',
                    label: 'Tomorrow',
                    items: sort(tomorrow)
                },
                {
                    key: 'thisWeek',
                    label: 'This Week',
                    items: sort(thisWeek)
                },
                {
                    key: 'nextWeek',
                    label: 'Next Week',
                    items: sort(nextWeek)
                },
                {
                    key: 'later',
                    label: 'Later',
                    items: sort(later)
                }
            ]
        };
    }
    async getInboxView(now = Date.now()) {
        const preference = await this.getUserPreference();
        const rows = (await this.rowsForItems(await this.filterItems({
            statuses: [
                'inbox'
            ],
            includeDone: true
        }), now)).sort((a, b)=>b.id.localeCompare(a.id));
        return {
            now,
            timezone: preference.timezone,
            items: rows
        };
    }
    async getProjectView(projectId, now = Date.now()) {
        const preference = await this.getUserPreference();
        const repos = createRepositories(this.db);
        const project = await repos.projects.get(projectId);
        if (!project) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Project not found');
        }
        const items = await this.rowsForItems(await repos.items.listByProject(projectId), now);
        const history = await repos.events.listByProject(projectId, 100);
        return {
            now,
            timezone: preference.timezone,
            project,
            items,
            history
        };
    }
    async getHistoryView(now = Date.now()) {
        const preference = await this.getUserPreference();
        const events = await createRepositories(this.db).events.listAll();
        return {
            now,
            timezone: preference.timezone,
            events
        };
    }
    async getTimelineView(input = {}) {
        const preference = await this.getUserPreference();
        const now = input.now ?? Date.now();
        const zoom = input.zoom ?? 'week';
        const mode = input.mode ?? 'dual';
        const defaultWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$time$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultTimelineWindow"])(now);
        let windowStart = input.windowStart ?? defaultWindow.windowStart;
        let windowEnd = input.windowEnd ?? defaultWindow.windowEnd;
        if (windowStart > windowEnd) {
            [windowStart, windowEnd] = [
                windowEnd,
                windowStart
            ];
        }
        if (windowStart === windowEnd) {
            windowEnd += 1;
        }
        const playheadTs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$time$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampPlayhead"])(input.playheadTs ?? now, windowStart, windowEnd);
        const repos = createRepositories(this.db);
        const [allProjects, allItems, allEvents] = await Promise.all([
            repos.projects.list({
                includeArchived: true
            }),
            repos.items.listAll(),
            repos.events.listAll(5_000)
        ]);
        const defaultProjectIds = allProjects.filter((project)=>project.status !== 'archived').map((project)=>project.id);
        const scopedProjectIds = input.projectIds && input.projectIds.length > 0 ? input.projectIds : defaultProjectIds;
        const scopedProjectSet = new Set(scopedProjectIds);
        const hasExplicitProjectScope = Boolean(input.projectIds && input.projectIds.length > 0);
        const scopedItems = allItems.filter((item)=>{
            if (!item.projectId) return !hasExplicitProjectScope;
            return scopedProjectSet.has(item.projectId);
        });
        const itemById = new Map(scopedItems.map((item)=>[
                item.id,
                item
            ]));
        const scopedItemIds = new Set(scopedItems.map((item)=>item.id));
        const scopedRows = await this.rowsForItems(scopedItems, now);
        const rowById = new Map(scopedRows.map((row)=>[
                row.id,
                row
            ]));
        const scopedEvents = allEvents.filter((event)=>scopedItemIds.has(event.itemId) && event.occurredAt >= windowStart && event.occurredAt <= windowEnd);
        const baseBuckets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$time$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildTimelineBuckets"])({
            zoom,
            windowStart,
            windowEnd,
            timezone: preference.timezone
        });
        const makeLane = (key, label)=>({
                key,
                label,
                buckets: baseBuckets.map((bucket)=>({
                        start: bucket.start,
                        end: bucket.end,
                        label: bucket.label,
                        count: 0,
                        itemIds: [],
                        eventIds: []
                    }))
            });
        const planLane = makeLane('plan', 'Plan');
        const realityLane = makeLane('reality', 'Reality');
        const overdueLane = makeLane('overduePressure', 'Overdue Pressure');
        const interruptionLane = makeLane('interruptions', 'Interruptions');
        for (const row of scopedRows){
            const ts = row.scheduledAt ?? row.dueAt;
            if (!ts || ts < windowStart || ts > windowEnd) continue;
            const index = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$time$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timelineBucketIndexForTs"])(baseBuckets, ts);
            const bucket = planLane.buckets[index];
            if (!bucket) continue;
            bucket.count += 1;
            bucket.itemIds.push(row.id);
        }
        const realityTypes = new Set([
            'item.created',
            'item.updated',
            'item.statusChanged',
            'item.scheduled',
            'item.dueChanged',
            'item.completed',
            'item.reopened',
            'item.moved',
            'item.reordered'
        ]);
        for (const event of scopedEvents){
            if (!realityTypes.has(event.eventType)) continue;
            const index = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$time$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timelineBucketIndexForTs"])(baseBuckets, event.occurredAt);
            const bucket = realityLane.buckets[index];
            if (!bucket) continue;
            bucket.count += 1;
            bucket.itemIds.push(event.itemId);
            bucket.eventIds.push(event.id);
        }
        for(let i = 0; i < baseBuckets.length; i += 1){
            const bucket = baseBuckets[i];
            if (!bucket) continue;
            const overdueCount = scopedRows.filter((row)=>{
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$status$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTerminalStatus"])(row.status)) return false;
                if (!row.dueAt) return false;
                return row.dueAt < bucket.end;
            }).length;
            const overdueBucket = overdueLane.buckets[i];
            const interruptionBucket = interruptionLane.buckets[i];
            if (!overdueBucket || !interruptionBucket) continue;
            overdueBucket.count = overdueCount;
            const interruptionFromItems = scopedItems.filter((item)=>item.isInterruption && item.createdAt >= bucket.start && item.createdAt < bucket.end);
            const interruptionFromEvents = scopedEvents.filter((event)=>{
                if (event.occurredAt < bucket.start || event.occurredAt >= bucket.end) return false;
                const item = itemById.get(event.itemId);
                return Boolean(item?.isInterruption) && event.eventType === 'item.created';
            });
            interruptionBucket.count = interruptionFromItems.length + interruptionFromEvents.length;
            interruptionBucket.itemIds = [
                ...new Set(interruptionFromItems.map((item)=>item.id).concat(interruptionFromEvents.map((event)=>event.itemId)))
            ];
            interruptionBucket.eventIds = interruptionFromEvents.map((event)=>event.id);
        }
        const playheadIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$time$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timelineBucketIndexForTs"])(baseBuckets, playheadTs);
        const emptyBucket = {
            start: windowStart,
            end: windowEnd,
            label: '',
            count: 0,
            itemIds: [],
            eventIds: []
        };
        const playheadBucket = baseBuckets[playheadIndex] ?? baseBuckets[0] ?? {
            start: windowStart,
            end: windowEnd,
            label: ''
        };
        const planAtPlayhead = planLane.buckets[playheadIndex] ?? emptyBucket;
        const realityAtPlayhead = realityLane.buckets[playheadIndex] ?? emptyBucket;
        const overdueAtPlayhead = overdueLane.buckets[playheadIndex] ?? emptyBucket;
        const interruptionAtPlayhead = interruptionLane.buckets[playheadIndex] ?? emptyBucket;
        let topItemIds = [
            ...new Set([
                ...planAtPlayhead.itemIds,
                ...realityAtPlayhead.itemIds
            ])
        ];
        if (topItemIds.length === 0) {
            topItemIds = [
                ...new Set(planLane.buckets.flatMap((bucket)=>bucket.itemIds).concat(realityLane.buckets.flatMap((bucket)=>bucket.itemIds)))
            ].slice(0, 20);
        }
        const topItems = topItemIds.map((itemId)=>rowById.get(itemId)).filter((row)=>Boolean(row)).sort((a, b)=>{
            if (a.priority !== b.priority) return b.priority - a.priority;
            if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
            return a.title.localeCompare(b.title);
        }).slice(0, 12);
        const recentEvents = scopedEvents.filter((event)=>event.occurredAt >= playheadBucket.start && event.occurredAt < playheadBucket.end).sort((a, b)=>b.occurredAt - a.occurredAt).slice(0, 12);
        const moments = [
            ...planLane.buckets.map((bucket)=>({
                    ts: bucket.start,
                    label: `Plan · ${bucket.label}`,
                    kind: 'plan',
                    count: bucket.count
                })),
            ...realityLane.buckets.map((bucket)=>({
                    ts: bucket.start,
                    label: `Reality · ${bucket.label}`,
                    kind: 'reality',
                    count: bucket.count
                })),
            ...overdueLane.buckets.map((bucket)=>({
                    ts: bucket.start,
                    label: `Overdue · ${bucket.label}`,
                    kind: 'overdue',
                    count: bucket.count
                })),
            ...interruptionLane.buckets.map((bucket)=>({
                    ts: bucket.start,
                    label: `Interruptions · ${bucket.label}`,
                    kind: 'interruption',
                    count: bucket.count
                }))
        ].filter((moment)=>moment.count > 0).sort((a, b)=>b.count - a.count || a.ts - b.ts).slice(0, 24);
        return {
            now,
            timezone: preference.timezone,
            zoom,
            mode,
            windowStart,
            windowEnd,
            playheadTs,
            projectIds: hasExplicitProjectScope ? scopedProjectIds : undefined,
            lanes: [
                planLane,
                realityLane,
                overdueLane,
                interruptionLane
            ],
            moments,
            summary: {
                playheadTs,
                playheadLabel: `${playheadBucket.label}`,
                counts: {
                    plan: planAtPlayhead.count,
                    reality: realityAtPlayhead.count,
                    overdue: overdueAtPlayhead.count,
                    interruptions: interruptionAtPlayhead.count
                },
                topItems,
                recentEvents
            }
        };
    }
    async search(query, filter) {
        const trimmed = query.trim();
        if (!trimmed) {
            const items = await this.filterItems(filter);
            const rows = await this.rowsForItems(items, Date.now());
            return rows.map((item)=>({
                    item,
                    score: 0
                }));
        }
        const repos = createRepositories(this.db);
        const hits = await repos.search.search(trimmed);
        const hitMap = new Map(hits.map((hit)=>[
                hit.itemId,
                hit.rank
            ]));
        const candidateIds = hits.map((hit)=>hit.itemId);
        if (candidateIds.length === 0) {
            return [];
        }
        const allFilteredItems = await this.filterItems({
            ...filter,
            includeDone: filter?.includeDone ?? true
        });
        const selectedItems = allFilteredItems.filter((item)=>hitMap.has(item.id));
        const rows = await this.rowsForItems(selectedItems, Date.now());
        const results = rows.map((row)=>{
            const rank = hitMap.get(row.id) ?? 9999;
            const score = 1 / (1 + Math.max(rank, 0));
            return {
                item: row,
                score,
                snippet: row.title
            };
        });
        return results.sort((a, b)=>b.score - a.score || b.item.id.localeCompare(a.item.id));
    }
    async getAttachment(attachmentId) {
        const attachment = await createRepositories(this.db).attachments.get(attachmentId);
        if (!attachment) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Attachment not found');
        }
        return attachment;
    }
    async getItemDetail(itemId) {
        const repos = createRepositories(this.db);
        const item = await repos.items.get(itemId);
        if (!item) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Item not found');
        const [project, tags, links, attachments, events] = await Promise.all([
            item.projectId ? repos.projects.get(item.projectId) : Promise.resolve(undefined),
            repos.tags.listByItemId(itemId),
            repos.links.listByItemId(itemId),
            repos.attachments.listByItemId(itemId),
            repos.events.listByItemId(itemId, 200)
        ]);
        return {
            item,
            project: project ?? undefined,
            tags,
            links,
            attachments,
            events
        };
    }
    async deleteAttachment(attachmentId) {
        await this.db.transaction().execute(async (trx)=>{
            const repos = createRepositories(trx);
            const attachment = await repos.attachments.get(attachmentId);
            if (!attachment) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Attachment not found');
            await repos.attachments.update({
                ...attachment,
                deletedAt: Date.now()
            });
            await repos.search.upsertItemDocument(attachment.itemId);
        });
    }
    async getItem(itemId) {
        const item = await createRepositories(this.db).items.get(itemId);
        if (!item) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('not_found', 'Item not found');
        return item;
    }
    async listItems() {
        return createRepositories(this.db).items.listAll();
    }
    async addTagToItemInternal(repos, itemId, rawTagName, commandId) {
        const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tag$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeTagName"])(rawTagName);
        let tag = await repos.tags.getByName(normalized);
        if (!tag) {
            tag = {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(),
                name: normalized,
                displayName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tag$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toTagDisplayName"])(normalized),
                createdAt: Date.now()
            };
            await repos.tags.insert(tag);
        }
        const added = await repos.tags.attach(itemId, tag.id, Date.now());
        if (!added) {
            return undefined;
        }
        await repos.events.insert({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ulid$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ulid"])(),
            itemId,
            commandId,
            eventType: 'item.tagAdded',
            payloadJson: {
                tag: normalized
            },
            occurredAt: Date.now()
        });
        return tag;
    }
    async filterItems(filter) {
        const repos = createRepositories(this.db);
        let items = await repos.items.listAll();
        if (!filter) {
            return items;
        }
        if (filter.includeDone !== true) {
            items = items.filter((item)=>item.status !== 'done' && item.status !== 'canceled');
        }
        if (filter.statuses && filter.statuses.length > 0) {
            const allowed = new Set(filter.statuses);
            items = items.filter((item)=>allowed.has(item.status));
        }
        if (filter.kinds && filter.kinds.length > 0) {
            const allowed = new Set(filter.kinds);
            items = items.filter((item)=>allowed.has(item.kind));
        }
        if (filter.projectIds && filter.projectIds.length > 0) {
            const allowed = new Set(filter.projectIds);
            items = items.filter((item)=>item.projectId && allowed.has(item.projectId));
        }
        if (filter.tagAny && filter.tagAny.length > 0) {
            const normalizedAny = filter.tagAny.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tag$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeTagName"]);
            const namesByItemId = await repos.tags.namesByItemIds(items.map((item)=>item.id));
            items = items.filter((item)=>{
                const names = namesByItemId.get(item.id) ?? [];
                return normalizedAny.some((name)=>names.includes(name));
            });
        }
        if (filter.tagAll && filter.tagAll.length > 0) {
            const normalizedAll = filter.tagAll.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tag$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeTagName"]);
            const namesByItemId = await repos.tags.namesByItemIds(items.map((item)=>item.id));
            items = items.filter((item)=>{
                const names = namesByItemId.get(item.id) ?? [];
                return normalizedAll.every((name)=>names.includes(name));
            });
        }
        if (filter.search) {
            const q = filter.search.toLowerCase();
            const namesByItemId = await repos.tags.namesByItemIds(items.map((item)=>item.id));
            const projectIds = [
                ...new Set(items.map((item)=>item.projectId).filter((id)=>Boolean(id)))
            ];
            const projectMap = new Map();
            for (const projectId of projectIds){
                const project = await repos.projects.get(projectId);
                if (project) projectMap.set(projectId, project.title);
            }
            items = items.filter((item)=>{
                const tagNames = namesByItemId.get(item.id) ?? [];
                const projectTitle = item.projectId ? projectMap.get(item.projectId) ?? '' : '';
                return item.title.toLowerCase().includes(q) || item.descriptionMd.toLowerCase().includes(q) || tagNames.some((tag)=>tag.includes(q)) || projectTitle.toLowerCase().includes(q);
            });
        }
        return items;
    }
    async activeRows(now, includeDone = false) {
        const items = await this.filterItems({
            includeDone
        });
        const rows = await this.rowsForItems(items, now);
        const byId = new Map(items.map((item)=>[
                item.id,
                item
            ]));
        return rows.map((row)=>({
                ...row,
                isOverdue: row.dueAt !== undefined && row.dueAt < now && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$status$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTerminalStatus"])(row.status),
                _meta: {
                    snoozedUntil: byId.get(row.id)?.snoozedUntil
                }
            }));
    }
    async rowsForItems(items, now = Date.now()) {
        const repos = createRepositories(this.db);
        const itemIds = items.map((item)=>item.id);
        const projectIds = [
            ...new Set(items.map((item)=>item.projectId).filter((id)=>Boolean(id)))
        ];
        const projectMap = new Map();
        for (const projectId of projectIds){
            const project = await repos.projects.get(projectId);
            if (project) projectMap.set(projectId, project);
        }
        const tagsByItemId = await repos.tags.namesByItemIds(itemIds);
        const linkCounts = await repos.links.countByItemIds(itemIds);
        const attachmentCounts = await repos.attachments.countByItemIds(itemIds);
        const childCounts = await repos.items.childCountByItemIds(itemIds);
        return items.map((item)=>{
            const project = item.projectId ? projectMap.get(item.projectId) : undefined;
            return {
                id: item.id,
                title: item.title,
                kind: item.kind,
                status: item.status,
                priority: item.priority,
                project: project ? {
                    id: project.id,
                    title: project.title,
                    slug: project.slug
                } : undefined,
                tags: tagsByItemId.get(item.id) ?? [],
                dueAt: item.dueAt,
                scheduledAt: item.scheduledAt,
                requestedBy: item.requestedBy,
                isInterruption: item.isInterruption,
                hasLinks: (linkCounts.get(item.id) ?? 0) > 0,
                attachmentCount: attachmentCounts.get(item.id) ?? 0,
                childCount: childCounts.get(item.id) ?? 0,
                isOverdue: item.dueAt !== undefined && item.dueAt < now && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$status$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTerminalStatus"])(item.status)
            };
        });
    }
    stripMeta(rows) {
        return rows.map((row)=>{
            const { _meta: _unused, ...rest } = row;
            return rest;
        });
    }
    sortTodayRows(rows) {
        return rows.sort((a, b)=>{
            if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
            const aDue = a.dueAt ?? Number.MAX_SAFE_INTEGER;
            const bDue = b.dueAt ?? Number.MAX_SAFE_INTEGER;
            if (aDue !== bDue) return aDue - bDue;
            const aSched = a.scheduledAt ?? Number.MAX_SAFE_INTEGER;
            const bSched = b.scheduledAt ?? Number.MAX_SAFE_INTEGER;
            if (aSched !== bSched) return aSched - bSched;
            if (a.priority !== b.priority) return b.priority - a.priority;
            return a.id.localeCompare(b.id);
        });
    }
    assertTransition(from, to) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$status$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canTransitionStatus"])(from, to)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('conflict', `Illegal status transition: ${from} -> ${to}`);
        }
    }
    assertSafeUrl(rawUrl) {
        let parsed;
        try {
            parsed = new URL(rawUrl);
        } catch  {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('validation', 'Invalid URL');
        }
        if (!ALLOWED_LINK_SCHEMES.has(parsed.protocol)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]('validation', 'URL scheme is not allowed');
        }
    }
    async generateOrderKeyBetweenItems(repos, leftItemId, rightItemId) {
        const left = leftItemId ? await repos.items.get(leftItemId) : undefined;
        const right = rightItemId ? await repos.items.get(rightItemId) : undefined;
        if (!left && !right) {
            return repos.items.nextOrderKey();
        }
        const leftKey = left?.orderKey;
        const rightKey = right?.orderKey;
        if (!leftKey && rightKey) {
            return `0${rightKey}`;
        }
        if (leftKey && !rightKey) {
            return `${leftKey}z`;
        }
        if (!leftKey || !rightKey) {
            return await repos.items.nextOrderKey();
        }
        let candidate = `${leftKey}m`;
        if (candidate <= leftKey || candidate >= rightKey) {
            candidate = `${leftKey}0`;
        }
        if (candidate <= leftKey || candidate >= rightKey) {
            // TODO(GOTCHA): Order-key midpoint fallback is simplistic; dense reorder ranges may require a stricter fractional-indexing implementation.
            return `${leftKey}zz`;
        }
        return candidate;
    }
    async generateOrderKeyBetweenProjects(repos, leftProjectId, rightProjectId) {
        const left = leftProjectId ? await repos.projects.get(leftProjectId) : undefined;
        const right = rightProjectId ? await repos.projects.get(rightProjectId) : undefined;
        if (!left && !right) {
            return repos.projects.nextOrderKey();
        }
        const leftKey = left?.orderKey;
        const rightKey = right?.orderKey;
        if (!leftKey && rightKey) {
            return `0${rightKey}`;
        }
        if (leftKey && !rightKey) {
            return `${leftKey}z`;
        }
        if (!leftKey || !rightKey) {
            return await repos.projects.nextOrderKey();
        }
        let candidate = `${leftKey}m`;
        if (candidate <= leftKey || candidate >= rightKey) {
            candidate = `${leftKey}0`;
        }
        if (candidate <= leftKey || candidate >= rightKey) {
            return `${leftKey}zz`;
        }
        return candidate;
    }
}
}),
"[project]/src/db/migrations.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "defaultMigrationDir",
    ()=>defaultMigrationDir,
    "getAppliedMigrations",
    ()=>getAppliedMigrations,
    "migrateDown",
    ()=>migrateDown,
    "migrateUp",
    ()=>migrateUp,
    "migrationStatus",
    ()=>migrationStatus
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
const defaultMigrationDir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), 'migrations');
const ensureMigrationsTable = (sqlite)=>{
    sqlite.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL
    );
  `);
};
const loadMigrationPairs = (migrationDir = defaultMigrationDir)=>{
    const entries = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(migrationDir).filter((file)=>file.endsWith('.sql'));
    const grouped = new Map();
    for (const file of entries){
        const match = file.match(/^(\d+_[\w-]+)\.(up|down)\.sql$/);
        if (!match) continue;
        const name = match[1];
        const direction = match[2];
        if (!name || direction !== 'up' && direction !== 'down') {
            continue;
        }
        const group = grouped.get(name) ?? {};
        group[direction] = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(migrationDir, file);
        grouped.set(name, group);
    }
    return [
        ...grouped.entries()
    ].map(([name, value])=>{
        if (!value.up || !value.down) {
            throw new Error(`Migration ${name} must have both .up.sql and .down.sql`);
        }
        return {
            name,
            upPath: value.up,
            downPath: value.down
        };
    }).sort((a, b)=>a.name.localeCompare(b.name));
};
const getAppliedMigrations = (sqlite)=>{
    ensureMigrationsTable(sqlite);
    const rows = sqlite.prepare('SELECT name, applied_at as appliedAt FROM schema_migrations ORDER BY name ASC').all();
    return rows;
};
const migrateUp = (sqlite, migrationDir = defaultMigrationDir)=>{
    ensureMigrationsTable(sqlite);
    const applied = new Set(getAppliedMigrations(sqlite).map((row)=>row.name));
    const pairs = loadMigrationPairs(migrationDir);
    const appliedNow = [];
    for (const pair of pairs){
        if (applied.has(pair.name)) continue;
        const upSql = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(pair.upPath, 'utf8');
        const tx = sqlite.transaction(()=>{
            sqlite.exec(upSql);
            sqlite.prepare('INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)').run(pair.name, Date.now());
        });
        tx();
        appliedNow.push(pair.name);
    }
    return appliedNow;
};
const migrateDown = (sqlite, migrationDir = defaultMigrationDir, steps = 1)=>{
    ensureMigrationsTable(sqlite);
    const applied = getAppliedMigrations(sqlite);
    if (applied.length === 0 || steps <= 0) return [];
    const pairs = loadMigrationPairs(migrationDir);
    const pairByName = new Map(pairs.map((pair)=>[
            pair.name,
            pair
        ]));
    const targets = applied.slice(-steps).reverse();
    const rolledBack = [];
    for (const target of targets){
        const pair = pairByName.get(target.name);
        if (!pair) {
            throw new Error(`Missing migration files for applied migration ${target.name}`);
        }
        const downSql = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(pair.downPath, 'utf8');
        const tx = sqlite.transaction(()=>{
            sqlite.exec(downSql);
            sqlite.prepare('DELETE FROM schema_migrations WHERE name = ?').run(target.name);
        });
        tx();
        rolledBack.push(target.name);
    }
    return rolledBack;
};
const migrationStatus = (sqlite, migrationDir = defaultMigrationDir)=>{
    ensureMigrationsTable(sqlite);
    const applied = new Map(getAppliedMigrations(sqlite).map((row)=>[
            row.name,
            row.appliedAt
        ]));
    const pairs = loadMigrationPairs(migrationDir);
    return pairs.map((pair)=>({
            name: pair.name,
            applied: applied.has(pair.name),
            appliedAt: applied.get(pair.name) ?? null
        }));
};
}),
"[project]/src/db/bootstrap.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureDatabaseReady",
    ()=>ensureDatabaseReady
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$migrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/migrations.ts [app-route] (ecmascript)");
;
;
let readyPromise;
let readyDatabasePath;
const ensureDatabaseReady = async ()=>{
    const runtime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDatabaseRuntime"])();
    if (!readyPromise || readyDatabasePath !== runtime.databasePath) {
        readyDatabasePath = runtime.databasePath;
        readyPromise = (async ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$migrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["migrateUp"])(runtime.sqlite);
        })();
    }
    return readyPromise;
};
}),
"[project]/src/storage/local-storage-adapter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LocalStorageAdapter",
    ()=>LocalStorageAdapter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
;
;
class LocalStorageAdapter {
    rootDir;
    publicBaseUrl;
    constructor(rootDir, publicBaseUrl){
        this.rootDir = rootDir;
        this.publicBaseUrl = publicBaseUrl;
    }
    async put(input) {
        const fullPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(this.rootDir, input.key);
        await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["promises"].mkdir(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname(fullPath), {
            recursive: true
        });
        const data = input.body instanceof Buffer ? input.body : Buffer.from(new Uint8Array(input.body));
        await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["promises"].writeFile(fullPath, data);
    }
    async getSignedReadUrl(key) {
        return `${this.publicBaseUrl.replace(/\/$/, '')}/api/files/${encodeURIComponent(key)}`;
    }
    async delete(key) {
        const fullPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(this.rootDir, key);
        await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["promises"].rm(fullPath, {
            force: true
        });
    }
}
}),
"[project]/src/api/service-context.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getService",
    ()=>getService,
    "getStorage",
    ()=>getStorage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$taskio$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/taskio-service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$bootstrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/bootstrap.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$storage$2f$local$2d$storage$2d$adapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/storage/local-storage-adapter.ts [app-route] (ecmascript)");
;
;
;
;
;
const getService = async ()=>{
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$bootstrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureDatabaseReady"])();
    return new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$taskio$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TaskioService"]({
        db: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDatabaseRuntime"])().db,
        timezone: process.env.TASKIO_TIMEZONE ?? 'America/New_York'
    });
};
const getStorage = ()=>{
    const uploadDir = process.env.UPLOAD_LOCAL_DIR ?? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), '.uploads');
    const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000';
    return new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$storage$2f$local$2d$storage$2d$adapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LocalStorageAdapter"](uploadDir, baseUrl);
};
}),
"[project]/src/api/schemas.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Base64Schema",
    ()=>Base64Schema,
    "ItemCreateSchema",
    ()=>ItemCreateSchema,
    "ItemKindSchema",
    ()=>ItemKindSchema,
    "ItemPatchSchema",
    ()=>ItemPatchSchema,
    "ItemStatusSchema",
    ()=>ItemStatusSchema,
    "LinkKindSchema",
    ()=>LinkKindSchema,
    "MimeTypeSchema",
    ()=>MimeTypeSchema,
    "PrioritySchema",
    ()=>PrioritySchema,
    "ProjectCreateSchema",
    ()=>ProjectCreateSchema,
    "ProjectPatchSchema",
    ()=>ProjectPatchSchema,
    "ProjectStatusSchema",
    ()=>ProjectStatusSchema,
    "SearchQuerySchema",
    ()=>SearchQuerySchema,
    "SourceKindSchema",
    ()=>SourceKindSchema,
    "TimelineModeSchema",
    ()=>TimelineModeSchema,
    "TimelineQuerySchema",
    ()=>TimelineQuerySchema,
    "TimelineZoomSchema",
    ()=>TimelineZoomSchema,
    "TimestampSchema",
    ()=>TimestampSchema,
    "parseSearchFilter",
    ()=>parseSearchFilter,
    "parseTimelineQuery",
    ()=>parseTimelineQuery,
    "splitCsv",
    ()=>splitCsv
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const ProjectStatusSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    'active',
    'paused',
    'done',
    'archived'
]);
const ItemKindSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    'task',
    'note',
    'milestone'
]);
const ItemStatusSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    'inbox',
    'active',
    'blocked',
    'waiting',
    'done',
    'canceled'
]);
const LinkKindSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    'github',
    'doc',
    'ticket',
    'chat',
    'calendar',
    'generic'
]);
const SourceKindSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    'manual',
    'api',
    'import',
    'share',
    'email',
    'link',
    'upload'
]);
const TimelineZoomSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    'day',
    'week',
    'month',
    'quarter',
    'year',
    'all'
]);
const TimelineModeSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    'dual',
    'plan',
    'reality'
]);
const PrioritySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(0),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(1),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(2),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(3),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(4)
]);
const TimestampSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nonnegative();
const MimeTypeSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i, 'Invalid MIME type');
const Base64Schema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).regex(/^[A-Za-z0-9+/]+={0,2}$/, 'Invalid base64 payload');
const ProjectCreateSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(240),
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(240).regex(/^[a-z0-9-]+$/, 'Slug must use [a-z0-9-]+'),
    descriptionMd: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100_000).optional(),
    status: ProjectStatusSchema.optional(),
    colorToken: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(64).optional(),
    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(64).optional()
});
const ProjectPatchSchema = ProjectCreateSchema.partial();
const ItemCreateSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(240),
    projectId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).optional(),
    parentItemId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).optional(),
    kind: ItemKindSchema.optional(),
    descriptionMd: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(200_000).optional(),
    status: ItemStatusSchema.optional(),
    priority: PrioritySchema.optional(),
    scheduledAt: TimestampSchema.optional(),
    dueAt: TimestampSchema.optional(),
    snoozedUntil: TimestampSchema.optional(),
    requestedBy: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).optional(),
    isInterruption: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    sourceKind: SourceKindSchema.optional(),
    sourceRef: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(500).optional(),
    tags: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(120)).max(200).optional()
});
const ItemPatchSchema = ItemCreateSchema.omit({
    tags: true
}).partial();
const SearchQuerySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    q: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    search: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    statuses: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    kinds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    projectIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    tagAny: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    tagAll: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    includeDone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'true',
        'false'
    ]).optional()
});
const TimelineQuerySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    zoom: TimelineZoomSchema.optional(),
    mode: TimelineModeSchema.optional(),
    windowStart: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^\d+$/).optional(),
    windowEnd: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^\d+$/).optional(),
    playheadTs: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^\d+$/).optional(),
    projectIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
const splitCsv = (value)=>{
    if (!value) return undefined;
    const parts = value.split(',').map((v)=>v.trim()).filter(Boolean);
    return parts.length > 0 ? parts : undefined;
};
const parseSearchFilter = (query)=>({
        statuses: query.statuses ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(ItemStatusSchema).parse(splitCsv(query.statuses)) : undefined,
        kinds: query.kinds ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(ItemKindSchema).parse(splitCsv(query.kinds)) : undefined,
        projectIds: splitCsv(query.projectIds),
        tagAny: splitCsv(query.tagAny),
        tagAll: splitCsv(query.tagAll),
        includeDone: query.includeDone === undefined ? undefined : query.includeDone === 'true',
        search: query.search
    });
const parseOptionalTimestamp = (value)=>{
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};
const parseTimelineQuery = (query)=>({
        zoom: query.zoom,
        mode: query.mode,
        windowStart: parseOptionalTimestamp(query.windowStart),
        windowEnd: parseOptionalTimestamp(query.windowEnd),
        playheadTs: parseOptionalTimestamp(query.playheadTs),
        projectIds: splitCsv(query.projectIds)
    });
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/api/contracts.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiHttpError",
    ()=>ApiHttpError,
    "fail",
    ()=>fail,
    "ok",
    ()=>ok
]);
const ok = (data)=>({
        ok: true,
        data
    });
const fail = (code, message, details)=>({
        ok: false,
        error: {
            code,
            message,
            details
        }
    });
class ApiHttpError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, code, message, details){
        super(message), this.statusCode = statusCode, this.code = code, this.details = details;
    }
}
}),
"[project]/src/repositories/idempotency-repository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IdempotencyRepository",
    ()=>IdempotencyRepository
]);
class IdempotencyRepository {
    db;
    constructor(db){
        this.db = db;
    }
    async get(operation, idempotencyKey) {
        const row = await this.db.selectFrom('idempotency_keys').select([
            'status_code',
            'response_json'
        ]).where('operation', '=', operation).where('idempotency_key', '=', idempotencyKey).executeTakeFirst();
        if (!row) return undefined;
        return {
            statusCode: row.status_code,
            payloadJson: row.response_json
        };
    }
    async set(input) {
        await this.db.insertInto('idempotency_keys').values({
            operation: input.operation,
            idempotency_key: input.idempotencyKey,
            status_code: input.statusCode,
            response_json: input.payloadJson,
            created_at: Date.now()
        }).onConflict((oc)=>oc.columns([
                'operation',
                'idempotency_key'
            ]).doNothing()).execute();
    }
}
}),
"[project]/src/api/next-helpers.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleRouteError",
    ()=>handleRouteError,
    "jsonOk",
    ()=>jsonOk,
    "parseOrThrow",
    ()=>parseOrThrow,
    "parseRequestJson",
    ()=>parseRequestJson,
    "withIdempotency",
    ()=>withIdempotency
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/errors.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$contracts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/api/contracts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$idempotency$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/repositories/idempotency-repository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$bootstrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/bootstrap.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const parseOrThrow = (schema, input)=>schema.parse(input);
const jsonOk = (data, init)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$contracts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])(data), {
        status: init?.status ?? 200,
        headers: init?.headers
    });
const parseRequestJson = async (request, schema)=>{
    const raw = await request.json();
    return parseOrThrow(schema, raw);
};
const handleRouteError = (error)=>{
    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodError"]) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$contracts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('VALIDATION_ERROR', 'Validation failed', error.flatten()), {
            status: 400
        });
    }
    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$contracts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ApiHttpError"]) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$contracts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])(error.code, error.message, error.details), {
            status: error.statusCode
        });
    }
    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DomainError"]) {
        if (error.code === 'validation') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$contracts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('BAD_REQUEST', error.message), {
                status: 400
            });
        }
        if (error.code === 'not_found') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$contracts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('NOT_FOUND', error.message), {
                status: 404
            });
        }
        if (error.code === 'conflict') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$contracts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('CONFLICT', error.message), {
                status: 409
            });
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$contracts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('INTERNAL_ERROR', 'Internal server error'), {
        status: 500
    });
};
const idempotencyKeyFromRequest = (request)=>{
    const raw = request.headers.get('idempotency-key');
    if (!raw) return undefined;
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};
const withIdempotency = async (request, operation, execute)=>{
    const key = idempotencyKeyFromRequest(request);
    if (!key) {
        return execute();
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$bootstrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureDatabaseReady"])();
    const repo = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$repositories$2f$idempotency$2d$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["IdempotencyRepository"]((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDatabaseRuntime"])().db);
    const stored = await repo.get(operation, key);
    if (stored) {
        return {
            status: stored.statusCode,
            payload: JSON.parse(stored.payloadJson)
        };
    }
    const result = await execute();
    if (result.status < 500) {
        await repo.set({
            operation,
            idempotencyKey: key,
            statusCode: result.status,
            payloadJson: JSON.stringify(result.payload)
        });
    }
    return result;
};
}),
"[project]/app/api/search/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$service$2d$context$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/api/service-context.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/api/schemas.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$next$2d$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/api/next-helpers.ts [app-route] (ecmascript)");
;
;
;
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$next$2d$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseOrThrow"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SearchQuerySchema"], Object.fromEntries(searchParams.entries()));
        const service = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$service$2d$context$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getService"])();
        const q = query.q ?? '';
        const filter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseSearchFilter"])(query);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$next$2d$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonOk"])(await service.search(q, filter));
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$next$2d$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleRouteError"])(error);
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a73add0e._.js.map