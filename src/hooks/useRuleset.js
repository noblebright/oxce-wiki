import {useCallback, useEffect, useState, useRef} from 'react';
import { load } from "../model/L1L2Loader.js";
import compile from "../model/compiler/index.js";

const handlers = {
    "INIT": counters => () => ({ status: "Initializing...", ...getCounters(counters)}),
    "LOADING_CONFIG": counters => () => ({ status: "Loading Config...", ...getCounters(counters) }),
    "LOADING_VERSIONS": counters => ([repo]) => ({ status:`Loading versions for repo: ${repo}`, ...getCounters(counters) }),
    "LOADING_FILELIST": counters => ([repo, sha, max]) => ({ status:`Loading file list for: ${repo}@${sha}`, ...getCounters(counters, {max}) }),
    "LOADING_FILELIST_COMPLETE": counters => ([repo, sha, now]) => ({ status:`Loading complete: ${repo}@${sha}`, ...getCounters(counters, {now}) }),
    "LOADING_FILE": counters => ([url, now]) => ({ status:`Loaded file: ${url && url.substring(url.lastIndexOf("/", url.lastIndexOf("/") - 1))}`, ...getCounters(counters, {now}) }),
    "COMPILING_RULESET": counters => () => ({ status: "Compiling Ruleset", ...getCounters(counters)}),
    "COMPLETE": counters => () => ({ status: "Complete", ...getCounters(counters)}),
    "ERROR": counters => ([error]) => ({ status: "Parse Error", ...getCounters(counters), error }),
    "INVALID": counters => () => ({ status: "Invalid Version", ...getCounters(counters)})
}

function getCounters(counters, changes = {}) {
    Object.keys(changes).forEach(k => {
        counters[k] += changes[k];
    });
    return counters;
}

const INIT = ["INIT"];
export default function useRuleset(version, versions) {
    const [status, setStatus] = useState(INIT);
    const [result, setResult] = useState();
    const loadState = useRef();
    const oldVersion = useRef();
    const oldVersions = useRef();

    const callback = useCallback(state => {
        const [key, maybeErr] = state;
        // if we hit an error, stop updating status.
        if(!loadState.current || loadState.current.error) return;
        if(key === "ERROR") {
            loadState.current.error = loadState.current.error ?? [];
            loadState.current.error.push(maybeErr);
        } 
        setStatus(state);  
    }, [loadState]);

    useEffect(() => {
        if(oldVersion.current !== version) {
            console.log("Version changed:", oldVersion.current, version);
        }
        if(oldVersions.current !== versions) {
            console.log("Versions changed:", oldVersions.current, versions);
        }
        if(!versions[version]) {
            setStatus(["INVALID"])
        } else {
            setStatus(INIT);
            setResult(undefined);
            loadState.current = { min: 0, max: 0, now: 0 }
            load(version, compile, callback).then(result => {
                setResult(result);
                setStatus(["COMPLETE"]);
                window.db = result;
            });
        }
        oldVersion.current = version;
        oldVersions.current = versions;
    }, [version, versions, callback]);

    const [key, ...rest] = status;
    return { statusKey: key, status: handlers[key](loadState.current)(rest), result };
}