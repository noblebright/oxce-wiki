import {useEffect, useState, useRef} from 'react';
import { load } from "../model/RulesetDB";
import compile from "../model/RulesetCompiler";

const handlers = {
    "INIT": () => ({ status: "Initializing...", min:0, max: 10, now: 10}),
    "LOADING_CONFIG": () => ({ status: "Loading Config...", min:0, max: 0, now: 0}),
    "LOADING_VERSIONS": ([repo]) => ({ status:`Loading versions for repo: ${repo}`, min:0, max: 0, now: 0}),
    "LOADING_FILELIST": ([repo, sha]) => ({ status:`Loading file list for: ${repo}@${sha}`, min:0, max: 0, now: 0}),
    "LOADING_FILE": ([url, now, max]) => ({ status:`Loading file: ${url && url.substring(url.lastIndexOf("/", url.lastIndexOf("/") - 1))}`, min:0, max, now }),
    "COMPILING_RULESET": () => ({ status: "Compiling Ruleset", min:0, max: 100, now: 100}),
    "COMPLETE": () => ({ status: "Complete", min:0, max: 100, now: 100}),
    "INVALID": () => ({ status: "Invalid Version", min:0, max: 0, now: 0})
}

export default function useRuleset(version, versions) {
    const [status, setStatus] = useState(["INIT"]);
    const [result, setResult] = useState();
    const oldVersion = useRef();
    const oldVersions = useRef();

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
            load(version, compile, setStatus).then(result => {
                setResult(result);
                setStatus(["COMPLETE"]);
                console.log(result);
            });
        }
        oldVersion.current = version;
        oldVersions.current = versions;
    }, [version, versions]);

    const [key, ...rest] = status;
    return { statusKey: key, status: handlers[key](rest), result };
}