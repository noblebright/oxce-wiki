import React from "react";
import Table from "react-bootstrap/Table";
import useLink from "../../hooks/useLink";
import useLocale from "../../hooks/useLocale";
import { BooleanValue, ListValue, Percent, SectionHeader, SimpleValue, UnitStats } from "../ComponentUtils.js";


const specAb = [
    "None",
    "Explodes on Death",
    "Burns Floor",
    "Burns Floor and Explodes on Death"
];

export default function Units({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const units = ruleset.entries[id].units;

    if(!units) return null;
    
    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Unit"/>
            <tbody>
                <SimpleValue label="Aggression" value={units.aggression}/>
                <SimpleValue label="Race" value={units.race}>{ lc }</SimpleValue>
                <SimpleValue label="Rank" value={units.rank}>{ lc }</SimpleValue>
                <SimpleValue label="Spotter" value={units.spotter}/>
                <SimpleValue label="Sniper" value={units.sniper}/>
                <SimpleValue label="Armor" value={units.armor}/>
                <SimpleValue label="Stand Height" value={units.standHeight}/>
                <SimpleValue label="Kneel Height" value={units.kneelHeight}/>
                <SimpleValue label="Float Height" value={units.floatHeight}/>
                <SimpleValue label="Score" value={units.value}/>
                <SimpleValue label="Intelligence" value={units.intelligence}/>
                <BooleanValue label="Can Surrender?" value={units.canSurrender}/>
                <BooleanValue label="Auto Surrender" value={units.autoSurrender}/>
                <SimpleValue label="Aggression" value={units.aggression}/>
                <BooleanValue label="Mindless Aggro?" value={units.isLeeroyJenkins}/>
                <SimpleValue label="Energy Recovery" value={units.energyRecovery}/>
                <SimpleValue label="Special Ability" value={units.specab}>
                    { x => specAb[x] }
                </SimpleValue>
                <SimpleValue label="Spawn on Death" value={units.spawnUnit}>{ linkFn }</SimpleValue>
                <BooleanValue label="Living Weapon" value={units.livingWeapon}/>
                <SimpleValue label="Melee Weapon" value={units.meleeWeapon}>{ linkFn }</SimpleValue>
                <SimpleValue label="Psi Weapon" value={units.psiWeapon}>{ linkFn }</SimpleValue>
                <BooleanValue label="Capturable" value={units.capturable}/>
                <SimpleValue label="Morale Loss When Killed" value={units.moraleLossWhenKilled}>{ Percent }</SimpleValue>
            </tbody>
            <UnitStats stats={units.stats} lc={lc}/>
            { units.builtInWeaponSets && units.builtInWeaponSets.map((weaponSet, idx) => <ListValue key={idx} label={`Built-In Weapons Set ${idx + 1}`} values={weaponSet}>{ linkFn }</ListValue>) }
        </Table>
    )
}