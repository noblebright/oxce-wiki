import { Weapon, Target, VOXEL_PER_TILE } from "./AccuracySimulator";
import { getMultiplier } from "./Multipliers";
import { mergeStats } from "./utils";
import { unitWidths } from "../Constants";

function getTarget(entries, source, targetEntry, distance) {
    const targetHeight = targetEntry.standHeight;
    const targetArmor = entries[targetEntry.armor].armors;
    const targetWidth = unitWidths[targetArmor.loftempsSet[0]] ?? 7; //weird-shaped units we assume are 7 voxels wide (human)
    return new Target(160, source.y + (distance * VOXEL_PER_TILE), 160, targetWidth, targetHeight);
}

function getWeapon(weaponEntry) {
    return new Weapon(weaponEntry.aimRange ?? 200, 
        weaponEntry.minRange ?? 0, 
        weaponEntry.autoRange ?? 7, 
        weaponEntry.snapRange ?? 15, 
        weaponEntry.dropoff, 
        0/* dmg never used*/ );
}

function getAccuracy(ruleset, stats, weapon, mode, kneeling, oneHanded) {
    let acc = weapon[`accuracy${mode}`];
    if(weapon.accuracyMultiplier) {
        acc *= getMultiplier(weapon.accuracyMultiplier, stats) / 100;
    } else {
        acc *= stats.firing / 100;
    }
    if(kneeling) {
        acc *= (weapon.kneelBonus ?? ruleset.globalVars.kneelBonusGlobal ?? 115) / 100;
    }
    if(oneHanded && weapon.twoHanded) {
        acc *= (weapon.oneHandedPenalty ?? ruleset.globalVars.oneHandedPenaltyGlobal ?? 80) / 100;
    }
    return acc / 100;
}

function getShots(weapon, ammo, mode) {
    let shots = 1;
    if(mode === "Auto") {
        if(weapon.autoShots && !weapon.confAuto) {
            shots = weapon.autoShots;
        } else if(weapon.confAuto) {
            shots = weapon.confAuto.shots;
        } else {
            shots = 3;
        }
    } else if(weapon[`conf${mode}`]) {
        shots = weapon[`conf${mode}`].shots
    }

    let pellets = 1;
    let shotgunSpread = 100;
    if(weapon.shotgunPellets) {
        pellets = weapon.shotgunPellets;
        shotgunSpread = weapon.shotgunSpread;
    }
    if(ammo?.shotgunPellets) {
        pellets = ammo.shotgunPellets;
        shotgunSpread = ammo.shotgunSpread;
    }

    // FIXME: Handle shotgunBehavior and shotgunChoke
    // We approximate pellets as the expected value of shotgunSpread in shots.
    // According to: https://openxcom.org/forum/index.php/topic,4834.0.html
    // shotgunSpread:  Defined on an ammunition type as a number between 0 and 100 with a default value of 100.  
    // With shotgunBehavior: true, this is approximatley the percent of pellets after the first that will hit 
    // the same tile/target as the first at the maximum accurate range."
    return shots * Math.max(1, Math.ceil(pellets * shotgunSpread / 100));
}

// function simulateAcc(source, target, w, acc, simulations, shots, type) {

export function computeAccuracyInputs(ruleset, shotType, iterations, distance, state, weaponKey = "weapon", ammoKey = "ammo") {
    const {stat, soldier, armor, target, kneeling, oneHanded} = state;
    const entries = ruleset.entries;
    const source = { x: 160, y: 160, z: 160 };
    const weaponEntry = entries[state[weaponKey]].items;
    const targetEntry = entries[target].units;
    const soldierEntry = entries[soldier].soldiers;
    const armorEntry = entries[armor].armors;
    const ammoEntry = entries[state[ammoKey]]?.items;
    const soldierStats = soldierEntry[stat];
    const adjustedStats = mergeStats(soldierStats, armorEntry.stats);
    const acc = getAccuracy(ruleset, adjustedStats, weaponEntry, shotType, kneeling, oneHanded);
    const shots = getShots(weaponEntry, ammoEntry, shotType);
    const simulations = Math.ceil(iterations / shots);

    const targetObj = getTarget(entries, source, targetEntry, distance);
    const weaponObj = getWeapon(weaponEntry);

    return [source, targetObj, weaponObj, acc, simulations, shots, shotType];
}