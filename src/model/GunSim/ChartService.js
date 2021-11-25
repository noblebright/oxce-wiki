import { getAverageDamage } from "./DamageSimulator";
import { ShotType } from "../Constants";
import { computeAccuracyInputs } from "./Simulator";
import simulateAcc from "./AccuracySimulator";
import { mergeStats } from "./utils";

const iterations = 10000;

export function hasCost(value, suffix) {
    const costObj = value[`cost${suffix}`];
    const tu = value[`tu${suffix}`];

    return (costObj && costObj.time) || tu;
}

const actionTypes = Object.values(ShotType);

function getShotTypes(weapon, ammo) {
    if(!ammo || !weapon.ammo) { // ie, vanilla-style compatibleAmmo
        return actionTypes.filter(type => hasCost(weapon, type));
    } else {
        return actionTypes.filter((type, idx) => hasCost(weapon, type) && weapon.ammo[idx].compatibleAmmo?.includes(ammo.type));
    }
    
}

function getShotsPerTurn(ruleset, {soldier, weapon, armor, stat}) {
    const entries = ruleset.entries;
    const weaponEntry = entries[weapon].items;
    const soldierEntry = entries[soldier].soldiers;
    const armorEntry = entries[armor].armors;
    const soldierStats = soldierEntry[stat];
    const adjustedStats = mergeStats(soldierStats, armorEntry.stats);
    const tu = adjustedStats.tu;
    const result = {};

    actionTypes.forEach(type => {
        if(weaponEntry[`cost${type}`]) {
            result[type] = weaponEntry.flatRate ? Math.floor(tu / weaponEntry[`cost${type}`].time) : Math.floor(100 / weaponEntry[`cost${type}`].time);
        } else {
            result[type] = weaponEntry.flatRate ? Math.floor(tu / weaponEntry[`tu${type}`]) : Math.floor(100 /weaponEntry[`tu${type}`]);
        }
    });
    console.log("shots per turn", result);
    return result;
}

function getCancellableDataset(data, fn) {
    let cancelled = false;
    let res, rej;
    let current = 0;
    const p = new Promise((resolve, reject) => {
        res = resolve;
        rej = reject;
    });
    const result = [];
    function iterate() {
        if(cancelled) {
            rej();
            return;
        }
        fn(data[current]).then(val => {
            result.push(val);
            current++;
            if(current >= data.length) {
                res(result);
            } else {
                iterate();
            }
        });
    }
    iterate();
    return { p, abort: () => cancelled = true };
}

export default function getChartData(ruleset, state, updateProgress, updateMaxProgress) {
    const avgDamage = getAverageDamage(ruleset, iterations, state);
    const weaponEntry = ruleset.entries[state.weapon].items;
    const ammoEntry = ruleset.entries[state.ammo].items;
    const shotTypes = getShotTypes(weaponEntry, ammoEntry);
    const shotsPerTurnByType = getShotsPerTurn(ruleset, state);
    const data = [];

    updateMaxProgress(50 * shotTypes.length);

    for(let i = 1; i <= 50; i++) {
        data.push(i);
    }

    return getCancellableDataset(data, async distance => {
        updateProgress(distance);
        const dataPoint = { distance };
        for(let shotType of shotTypes) {
            const accuracyInputs = computeAccuracyInputs(ruleset, shotType, iterations, distance, state);
            const hitRatio = await Promise.resolve(simulateAcc(...accuracyInputs));
            const shotsPerTurn = shotsPerTurnByType[shotType];
            dataPoint[`${shotType}HitRatio`] = hitRatio;
            dataPoint[`${shotType}Damage`] = avgDamage * hitRatio / 100 * shotsPerTurn;
        }
        return dataPoint;
    });
}