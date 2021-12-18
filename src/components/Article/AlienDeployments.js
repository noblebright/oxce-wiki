import React, {useState, useEffect, useMemo} from "react";
import Table from "react-bootstrap/Table";
import useLink from "../../hooks/useLink";
import useLocale from "../../hooks/useLocale";
import useInventory from "../../hooks/useInventory";
import { BooleanValue, SectionHeader, ListHeader, ContainerValue, SimpleValue, SimpleSelect, ListValue, Percent } from "../ComponentUtils.js";
import { getPossibleRaces } from "../../model/UnitSourceMapper";

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

const factions = ["STR_FRIENDLY", "STR_NEUTRAL", "STR_HOSTILE"];
const armorFacing = ["STR_RANDOMIZE", "STR_FRONT_ARMOR", "STR_LEFT_ARMOR", "STR_RIGHT_ARMOR", "STR_REAR_ARMOR", "STR_UNDER_ARMOR"];
const bodyPart = ["STR_RANDOMIZE", "STR_HEAD", "STR_TORSO", "STR_RIGHT_ARM", "STR_LEFT_ARM", "STR_RIGHT_LEG", "STR_LEFT_LEG"];

function EnviroCondition({ faction, value, lc, linkFn }) {
    if(!value) return null;
    // bodyPart and side + 1, since STR_RANDOMIZE value is -1
    return(
        <React.Fragment>
            <SectionHeader label={`${lc(faction)} Condition`}/>
            <tbody>
                <SimpleValue label="% Chance This Combat" value={value.globalChance}/>
                <SimpleValue label="% Chance Per Turn" value={value.chancePerTurn}/>
                <SimpleValue label="First Turn" value={value.firstTurn}/>
                <SimpleValue label="Last Turn" value={value.lastTurn}/>
                <SimpleValue label="Message" value={value.message}>{ lc }</SimpleValue>
                <SimpleValue label="Effect" value={value.weaponOrAmmo}>{ linkFn }</SimpleValue>
                <SimpleValue label="Facing" value={armorFacing[value.side + 1]}>{ lc }</SimpleValue>
                <SimpleValue label="Body Part" value={bodyPart[value.bodyPart + 1]}>{ lc }</SimpleValue>
            </tbody>
        </React.Fragment>
    );
}

function EnviroEffect({ value, lc, linkFn }) {
    if(!value) return null;
    return (
        <React.Fragment>
            {factions.map(x => (<EnviroCondition key={x} faction={x} value={value.environmentalConditions?.[x]} lc={lc} linkFn={linkFn} />))}
            <ListValue label="Armor Transforms" values={Object.entries(value.armorTransformations ?? {})}>
                { ([key, value]) => (
                    <React.Fragment>
                        {linkFn(key)} ➔ {linkFn(value)}
                    </React.Fragment>
                )}
            </ListValue>
        </React.Fragment>
    )
}

function StartingConditions({ value, lc, linkFn, inventoryFn }) {
    if(!value) return null;
    return (
        <React.Fragment>
            <tbody>
                <SimpleValue label="Destroy Required Items?" value={value.destroyRequiredItems}/>
            </tbody>
            <ListValue label="Required Items" values={value.requiredItems}>{ linkFn } </ListValue>
            <SectionHeader label="Default Armors"/>
            { Object.entries(value.defaultArmor).map(([soldier, armorTypes]) => (
                <ListValue key={soldier} label={lc(soldier)} values={Object.entries(armorTypes)}>{inventoryFn}</ListValue>
            ))}
            <SectionHeader label="Allowed/Forbidden"/>
            <ListValue label="Allowed Armors" values={value.allowedArmors}>{ linkFn }</ListValue>
            <ListValue label="Forbidden Armors" values={value.forbiddenArmors}>{ linkFn }</ListValue>
            <ListValue label="Allowed Soldier Types" values={value.allowedSoldierTypes}>{ linkFn }</ListValue>
            <ListValue label="Forbidden Soldier Types" values={value.forbiddenSoldierTypes}>{ linkFn }</ListValue>
            <ListValue label="Allowed Soldier Types" values={value.allowedSoldierTypes}>{ linkFn }</ListValue>
            <ListValue label="Forbidden Soldier Types" values={value.forbiddenSoldierTypes}>{ linkFn }</ListValue>
            <ListValue label="Allowed Vehicle Unit Types" values={value.allowedVehicles }>{ linkFn}</ListValue>
            <ListValue label="Forbidden Vehicle Unit Types" values={value.forbiddenVehicles}>{ linkFn }</ListValue>
            <ListValue label="Allowed Items" values={value.allowedItems}>{ linkFn }</ListValue>
            <ListValue label="Forbidden Items" values={value.forbiddenItems}>{ linkFn }</ListValue>
            <ListValue label="Allowed Item Categories" values={value.allowedItemCategories}>{ linkFn }</ListValue>
            <ListValue label="Forbidden Item Categories" values={value.forbiddenItemCategories}>{ linkFn }</ListValue>
            <ListValue label="Allowed Craft" values={value.allowedCraft}>{ linkFn }</ListValue>
            <ListValue label="Forbidden Craft" values={value.forbiddenCraft}>{ linkFn }</ListValue>
        </React.Fragment>
    )
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
                <ListValue label="Variant Of" values={alienDeployments.$variant}>{ linkFn }</ListValue>
                <ListValue label="Map Items" values={alienDeployments.terrainItems}>{ linkFn }</ListValue>
                <ListValue label="Map Items (Random)" values={alienDeployments.terrainRandomItems}>{ linkFn }</ListValue>
                <ListValue label="Civilians" values={Object.entries(alienDeployments.civiliansByType || {})}>{ inventoryFn }</ListValue>
                <ListValue label="Spawned Units" values={alienDeployments.$spawnedUnits}>{ linkFn }</ListValue>
                <EnviroEffect value={enviroEffects} linkFn={linkFn} lc={lc}/>
                <StartingConditions value={startingConditions} lc={lc} linkFn={linkFn} inventoryFn={inventoryFn}/>
                {alienDeployments.data.map((x, idx) => <Deployment key={idx} ruleset={ruleset} linkFn={linkFn} deployment={x} race={race} idx={idx}/>)}
            </Table>
            <Reinforcements ruleset={ruleset} linkFn={linkFn} race={race} reinforcements={alienDeployments.reinforcements}/>
        </React.Fragment>
    );
}