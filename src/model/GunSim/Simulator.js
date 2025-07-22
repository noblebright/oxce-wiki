import { getMultiplier } from "./Multipliers.js";
import { mergeStats } from "./utils.js";
import { unitWidths, ShotType } from "../Constants.js";

function getAccuracy(
  ruleset,
  stats,
  weapon,
  shotType,
  kneeling,
  oneHanded,
  distance
) {
  let acc = weapon[`accuracy${shotType}`];
  let modifier = 0.0;
  let upperLimit;
  let lowerLimit = weapon.minRange ?? 0;

  switch (shotType) {
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
  if (distance < lowerLimit) {
    modifier = dropoff * (lowerLimit - distance);
  } else if (upperLimit < distance) {
    modifier = dropoff * (distance - upperLimit);
  }

  acc = Math.max(0, acc - modifier);

  if (weapon.accuracyMultiplier) {
    acc *= getMultiplier(weapon.accuracyMultiplier, stats) / 100;
  } else {
    acc *= stats.firing / 100;
  }
  if (kneeling) {
    acc *=
      (weapon.kneelBonus ?? ruleset.globalVars.kneelBonusGlobal ?? 115) / 100;
  }
  if (oneHanded && weapon.twoHanded) {
    acc *=
      (weapon.oneHandedPenalty ??
        ruleset.globalVars.oneHandedPenaltyGlobal ??
        80) / 100;
  }

  //cap accuracy at 109 since that's the max the game supports
  return Math.min(Math.floor(acc), 109);
}

function getShots(weapon, ammo, mode) {
  let shots = 1;
  if (mode === "Auto") {
    if (weapon.autoShots && !weapon.confAuto) {
      shots = weapon.autoShots;
    } else if (weapon.confAuto) {
      shots = weapon.confAuto.shots;
    } else {
      shots = 3;
    }
  } else if (weapon[`conf${mode}`]) {
    shots = weapon[`conf${mode}`].shots;
  }

  return shots;
}

export function getShotgunMultipler(
  ruleset,
  state,
  weaponKey = "weapon",
  ammoKey = "ammo"
) {
  const entries = ruleset.entries;
  const weapon = entries[state[weaponKey]].items;
  const ammo = entries[state[ammoKey]]?.items;

  let pellets = 1;
  let shotgunSpread = 100;
  let shotgunChoke = 100;

  if (weapon.shotgunPellets) {
    pellets = weapon.shotgunPellets;
    if (weapon.shotgunChoke !== undefined) {
      shotgunChoke = weapon.shotgunChoke;
    }
  }
  if (ammo?.shotgunPellets) {
    pellets = ammo.shotgunPellets;
    if (ammo.shotgunSpread !== undefined) {
      shotgunSpread = ammo.shotgunSpread;
    }
  }

  // FIXME: Handle shotgunBehavior:false mode
  // We approximate pellets as the expected value of shotgunSpread in shots.
  // According to: https://openxcom.org/forum/index.php/topic,4834.0.html
  // shotgunSpread:  Defined on an ammunition type as a number between 0 and 100 with a default value of 100.
  // With shotgunBehavior: true, this is approximatley the percent of pellets after the first that will hit
  // the same tile/target as the first at the maximum accurate range."
  const multiplier =
    1 +
    Math.max(
      // pellets beyond the first * (100 - spread) * choke%
      (pellets - 1) * (100 - shotgunSpread) * 0.01 * shotgunChoke * 0.01,
      0
    );
  console.log(
    `1 + Math.max((${pellets} - 1) * (100 - ${shotgunSpread}) * 0.01 * ${shotgunChoke} * 0.01, 0) = ${multiplier}`
  );
  return multiplier;
}

export function computeAccuracyInputs(
  ruleset,
  shotType,
  distance,
  state,
  weaponKey = "weapon",
  ammoKey = "ammo"
) {
  const { stat, soldier, armor, target, kneeling, oneHanded } = state;
  const entries = ruleset.entries;
  const weaponEntry = entries[state[weaponKey]].items;
  const targetEntry = entries[target].units;
  const soldierEntry = entries[soldier].soldiers ?? entries[soldier].units;
  const armorEntry = entries[armor].armors;
  const ammoEntry = entries[state[ammoKey]]?.items;
  const soldierStats = soldierEntry[stat] ?? soldierEntry["stats"];
  const adjustedStats = mergeStats(soldierStats, armorEntry.stats);
  const acc = getAccuracy(
    ruleset,
    adjustedStats,
    weaponEntry,
    shotType,
    kneeling,
    oneHanded,
    distance
  );
  const shots = getShots(weaponEntry, ammoEntry, shotType);

  const targetArmor = entries[targetEntry.armor].armors;
  const targetHeight = targetEntry.standHeight;
  const targetWidth = unitWidths[targetArmor.loftempsSet[0]] ?? 7; //weird-shaped units we assume are 7 voxels wide (human)

  return [shots, targetWidth, targetHeight, acc, distance];
}
