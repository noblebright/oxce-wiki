import React from "react";
import Table from "react-bootstrap/Table";
import { BooleanValue, SectionHeader, ListHeader, ContainerValue, SimpleValue, ListValue, Percent } from "../../ComponentUtils.js";

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

export function Deployment({ ruleset, deployment, race, linkFn, idx }) {
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
            { deployment.itemSets?.map((x, idx) => <ListValue key={idx} label={`Item Set ${idx}`} values={x}>{ linkFn }</ListValue>)}
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

export function Reinforcements(props) {
    const { reinforcements, ...rest } = props;

    if(!reinforcements) return null;

    return (
        <React.Fragment>
            { reinforcements.map((x, idx)=> <Reinforcement key={idx} {...rest} data={x} idx={idx}/>) }
        </React.Fragment>
    );
}
