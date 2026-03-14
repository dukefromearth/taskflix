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
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

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
"[project]/app/api/files/[key]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$next$2d$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/api/next-helpers.ts [app-route] (ecmascript)");
;
;
;
;
;
const ParamsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    key: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
async function GET(_request, context) {
    try {
        const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$next$2d$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseOrThrow"])(ParamsSchema, await context.params);
        const decodedKey = decodeURIComponent(params.key);
        const normalizedKey = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].normalize(decodedKey).replace(/^\/+/, '');
        if (normalizedKey.startsWith('..') || __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].isAbsolute(normalizedKey)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                error: {
                    code: 'BAD_REQUEST',
                    message: 'Invalid file key'
                }
            }, {
                status: 400
            });
        }
        const uploadsDir = process.env.UPLOAD_LOCAL_DIR ?? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), '.uploads');
        const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(uploadsDir, normalizedKey);
        const fileData = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["promises"].readFile(filePath);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](fileData, {
            status: 200,
            headers: {
                'content-type': 'application/octet-stream',
                'cache-control': 'private, max-age=300'
            }
        });
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$next$2d$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleRouteError"])(error);
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__35e41784._.js.map