import { getMultiplier } from "./Multipliers";
import { mergeStats } from "./utils";
import { defaultDTProps } from "../Constants";

const randomTypeHisto = [
    null,
    [0, 200],
    [50, 150],
    [100, 100],
    ruleset => ruleset.fireDamageRange || [5, 10],
    [0,0],
    () => (power, resist, armor) => {
        // 0-100 * 2
        let sum = 0;
        for(let i = 0; i <= 100; i++) { //0-1
            const penetratingDamage = Math.floor(((power * i / 100) * resist) - armor);
            // distribution: 1,2,3,...,100, 101, 100,
            // sum of 1-100 = 5050
            // so, 1-100 * 2 + 101 = 10201
            sum += Math.max(0, penetratingDamage * (i + 1) / 10201); // 0 = 1/10201 -> 100 = 101/10201
        }
        for(let i = 101; i <= 200; i++) {
            const penetratingDamage = Math.floor(((power * i / 100) * resist) - armor);
            sum += Math.max(0, penetratingDamage * (201 - i) / 10201); // 101 = 100/10201 -> 200 = 1/10201             
        }
        return sum;
    },
    [50, 200],
    ruleset => {
        const damageRange = ruleset.globalVars.damageRange ?? 100;
        return [100 - damageRange, 100 + damageRange];
    },
    ruleset => {
        const damageRange = ruleset.globalVars.explosiveDamageRange ?? 50;
        return [100 - damageRange, 100 + damageRange];
    }
];

function getDamageHistogram(ruleset, randomType, effectivePower, resist, effectiveArmor) {
    const range = typeof randomTypeHisto[randomType] === "function" ? randomTypeHisto[randomType](ruleset) : randomTypeHisto[randomType];
    if(typeof range === "function") { //0-100 * 2
        return range(effectivePower, resist, effectiveArmor);
    }
    const histoLength = range[1] - range[0] + 1;
    let sum = 0;
    for(let i = 0; i < histoLength; i++) {
        const penetratingDamage = Math.floor(((effectivePower * (i + range[0]) / 100) * resist) - effectiveArmor);
        sum += Math.max(0, penetratingDamage);
    }
    return sum / histoLength;
}

function getExpectedDamage(ruleset, randomType, power, multipliers, stats, armorRating, armorPen, resist) {
    const effectivePower = power + getMultiplier(multipliers, stats);
    const effectiveArmor = Math.floor(armorRating * armorPen);

    return getDamageHistogram(ruleset, randomType, effectivePower, resist, effectiveArmor);
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
const getToHealth = getDamageAlter("ToHealth", 1);
const getRandomHealth = getDamageAlter("RandomHealth", false);
const getRandomStun = getDamageAlter("RandomStun", true);
const getToStun = getDamageAlter("ToHealth", 0.25);
const getIgnorePainImmunity = getDamageAlter("IgnorePainImmunity", false);
const getIgnoreDirection = getDamageAlter("IgnoreDirection", false);

function getTargetStats(entries, damageType, targetEntry, direction, explosive) {
    const targetArmor = entries[targetEntry.armor].armors;
    const resist = targetArmor.damageModifier[damageType] ?? 1;
    const painImmune = targetArmor.painImmune ?? targetArmor.size === 2;
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
    return { armorRating, painImmune, resist };
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

export function getAverageDamage(ruleset, state, weaponKey = "weapon", ammoKey = "ammo", powerModifier = 0) {
    const entries = ruleset.entries;
    const {stat, soldier, armor, target, direction} = state;
    const weaponEntry = entries[state[weaponKey]].items;  
    const targetEntry = entries[target].units;  //needed for armor info
    const soldierEntry = entries[soldier].soldiers;  //needed for stats
    const armorEntry = entries[armor].armors; //needed for stats
    const ammoEntry = entries[state[ammoKey]]?.items ?? {};

    const soldierStats = soldierEntry[stat];
    const adjustedStats = mergeStats(soldierStats, armorEntry.stats);
    const randomType = getRandomType(weaponEntry, ammoEntry);
    const power = getBasePower(weaponEntry, ammoEntry) + powerModifier;
    const multipliers = getMultipliers(weaponEntry, ammoEntry);
    const armorPen = getArmorPen(weaponEntry, ammoEntry);
    const damageType = getDamageType(weaponEntry, ammoEntry);
    const isExplosive = getExplosive(weaponEntry, ammoEntry);
    const ignoreDirection = getIgnoreDirection(weaponEntry, ammoEntry);
    const ignorePainImmunity = getIgnorePainImmunity(weaponEntry, ammoEntry);
    const randomHealthFactor = getRandomHealth(weaponEntry, ammoEntry) ? .5 : 1; // RandomX is uniform 1-N distribution
    const randomStunFactor = getRandomStun(weaponEntry, ammoEntry) ? .5 : 1;     // Average distribution is n / 2

    // IgnoreDirection defaults to front armor
    const { armorRating, painImmune, resist } = getTargetStats(entries, damageType, targetEntry, ignoreDirection ? "front" : direction, isExplosive);
    const penetratingDamageMultiplier = getToHealth(weaponEntry, ammoEntry) * randomHealthFactor + 
                                        getToStun(weaponEntry, ammoEntry) * ((ignorePainImmunity || !painImmune) ? 1 : 0) * randomStunFactor;

    return getExpectedDamage(ruleset, randomType, power, multipliers, adjustedStats, armorRating, armorPen, resist) * penetratingDamageMultiplier;
}
