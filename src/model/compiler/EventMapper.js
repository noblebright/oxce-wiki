export function mapEventScripts(lookups) {
    lookups.eventScriptsByEvent = {};

    const addScript = key => event => {
        lookups.eventScriptsByEvent[event] = lookups.eventScriptsByEvent[event] || new Set();
        lookups.eventScriptsByEvent[event].add(key);
    };

    Object.entries(lookups.eventScripts || {}).forEach(([key, script]) => {
        const add = addScript(key);
        (script.oneTimeSequentialEvents || []).forEach(add);
        Object.values(script.eventWeights || {}).forEach(eventMap => {
            Object.keys(eventMap).forEach(add);
        });
        Object.keys(script.oneTimeRandomEvents || {}).forEach(add);
    });
}
