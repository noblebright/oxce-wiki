import React, {useState, useEffect, useMemo} from "react";
import Table from "react-bootstrap/Table";
import useLink from "../../hooks/useLink";
import useLocale from "../../hooks/useLocale";
import useInventory from "../../hooks/useInventory";
import { BooleanValue, SectionHeader, ListHeader, ContainerValue, SimpleValue, SimpleSelect, ListValue, Percent } from "../ComponentUtils.js";

function getAliens(ruleset, race, deployment) {
    const rank = deployment.alienRank;
    const overrideUnit = deployment.customUnitType;
    const raceEntry = ruleset.entries[race]?.alienRaces;
    
    if(overrideUnit) return [overrideUnit];
    
    if(!raceEntry) {
        return null;
    }
    return raceEntry.membersRandom?.[rank] || [raceEntry.members[rank]];
}

function NumberAppearing({deployment}) {
    const low = deployment.lowQty;
    const delta = (deployment.dQty ?? 0) + (deployment.extraQty ?? 0);
    const high = deployment.highQty;
    const mid = Math.ceil((low + high) / 2);

    return (
        <React.Fragment>
            <ListHeader label="Number Appearing"/>
            <tbody>
                <ContainerValue>
                    <Table>
                        <thead>
                            <tr><th>Beginner/Experienced</th><th>Veteran/Genius</th><th>SuperHuman</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{low} - {low + delta}</td>
                                <td>{mid} - {mid + delta}</td>
                                <td>{high} - {high + delta}</td>
                            </tr>
                        </tbody>
                    </Table>
                </ContainerValue>
            </tbody>
        </React.Fragment>
    )
}

function Deployment({ ruleset, deployment, race, linkFn, idx }) {
    const alienList = getAliens(ruleset, race, deployment);
        
    return (
        <React.Fragment>
            <SectionHeader label={`Alien Loadout ${idx}`}/>
            <tbody>
                <SimpleValue label="Rank" value={deployment.alienRank}/>
                <SimpleValue label="Percent Outside" value={deployment.percentageOutsideUfo}/>
            </tbody>
            <ListValue label="Alien Types" values={alienList}>{ linkFn }</ListValue>
            <NumberAppearing deployment={deployment}/>
            { deployment.itemSets.map((x, idx) => <ListValue key={idx} label={`Item Set ${idx}`} values={x}>{ linkFn }</ListValue>)}
        </React.Fragment>
    )
    
}

const SPAWN_MODE = ["All Blocks", "Map Script Blocks", "Indicated Blocks", "Script or Indicated", "Script and Indicated"];

function Reinforcement({ruleset, linkFn, race, idx, data}) {
    const turnsOrObjective = data.objectiveDestroyed || !!data.turns;

    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label={`Reinforcement[${idx}] ${data.type}`}/>
            <tbody>
                <SimpleValue label="Max Times Triggered" value={data.maxRuns}/>
                <SimpleValue label="Minimum Difficulty" value={data.minDifficulty}/>
                <SimpleValue label="Maximum Difficulty" value={data.maxDifficulty}/>
                <BooleanValue label="Objective Destroyed?" value={data.objectiveDestroyed}/>
                <BooleanValue label="Objective Destroyed?" value={data.objectiveDestroyed}/>
                { !data.objectiveDestroyed && <SimpleValue label="Turns" value={data.turns?.join?.(", ")}/> }
                { !turnsOrObjective && <SimpleValue label="Minimum Turn" value={data.minTurn}/> }
                { !turnsOrObjective && <SimpleValue label="Maximum Turn" value={data.maxTurn}/> }
                <SimpleValue label="Execution Odds" value={data.executionOdds || 100}>{ Percent }</SimpleValue>
                <BooleanValue label="Use Spawn Nodes?" value={data.useSpawnNodes ?? true}/>
                <SimpleValue label="Spawn Mode" showZero value={data.mapBlockFilterType}>{ x => SPAWN_MODE[x] }</SimpleValue>
                <BooleanValue label="Randomize Z-Levels?" value={data.randomizeZLevels ?? true}/>
                <SimpleValue label="Spawn Z-Levels" value={data.spawnZLevels?.join?.(", ")}/>
                <SimpleValue label="Minimum Distance from X-Com Units" value={data.minDistanceFromXcomUnits}/>
                <SimpleValue label="Maximum Distance from Borders" value={data.maxDistanceFromBorders}/>
                <BooleanValue label="Force Spawn Near Friendly?" value={data.forceSpawnNearFriend ?? true}/>
            </tbody>
            <ListValue label="Indicated Spawn Blocks" values={data.spawnBlocks}/>
            {data.data.map((x, idx) => <Deployment key={idx} ruleset={ruleset} linkFn={linkFn} deployment={x} race={race} idx={idx}/>)}
        </Table>
    )
}

function Reinforcements(props) {
    const { reinforcements, ...rest } = props;

    if(!reinforcements) return null;

    return (
        <React.Fragment>
            { reinforcements.map((x, idx)=> <Reinforcement key={idx} {...rest} data={x} idx={idx}/>) }
        </React.Fragment>
    );
}

export default function AlienDeployments({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const inventoryFn = useInventory(linkFn);
    const entry = ruleset.entries[id];
    const alienDeployments = entry.alienDeployments;
    const alienRace = alienDeployments?.race;
    const randomRace = alienDeployments?.randomRace;
    const prevStage = alienDeployments?.$prevStage;
    const raceByDeployment = ruleset.lookups.raceByDeployment;

    const availableRaces = useMemo(() => {
        const possibleRaces = new Set();
        if(!alienDeployments) return [null];
        if(randomRace) randomRace.forEach(x => possibleRaces.add(x));
        if(alienRace) possibleRaces.add(alienRace);
        if(raceByDeployment[id]) {
            raceByDeployment[id].forEach(x => possibleRaces.add(x));
        }
        if(raceByDeployment[prevStage]) {
            raceByDeployment[prevStage].forEach(x => possibleRaces.add(x)); //check previous stage if this is the second part of a two-parter.
        }
        console.log([...possibleRaces]);
        return [...possibleRaces];
    }, [id, alienDeployments, alienRace, randomRace, prevStage, raceByDeployment]);
    const [race, setRace] = useState(availableRaces[0]);

    useEffect(() => {
        //reset race when the list of races changes (due to switching to a different deployment, for example)
        setRace(availableRaces[0]);
    }, [availableRaces]);

    if(!alienDeployments) return null;

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
                    <SimpleValue label="Alien Race" value={availableRaces}>
                        { availableRaces.length > 1 ? (x => <SimpleSelect options={x} value={race || ""} onChange={setRace}>{ x => `${lc(x)} [${x}]` }</SimpleSelect>) : x => lc(x[0])}
                    </SimpleValue>
                </tbody>
                <ListValue label="Variant Of" values={alienDeployments.$variant}>{ linkFn }</ListValue>
                <ListValue label="Map Items" values={alienDeployments.terrainItems}>{ linkFn }</ListValue>
                <ListValue label="Map Items (Random)" values={alienDeployments.terrainRandomItems}>{ linkFn }</ListValue>
                <ListValue label="Civilians" values={Object.entries(alienDeployments.civiliansByType || {})}>{ inventoryFn }</ListValue>
                {alienDeployments.data.map((x, idx) => <Deployment key={idx} ruleset={ruleset} linkFn={linkFn} deployment={x} race={race} idx={idx}/>)}
            </Table>
            <Reinforcements ruleset={ruleset} linkFn={linkFn} race={race} reinforcements={alienDeployments.reinforcements}/>
        </React.Fragment>
    );
}