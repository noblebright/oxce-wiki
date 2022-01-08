import { getAverageDamage } from "./DamageSimulator";
import { unitWidths, ShotType } from "../Constants";
import { computeAccuracyInputs } from "./Simulator";
import { mergeStats } from "./utils";

const iterations = 100000;

function hasCost(value, suffix) {
    const costObj = value[`cost${suffix}`];
    const tu = value[`tu${suffix}`];

    return (costObj && costObj.time) || tu;
}

const actionTypes = Object.values(ShotType);

function getShotTypes(weapon, ammo) {
    if(!ammo || !weapon.ammo) { // ie, vanilla-style compatibleAmmo
        return actionTypes.filter(type => hasCost(weapon, type));
    } else {
        const validAmmoSlots = new Set();
        Object.entries(weapon.ammo).forEach(([key, value]) => {
            if(value.compatibleAmmo.includes(ammo.type)) {
                validAmmoSlots.add(key);
            }
        });
        return actionTypes.filter((type, idx) => {
            if(!hasCost(weapon, type)) {
                return false;
            }
            return validAmmoSlots.has(`${weapon[`conf${type}`].ammoSlot}`);
        });
    }    
}

function getShotsPerTurn(ruleset, state, key = "weapon") {
    const {soldier, armor, stat} = state;
    const entries = ruleset.entries;
    const weaponEntry = entries[state[key]].items;
    const soldierEntry = entries[soldier].soldiers;
    const armorEntry = entries[armor].armors;
    const soldierStats = soldierEntry[stat];
    const adjustedStats = mergeStats(soldierStats, armorEntry.stats);
    const tu = adjustedStats.tu;
    const result = {};

    actionTypes.forEach(type => {
        const tuCost = hasCost(weaponEntry, type);
        const flatCost = weaponEntry.flatRate || weaponEntry[`flat${type}`]?.time;
        if(tuCost) {
            result[type] = flatCost ? Math.floor(tu / tuCost) : Math.floor(100 / tuCost);
        }
    });
    return result;
}

let accuracyData;

export function loadAccuracyData() {
    return fetch("/accuracyLookup.dat")
            .then(response => response.arrayBuffer())
            .then(buffer => { accuracyData = new Uint16Array(buffer)});
}

const widthOffsets = Object.values(unitWidths).reduce((acc, width, idx) => {
    acc[width] = idx;
    return acc;
}, {});

function lookupAcc(accuracyData, targetWidth, targetHeight, acc, distance, shots) {
    const offset =  widthOffsets[targetWidth] * 132000 +
                    (targetHeight - 1) * 5500 +
                    acc * 50 +
                    (distance - 1);

    return accuracyData[offset] * shots  * 100 /  65535;
}

export function getChartData(ruleset, state) {
    const avgDamage = getAverageDamage(ruleset, iterations, state);
    let compareAvgDamage;
    if(state.compare) {
        compareAvgDamage = getAverageDamage(ruleset, iterations, state, "compareWeapon", "compareAmmo");
    }
    const weaponEntry = ruleset.entries[state.weapon].items;
    const ammoEntry = ruleset.entries[state.ammo]?.items;
    const compareWeaponEntry = ruleset.entries[state.compareWeapon].items;
    const compareAmmoEntry = ruleset.entries[state.compareAmmo].items;
    const shotTypes = getShotTypes(weaponEntry, ammoEntry);
    const compareShotTypes = getShotTypes(compareWeaponEntry, compareAmmoEntry);
    const shotsPerTurnByType = getShotsPerTurn(ruleset, state);
    const compareShotsPerTurnByType = getShotsPerTurn(ruleset, state, "compareWeapon");
    const data = [];

    for(let distance = 1; distance <= 50; distance++) {
        const dataPoint = { distance };
        for(let shotType of shotTypes) {
            const accuracyInputs = computeAccuracyInputs(ruleset, shotType, distance, state);
            const hitRatio = lookupAcc(accuracyData, ...accuracyInputs);
            const shotsPerTurn = shotsPerTurnByType[shotType];
            dataPoint[`${shotType}HitRatio`] = hitRatio;
            dataPoint[`${shotType}Damage`] = avgDamage * hitRatio / 100 * shotsPerTurn;
        }
        if(state.compare) {
            for(let shotType of compareShotTypes) {
                const accuracyInputs = computeAccuracyInputs(ruleset, shotType, distance, state, "compareWeapon", "compareAmmo");
                const hitRatio = lookupAcc(accuracyData, ...accuracyInputs);
                const shotsPerTurn = compareShotsPerTurnByType[shotType];
                dataPoint[`Compare${shotType}HitRatio`] = hitRatio;
                dataPoint[`Compare${shotType}Damage`] = compareAvgDamage * hitRatio / 100 * shotsPerTurn;
            }
        }
        data.push(dataPoint);
    }
    return Promise.resolve(data);
}