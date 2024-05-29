import { getMultiplier } from "./Multipliers.js";
import { mergeStats } from "./utils.js";
import { defaultDTProps } from "../Constants.js";

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

function getPowerRangeObj(weapon, ammo) {
    if(ammo?.powerRangeThreshold) return ammo;
    if(weapon.powerRangeThreshold) return weapon;
    return null;
}

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

class DamageSimulator {
    constructor(ruleset, state, weaponKey = "weapon", ammoKey = "ammo") {
        this.ruleset = ruleset;
        this.state = state;
        this.weaponEntry = ruleset.entries[state[weaponKey]].items;
        this.ammoEntry = ruleset.entries[state[ammoKey]]?.items;
        this.powerRangeObj = getPowerRangeObj(this.weaponEntry, this.ammoEntry);
        this.basicDamage = this.#getAverageDamage(); // damage without distance dropoff.
    }

    #getDamageHistogram(randomType, effectivePower, resist, effectiveArmor) {
        const range = typeof randomTypeHisto[randomType] === "function" ? randomTypeHisto[randomType](this.ruleset) : randomTypeHisto[randomType];
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

    #getDamageAlter(key, defaultValue) {
        const ammo = this.ammoEntry ?? {};
        const weapon = this.weaponEntry;
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
    
    #getExplosive() {
        const weapon = this.weaponEntry;
        const ammo = this.ammoEntry ?? {};
        const fixRadius = this.#getDamageAlter("FixRadius", undefined);
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

    #getAverageDamage(powerModifier = 0) {
        const entries = this.ruleset.entries;
        const {stat, soldier, armor, target, direction} = this.state;
        const targetEntry = entries[target].units;  //needed for armor info
        const soldierEntry = entries[soldier].soldiers ?? entries[soldier].units;  //needed for stats
        const armorEntry = entries[armor].armors; //needed for stats
        const soldierStats = soldierEntry[stat] ?? soldierEntry["stats"];
        const adjustedStats = mergeStats(soldierStats, armorEntry.stats);
        const randomType = this.#getDamageAlter("RandomType", 8);
        const power = getBasePower(this.weaponEntry, this.ammoEntry ?? {}) + powerModifier;
        const multipliers = getMultipliers(this.weaponEntry, this.ammoEntry ?? {});
        const armorPen = this.#getDamageAlter("ArmorEffectiveness", 1);
        const damageType = this.#getDamageAlter("ResistType", 1);
        const isExplosive = this.#getExplosive();
        const ignoreDirection = this.#getDamageAlter("IgnoreDirection", false);
        const ignorePainImmunity = this.#getDamageAlter("IgnorePainImmunity", false);
        const randomHealthFactor = this.#getDamageAlter("RandomHealth", false) ? .5 : 1; // RandomX is uniform 1-N distribution
        const randomStunFactor = this.#getDamageAlter("RandomStun", true) ? .5 : 1;     // Average distribution is n / 2
    
        // IgnoreDirection defaults to front armor
        const { armorRating, painImmune, resist } = getTargetStats(entries, damageType, targetEntry, ignoreDirection ? "front" : direction, isExplosive);
        const penetratingDamageMultiplier = this.#getDamageAlter("ToHealth", 1) * randomHealthFactor + 
                                            this.#getDamageAlter("ToStun", 0.25) * ((ignorePainImmunity || !painImmune) ? 1 : 0) * randomStunFactor;
    
        const effectivePower = power + getMultiplier(multipliers, adjustedStats);
        const effectiveArmor = Math.floor(armorRating * armorPen);

        //expose this for TTK computation, we can throw it into average, since this stuff doesn't change.
        const targetHealth = targetEntry.stats.health + (armorEntry.stats?.health ?? 0);
        const range = typeof randomTypeHisto[randomType] === "function" ? randomTypeHisto[randomType](this.ruleset) : randomTypeHisto[randomType];

        const randomBounds = typeof range === "function" ? [2, 1, 100] : [1, ...range];
        this.TTKParams = [targetHealth, effectiveArmor, ...randomBounds, penetratingDamageMultiplier];
        this.TTKPower = effectivePower * resist;
        
        return this.#getDamageHistogram(randomType, effectivePower, resist, effectiveArmor) * penetratingDamageMultiplier;
    }

    getRangeModifiedDamage(distance, powerModifier = 0) {
        if(!this.powerRangeObj) return this.basicDamage;
        const modifiedDistance = distance - this.powerRangeObj.powerRangeThreshold;
        if(modifiedDistance <= 0) return this.basicDamage;
        const distanceModifier = -modifiedDistance * this.powerRangeObj.powerRangeReduction;
        return this.#getAverageDamage(distanceModifier + powerModifier);
    }
    
    getTTKPower(distance) {
        let power = this.TTKPower;
        if(this.powerRangeObj) {
            const modifiedDistance = distance - this.powerRangeObj.powerRangeThreshold;
            if(modifiedDistance > 0) {
                const distanceModifier = -modifiedDistance * this.powerRangeObj.powerRangeReduction;
                power = this.TTKPower + distanceModifier;
            }
        }
        return Math.floor(power);
    }
}

export default DamageSimulator;