import React from "react";
import Table from "react-bootstrap/Table";
import useLink from "../../hooks/useLink";
import useLocale from "../../hooks/useLocale";
import { SectionHeader, SimpleValue, Money, ListValue } from "../ComponentUtils.js";

export default function Events({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const entry = ruleset.entries[id];
    const events = entry.events;

    if(!events) return null;

    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Event"/>
            <tbody>
                <SimpleValue label="Description" value={events.description}>{ x => <p dangerouslySetInnerHTML={{__html: lc(x)}} /> }</SimpleValue>
                <SimpleValue label="Points" value={events.points}/>
                <SimpleValue label="Funds" value={events.funds}>{ Money }</SimpleValue>
                <SimpleValue label="Spawned Persons" value={events.spawnedPersons}/>
                <SimpleValue label="Spawned Person Type" value={events.spawnedPersonType}>{ linkFn }</SimpleValue>
                <SimpleValue label="Interrupted by Research" value={events.interruptResearch}>{ linkFn }</SimpleValue>
                <SimpleValue label="Timer" value={events.timer} />
                <SimpleValue label="timerRandom" value={events.timerRandom}/>
            </tbody>
            <ListValue label="Grants One Research" values={events.researchList}>{ linkFn }</ListValue>
        </Table>
    );
}