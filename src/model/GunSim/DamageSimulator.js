import { getMultiplier } from "./Multipliers";
import { generate, mergeStats } from "./utils";
import { defaultDTProps } from "../Constants";

const randomTypes = [
    null,
    power => generate(200) / 100 * power,
    power => (generate(100) + 50) / 100 * power,
    power => power,
    (power, ruleset) => {
        const fireDamageRange = ruleset.fireDamageRange && [5, 10];
        const delta = fireDamageRange[1] - fireDamageRange[0]
        return generate(delta) + fireDamageRange[0] / 100 * power;
    },
    () => 0,
    power => (generate(100) + generate(100)) / 100 * power,
    power => (generate(150) + 50) / 100 * power,
    (power, ruleset) => {
        const damageRange = ruleset.globalVars.damageRange ?? 100;
        return (generate(damageRange * 2) + (100 - damageRange)) / 100 * power;
    },
    (power, ruleset) => {
        const damageRange = ruleset.globalVars.explosiveDamageRange ?? 50;
        return (generate(damageRange * 2) + (100 - damageRange)) / 100 * power;
    }
];

function getExpectedDamage(ruleset, randomType, power, multipliers, stats, armorRating, armorPen, resist) {
    const powerBonus = getMultiplier(multipliers, stats);

    const incomingDamage = randomTypes[randomType](power + powerBonus, ruleset);
    const resistedDamage = Math.floor(incomingDamage * resist);
    const effectiveArmor = Math.floor(armorRating * armorPen);
    return Math.max(0, resistedDamage - effectiveArmor); //can't take negative damage
}

const getDamageAlter = (key, defaultValue) => (weapon, ammo) => {
    switch(true) {
        case ammo.damageAlter?.[key] !== undefined && 
             ammo.damageAlter?.[key] !== 0: 
            return ammo.damageAlter[key];
        case weapon.damageAlter?.[key] !== undefined && 
             weapon.damageAlter?.[key] !== 0:
            return weapon.damageAlter[key];
        case ammo.damageType !== undefined && 
            defaultDTProps[ammo.damageType][key] !== undefined: 
            return defaultDTProps[ammo.damageType][key];
        case weapon.damageType !== undefined &&
            defaultDTProps[weapon.damageType][key] !== undefined: 
            return defaultDTProps[weapon.damageType][key];
        default:
            return defaultValue;
    }
}

const getRandomType = getDamageAlter("RandomType", 8);

function getBasePower(weapon, ammo) {
    return ammo.power !== undefined ? ammo.power : weapon.power;
}

function getMultipliers(weapon, ammo) {
    switch(true) {
        case ammo.damageBonus !== undefined: 
            return ammo.damageBonus;
        case ammo.strengthApplied: 
            return { strength: 1 };
        case weapon.damageBonus !== undefined: 
            return weapon.damageBonus;
        case weapon.strengthApplied: 
            return { strength: 1 };
        default: return {};
    }
}

const getArmorPen = getDamageAlter("ArmorEffectiveness", 1);
const getDamageType = getDamageAlter("ResistType", 1);

function getTargetStats(entries, damageType, targetEntry, direction, explosive) {
    const targetArmor = entries[targetEntry.armor].armors;
    const resist = targetArmor.damageModifier[damageType] ?? 1;
    let armorRating;
    if(!explosive) {
        switch(direction) {
            case "front":
                armorRating = targetArmor.frontArmor;
                break;
            case "rear":
                armorRating = targetArmor.rearArmor;
                break;
            case "right":
                armorRating = targetArmor.sideArmor;
                break;
            case "left":
                armorRating = targetArmor.sideArmor + (targetArmor.leftArmorDiff ?? 0);
                break;
            default:
        }    
    } else {
        armorRating = targetArmor.underArmor;
    }
    return { armorRating, resist };
}

const getFixRadius = getDamageAlter("FixRadius", undefined);

function getExplosive(weapon, ammo) {
    const fixRadius = getFixRadius(weapon, ammo);
    switch(true) {
        case fixRadius !== undefined: 
            return fixRadius !== 0;
        case ammo.blastRadius !== undefined: 
            return ammo.blastRadius !== 0;
        case weapon.blastRadius !== undefined: 
            return weapon.blastRadius !== 0;
        default:
            return false;
    }
}

export function getAverageDamage(ruleset, iterations, {stat, soldier, armor, weapon, ammo, target, direction}) {
    const entries = ruleset.entries;

    const weaponEntry = entries[weapon].items;  
    const targetEntry = entries[target].units;  //needed for armor info
    const soldierEntry = entries[soldier].soldiers;  //needed for stats
    const armorEntry = entries[armor].armors; //needed for stats
    const ammoEntry = entries[ammo]?.items;

    const soldierStats = soldierEntry[stat];
    const adjustedStats = mergeStats(soldierStats, armorEntry.stats);
    const randomType = getRandomType(weaponEntry, ammoEntry);
    const power = getBasePower(weaponEntry, ammoEntry);
    const multipliers = getMultipliers(weaponEntry, ammoEntry);
    const armorPen = getArmorPen(weaponEntry, ammoEntry);
    const damageType = getDamageType(weaponEntry, ammoEntry);
    const isExplosive = getExplosive(weaponEntry, ammoEntry);
    const { armorRating, resist } = getTargetStats(entries, damageType, targetEntry, direction, isExplosive);

    let totalDamage = 0;
    for(let i = 0; i < iterations; i++) {
        totalDamage += getExpectedDamage(ruleset, randomType, power, multipliers, adjustedStats, armorRating, armorPen, resist)
    }
    return Math.floor(totalDamage / iterations);
}