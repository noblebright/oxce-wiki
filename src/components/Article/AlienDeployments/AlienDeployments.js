import React, {useState, useEffect, useMemo} from "react";
import Table from "react-bootstrap/Table";
import useLink from "../../../hooks/useLink";
import useLocale from "../../../hooks/useLocale";
import useInventory from "../../../hooks/useInventory";
import { BooleanValue, SectionHeader, SimpleValue, SimpleSelect, ListValue } from "../../ComponentUtils.js";
import { getPossibleRaces } from "../../../model/UnitSourceMapper";
import { Deployment, Reinforcements } from "./Deployment";
import EnviroEffect from "./EnviroEffect";
import StartingConditions from "./StartingConditions";
import Triggers from "./Triggers";

function getMapItems(ruleset, entry) {
    const items = new Set(entry.$terrainItems);
    const randomItems = new Set(entry.$terrainRandomItems);
    
    entry.$relatedUfos.forEach(key => {
        const ufo = ruleset.entries[key].ufos;
        //eslint-disable-next-line no-unused-expressions
        ufo.$ufoItems?.forEach(item => items.add(item));
        //eslint-disable-next-line no-unused-expressions
        ufo.$ufoRandomItems?.forEach(item => randomItems.add(item));
    });    
    
    return [[...items], [...randomItems]];
}

export default function AlienDeployments({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const inventoryFn = useInventory(linkFn);
    const entry = ruleset.entries[id];
    const alienDeployments = entry.alienDeployments;
    
    const availableRaces = useMemo(() => {
        const possibleRaces = getPossibleRaces(id, ruleset);
        return [...possibleRaces];
    }, [id, ruleset]);
    const [race, setRace] = useState(availableRaces[0]);

    useEffect(() => {
        //reset race when the list of races changes (due to switching to a different deployment, for example)
        setRace(availableRaces[0]);
    }, [availableRaces]);

    if(!alienDeployments) return null;

    const startingConditions = ruleset.lookups.startingConditions[alienDeployments.startingCondition];
    const enviroEffects = ruleset.lookups.enviroEffects[alienDeployments.enviroEffects];

    const [mapItems, mapRandomItems] = getMapItems(ruleset, alienDeployments);

    return (
        <React.Fragment>
            <Table bordered striped size="sm" className="auto-width">
                <SectionHeader label="Deployment"/>
                <tbody>
                    <SimpleValue label="Map Size" value={`${alienDeployments.width}x${alienDeployments.length}x${alienDeployments.height}`}/>
                    <SimpleValue label="Civilian Count" value={alienDeployments.civilians}/>
                    <SimpleValue label="Light Level" value={alienDeployments.shade}/>
                    <SimpleValue label="Min Light" value={alienDeployments.minShade}/>
                    <SimpleValue label="Max Light" value={alienDeployments.maxShade}/>
                    <SimpleValue label="Next Stage" value={alienDeployments.nextStage}>{ linkFn }</SimpleValue>
                    <BooleanValue label="Final Mission" value={alienDeployments.finalDestination} />
                    <SimpleValue label="Alert" value={alienDeployments.alert}>{ lc }</SimpleValue>
                    <SimpleValue label="Duration" value={alienDeployments.duration}>{ x => `${x[0]} - ${x[1]}` }</SimpleValue>
                    <SimpleValue label="Point Penalty" value={alienDeployments.points}/>
                    <SimpleValue label="Grants Research" value={alienDeployments.unlockedResearch}>{ linkFn }</SimpleValue>
                    <SimpleValue label="Grants Item" value={alienDeployments.missionBountyItem}>{ linkFn }</SimpleValue>
                    <SimpleValue label="Despawn Penalty" value={alienDeployments.despawnPenalty}/>
                    <SimpleValue label="Abort Penalty" value={alienDeployments.abortPenalty}/>
                    <SimpleValue label="Turn Limit" value={alienDeployments.turnLimit}/>
                    <SimpleValue label="Related Ufo" value={alienDeployments.$relatedUfo}>{ linkFn }</SimpleValue>
                    <SimpleValue label="Alien Race" value={availableRaces}>
                        { availableRaces.length > 1 ? (x => <SimpleSelect options={x} value={race || ""} onChange={setRace}>{ x => `${lc(x)} [${x}]` }</SimpleSelect>) : x => lc(x[0])}
                    </SimpleValue>
                </tbody>
                <ListValue label="Variant Of" values={alienDeployments.$variantOf}>{ linkFn }</ListValue>
                <ListValue label="Previous Stage" values={alienDeployments.$prevStage}>{ linkFn }</ListValue>
                <ListValue label="Map Items" values={mapItems}>{ linkFn }</ListValue>
                <ListValue label="Map Items (Random)" values={mapRandomItems}>{ linkFn }</ListValue>
                <ListValue label="Civilians" values={Object.entries(alienDeployments.civiliansByType || {})}>{ inventoryFn }</ListValue>
                <ListValue label="Spawned Units" values={alienDeployments.$spawnedUnits}>{ linkFn }</ListValue>
                <EnviroEffect value={enviroEffects} linkFn={linkFn} lc={lc}/>
                <StartingConditions value={startingConditions} lc={lc} linkFn={linkFn} inventoryFn={inventoryFn}/>
                {alienDeployments.data.map((x, idx) => <Deployment key={idx} ruleset={ruleset} linkFn={linkFn} deployment={x} race={race} idx={idx}/>)}
            </Table>
            <Reinforcements ruleset={ruleset} linkFn={linkFn} race={race} reinforcements={alienDeployments.reinforcements}/>
            <Triggers ruleset={ruleset} linkFn={linkFn} lc={lc} inventoryFn={inventoryFn} id={id}/>
        </React.Fragment>
    );
}