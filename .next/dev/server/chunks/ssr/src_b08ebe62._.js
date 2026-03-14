module.exports = [
"[project]/src/domain/time.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/ui/components/item-list.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ItemList",
    ()=>ItemList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ui/components/utils.ts [app-ssr] (ecmascript)");
'use client';
;
;
const ItemList = ({ items, selectedItemId, onSelect, actions, emptyLabel = 'No items' })=>{
    if (items.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-xl border border-stone-300 bg-panel p-4 text-sm text-muted",
            children: emptyLabel
        }, void 0, false, {
            fileName: "[project]/src/ui/components/item-list.tsx",
            lineNumber: 24,
            columnNumber: 12
        }, ("TURBOPACK compile-time value", void 0));
    }
    const actionList = [
        {
            key: 'complete',
            label: 'Done',
            onClick: actions?.onComplete
        },
        {
            key: 'activate',
            label: 'Active',
            onClick: actions?.onActivate
        },
        {
            key: 'inbox',
            label: 'Inbox',
            onClick: actions?.onInbox
        },
        {
            key: 'scheduleTomorrow',
            label: 'Tomorrow',
            onClick: actions?.onScheduleTomorrow
        },
        {
            key: 'deferDay',
            label: 'Defer +1d',
            onClick: actions?.onDeferDay
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
        className: "space-y-2",
        children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('rounded-xl border bg-gradient-to-b from-white via-white to-stone-50 p-3 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-accent/60', selectedItemId === item.id ? 'border-accent ring-2 ring-accent/25 shadow-[0_20px_38px_-24px_rgba(185,28,28,0.65)]' : 'border-stone-300'),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>onSelect(item.id),
                            className: "w-full text-left",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start justify-between gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-medium text-ink",
                                                children: item.title
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/item-list.tsx",
                                                lineNumber: 48,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-1 text-xs leading-5 text-muted",
                                                children: [
                                                    item.project ? item.project.title : 'No project',
                                                    item.isOverdue ? ' · overdue' : '',
                                                    item.scheduledAt ? ` · scheduled ${new Date(item.scheduledAt).toLocaleDateString()}` : '',
                                                    item.dueAt ? ` · due ${new Date(item.dueAt).toLocaleDateString()}` : ''
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/ui/components/item-list.tsx",
                                                lineNumber: 49,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            item.tags.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-2 text-xs text-muted",
                                                children: [
                                                    "#",
                                                    item.tags.join(' #')
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/ui/components/item-list.tsx",
                                                lineNumber: 55,
                                                columnNumber: 41
                                            }, ("TURBOPACK compile-time value", void 0)) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/ui/components/item-list.tsx",
                                        lineNumber: 47,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase', item.status === 'done' ? 'bg-emerald-100 text-emerald-900' : item.status === 'canceled' ? 'bg-stone-200 text-stone-700' : item.status === 'blocked' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'),
                                                children: item.status
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/item-list.tsx",
                                                lineNumber: 58,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-muted",
                                                children: [
                                                    "P",
                                                    item.priority
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/ui/components/item-list.tsx",
                                                lineNumber: 72,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/ui/components/item-list.tsx",
                                        lineNumber: 57,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/ui/components/item-list.tsx",
                                lineNumber: 46,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/ui/components/item-list.tsx",
                            lineNumber: 45,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-3 flex flex-wrap gap-1",
                            "aria-label": "Inline item actions",
                            children: actionList.map((action)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActionButton, {
                                    label: action.label,
                                    disabled: !action.onClick,
                                    onClick: ()=>action.onClick?.(item.id)
                                }, action.key, false, {
                                    fileName: "[project]/src/ui/components/item-list.tsx",
                                    lineNumber: 79,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)))
                        }, void 0, false, {
                            fileName: "[project]/src/ui/components/item-list.tsx",
                            lineNumber: 77,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/ui/components/item-list.tsx",
                    lineNumber: 39,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, item.id, false, {
                fileName: "[project]/src/ui/components/item-list.tsx",
                lineNumber: 38,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)))
    }, void 0, false, {
        fileName: "[project]/src/ui/components/item-list.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const ActionButton = ({ label, onClick, disabled })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        disabled: disabled,
        onClick: (event)=>{
            event.preventDefault();
            event.stopPropagation();
            onClick?.();
        },
        className: "rounded border border-stone-300 bg-white px-2 py-0.5 text-xs text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40",
        children: label
    }, void 0, false, {
        fileName: "[project]/src/ui/components/item-list.tsx",
        lineNumber: 95,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
}),
"[project]/src/ui/hooks/use-item-actions.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useItemActions",
    ()=>useItemActions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ui/api/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ui/query/keys.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const useItemActions = ()=>{
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    const invalidate = async (itemId)=>{
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryKeys"].today
            }),
            queryClient.invalidateQueries({
                queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryKeys"].upcoming
            }),
            queryClient.invalidateQueries({
                queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryKeys"].inbox
            }),
            queryClient.invalidateQueries({
                queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryKeys"].history
            }),
            queryClient.invalidateQueries({
                queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryKeys"].timeline
            }),
            queryClient.invalidateQueries({
                queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryKeys"].items
            }),
            queryClient.invalidateQueries({
                queryKey: [
                    'search'
                ]
            })
        ]);
        if (itemId) {
            await queryClient.invalidateQueries({
                queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryKeys"].itemDetail(itemId)
            });
        }
    };
    const completeMutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (itemId)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].completeItem(itemId),
        onSuccess: (_, itemId)=>invalidate(itemId)
    });
    const statusMutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (input)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].changeItemStatus(input.itemId, input.to),
        onSuccess: (_, input)=>invalidate(input.itemId)
    });
    const scheduleMutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (input)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].scheduleItem(input.itemId, input.scheduledAt, input.dueAt),
        onSuccess: (_, input)=>invalidate(input.itemId)
    });
    const deferMutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (input)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].deferItem(input.itemId, input.snoozedUntil),
        onSuccess: (_, input)=>invalidate(input.itemId)
    });
    return {
        complete: (itemId)=>completeMutation.mutate(itemId),
        setStatus: (itemId, to)=>statusMutation.mutate({
                itemId,
                to
            }),
        schedule: (itemId, scheduledAt, dueAt)=>scheduleMutation.mutate({
                itemId,
                scheduledAt,
                dueAt
            }),
        defer: (itemId, snoozedUntil)=>deferMutation.mutate({
                itemId,
                snoozedUntil
            })
    };
};
}),
"[project]/src/ui/components/timeline-page-client.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TimelinePageClient",
    ()=>TimelinePageClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$time$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/time.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ui/api/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$item$2d$list$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ui/components/item-list.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$hooks$2f$use$2d$item$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ui/hooks/use-item-actions.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ui/query/keys.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$state$2f$ui$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ui/state/ui-store.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
const ZOOM_OPTIONS = [
    'day',
    'week',
    'month',
    'quarter',
    'year',
    'all'
];
const ZOOM_ORDER = [
    'day',
    'week',
    'month',
    'quarter',
    'year',
    'all'
];
const DAY_MS = 24 * 60 * 60 * 1000;
const clamp = (value, min, max)=>Math.min(max, Math.max(min, value));
const formatPoint = (ts)=>new Date(ts).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
const zoomMinBucketWidth = (zoom)=>{
    if (zoom === 'day') return 22;
    if (zoom === 'week') return 28;
    if (zoom === 'month' || zoom === 'quarter') return 34;
    return 40;
};
const axisStrideForBucketCount = (bucketCount)=>{
    if (bucketCount > 144) return 24;
    if (bucketCount > 84) return 12;
    if (bucketCount > 48) return 6;
    if (bucketCount > 30) return 4;
    if (bucketCount > 16) return 2;
    return 1;
};
const modeLabel = (mode)=>{
    if (mode === 'plan') return 'Plan Lens';
    if (mode === 'reality') return 'Reality Lens';
    return 'Dual Lens';
};
const laneTone = (key)=>{
    if (key === 'plan') {
        return {
            glow: 'from-emerald-300/20 to-teal-400/10',
            fill: 'bg-gradient-to-t from-emerald-500/70 to-emerald-300/70',
            text: 'text-emerald-900'
        };
    }
    if (key === 'reality') {
        return {
            glow: 'from-rose-300/25 to-red-400/10',
            fill: 'bg-gradient-to-t from-red-500/75 to-rose-300/70',
            text: 'text-red-900'
        };
    }
    if (key === 'overduePressure') {
        return {
            glow: 'from-amber-300/25 to-orange-400/10',
            fill: 'bg-gradient-to-t from-amber-500/75 to-yellow-300/75',
            text: 'text-amber-900'
        };
    }
    return {
        glow: 'from-violet-300/25 to-fuchsia-300/10',
        fill: 'bg-gradient-to-t from-violet-500/75 to-fuchsia-300/75',
        text: 'text-violet-900'
    };
};
const TimelinePageClient = ({ initialZoom, initialMode, initialWindowStart, initialWindowEnd, initialPlayheadTs, initialProjectIds })=>{
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    const viewportRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { complete, setStatus, schedule, defer } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$hooks$2f$use$2d$item$2d$actions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useItemActions"])();
    const now = Date.now();
    const defaultWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$time$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDefaultTimelineWindow"])(now);
    const [zoom, setZoom] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialZoom ?? 'week');
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialMode ?? 'dual');
    const [windowStart, setWindowStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialWindowStart ?? defaultWindow.windowStart);
    const [windowEnd, setWindowEnd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialWindowEnd ?? defaultWindow.windowEnd);
    const [playheadTs, setPlayheadTs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialPlayheadTs ?? now);
    const [projectIds, setProjectIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialProjectIds ?? []);
    const [playing, setPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [playbackSpeed, setPlaybackSpeed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [reduceMotion, setReduceMotion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [viewportWidth, setViewportWidth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [windowWidth, setWindowWidth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [showAllTopItems, setShowAllTopItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showAllMoments, setShowAllMoments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showAllProjects, setShowAllProjects] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const selectedItemId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$state$2f$ui$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUiStore"])((state)=>state.selectedItemId);
    const setSelectedItemId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$state$2f$ui$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUiStore"])((state)=>state.setSelectedItemId);
    const setListItemIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$state$2f$ui$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUiStore"])((state)=>state.setListItemIds);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const localSetting = window.localStorage.getItem('taskio.reduceMotion') === 'true';
        setReduceMotion(localSetting || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        setWindowWidth(window.innerWidth);
        const onResize = ()=>setWindowWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return ()=>window.removeEventListener('resize', onResize);
    }, []);
    const projectsQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryKeys"].projects,
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].listProjects(false)
    });
    const projectIdsKey = projectIds.slice().sort().join(',');
    const timelineQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryKeys"].timelineView({
            windowStart,
            windowEnd,
            zoom,
            mode,
            projectIds: projectIdsKey,
            playheadTs
        }),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].getTimelineView({
                windowStart,
                windowEnd,
                zoom,
                mode,
                projectIds,
                playheadTs
            })
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const node = viewportRef.current;
        if (!node) return;
        const update = ()=>setViewportWidth(node.clientWidth);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(node);
        return ()=>observer.disconnect();
    // TODO(gotcha): This ref can mount after async data loads, so rerun when timeline payload changes.
    }, [
        timelineQuery.data
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!timelineQuery.data) return;
        const itemIds = timelineQuery.data.summary.topItems.map((item)=>item.id);
        setListItemIds(itemIds);
    }, [
        timelineQuery.data,
        setListItemIds
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!playing || reduceMotion) return;
        const span = Math.max(1, windowEnd - windowStart);
        const step = Math.max(60_000, Math.floor(span / 100 * playbackSpeed));
        const timer = window.setInterval(()=>{
            setPlayheadTs((current)=>{
                const next = current + step;
                if (next > windowEnd) return windowStart;
                return next;
            });
        }, 260);
        return ()=>window.clearInterval(timer);
    }, [
        playing,
        playbackSpeed,
        reduceMotion,
        windowStart,
        windowEnd
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setPlayheadTs((value)=>clamp(value, windowStart, windowEnd));
    }, [
        windowStart,
        windowEnd
    ]);
    const selectedItemActionsMutation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async (input)=>{
            if (!selectedItemId) return;
            if (input.tags && input.tags.length > 0) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].updateTags(selectedItemId, input.tags);
            }
            if (input.link) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].addLink(selectedItemId, {
                    url: input.link.url,
                    label: input.link.label,
                    kind: 'generic'
                });
            }
        },
        onSuccess: async ()=>{
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryKeys"].timeline
                }),
                queryClient.invalidateQueries({
                    queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryKeys"].today
                }),
                queryClient.invalidateQueries({
                    queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryKeys"].upcoming
                }),
                queryClient.invalidateQueries({
                    queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryKeys"].inbox
                }),
                queryClient.invalidateQueries({
                    queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryKeys"].history
                }),
                queryClient.invalidateQueries({
                    queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryKeys"].items
                })
            ]);
            if (selectedItemId) {
                await queryClient.invalidateQueries({
                    queryKey: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$query$2f$keys$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryKeys"].itemDetail(selectedItemId)
                });
            }
        }
    });
    const visibleLaneKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (mode === 'plan') return new Set([
            'plan',
            'overduePressure',
            'interruptions'
        ]);
        if (mode === 'reality') return new Set([
            'reality',
            'overduePressure',
            'interruptions'
        ]);
        return new Set([
            'plan',
            'reality',
            'overduePressure',
            'interruptions'
        ]);
    }, [
        mode
    ]);
    const activeProjectSet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>new Set(projectIds), [
        projectIds
    ]);
    const projectTitleCounts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const counts = new Map();
        for (const project of projectsQuery.data ?? []){
            counts.set(project.title, (counts.get(project.title) ?? 0) + 1);
        }
        return counts;
    }, [
        projectsQuery.data
    ]);
    const projectChipLabel = (project)=>{
        const count = projectTitleCounts.get(project.title) ?? 0;
        if (count < 2) return project.title;
        return `${project.title} · ${project.id.slice(-4)}`;
    };
    const toggleProject = (projectId)=>{
        setProjectIds((current)=>{
            if (current.includes(projectId)) {
                return current.filter((id)=>id !== projectId);
            }
            return [
                ...current,
                projectId
            ];
        });
    };
    const setWindowAround = (spanDays)=>{
        const halfSpan = Math.floor(spanDays * DAY_MS / 2);
        setWindowStart(playheadTs - halfSpan);
        setWindowEnd(playheadTs + halfSpan);
    };
    const shiftZoom = (delta)=>{
        const index = ZOOM_ORDER.indexOf(zoom);
        const next = ZOOM_ORDER[clamp(index + delta, 0, ZOOM_ORDER.length - 1)];
        if (next) setZoom(next);
    };
    const hotkeyBucketStep = Math.max(DAY_MS / 24, timelineQuery.data?.lanes?.[0]?.buckets?.[0] ? timelineQuery.data.lanes[0].buckets[0].end - timelineQuery.data.lanes[0].buckets[0].start : Math.floor((windowEnd - windowStart) / 64));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onKeyDown = (event)=>{
            if (event.defaultPrevented) return;
            if (event.target instanceof HTMLElement) {
                const editable = [
                    'INPUT',
                    'TEXTAREA',
                    'SELECT'
                ].includes(event.target.tagName) || event.target.isContentEditable;
                if (editable) return;
            }
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                setPlayheadTs((value)=>clamp(value - hotkeyBucketStep, windowStart, windowEnd));
            }
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                setPlayheadTs((value)=>clamp(value + hotkeyBucketStep, windowStart, windowEnd));
            }
            if (event.key === ' ') {
                if (reduceMotion) return;
                event.preventDefault();
                setPlaying((value)=>!value);
            }
            if (event.key === '=') {
                event.preventDefault();
                shiftZoom(-1);
            }
            if (event.key === '-') {
                event.preventDefault();
                shiftZoom(1);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return ()=>window.removeEventListener('keydown', onKeyDown);
    }, [
        hotkeyBucketStep,
        reduceMotion,
        windowEnd,
        windowStart,
        zoom
    ]);
    if (timelineQuery.isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "timeline-reveal h-52 rounded-3xl border border-stone-300 bg-panel p-4 shadow-card",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-6 w-36 animate-pulse rounded bg-stone-200"
                        }, void 0, false, {
                            fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                            lineNumber: 293,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-3 h-4 w-4/5 animate-pulse rounded bg-stone-200"
                        }, void 0, false, {
                            fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                            lineNumber: 294,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-2 h-4 w-3/5 animate-pulse rounded bg-stone-200"
                        }, void 0, false, {
                            fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                            lineNumber: 295,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-6 h-10 w-full animate-pulse rounded-xl bg-stone-200"
                        }, void 0, false, {
                            fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                            lineNumber: 296,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                    lineNumber: 292,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "timeline-reveal h-64 rounded-2xl border border-stone-300 bg-panel p-4 shadow-card",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full w-full animate-pulse rounded-xl bg-stone-200"
                    }, void 0, false, {
                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                        lineNumber: 299,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                    lineNumber: 298,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/ui/components/timeline-page-client.tsx",
            lineNumber: 291,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    if (timelineQuery.isError || !timelineQuery.data) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "timeline-reveal rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 shadow-card",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "font-semibold",
                    children: "Failed to load timeline."
                }, void 0, false, {
                    fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                    lineNumber: 308,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-1 text-xs text-red-800",
                    children: "Check your connection and retry."
                }, void 0, false, {
                    fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                    lineNumber: 309,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    className: "mt-3 rounded border border-red-300 bg-white px-2 py-1 text-xs hover:border-red-500",
                    onClick: ()=>timelineQuery.refetch(),
                    children: "Retry"
                }, void 0, false, {
                    fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                    lineNumber: 310,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/ui/components/timeline-page-client.tsx",
            lineNumber: 307,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    const timeline = timelineQuery.data;
    const visibleLanes = timeline.lanes.filter((lane)=>visibleLaneKeys.has(lane.key));
    const laneBuckets = visibleLanes[0]?.buckets ?? timeline.lanes[0]?.buckets ?? [];
    const compactLayout = (viewportWidth || windowWidth) > 0 && (viewportWidth || windowWidth) < 760;
    const allProjects = projectsQuery.data ?? [];
    const visibleProjects = compactLayout && !showAllProjects ? allProjects.slice(0, 6) : allProjects;
    const hasHiddenProjects = compactLayout && allProjects.length > 6;
    const visibleTopItems = compactLayout && !showAllTopItems ? timeline.summary.topItems.slice(0, 6) : timeline.summary.topItems;
    const hasHiddenTopItems = compactLayout && timeline.summary.topItems.length > 6;
    const visibleMoments = compactLayout && !showAllMoments ? timeline.moments.slice(0, 8) : timeline.moments.slice(0, 18);
    const hasHiddenMoments = compactLayout && timeline.moments.length > 8;
    const bucketCount = Math.max(1, laneBuckets.length);
    const axisStride = axisStrideForBucketCount(bucketCount);
    const maxBucketCount = Math.max(1, ...visibleLanes.flatMap((lane)=>lane.buckets.map((bucket)=>bucket.count)));
    const minBucketWidth = zoomMinBucketWidth(zoom);
    const gridTemplateColumns = `repeat(${bucketCount}, minmax(${minBucketWidth}px, 1fr))`;
    const timelineWidth = Math.max(viewportWidth || 0, bucketCount * minBucketWidth);
    const normalizedPlayhead = clamp(playheadTs, windowStart, windowEnd);
    const playheadRatio = (normalizedPlayhead - windowStart) / Math.max(1, windowEnd - windowStart);
    const playheadPercent = clamp(playheadRatio * 100, 0, 100);
    const playheadBucketIndex = laneBuckets.findIndex((bucket)=>normalizedPlayhead >= bucket.start && normalizedPlayhead < bucket.end);
    const bucketStep = laneBuckets.length > 0 ? Math.max(1, laneBuckets[0].end - laneBuckets[0].start) : DAY_MS;
    const isNearNow = Math.abs(playheadTs - Date.now()) < Math.max(90_000, bucketStep);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "timeline-reveal relative overflow-hidden rounded-3xl border border-stone-300 bg-panel shadow-[0_30px_70px_-45px_rgba(120,20,20,0.65)]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,120,90,0.22),transparent_40%),radial-gradient(circle_at_85%_0%,rgba(76,111,255,0.18),transparent_36%)]"
                    }, void 0, false, {
                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                        lineNumber: 348,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative space-y-4 p-4 md:p-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-start justify-between gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "text-2xl font-semibold text-ink md:text-3xl",
                                                children: "Timeline"
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 352,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 max-w-2xl text-sm text-muted",
                                                children: "Scrub time like a film reel. Track commitments, real execution, overdue pressure, and interruption spikes from one playhead."
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 353,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 351,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl border border-stone-300/80 bg-white/70 px-3 py-2 text-right backdrop-blur",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[11px] uppercase tracking-wide text-muted",
                                                children: "Lens"
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 358,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-medium text-ink",
                                                children: modeLabel(mode)
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 359,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[11px] text-muted",
                                                children: new Date(playheadTs).toLocaleString()
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 360,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${isNearNow ? 'bg-red-100 text-red-900' : 'bg-stone-200 text-stone-700'}`,
                                                children: isNearNow ? 'LIVE' : 'ARCHIVE'
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 361,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 357,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 350,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2",
                                role: "group",
                                "aria-label": "Timeline mode",
                                children: [
                                    'dual',
                                    'plan',
                                    'reality'
                                ].map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        "aria-pressed": mode === option,
                                        className: `rounded-full border px-3 py-1 text-xs font-medium transition ${mode === option ? 'border-red-600 bg-red-600 text-white shadow-[0_10px_30px_-16px_rgba(185,28,28,0.8)]' : 'border-stone-300 bg-white/85 text-ink hover:border-stone-400'}`,
                                        onClick: ()=>setMode(option),
                                        children: option === 'dual' ? 'Dual' : option === 'plan' ? 'Plan' : 'Reality'
                                    }, option, false, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 369,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)))
                            }, void 0, false, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 367,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-1",
                                role: "group",
                                "aria-label": "Timeline zoom presets",
                                children: ZOOM_OPTIONS.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        "aria-pressed": zoom === option,
                                        className: `rounded-lg border px-2.5 py-1 text-xs transition ${zoom === option ? 'border-ink bg-ink text-white' : 'border-stone-300 bg-white/80 text-muted hover:border-stone-500 hover:text-ink'}`,
                                        onClick: ()=>setZoom(option),
                                        children: option
                                    }, option, false, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 387,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)))
                            }, void 0, false, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 385,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap items-center justify-between gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs font-medium uppercase tracking-wide text-muted",
                                                children: "Project Scope"
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 405,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: "rounded border border-stone-300 bg-white/80 px-2 py-1 text-xs text-muted hover:border-stone-500 hover:text-ink",
                                                        onClick: ()=>setProjectIds([]),
                                                        children: "All Active"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                        lineNumber: 407,
                                                        columnNumber: 17
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    hasHiddenProjects ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: "rounded border border-stone-300 bg-white/80 px-2 py-1 text-xs text-muted hover:border-stone-500 hover:text-ink",
                                                        onClick: ()=>setShowAllProjects((value)=>!value),
                                                        children: showAllProjects ? 'Show Less' : `+${allProjects.length - 6} More`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                        lineNumber: 415,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)) : null
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 406,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 404,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `flex gap-2 ${compactLayout ? 'timeline-scroll overflow-x-auto pb-1' : 'flex-wrap'}`,
                                        children: [
                                            visibleProjects.map((project)=>{
                                                const active = activeProjectSet.has(project.id);
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    "aria-pressed": active,
                                                    className: `shrink-0 rounded-full border px-2.5 py-1 text-xs transition ${active ? 'border-amber-500 bg-amber-100 text-amber-950' : 'border-stone-300 bg-white/75 text-muted hover:border-stone-500 hover:text-ink'}`,
                                                    onClick: ()=>toggleProject(project.id),
                                                    children: projectChipLabel(project)
                                                }, project.id, false, {
                                                    fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                    lineNumber: 429,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0));
                                            }),
                                            allProjects.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-muted",
                                                children: "No projects yet."
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 444,
                                                columnNumber: 43
                                            }, ("TURBOPACK compile-time value", void 0)) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 425,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 403,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-2xl border border-stone-300 bg-white/75 p-3 backdrop-blur",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    "Window ",
                                                    formatPoint(windowStart),
                                                    " - ",
                                                    formatPoint(windowEnd)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 450,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-medium text-ink",
                                                children: [
                                                    "Playhead ",
                                                    formatPoint(playheadTs)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 453,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 449,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "rounded border border-stone-300 px-2 py-1 text-xs text-muted hover:border-stone-500 hover:text-ink",
                                                onClick: ()=>setPlayheadTs((value)=>clamp(value - bucketStep, windowStart, windowEnd)),
                                                children: "- Step"
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 457,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "range",
                                                min: windowStart,
                                                max: windowEnd,
                                                step: Math.max(1, bucketStep),
                                                value: normalizedPlayhead,
                                                onChange: (event)=>setPlayheadTs(Number(event.target.value)),
                                                className: "timeline-slider h-2 w-full cursor-pointer accent-red-600",
                                                "aria-label": "Timeline playhead scrubber"
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 464,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "rounded border border-stone-300 px-2 py-1 text-xs text-muted hover:border-stone-500 hover:text-ink",
                                                onClick: ()=>setPlayheadTs((value)=>clamp(value + bucketStep, windowStart, windowEnd)),
                                                children: "Step +"
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 474,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 456,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-2 flex flex-wrap items-center gap-2 text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "rounded border border-stone-300 bg-white px-2 py-1 text-muted hover:border-stone-500 hover:text-ink",
                                                onClick: ()=>setPlaying((value)=>!value),
                                                disabled: reduceMotion,
                                                children: playing ? 'Pause' : 'Play'
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 484,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-muted",
                                                children: [
                                                    "Speed",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        className: "ml-1 rounded border border-stone-300 bg-white px-2 py-1 text-xs text-ink",
                                                        value: String(playbackSpeed),
                                                        onChange: (event)=>setPlaybackSpeed(Number(event.target.value)),
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "1",
                                                                children: "1x"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                                lineNumber: 499,
                                                                columnNumber: 19
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "2",
                                                                children: "2x"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                                lineNumber: 500,
                                                                columnNumber: 19
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "4",
                                                                children: "4x"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                                lineNumber: 501,
                                                                columnNumber: 19
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                        lineNumber: 494,
                                                        columnNumber: 17
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 492,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "rounded border border-stone-300 bg-white px-2 py-1 text-muted hover:border-stone-500 hover:text-ink",
                                                onClick: ()=>{
                                                    const ts = Date.now();
                                                    setPlayheadTs(ts);
                                                    const reset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$time$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDefaultTimelineWindow"])(ts);
                                                    setWindowStart(reset.windowStart);
                                                    setWindowEnd(reset.windowEnd);
                                                },
                                                children: "Now"
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 504,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "ml-auto hidden text-muted md:block",
                                                children: "Shortcuts: Left/Right scrub, Space play, +/- zoom"
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 517,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 483,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    compactLayout ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-2 text-[11px] text-muted",
                                        children: "Shortcuts: Left/Right scrub, Space play, +/- zoom."
                                    }, void 0, false, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 519,
                                        columnNumber: 30
                                    }, ("TURBOPACK compile-time value", void 0)) : null,
                                    reduceMotion ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-2 text-xs text-muted",
                                        children: "Playback disabled by reduced-motion preference."
                                    }, void 0, false, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 520,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0)) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 448,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                        lineNumber: 349,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                lineNumber: 347,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "timeline-reveal rounded-2xl border border-stone-300 bg-panel p-3 shadow-card md:p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "pointer-events-none absolute inset-y-0 left-0 z-30 w-5 bg-gradient-to-r from-panel to-transparent"
                        }, void 0, false, {
                            fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                            lineNumber: 527,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "pointer-events-none absolute inset-y-0 right-0 z-30 w-5 bg-gradient-to-l from-panel to-transparent"
                        }, void 0, false, {
                            fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                            lineNumber: 528,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: viewportRef,
                            className: "timeline-scroll overflow-x-auto pb-2",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                style: {
                                    width: `${timelineWidth}px`,
                                    minWidth: '100%'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "pointer-events-none absolute inset-y-0 z-20 w-px bg-red-600/80",
                                        style: {
                                            left: `${playheadPercent}%`
                                        },
                                        "aria-hidden": "true"
                                    }, void 0, false, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 531,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "pointer-events-none absolute inset-y-0 z-10 w-8 -translate-x-1/2 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0",
                                        style: {
                                            left: `${playheadPercent}%`
                                        },
                                        "aria-hidden": "true"
                                    }, void 0, false, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 536,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3",
                                        children: [
                                            visibleLanes.map((lane)=>{
                                                const laneStyle = laneTone(lane.key);
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "film-lane rounded-xl border border-stone-300 bg-white/88 p-2.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "mb-2 flex items-center justify-between gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: `text-[11px] font-semibold uppercase tracking-[0.18em] ${laneStyle.text}`,
                                                                    children: lane.label
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                                    lineNumber: 544,
                                                                    columnNumber: 23
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-[11px] text-muted",
                                                                    children: [
                                                                        lane.buckets.reduce((sum, bucket)=>sum + bucket.count, 0),
                                                                        " total · peak ",
                                                                        Math.max(0, ...lane.buckets.map((bucket)=>bucket.count))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                                    lineNumber: 545,
                                                                    columnNumber: 23
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                            lineNumber: 543,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `rounded-lg bg-gradient-to-r ${laneStyle.glow} p-1.5`,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "grid items-end gap-1",
                                                                style: {
                                                                    gridTemplateColumns
                                                                },
                                                                children: lane.buckets.map((bucket, index)=>{
                                                                    const isPlayhead = index === playheadBucketIndex;
                                                                    const heightRatio = bucket.count === 0 ? 0.08 : bucket.count / maxBucketCount;
                                                                    const bucketHeight = 18 + Math.round(heightRatio * 72);
                                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: `group relative flex items-end justify-center rounded-md border transition-transform duration-150 ${isPlayhead ? 'border-red-500 bg-red-50 shadow-[0_0_0_1px_rgba(239,68,68,0.26)]' : 'border-stone-200 bg-white/85 hover:-translate-y-0.5 hover:border-stone-400'}`,
                                                                        style: {
                                                                            height: `${bucketHeight}px`
                                                                        },
                                                                        onClick: ()=>setPlayheadTs(Math.floor((bucket.start + bucket.end) / 2)),
                                                                        title: `${lane.label}: ${bucket.count} in ${bucket.label}`,
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: `absolute inset-x-0 bottom-0 rounded-b-md ${laneStyle.fill}`,
                                                                                style: {
                                                                                    height: `${Math.max(3, Math.round(bucket.count / maxBucketCount * 100))}%`
                                                                                },
                                                                                "aria-hidden": "true"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                                                lineNumber: 570,
                                                                                columnNumber: 31
                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: `relative z-10 mb-0.5 text-[10px] font-medium ${isPlayhead ? 'text-red-700' : 'text-stone-600 group-hover:text-ink'}`,
                                                                                children: bucket.count > 0 ? bucket.count : ''
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                                                lineNumber: 575,
                                                                                columnNumber: 31
                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                        ]
                                                                    }, `${lane.key}-${index}`, true, {
                                                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                                        lineNumber: 558,
                                                                        columnNumber: 29
                                                                    }, ("TURBOPACK compile-time value", void 0));
                                                                })
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                                lineNumber: 551,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                            lineNumber: 550,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, lane.key, true, {
                                                    fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                    lineNumber: 542,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0));
                                            }),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid gap-1 text-[10px] text-muted",
                                                style: {
                                                    gridTemplateColumns
                                                },
                                                children: laneBuckets.map((bucket, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "truncate text-center",
                                                        title: bucket.label,
                                                        children: index % axisStride === 0 || index === laneBuckets.length - 1 ? bucket.label : ''
                                                    }, `axis-${index}`, false, {
                                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                        lineNumber: 589,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)))
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 587,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 538,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 530,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                            lineNumber: 529,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                    lineNumber: 526,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                lineNumber: 525,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "timeline-reveal grid gap-4 xl:grid-cols-[1.85fr_1fr]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3 rounded-2xl border border-stone-300 bg-panel p-3 shadow-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-sm font-semibold uppercase tracking-wide text-muted",
                                children: "What Matters"
                            }, void 0, false, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 602,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 gap-2 text-xs md:grid-cols-5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MetricChip, {
                                        label: "Plan",
                                        value: timeline.summary.counts.plan,
                                        tone: "emerald"
                                    }, void 0, false, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 605,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MetricChip, {
                                        label: "Reality",
                                        value: timeline.summary.counts.reality,
                                        tone: "red"
                                    }, void 0, false, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 606,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MetricChip, {
                                        label: "Overdue",
                                        value: timeline.summary.counts.overdue,
                                        tone: "amber"
                                    }, void 0, false, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 607,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MetricChip, {
                                        label: "Interruptions",
                                        value: timeline.summary.counts.interruptions,
                                        tone: "violet"
                                    }, void 0, false, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 608,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs md:col-span-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-muted",
                                                children: "Slice"
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 610,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-medium text-ink",
                                                children: timeline.summary.playheadLabel
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 611,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 609,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 604,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$item$2d$list$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ItemList"], {
                                items: visibleTopItems,
                                selectedItemId: selectedItemId,
                                onSelect: setSelectedItemId,
                                emptyLabel: "No top items at this playhead.",
                                actions: {
                                    onComplete: (itemId)=>complete(itemId),
                                    onActivate: (itemId)=>setStatus(itemId, 'active'),
                                    onInbox: (itemId)=>setStatus(itemId, 'inbox'),
                                    onScheduleTomorrow: (itemId)=>schedule(itemId, playheadTs),
                                    onDeferDay: (itemId)=>defer(itemId, playheadTs + DAY_MS)
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 615,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            hasHiddenTopItems ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "rounded border border-stone-300 bg-white px-2 py-1 text-xs text-muted hover:border-stone-500 hover:text-ink",
                                onClick: ()=>setShowAllTopItems((value)=>!value),
                                children: showAllTopItems ? 'Show Fewer Items' : `Show All ${timeline.summary.topItems.length} Items`
                            }, void 0, false, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 629,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)) : null,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "rounded border border-stone-300 px-2 py-1 text-xs hover:border-red-600 hover:text-red-700",
                                        disabled: !selectedItemId,
                                        onClick: ()=>{
                                            if (!selectedItemId) return;
                                            setStatus(selectedItemId, 'canceled');
                                        },
                                        children: "Cancel Selected"
                                    }, void 0, false, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 639,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "rounded border border-stone-300 px-2 py-1 text-xs hover:border-stone-500 hover:text-ink",
                                        disabled: !selectedItemId,
                                        onClick: ()=>{
                                            if (!selectedItemId) return;
                                            const raw = window.prompt('Add tags (comma-separated)');
                                            if (!raw) return;
                                            const tags = raw.split(',').map((value)=>value.trim()).filter(Boolean);
                                            if (tags.length > 0) selectedItemActionsMutation.mutate({
                                                tags
                                            });
                                        },
                                        children: "Add Tags"
                                    }, void 0, false, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 650,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "rounded border border-stone-300 px-2 py-1 text-xs hover:border-stone-500 hover:text-ink",
                                        disabled: !selectedItemId,
                                        onClick: ()=>{
                                            if (!selectedItemId) return;
                                            const url = window.prompt('Link URL');
                                            if (!url) return;
                                            const label = window.prompt('Label (optional)') ?? undefined;
                                            selectedItemActionsMutation.mutate({
                                                link: {
                                                    url,
                                                    label
                                                }
                                            });
                                        },
                                        children: "Add Link"
                                    }, void 0, false, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 667,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 638,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                        lineNumber: 601,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: "space-y-3 rounded-2xl border border-stone-300 bg-panel p-3 shadow-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-sm font-semibold uppercase tracking-wide text-muted",
                                children: "Timeline Moments"
                            }, void 0, false, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 685,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "max-h-[22rem] space-y-2 overflow-y-auto pr-1 text-xs",
                                children: visibleMoments.map((moment, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "w-full rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-left transition hover:border-red-500",
                                        onClick: ()=>setPlayheadTs(moment.ts),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-medium text-ink",
                                                children: moment.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 694,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-muted",
                                                children: [
                                                    moment.kind,
                                                    " · count ",
                                                    moment.count
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                lineNumber: 695,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, `${moment.kind}-${moment.ts}-${index}`, true, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 688,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)))
                            }, void 0, false, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 686,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            hasHiddenMoments ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "rounded border border-stone-300 bg-white px-2 py-1 text-xs text-muted hover:border-stone-500 hover:text-ink",
                                onClick: ()=>setShowAllMoments((value)=>!value),
                                children: showAllMoments ? 'Show Fewer Moments' : `Show All ${timeline.moments.length} Moments`
                            }, void 0, false, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 702,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)) : null,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-semibold uppercase tracking-wide text-muted",
                                children: "Recent Events @ Playhead"
                            }, void 0, false, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 711,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1 text-xs text-muted",
                                children: [
                                    timeline.summary.recentEvents.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: "No events in this slice."
                                    }, void 0, false, {
                                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                        lineNumber: 713,
                                        columnNumber: 59
                                    }, ("TURBOPACK compile-time value", void 0)) : null,
                                    timeline.summary.recentEvents.map((event)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-lg border border-stone-200 bg-white p-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-medium text-ink",
                                                    children: event.eventType
                                                }, void 0, false, {
                                                    fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                    lineNumber: 716,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: new Date(event.occurredAt).toLocaleString()
                                                }, void 0, false, {
                                                    fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                                    lineNumber: 717,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, event.id, true, {
                                            fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                            lineNumber: 715,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 712,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                        lineNumber: 684,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                lineNumber: 600,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "timeline-reveal rounded-2xl border border-stone-300 bg-panel p-3 text-xs text-muted shadow-card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-2 font-semibold uppercase tracking-wide",
                        children: "Timeline Window"
                    }, void 0, false, {
                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                        lineNumber: 725,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "rounded border border-stone-300 bg-white px-2 py-1 hover:border-stone-500 hover:text-ink",
                                onClick: ()=>setWindowAround(7),
                                children: "Center 1 Week"
                            }, void 0, false, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 727,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "rounded border border-stone-300 bg-white px-2 py-1 hover:border-stone-500 hover:text-ink",
                                onClick: ()=>setWindowAround(30),
                                children: "Center 1 Month"
                            }, void 0, false, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 730,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "rounded border border-stone-300 bg-white px-2 py-1 hover:border-stone-500 hover:text-ink",
                                onClick: ()=>setWindowAround(90),
                                children: "Center 1 Quarter"
                            }, void 0, false, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 733,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "rounded border border-stone-300 bg-white px-2 py-1 hover:border-stone-500 hover:text-ink",
                                onClick: ()=>{
                                    const resetNow = Date.now();
                                    const resetWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$time$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDefaultTimelineWindow"])(resetNow);
                                    setWindowStart(resetWindow.windowStart);
                                    setWindowEnd(resetWindow.windowEnd);
                                    setPlayheadTs(resetNow);
                                },
                                children: "Reset Default"
                            }, void 0, false, {
                                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                                lineNumber: 736,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                        lineNumber: 726,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                lineNumber: 724,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
        lineNumber: 346,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const MetricChip = ({ label, value, tone })=>{
    const toneClasses = tone === 'emerald' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : tone === 'red' ? 'border-red-200 bg-red-50 text-red-900' : tone === 'amber' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-violet-200 bg-violet-50 text-violet-900';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `rounded-lg border px-2 py-1.5 ${toneClasses}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[11px] uppercase tracking-wide",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                lineNumber: 775,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-sm font-semibold",
                children: value
            }, void 0, false, {
                fileName: "[project]/src/ui/components/timeline-page-client.tsx",
                lineNumber: 776,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/ui/components/timeline-page-client.tsx",
        lineNumber: 774,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
];

//# sourceMappingURL=src_b08ebe62._.js.map