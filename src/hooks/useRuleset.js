import {useEffect, useState} from 'react';
import { load } from "../model/RulesetDB";
import compile from "../model/RulesetCompiler";

const handlers = {
    "INIT": () => ({ status: "Initializing...", min:0, max: 0, now: 0}),
    "LOADING_CONFIG": () => ({ status: "Loading Config...", min:0, max: 0, now: 0}),
    "LOADING_VERSIONS": ([repo]) => ({ status:`Loading versions for repo: ${repo}`, min:0, max: 0, now: 0}),
    "LOADING_FILELIST": ([repo, sha]) => ({ status:`Loading file list for: ${repo}@${sha}`, min:0, max: 0, now: 0}),
    "LOADING_FILE": ([url, now, max]) => ({ status:`Loading file: ${url}`, min:0, max, now }),
    "COMPILING_RULESET": () => ({ status: "Compiling Ruleset", min:0, max: 100, now: 100}),
    "COMPLETE": () => ({ status: "Complete", min:0, max: 100, now: 100})
}

export default function useRuleset(version) {
    const [status, setStatus] = useState(["INIT"]);
    const [result, setResult] = useState();
    useEffect(() => {
        load(version, compile, setStatus).then(result => {
            setResult(result);
            setStatus(["COMPLETE"]);
            console.log(result);
        });
    }, [version]);

    const [key, ...rest] = status;
    return { statusKey: key, status: handlers[key](rest), result };
}