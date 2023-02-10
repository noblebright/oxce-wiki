import DamageSimulator from "./DamageSimulator.js";
import { unitWidths, ShotType } from "../Constants.js";
import { computeAccuracyInputs } from "./Simulator.js";
import { mergeStats } from "./utils.js";

//symlink to raw wasm binding
import { instantiate } from "../wasmInterface.js";

function hasCost(value, suffix) {
    const costObj = value[`cost${suffix}`];
    const tu = value[`tu${suffix}`];

    return (costObj && costObj.time) || tu;
}

const actionTypes = Object.values(ShotType);

function getShotTypes(damageModel) {
    const weapon = damageModel.weaponEntry;
    const ammo = damageModel.ammoEntry;
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
            if(!weapon[`conf${type}`]) {
                return validAmmoSlots.has("0");
            }
            return validAmmoSlots.has(`${weapon[`conf${type}`].ammoSlot}`);
        });
    }    
}

function getAttemptsPerTurn(ruleset, state, key = "weapon") {
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
let getTTK;

async function loadWASM() {
    const stream = await fetch("/release.wasm");
    const wasm = await WebAssembly.compileStreaming(stream);
    return instantiate(wasm, {});
}

export function loadDependencies() {
    // load accuracy into buffer
    const accuracy = fetch("/accuracyLookup.dat")
            .then(response => response.arrayBuffer())
            .then(buffer => { accuracyData = new Uint16Array(buffer)});

    // load WASM code
    const wasm = loadWASM().then(iface => { getTTK = iface.getTTK; });

    // wait for both
    return Promise.all([accuracy, wasm]);
}

const widthOffsets = Object.values(unitWidths).reduce((acc, width, idx) => {
    acc[width] = idx;
    return acc;
}, {});

function lookupAcc(accuracyData, targetWidth, targetHeight, acc, distance) {
    const offset =  widthOffsets[targetWidth] * 132000 + // 50 * 110 * 24
                    (targetHeight - 1) * 5500 + //height 1-24
                    acc * 50 +      //acc 0-109
                    (distance - 1); //distance 1-50

    return accuracyData[offset] * 100 /  65535;
}

export function getChartData(ruleset, state) {
    const damageModel = new DamageSimulator(ruleset, state);
    const shotTypes = getShotTypes(damageModel);
    // attempt = 1 mouse click, vs shot = 1 bullet/pellet
    const attemptsPerTurnByType = getAttemptsPerTurn(ruleset, state);

    const compareDamageModel = state.compare && new DamageSimulator(ruleset, state, "compareWeapon", "compareAmmo");
    const compareShotTypes = state.compare && getShotTypes(compareDamageModel);
    const compareAttemptsPerTurnByType = state.compare && getAttemptsPerTurn(ruleset, state, "compareWeapon");

    const data = [];

    for(let distance = 1; distance <= 50; distance++) {
        const dataPoint = { distance };
        for(let shotType of shotTypes) {
            const accuracyParameters = computeAccuracyInputs(ruleset, shotType, distance, state);
            const [shotCount, ...accuracyInputs] = accuracyParameters;
            const singleHitAccuracy = lookupAcc(accuracyData, ...accuracyInputs);
            const hitRatio = singleHitAccuracy * shotCount;
            const attemptsPerTurn = attemptsPerTurnByType[shotType];
            const rangeModifiedDamage = damageModel.getRangeModifiedDamage(distance);
            
            dataPoint[`${shotType}HitRatio`] = hitRatio;
            dataPoint[`${shotType}Damage`] = rangeModifiedDamage * hitRatio / 100 * attemptsPerTurn;
            // function getTTK(health: i32, armor: i32, rolls: i32, lowLimit: i32, highLimit: i32, dmg: i32, hitChance: f64) : f64[] {
            console.log(`${shotType}TTK_${distance}`, ...damageModel.TTKParams, singleHitAccuracy / 100);
            const ttk = getTTK(...damageModel.TTKParams, singleHitAccuracy / 100);
            dataPoint[`${shotType}TTK`] = ttk.length;
            for(let i = 1; i < ttk.length; i++) {
                dataPoint[`${shotType}TTK_${i}`] = ttk[i];
            }
        }
        if(state.compare) {
            for(let shotType of compareShotTypes) {
                const accuracyParameters = computeAccuracyInputs(ruleset, shotType, distance, state, "compareWeapon", "compareAmmo");
                const [shotCount, ...accuracyInputs] = accuracyParameters;
                const singleHitAccuracy = lookupAcc(accuracyData, ...accuracyInputs);
                const hitRatio = singleHitAccuracy * shotCount;
                const compareAttemptsPerTurn = compareAttemptsPerTurnByType[shotType];
                const rangeModifiedDamage = compareDamageModel.getRangeModifiedDamage(distance);
                
                dataPoint[`Compare${shotType}HitRatio`] = hitRatio;
                dataPoint[`Compare${shotType}Damage`] = rangeModifiedDamage * hitRatio / 100 * compareAttemptsPerTurn;
                const ttk = getTTK(...compareDamageModel.TTKParams, singleHitAccuracy / 100);
                dataPoint[`Compare${shotType}TTK`] = ttk.length;
                for(let i = 1; i < ttk.length; i++) {
                    dataPoint[`Compare${shotType}TTK_${i}`] = ttk[i];
                }

            }
        }
        data.push(dataPoint);
    }
    window.chartData = data;
    return { data, weaponEntry: damageModel.weaponEntry, compareWeaponEntry: compareDamageModel?.weaponEntry };
}

window.getChartData = function (statMode, direction, soldier, armor, weapon, ammo, target, kneeling = false, oneHanded = false) {
    if(!arguments.length) {
        console.log([
            "usage: getChartData(statMode, direction, soldier, armor, weapon, ammo, target, kneeling = false, oneHanded = false)",
            "   statMode: one of 'minStats', 'maxStats', 'statCaps', 'trainingStatCaps'",
            "   direction: one of 'front', 'left', 'right', 'rear'",
            "   soldier: String key of ruleset entry with soldiers section",
            "   armor: String key of ruleset entry with armor section",
            "   weapon: String key of ruleset entry with items section and battleType: 1",
            "   ammo: String key of ruleset entry with items section and battleType: 2",
            "   target: String key of ruleset entry with unit section",
            "   kneeling: boolean",
            "   oneHanded: boolean"
        ].join("\n"));
        return;
    }
    const result = getChartData(window.db.ruleset, { stat: statMode, direction, soldier, armor, weapon, ammo, compare: false, compareWeapon: {}, compareAmmo: {}, target, kneeling, oneHanded });
    const rows = {};
    result.forEach(col => {
        Object.keys(col).forEach(k => {
            if(k === "distance") { // skip distance
                return;
            }
            if(!rows[k]) {
                rows[k] = [];
            }
            rows[k].push(col[k]);
        });
    });
    return Object.entries(rows).map(([k, v]) => [`${weapon}|${ammo}|${k}`, ...v].join(",")).join("\n");
}