import React, {useState, useEffect} from "react";
import RuleLoader from "../model/RuleLoader";

export default function Ruleset() {
    const [db, setDb] = useState({});
    useEffect(() => {
        const rl = new RuleLoader(["https://raw.githubusercontent.com/SolariusScorch/XComFiles/master/Ruleset/research_XCOMFILES.rul"], 
                                  ["https://raw.githubusercontent.com/SolariusScorch/XComFiles/master/Language/en-US.yml"]);
        rl.load().then(setDb);
    }, []);

    return (
        <pre>
            {JSON.stringify(db, null, 4)}
        </pre>
    );
}