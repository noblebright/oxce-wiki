import React from "react";
import Table from "react-bootstrap/Table";

import useLocale from "../../hooks/useLocale";
import { BooleanValue, SectionHeader, ListHeader, SimpleValue, ListValue } from "../ComponentUtils.js";
import useLink from "../../hooks/useLink";

function ProtectedTopics({topics, linkFn}) {
    if(!topics) return null;
    const topicList = Object.entries(topics);
    return (
        <React.Fragment>
            <ListHeader label="Protected Bonus Topics"/>
            <tbody>
                {topicList.map(([key, value]) => (
                    <tr key={key}>
                        <td>{linkFn(key)}</td>
                        <td>{value.map(x => <div key={x}>{linkFn(x)}</div>)}</td>
                    </tr>
                ))}
            </tbody>
        </React.Fragment>
    )
}

export default function Research({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const research = ruleset.entries[id].research;

    if(!research) return null;
    
    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Research"/>
            <tbody>
                <SimpleValue label="Cost" value={research.cost}>
                    { x => x === undefined ? "NONE" : `${x} Scientist Days` }
                </SimpleValue>
                <SimpleValue label="Points" value={research.points}/>
                <BooleanValue label="Requires Item" value={research.needItem}/>
                <BooleanValue label="Destroys Item" value={research.destroyItem}/>
                <SimpleValue label="Gives (lookup)" value={research.lookup}>{ linkFn }</SimpleValue>
                <SimpleValue label="Spawns Item" value={research.spawnedItem}>{ linkFn }</SimpleValue>
            </tbody>
            <ListValue label="Requires Service" values={research.requiresBaseFunc}>{ lc }</ListValue>
            <ListValue label="Get as a Result of " values={research.seeAlso}>{ linkFn }</ListValue>
            <ListValue label="Mission Reward" values={research.$fromMission}>{ linkFn }</ListValue>
            <ListValue label="Event Reward" values={research.$fromEvent}>{ linkFn }</ListValue>
            <ListValue label="Dependencies" values={research.dependencies}>{ linkFn }</ListValue>
            <ListValue label="Leads To" values={research.leadsTo}>{ linkFn }</ListValue>
            <ListValue label="Disabled" values={research.disables}>{ linkFn }</ListValue>
            <ListValue label="Unlocked By" values={research.unlockedBy}>{linkFn}</ListValue>
            <ListValue label="Unlocks" values={research.unlocks}>{ linkFn }</ListValue>
            <ListValue label="Bonus Topics" values={research.getOneFree}>{ linkFn }</ListValue>
            <ProtectedTopics topics={research.getOneFreeProtected} linkFn={linkFn}/>
            <ListValue label="Deployment Triggers" values={research.$deploymentTrigger}>{ linkFn }</ListValue>
            <ListValue label="Free From" values={research.freeFrom}>{ linkFn }</ListValue>
            <ListValue label="Allows Purchase" values={research.$allowsPurchase}>{ linkFn }</ListValue>
            <ListValue label="Manufacturing Process" values={research.manufacture}>{ linkFn }</ListValue>
            <ListValue label="Allows Transformation" values={research.$allowsTransform}>{ linkFn }</ListValue>
        </Table>
    )
}