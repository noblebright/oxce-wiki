import React from "react";
import Table from "react-bootstrap/Table";

import useLocale from "../../hooks/useLocale";
import { SectionHeader, SimpleValue, ListValue } from "../ComponentUtils.js";
import useLink from "../../hooks/useLink";

export default function Research({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const research = ruleset.entries[id].research;

    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Research"/>
            <tbody>
                <SimpleValue label="Cost" value={research.cost === undefined ? "NONE" : `${research.cost} Scientist Hours`}/>
                <SimpleValue label="Points" value={research.points}/>
                {research.needItem && <SimpleValue label="Requires Item" value="TRUE"/>}
                {research.destroyItem && <SimpleValue label="Destroys Item" value="TRUE"/>}
                <SimpleValue label="Gives (lookup)" value={research.lookup}>{ linkFn }</SimpleValue>
            </tbody>
            <ListValue label="Requires Service" values={research.requiresBaseFunc}>{ lc }</ListValue>
            <ListValue label="Get as a Result of " values={research.seeAlso}>{ linkFn }</ListValue>
            <ListValue label="Dependencies" values={research.dependencies}>{ linkFn }</ListValue>
            <ListValue label="Leads To" values={research.leadsTo}>{ linkFn }</ListValue>
            <ListValue label="Unlocked By" values={research.unlockedBy}>{linkFn}</ListValue>
            <ListValue label="Unlocks" values={research.unlocks}>{ linkFn }</ListValue>
            <ListValue label="Manufacturing Process" values={research.manufacture}>{ linkFn }</ListValue>
        </Table>
    )
}