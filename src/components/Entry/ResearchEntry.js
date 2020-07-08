import React, {useMemo} from "react";
import { Link } from "react-router-dom";
import Cytoscape from "../Cytoscape";

import { getLabel } from "../../model/RuleLoader";
import { buildCytoTree } from "../../model/treeBuilder";
import { SimpleValue, ListValue } from "./utils";

export default function ResearchEntry({ rules, entry, locale }) {
    const linkFn = id => <Link to={`/${id}`}>{getLabel(id, locale)}</Link>;
    const entityId = entry.name;
    const cytoTree = useMemo(() => buildCytoTree(rules, locale, entityId), [rules, locale, entityId]);

    return (
        <React.Fragment>
        <div className="ResearchEntry">
            <table>
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
        </div>
        <div className="techTree"><Cytoscape elements={cytoTree}/></div>
        </React.Fragment>
    );
}