import React, { useState } from "react";
import ReactDOM from "react-dom";
import {getLabel} from "../../model/RuleLoader";
import { buildCytoTree } from "../../model/treeBuilder";
import Cytoscape from "../Cytoscape";
import { SimpleValue, ListValue, Link } from "./utils";

import "./Entry.css";

export default function Entry({ db: {rules, strings}, id, onSelect: setSelect, language = "en-US" }) {
    const [showTree, setShowTree] = useState(false);
    const entry = rules[id];
    const locale = strings[language];
    const cytoTree = buildCytoTree(rules, strings, id, language);
    return (
        <div className="Entry">
            <h2>{getLabel(entry, locale)}</h2>
            { entry.research && <ResearchEntry locale={locale} entry={entry.research} onSelect={setSelect}/> }
            <DebugEntry key={entry.name} entry={entry}/>
            { ReactDOM.createPortal(<div className="techTree"><Cytoscape elements={cytoTree}/></div>, document.getElementsByTagName("main")[0]) }
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

function ResearchEntry({ entry, locale, onSelect: setSelect }) {
    const linkFn = id => <Link id={id} locale={locale} onClick={setSelect}/>;
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
                {entry.lookup && <SimpleValue label="Lookup" value={entry.lookup}>{ linkFn }</SimpleValue>}
                {entry.dependencies && <ListValue label="Dependencies" values={entry.dependencies}>{ linkFn }</ListValue>}
                {entry.leadsTo && <ListValue label="Leads To" values={entry.leadsTo}>{ linkFn }</ListValue>}
                {entry.unlockedBy && <ListValue label="Unlocked By" values={entry.unlockedBy}>{linkFn}</ListValue>}
                {entry.unlocks && <ListValue label="Unlocks" values={entry.unlocks}>{ linkFn }</ListValue>}
                {entry.requiresBaseFunc && <ListValue label="Requires Service" values={entry.requiresBaseFunc}>{linkFn}</ListValue>}
            </tbody>
        </table>
    );
}