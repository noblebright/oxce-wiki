import React, {useMemo} from "react";
import Cytoscape from "../Cytoscape";

import { getLabel } from "../../model/RuleLoader";
import { buildCytoTree } from "../../model/treeBuilder";
import { SimpleValue, ListValue, useLink } from "./utils";

export default function ResearchEntry({ rules, entry, locale }) {
    const linkFn = useLink(locale);
    const research = entry.research;
    const entityId = research.name;
    const cytoTree = useMemo(() => buildCytoTree(rules, locale, entityId), [rules, locale, entityId]);

    return (
        <React.Fragment>
        <div className="ResearchEntry">
            <table>
                <thead>
                    <tr><th colSpan="2">Research</th></tr>
                </thead>
                <tbody>
                    <SimpleValue label="Cost" value={research.cost}/>
                    <SimpleValue label="Points" value={research.points}/>
                    {research.needItem && <SimpleValue label="Requires Item" value="TRUE"/>}
                    {research.destroyItem && <SimpleValue label="Destroys Item" value="TRUE"/>}
                    {research.requiresBaseFunc && <ListValue label="Requires Service" values={research.requiresBaseFunc}>{ x => getLabel(x, locale) }</ListValue>}
                    {research.lookup && <SimpleValue label="Gives (lookup)" value={research.lookup}>{ linkFn }</SimpleValue>}
                    {research.lookupOf && <ListValue label="Get as a Result of " values={research.lookupOf}>{ linkFn }</ListValue>}
                    {research.dependencies && <ListValue label="Dependencies" values={research.dependencies}>{ linkFn }</ListValue>}
                    {research.leadsTo && <ListValue label="Leads To" values={research.leadsTo}>{ linkFn }</ListValue>}
                    {research.unlockedBy && <ListValue label="Unlocked By" values={research.unlockedBy}>{linkFn}</ListValue>}
                    {research.unlocks && <ListValue label="Unlocks" values={research.unlocks}>{ linkFn }</ListValue>}
                    {research.manufacture && <ListValue label="Manufacturing Process" values={research.manufacture}>{ linkFn }</ListValue>}
                    
                </tbody>
            </table>
        </div>
        <div className="techTree"><Cytoscape elements={cytoTree}/></div>
        </React.Fragment>
    );
}