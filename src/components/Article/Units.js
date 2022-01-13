import React from "react";
import Table from "react-bootstrap/Table";
import useLink from "../../hooks/useLink";
import useLocale from "../../hooks/useLocale";
import { BooleanValue, HeightStats, ListValue, Percent, SectionHeader, SimpleValue, UnitStats } from "../ComponentUtils.js";
import Armors from "./Armors";


const specAb = [
    "None",
    "Explodes on Death",
    "Burns Floor",
    "Burns Floor and Explodes on Death"
];

function getLivingWeapon(entries, id) {
    const weaponStr = id.substr(4);
    if(entries[`${weaponStr}_WEAPON`]) {
        return `${weaponStr}_WEAPON`;
    }
    const parts = weaponStr.split("_");
    while(parts.length) {
        parts.pop();
        const key = `${parts.join("_")}_WEAPON`;
        if(entries[key]) {
            return key;
        }
    }
    return null;
}
export default function Units(props) {
    const {ruleset, lang, id, version} = props;
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const units = ruleset.entries[id].units;

    if(!units) return null;
    
    const livingWeaponLink = units.livingWeapon ? getLivingWeapon(ruleset.entries, id) : null;
    
    return (
        <React.Fragment>
            <Table bordered striped size="sm" className="auto-width">
                <SectionHeader label="Unit"/>
                <tbody>
                    <SimpleValue label="Aggression" value={units.aggression}/>
                    <SimpleValue label="Race" value={units.race}>{ lc }</SimpleValue>
                    <SimpleValue label="Rank" value={units.rank}>{ lc }</SimpleValue>
                    <SimpleValue label="Spotter" value={units.spotter}/>
                    <SimpleValue label="Sniper" value={units.sniper}/>
                    <SimpleValue label="Armor" value={units.armor}>{ linkFn }</SimpleValue>
                    <HeightStats entity={units}/>
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
                    <BooleanValue label="Is Living Weapon" value={units.livingWeapon}/>
                    <SimpleValue label="Living Weapon" value={livingWeaponLink}>{ linkFn }</SimpleValue>
                    <SimpleValue label="Melee Weapon" value={units.meleeWeapon}>{ linkFn }</SimpleValue>
                    <SimpleValue label="Psi Weapon" value={units.psiWeapon || (units.stats.psiSkill ? "ALIEN_PSI_WEAPON" : undefined)}>{ linkFn }</SimpleValue>
                    <BooleanValue label="Capturable" value={units.capturable}/>
                    <SimpleValue label="Morale Loss When Killed" value={units.moraleLossWhenKilled}>{ Percent }</SimpleValue>
                </tbody>
                <UnitStats stats={units.stats} lc={lc}/>
                { units.builtInWeaponSets && units.builtInWeaponSets.map((weaponSet, idx) => <ListValue key={idx} label={`Built-In Weapons Set ${idx + 1}`} values={weaponSet}>{ linkFn }</ListValue>) }
                <ListValue label="Deployed In" values={units.$deployedIn}>{ linkFn }</ListValue>
            </Table>
            <Armors {...props} id={units.armor}/>
        </React.Fragment>
    )
}