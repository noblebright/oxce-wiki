import React from "react";

const costKeys = [["time", "STR_TIME_UNITS"], ["energy", "STR_ENERGY"], ["morale", "STR_MORALE"], ["health", "STR_HEALTH",], ["mana", "mana"], ["stun", "STR_DAMAGE_STUN"]];
export const Cost = ({ cost, flat = {}, locale }) => {
    const ary = costKeys.map(([key, label]) => (cost[key] ? `${getLabel(label, locale)}: ${cost[key]}${!flat[key] ? "%" : ""}`: null)).filter(x => x);
    return (<span>{ary.join(", ")}</span>);
}

const damageKeys = [
    "STR_DAMAGE_UC", "STR_DAMAGE_ARMOR_PIERCING", "STR_DAMAGE_INCENDIARY", "STR_DAMAGE_HIGH_EXPLOSIVE", "STR_DAMAGE_LASER_BEAM",
    "STR_DAMAGE_PLASMA_BEAM", "STR_DAMAGE_STUN", "STR_DAMAGE_MELEE", "STR_DAMAGE_ACID", "STR_DAMAGE_SMOKE",
    "STR_DAMAGE_10", "STR_DAMAGE_11", "STR_DAMAGE_12", "STR_DAMAGE_13", "STR_DAMAGE_14",
    "STR_DAMAGE_15", "STR_DAMAGE_16", "STR_DAMAGE_17", "STR_DAMAGE_18", "STR_DAMAGE_19"
];

function getDamageLabel(type, locale) {
    return getLabel(damageKeys[type], locale);
}

export function Damage({item, secondaryMelee = false, locale}) {
    const dKey = secondaryMelee ? "melee" : "damage";
    const alterKey = `${dKey}Alter`;
    const profile = {};
    profile.damageType = secondaryMelee ? item.meleeType : item.damageType;
    profile.blastRadius = item.blastRadius;
    profile.power = (secondaryMelee ? item.meleePower : item.power) || 0;
    profile.shotgunPellets = item.shotgunPellets;
    if(item.strengthApplied) {
        profile.damageBonus = { strength: 1.0 };
    }
    // TODO: Figure out alterDamage
    // if(item[alterKey]) {

    // }
    return <span>{profile.power}{profile.shotgunPellets ? `x${profile.shotgunPellets}` : null} {getDamageLabel(profile.damageType, locale)}</span>;
}