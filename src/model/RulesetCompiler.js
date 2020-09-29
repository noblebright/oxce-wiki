import deepmerge from "deepmerge";
import { getSupportedLanguages } from "./utils";

/*
{
    languages: { en-US: {}, en-GB: {}, ...}
    entries: {

    }
}
*/

//const supportedSections = ["items", "events", "commendations", "soldierTransforms"];
const supportedSections = [
    { section: "items", key: "type", filter: (x, rs, key) => x.recover !== false && (x.battleType !== 11 || x.recoverCorpse !== false)},
    { section: "manufacture", key: "name" },
    { section: "research", key: "name" },
    { section: "facilities", key: "type" },
    { section: "crafts", key: "type" },
    { section: "craftWeapons", key: "type" },
    { section: "ufos", key: "type" },
    { section: "units", key: "type" },
    { section: "soldiers", key: "type" },
    { section: "armors", key: "type" },
    { section: "alienDeployments", key: "type"},
    { section: "alienRaces", key: "id", filter: (x, rs, key) => (Object.keys(rs[key]).length > 1) }, //filter is run post-add, so there will always be at least one section.
    { section: "terrains", key: "name", filter: (x, rs, key) => (Object.keys(rs[key]).length > 1) },
    { section: "ufopaedia", key: "id", omit: (x, rs, key) => (rs[key]) }
];

function generateSection(ruleset, rules, metadata) {
    const { section: sectionName, key: keyField, filter, omit } = metadata;

    const sectionData = rules[sectionName];
    
    sectionData.forEach(entry => {
        const name = entry[keyField];

        if(entry.delete) { //process delete
            if(ruleset[entry.delete]){
                delete ruleset[entry.delete][sectionName];
            }
            if(ruleset[entry.delete] && 
                !Object.keys(ruleset[entry.delete])
                    .filter(x => x !== "hide").length) {
                delete ruleset[entry.delete];
            }
            return;
        }
        if(!name) { //malformed entry
            return;
        }
        if(omit && !omit(entry, ruleset, name)) {
            //don't compile this section.
            return;
        }
        if(!ruleset[name]) {
            ruleset[name] = { [sectionName]: entry };
        } else {
            const mergedEntry = Object.assign({}, ruleset[name][sectionName], entry); //if there's an existing entry, merge new data into it.
            Object.assign(ruleset[name], { [sectionName]: mergedEntry });
        }
        if(filter && !filter(entry, ruleset, name)) {
            ruleset[name].hide = true;
        }
    });
}

function generateAssets(ruleset, assets) {
    if(!assets) return;

    assets.forEach(asset => {
        const name = asset.typeSingle || asset.type;
        if(asset.delete && ruleset[asset.delete]) { //process delete
            delete ruleset[asset.delete];
            return;
        }
        if(!name) { //malformed entry
            return;
        }
        if(!ruleset[name]) {
            ruleset[name] = asset;
        } else {
            ruleset[name] = deepmerge(ruleset[name], asset);
        }
    });
}

const backlinkSets = [];

function backLinkSet(entries, id, list, targetSection, field) {
    if(!list) return;

    for(let key of list) {
        let back = entries[key]?.[targetSection];
        if (!back) continue;
        back[field] = back[field] || new Set();
        back[field].add(id);
        backlinkSets.push([back, field]);
    }
}

function backLink(entries, id, list, targetSection, field) {
    const entry = entries[id];
    const items = typeof list === "function" ? list(entry) : list;
    
    if (!items) return;

    for (let key of items) {
        let back = entries[key]?.[targetSection];
        if (!back) continue;
        back[field] = back[field] || [];
        back[field].push(id);
    }
}

function augmentServices(entries, id, list) {
    if(!list) return;
    for(let key of list) {
        if(!entries[key]) {
            entries[key] = {};
        }
        entries[key].providedBy = entries[key].providedBy || [];
        entries[key].providedBy.push(id);
    }
}

function getCompatibleAmmo(entry) {
    const ammo = new Set();
    const item = entry.items || {};

    if(item.compatibleAmmo) {
        item.compatibleAmmo.forEach(x => ammo.add(x));
    }
    if(item.ammo) {
        Object.values(item.ammo).forEach(def => {
            if(def.compatibleAmmo) {
                def.compatibleAmmo.forEach(x => ammo.add(x));
            }
        });
    }
    return ammo.size ? [...ammo] : undefined;
}

const globalKeys = ["maxViewDistance"];

function getMapBlockItems(block, items, randomItems) {
    if(block.items) {
        Object.keys(block.items).forEach(x => items.add(x));
    }
    if(block.randomizedItems) {
        block.randomizedItems.forEach(random => {
            random.itemList.forEach(x => randomItems.add(x));
        })
    }
}

export default function compile(base, mod) {
    const ruleset = { languages: {}, entries: {}, sprites: {}, sounds: {}, prisons: {}, globalVars: {} };
    
    //add languages
    const supportedLanguages = getSupportedLanguages(base, mod);
    supportedLanguages.forEach(key => {
        ruleset.languages[key] = mod[key] ? deepmerge(base[key], mod[key]) : base[key];
    });

    //add globalVars
    globalKeys.forEach(key => ruleset.globalVars[key] = base[key] || mod[key]);
    
    //add entries
    supportedSections.forEach(metadata => {
        generateSection(ruleset.entries, base, metadata);
        generateSection(ruleset.entries, mod, metadata);
    });

    //add sprites
    generateAssets(ruleset.sprites, base.extraSprites);
    generateAssets(ruleset.sprites, mod.extraSprites);

    //add sounds
    generateAssets(ruleset.sounds, base.extraSounds);
    generateAssets(ruleset.sounds, mod.extraSounds);

    //add backreferences
    for(let key in ruleset.entries) {
        const entry = ruleset.entries[key];
        const research = entry.research || {};
        const manufacture = entry.manufacture || {};
        const facilities = entry.facilities || {};
        const craftWeapons = entry.craftWeapons || {};
        const armors = entry.armors || {};
        const ufos = entry.ufos || {};
        const units = entry.units || {};
        const alienDeployments = entry.alienDeployments || {};

        backLink(ruleset.entries, key, research.dependencies, "research", "leadsTo");
        backLink(ruleset.entries, key, research.unlocks, "research", "unlockedBy");
        backLink(ruleset.entries, key, research.getOneFree, "research", "freeFrom");
        backLink(ruleset.entries, key, [research.lookup], "research", "seeAlso"); //lookup is just a single entry, so we gotta put it in a list.
        backLink(ruleset.entries, key, manufacture.requires, "research", "manufacture");
        backLink(ruleset.entries, key, manufacture.producedItems && Object.keys(manufacture.producedItems), "items", "manufacture");
        backLink(ruleset.entries, key, manufacture.requiredItems && Object.keys(manufacture.requiredItems), "items", "componentOf");
        backLink(ruleset.entries, key, [craftWeapons.launcher], "items", "craftWeapons");
        backLink(ruleset.entries, key, [craftWeapons.clip], "items", "craftAmmo");
        backLink(ruleset.entries, key, facilities.buildOverFacilities, "facilities", "upgradesTo");
        backLink(ruleset.entries, key, [manufacture.spawnedPersonType], "soldiers", "manufacture");
        backLink(ruleset.entries, key, [units.armor], "armors", "npcUnits");
        backLink(ruleset.entries, key, units.units, "soldiers", "usableArmors");
        backLink(ruleset.entries, key, [armors.storeItem], "items", "wearableArmors");
        if(entry.items) {
            const compatibleAmmo = getCompatibleAmmo(entry);
            if(compatibleAmmo) {
                entry.items.allCompatibleAmmo = compatibleAmmo;
            }
        }

        if(entry.facilities?.prisonType) {
            ruleset.prisons[entry.facilities.prisonType] = ruleset.prisons[entry.facilities.prisonType] || [];
            ruleset.prisons[entry.facilities.prisonType].push(key);
        }
        backLink(ruleset.entries, key, entry.items?.allCompatibleAmmo, "items", "ammoFor");

        //Items from alienDeployments
        const deploymentItems = alienDeployments.data?.reduce((acc, deployment) => {
            deployment.itemSets.forEach(itemSet => {
                itemSet.forEach(item => {
                    acc.add(item);
                });
            });
            return acc;
        }, new Set()) || null;
        backLinkSet(ruleset.entries, key, deploymentItems && [...deploymentItems], "items", "foundFrom");
        backLinkSet(ruleset.entries, key, [alienDeployments.missionBountyItem], "items", "foundFrom");

        //Items from terrain
        const terrainResults = alienDeployments.terrains?.reduce((acc, terrainKey) => {
            const terrain = ruleset.entries[terrainKey].terrains;
            const [items, randomItems] = acc;
            terrain.mapBlocks.forEach(block => {
                getMapBlockItems(block, items, randomItems);
            });
            return acc;
        }, [new Set(), new Set()]);

        const [terrainItems, terrainRandomItems] = terrainResults || [];

        if(terrainItems && terrainItems.size) {
            entry.alienDeployments.terrainItems = [...terrainItems];
            backLinkSet(ruleset.entries, key, [...terrainItems], "items", "foundFrom");
        }
        if(terrainRandomItems && terrainRandomItems.size) {
            entry.alienDeployments.terrainRandomItems = [...terrainRandomItems];
            backLinkSet(ruleset.entries, key, [...terrainItems], "items", "foundFrom");
        }

        //Items from UFOs
        const ufoResults = ufos.battlescapeTerrainData?.mapBlocks?.reduce((acc, block) => {
            const [items, randomItems] = acc;
            getMapBlockItems(block, items, randomItems);
            return acc;
        }, [new Set(), new Set()]);

        const [ufoItems, ufoRandomItems] = ufoResults || [];

        if(ufoItems && ufoItems.size) {
            entry.ufos.ufoItems = [...ufoItems];
            backLinkSet(ruleset.entries, key, [...ufoItems], "items", "foundFrom");
        }
        if(ufoRandomItems && ufoRandomItems.size) {
            entry.ufos.ufoRandomItems = [...ufoRandomItems];
            backLinkSet(ruleset.entries, key, [...ufoRandomItems], "items", "foundFrom");
        }

        //Items from Units
        const unitItems = units.builtInWeaponSets?.reduce((acc, weaponSet) => {
            weaponSet.forEach(item => acc.add(item));
            return acc;
        }, new Set());
        backLinkSet(ruleset.entries, key, unitItems && [...unitItems], "items", "foundFrom");
 
        //augmentServices(ruleset.entries, key, facilities.provideBaseFunc);
    }

    backlinkSets.forEach(([obj, key]) => { //convert Sets back into Arrays
        obj[key] = [...obj[key]];
    });
    return ruleset;
}