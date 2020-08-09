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

function AlterEntry({ alter, suffix, label }) {
    return (
        <React.Fragment>
            <SimpleValue label={`${label} Damage`} value={alter[`To${suffix}`]}>{ Percent }</SimpleValue>
            <BooleanValue label={`Random ${label}?`} value={alter[`Random${suffix}`]} />
        </React.Fragment>
    );
}

export default function DamageAlter({alter, lc}) {
    return (
        <React.Fragment>
            <SimpleValue label="Random Type" value={alter.RandomType}>
                { x => randomType[x]}
            </SimpleValue>
            <SimpleValue label="Blast Radius Type" value={alter.FixRadius}>
                { x => x === -1 ? "Dynamic" : `${x} Tiles` }
            </SimpleValue>
            <BooleanValue label="Use Fire Radius?" value={alter.FireBlastCalc} />
            <BooleanValue label="Ignore Direction?" value={alter.IgnoreDirection} />
            <BooleanValue label="Ignore Self Destruct?" value={alter.IgnoreSelfDestruct} />
            <BooleanValue label="Ignore Stun Immunity?" value={alter.IgnorePainImmunity} />
            <BooleanValue label="Ignore Overkill?" value={alter.IgnoreOverKill} />
            <SimpleValue label="Armor Effectivenesss" value={alter.ArmorEffectiveness} />
            <SimpleValue label="Radius Effectiveness" value={alter.RadiusEffectiveness} />
            <SimpleValue label="Radius Reduction" value={alter.RadiusReduction} />
            <SimpleValue label="Fire Threshold" value={alter.FireThreshold} />
            <SimpleValue label="Smoke Threshold" value={alter.SmokeThreshold} />
            <SimpleValue label="Armor Degradation (Raw Damage)" value={alter.ToArmorPre} />
            <BooleanValue label="Random Armor Degradation?" value={alter.RandomArmorPre} />
            <SimpleValue label="Armor Degradation (Penetrating)" value={alter.ToArmor} />
            <BooleanValue label="Random Penetrating Degradation?" value={alter.RandomArmor} />
            <AlterEntry alter={alter} label={lc("STR_HEALTH")} suffix="Health"/>
            <AlterEntry alter={alter} label={lc("STR_STUN")} suffix="Stun"/>
            <AlterEntry alter={alter} label={lc("STR_FATAL_WOUNDS")} suffix="Wound"/>
            <AlterEntry alter={alter} label={lc("STR_TIME_UNITS")} suffix="Time"/>
            <AlterEntry alter={alter} label={lc("STR_ENERGY")} suffix="Energy"/>
            <AlterEntry alter={alter} label={lc("STR_MANA_POOL")} suffix="Mana"/>
            <AlterEntry alter={alter} label={lc("STR_LIST_ITEM")} suffix="Item"/>
            <AlterEntry alter={alter} label="Tile" suffix="Tile"/>
        </React.Fragment>
    );
}