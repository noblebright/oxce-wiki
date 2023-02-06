import { getMultiplier } from "./Multipliers.js";
import { mergeStats } from "./utils.js";
import { unitWidths, ShotType } from "../Constants.js";

function getAccuracy(ruleset, stats, weapon, shotType, kneeling, oneHanded, distance) {
    let acc = weapon[`accuracy${shotType}`];
    let modifier = 0.0;
    let upperLimit;
	let lowerLimit = weapon.minRange ?? 0;

	switch(shotType) {
	case ShotType.Aimed:
		upperLimit = weapon.aimRange ?? 200;
		break;
	case ShotType.Snap:
		upperLimit = weapon.snapRange ?? 15;
		break;
	case ShotType.Auto:
			upperLimit = weapon.autoRange ?? 7;
		break;
	default:
	}
    
    const dropoff = weapon.dropoff ?? 2;
	if(distance < lowerLimit) {
		modifier = (dropoff * (lowerLimit - distance));
	} else if (upperLimit < distance) {
		modifier = (dropoff * (distance - upperLimit));
	}

	acc = Math.max(0, acc - modifier);

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

    //cap accuracy at 109 since that's the max the game supports
    return Math.min(Math.floor(acc), 109);
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

export function computeAccuracyInputs(ruleset, shotType, distance, state, weaponKey = "weapon", ammoKey = "ammo") {
    const {stat, soldier, armor, target, kneeling, oneHanded} = state;
    const entries = ruleset.entries;
    const weaponEntry = entries[state[weaponKey]].items;
    const targetEntry = entries[target].units;
    const soldierEntry = entries[soldier].soldiers;
    const armorEntry = entries[armor].armors;
    const ammoEntry = entries[state[ammoKey]]?.items;
    const soldierStats = soldierEntry[stat];
    const adjustedStats = mergeStats(soldierStats, armorEntry.stats);
    const acc = getAccuracy(ruleset, adjustedStats, weaponEntry, shotType, kneeling, oneHanded, distance);
    const shots = getShots(weaponEntry, ammoEntry, shotType);
    
    const targetArmor = entries[targetEntry.armor].armors;
    const targetHeight = targetEntry.standHeight;
    const targetWidth = unitWidths[targetArmor.loftempsSet[0]] ?? 7; //weird-shaped units we assume are 7 voxels wide (human)

    return [targetWidth, targetHeight, acc, distance, shots];
}