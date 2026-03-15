complete ./SPEC.md

# Architecture Discovery Example flow
    Start clean and deterministic.
    npm run arch:verify

    Possibly generate a full baseline graph bundle once.
    npm run arch -- --all --out-dir tmp/arch/baseline
        - This will be very large, but is a stable reference, you may not want to read all of it. 

    Form a hypothesis in code tokens (not abstract words) for what you'd like to slice around.
    Good: "getService handleRouteError parseRequestJson"
    Bad: "route architecture cleanup"

    Run discovery per hypothesis.
    npm run arch -- discover all "getService handleRouteError parseRequestJson" --max-depth 4 --max-edges 1200

    Read outputs in this order, but only read what you need to prove/disprove your hypothesis. Don't get lost in the weeds.
    1-scope/scope.json -> 2-flows/flows.json -> 3-contracts/contracts.json -> 4-confidence/confidence.json