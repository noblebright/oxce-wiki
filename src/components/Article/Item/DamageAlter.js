import React from "react";

import { SimpleValue, BooleanValue, Percent } from "../../ComponentUtils";

const randomType = [
    "Default",
    "0 - 200%",
    "50 - 150%",
    "Flat Damage",
    "Fire Damage",
    "No Damage",
    "(0 - 100%) + (0 - 100%)",
    "50 - 200%"
];

const defaultProps = [
    {}, //none
    { IgnoreOverKill: true }, //ap
    { //fire
        FireBlastCalc: true,
        IgnoreOverKill: true,
        IgnoreSelfDestruct: true,
        IgnoreDirection: true,
        FixRadius: -1,
        RadiusEffectiveness: 0.03,
        ArmorEffectiveness: 0,
        FireThreshold: 0,
        ToHealth: 1,
    },
    { //he
        IgnoreOverKill: true,
        IgnoreSelfDestruct: true,
        FixRadius: -1,
        RadiusEffectiveness: 0.05,
        ToItem: 1
    },
    { IgnoreOverKill: true }, //laser
    { IgnoreOverKill: true }, //plasma
    { //stun
        IgnoreOverKill: true,
        IgnoreSelfDestruct: true,
        IgnoreDirection: true,
        FixRadius: -1,
        RadiusEffectiveness: 0.05,
        ToHealth: 0,
        ToStun: 1,
        RandomStun: false
    }, 
    { IgnoreOverKill: true, IgnoreSelfDestruct: true }, //melee
    { IgnoreOverKill: true }, //acid
    { //smoke
        IgnoreOverKill: true,
        IgnoreDirection: true,
        FixRadius: -1,
        RadiusEffectiveness: 0.05,
        ArmorEffectiveness: 0,
        SmokeThreshold: 0,
        ToHealth: 0,
        ToStun: 1
    },
    { IgnoreOverKill: true }, //10
    { IgnoreOverKill: true }, //11
    { IgnoreOverKill: true }, //12
    { IgnoreOverKill: true }, //13
    { IgnoreOverKill: true }, //14
    { IgnoreOverKill: true }, //15
    { IgnoreOverKill: true }, //16
    { IgnoreOverKill: true }, //17
    { IgnoreOverKill: true }, //18
    { IgnoreOverKill: true }, //19
];

function AlterEntry({ alter, suffix, label }) {
    return (
        <React.Fragment>
            <SimpleValue label={`${label} Damage`} value={alter[`To${suffix}`] * 100} showZero>{ Percent }</SimpleValue>
            <BooleanValue label={`Random ${label}?`} value={alter[`Random${suffix}`]} />
        </React.Fragment>
    );
}

export default function DamageAlter({type, alter, lc, blastRadius, melee}) {
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
                { x => randomType[x]}
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