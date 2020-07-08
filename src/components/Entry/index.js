import React, { useState } from "react";
import { Link, useParams, Redirect } from "react-router-dom";
import Cytoscape from "../Cytoscape";

import { getLabel } from "../../model/RuleLoader";
import { buildCytoTree } from "../../model/treeBuilder";
import { SimpleValue, ListValue } from "./utils";

import "./Entry.css";

export default function Entry({ db: {rules, strings}, language = "en-US" }) {
    let { id } = useParams();

    const entry = rules[id];
    
    if(!entry) {
        //We got a non-existant entry.  Kick them to the homepage.
        return (
            <Redirect to="/"/>
        );
    }

    const locale = strings[language];
    const cytoTree = buildCytoTree(rules, strings, id, language);
    return (
        <div className="Entry">
            <h2>{getLabel(entry, locale)}</h2>
            { entry.research && <ResearchEntry locale={locale} entry={entry.research} /> }
            <DebugEntry key={entry.name} entry={entry}/>
            { <div className="techTree"><Cytoscape elements={cytoTree}/></div> }
        </div>
    )
}

function DebugEntry({entry}) {
    const [collapsed, setCollapsed] = useState(true);
    return (
        <div>
            <header>Debug [<a href="#" onClick={e => {e.preventDefault(); setCollapsed(x => !x);}}>{collapsed ? "Expand" : "Collapse"}</a>]</header>
            <pre style={{ display: collapsed ? "none" : ""}}>{JSON.stringify(entry, null, 4)}</pre>
        </div>
    );
}

function ResearchEntry({ entry, locale }) {
    const linkFn = id => <Link to={`/${id}`}>{getLabel(id, locale)}</Link>;
    return (
        <table className="ResearchEntry">
            <thead>
                <tr><th colSpan="2">Research</th></tr>
            </thead>
            <tbody>
                <SimpleValue label="Cost" value={entry.cost}/>
                <SimpleValue label="Points" value={entry.points}/>
                {entry.needItem && <SimpleValue label="Requires Item" value="TRUE"/>}
                {entry.destroyItem && <SimpleValue label="Destroys Item" value="TRUE"/>}
                {entry.requiresBaseFunc && <ListValue label="Requires Service" values={entry.requiresBaseFunc}>{ x => getLabel(x, locale) }</ListValue>}
                {entry.lookup && <SimpleValue label="Gives (lookup)" value={entry.lookup}>{ linkFn }</SimpleValue>}
                {entry.lookupOf && <ListValue label="Get as a Result of " values={entry.lookupOf}>{ linkFn }</ListValue>}
                {entry.dependencies && <ListValue label="Dependencies" values={entry.dependencies}>{ linkFn }</ListValue>}
                {entry.leadsTo && <ListValue label="Leads To" values={entry.leadsTo}>{ linkFn }</ListValue>}
                {entry.unlockedBy && <ListValue label="Unlocked By" values={entry.unlockedBy}>{linkFn}</ListValue>}
                {entry.unlocks && <ListValue label="Unlocks" values={entry.unlocks}>{ linkFn }</ListValue>}
                
            </tbody>
        </table>
    );
}