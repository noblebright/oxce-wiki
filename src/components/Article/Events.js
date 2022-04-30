import React, { useMemo, useCallback } from "react";
import Table from "react-bootstrap/Table";
import useLink from "../../hooks/useLink";
import useLocale from "../../hooks/useLocale";
import useInventory from "../../hooks/useInventory";
import { BooleanValue, SectionHeader, SimpleValue, Money, ListHeader, ListValue, Percent } from "../ComponentUtils.js";

function getGuaranteedItems(event) {
    const items = {};
    const inc = (x, count = 1) => items[x] = items[x] + count || count;
    const { everyItemList, everyMultiItemList } = event;
    (everyItemList || []).forEach(x => inc(x));
    Object.entries(everyMultiItemList || {}).forEach(([key, value]) => { inc(key, value); });
    return items;
}

function getWeightedItems(event) {
    const items = {};
    const inc = (x, count = 1) => items[x] = items[x] + count || count;
    if(!event || !event.weightedItemList) return {};
    const { weightedItemList } = event;
    let denominator = 0;
    Object.entries(weightedItemList).forEach(([key, value]) => { inc(key, value); denominator += value; });
    const rows = Object.entries(items).sort((a, b) => b[1] - a[1]);
    return { denominator, rows };
}

function RandomItems({label, denominator, rows, children}) {
    if(!rows) return null;
    return (
        <React.Fragment>
            <ListHeader label={label} />
            <tbody>
            { rows.map(
                ([item, weight], idx) => (
                <tr key={idx}>
                    <td>{children(item)}</td>
                    <td>{weight}/{denominator} ({(weight * 100 / denominator).toFixed(2)}%)</td>
                </tr>
            ))}
            </tbody>
        </React.Fragment>
    );
}

function EventScript({ data, linkFn }) {
    const triggerFn = useCallback(([item, status]) => (
        <div className="EventTrigger">
            <span className="TriggerLabel">{ linkFn(item) }</span>
            <span className="TriggerStatus">{`${status}`.toUpperCase()}</span>
        </div>
    ), [linkFn]);

    return (
        <React.Fragment>
            <SectionHeader label={`Trigger: ${data.type}`} />
            <tbody>
                <SimpleValue label="First Month" value={data.firstMonth}/>
                <SimpleValue label="Last Month" value={data.lastMonth}/>
                <SimpleValue label="Execution Chance" value={data.executionOdds}>{ Percent }</SimpleValue>
                <SimpleValue label="Minimum Difficulty" showZero value={data.minDifficulty}/>
                <SimpleValue label="Maximum Difficulty" showZero value={data.maxDifficulty}/>
                <SimpleValue label="Minimum Score" showZero value={data.minScore}/>
                <SimpleValue label="Maximum Score" showZero value={data.maxScore}/>
                <SimpleValue label="Minimum Funds" showZero value={data.minFunds}/>
                <SimpleValue label="Maximum Funds" showZero value={data.maxFunds}/>
                <BooleanValue label="Affects Progression?" value={data.affectsGameProgression}/>
            </tbody>
            <ListValue label="Item Triggers" values={Object.entries(data.itemTriggers || {})}>{ triggerFn }</ListValue>
            <ListValue label="Facility Triggers" values={Object.entries(data.facilityTriggers || {})}>{ triggerFn }</ListValue>
            <ListValue label="Research Triggers" values={Object.entries(data.researchTriggers || {})}>{ triggerFn }</ListValue>
        </React.Fragment>
    )
}

export default function Events({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const inventoryFn = useInventory(linkFn);
    const entry = ruleset.entries[id];
    const events = entry.events;
    const weightedItems = useMemo(() => getWeightedItems(events), [events]);

    if(!events) return null;

    //lookups are sets, so need to normalize to array before calling map
    const eventScripts = [...(ruleset.lookups.eventScriptsByEvent[events.name] || [])];

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
            <ListValue label="Triggered by Research" values={events.$fromResearch}>{ linkFn }</ListValue>
            <ListValue label="Grants One Research" values={events.researchList}>{ linkFn }</ListValue>
            <ListValue label="Get Random Item" values={events.randomItemList}>{ linkFn }</ListValue>
            <ListValue label="Guaranteed Items" values={Object.entries(getGuaranteedItems(events))}>{ inventoryFn }</ListValue>
            <RandomItems label="Weighted Items" {...weightedItems}>{ linkFn }</RandomItems>
            { eventScripts.map((triggerId, idx) => <EventScript key={idx} data={ruleset.lookups.eventScripts[triggerId]} linkFn={linkFn}/>) }
        </Table>
    );
}