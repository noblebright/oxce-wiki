import React from "react";
import Table from "react-bootstrap/Table";

import { Percent, BooleanValue, ListHeader, SectionHeader, SimpleValue, ListValue } from "../ComponentUtils.js";
import useLocale from "../../hooks/useLocale";
import useImage from "../../hooks/useImage";
import useLink from "../../hooks/useLink";

function Stats({stats, lc}) {
    return (
        <React.Fragment>
            <ListHeader label="Stats"/>
            <tbody>
                <SimpleValue label={lc("STR_TIME_UNITS")} value={stats.tu}/>
                <SimpleValue label={lc("STR_STAMINA")} value={stats.stamina}/>
                <SimpleValue label={lc("STR_HEALTH")} value={stats.health}/>
                <SimpleValue label={lc("STR_BRAVERY")} value={stats.bravery}/>
                <SimpleValue label={lc("STR_REACTIONS")} value={stats.reactions}/>
                <SimpleValue label={lc("STR_FIRING_ACCURACY")} value={stats.firing}/>
                <SimpleValue label={lc("STR_THROWING_ACCURACY")} value={stats.throwing}/>
                <SimpleValue label={lc("STR_STRENGTH")} value={stats.strength}/>
                <SimpleValue label={lc("STR_PSIONIC_STRENGTH")} value={stats.psiStrength}/>
                <SimpleValue label={lc("STR_PSIONIC_SKILL")} value={stats.psiSkill}/>
                <SimpleValue label={lc("STR_MELEE_ACCURACY")} value={stats.melee}/>
                <SimpleValue label={lc("STR_MANA_POOL")} value={stats.mana}/>
            </tbody>
        </React.Fragment>
    );
}

const specAb = [
    "None",
    "Explodes on Death",
    "Burns Floor",
    "Burns Floor and Explodes on Death"
];

export default function Units({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const imageFn = useImage(ruleset);
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
            <Stats stats={units.stats} lc={lc}/>
            { units.builtInWeaponSets && units.builtInWeaponSets.map((weaponSet, idx) => <ListValue key={idx} label={`Built-In Weapons Set ${idx + 1}`} values={weaponSet}>{ linkFn }</ListValue>) }
        </Table>
    )
}