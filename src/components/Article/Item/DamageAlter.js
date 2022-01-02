import React from "react";

import { SimpleValue, BooleanValue, Percent } from "../../ComponentUtils";
import {defaultDTProps as defaultProps} from "../../../model/Constants";

function getRandomType(ruleset, randomType) {
    switch(randomType) {
        case 0: return "Default";
        case 1: return "0 - 200%";
        case 2: return "50 - 150%";
        case 3: return "Flat Damage";
        case 4: return `${ruleset.globalVars.fireDamageRange?.[0] ?? 5} - ${ruleset.globalVars.fireDamageRange?.[1] ?? 10} (fire)`;
        case 5: return "No Damage";
        case 6: return "(0 - 100%) + (0 - 100%)";
        case 7: return "50 - 200%";
        case 8: return `${100 - (ruleset.globalVars.damageRange ?? 100)} - ${100 + (ruleset.globalVars.damageRange ?? 100)}`;
        case 9: return `${100 - (ruleset.globalVars.explosiveDamageRange ?? 50)} - ${100 + (ruleset.globalVars.explosiveDamageRange ?? 50)}`;
        default: return "Unknown randomType!";
    }
}
function AlterEntry({ alter, suffix, label }) {
    return (
        <React.Fragment>
            <SimpleValue label={`${label} Damage`} value={alter[`To${suffix}`] * 100} showZero>{ Percent }</SimpleValue>
            <BooleanValue label={`Random ${label}?`} value={alter[`Random${suffix}`]} />
        </React.Fragment>
    );
}

export default function DamageAlter({type, alter, lc, blastRadius, melee, ruleset}) {
    let blastRadiusObj = {};
    if(!alter?.FixRadius) {
        if(blastRadius !== undefined){
            blastRadiusObj.FixRadius = blastRadius;
        }
        if(blastRadius === 0) {
            blastRadiusObj.RadiusEffectiveness = 0;
            blastRadiusObj.IgnoreDirection = null;
        }
    }
    const mergedAlter = {...defaultProps[type], ...alter, ...blastRadiusObj};
    return mergedAlter ? (
        <React.Fragment>
            <SimpleValue label="Random Type" value={mergedAlter.RandomType}>
                { x => getRandomType(ruleset, x) }
            </SimpleValue>
            {!melee && <SimpleValue label="Blast Radius" value={mergedAlter.FixRadius}>
                { x => x === -1 ? "Dynamic" : `${x} Tiles` }
            </SimpleValue>}
            <BooleanValue label="Use Fire Radius?" value={mergedAlter.FireBlastCalc} />
            {!melee && <BooleanValue label="Ignore Direction?" value={mergedAlter.IgnoreDirection} />}
            <BooleanValue label="Ignore Self Destruct?" value={mergedAlter.IgnoreSelfDestruct} />
            <BooleanValue label="Ignore Stun Immunity?" value={mergedAlter.IgnorePainImmunity} />
            <BooleanValue label="Ignore Overkill?" value={mergedAlter.IgnoreOverKill}/>
            <SimpleValue label="Armor Effectivenesss" value={mergedAlter.ArmorEffectiveness} showZero/>
            {!melee && <SimpleValue label="Radius Effectiveness" value={mergedAlter.RadiusEffectiveness} />}
            {!melee &&<SimpleValue label="Radius Reduction" value={mergedAlter.RadiusReduction} />}
            <SimpleValue label="Fire Threshold" value={mergedAlter.FireThreshold} showZero/>
            <SimpleValue label="Smoke Threshold" value={mergedAlter.SmokeThreshold} showZero/>
            <SimpleValue label="Armor Degradation (Raw Damage)" value={mergedAlter.ToArmorPre} />
            <BooleanValue label="Random Armor Degradation?" value={mergedAlter.RandomArmorPre} />
            <SimpleValue label="Armor Degradation (Penetrating)" value={mergedAlter.ToArmor} showZero/>
            <BooleanValue label="Random Penetrating Degradation?" value={mergedAlter.RandomArmor} />
            <AlterEntry alter={mergedAlter} label={lc("STR_HEALTH")} suffix="Health"/>
            <AlterEntry alter={mergedAlter} label={lc("STR_STUN")} suffix="Stun"/>
            <AlterEntry alter={mergedAlter} label={lc("STR_FATAL_WOUNDS")} suffix="Wound"/>
            <AlterEntry alter={mergedAlter} label={lc("STR_TIME_UNITS")} suffix="Time"/>
            <AlterEntry alter={mergedAlter} label={lc("STR_ENERGY")} suffix="Energy"/>
            <AlterEntry alter={mergedAlter} label={lc("STR_MORALE")} suffix="Morale"/>
            <AlterEntry alter={mergedAlter} label={lc("STR_MANA_POOL")} suffix="Mana"/>
            <AlterEntry alter={mergedAlter} label={lc("STR_LIST_ITEM")} suffix="Item"/>
            <AlterEntry alter={mergedAlter} label="Tile" suffix="Tile"/>
        </React.Fragment>
    ) : null;
}