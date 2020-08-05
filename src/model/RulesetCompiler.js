import deepmerge from "deepmerge";
import { getSupportedLanguages } from "./utils";

/*
{
    languages: { en-US: {}, en-GB: {}, ...}
    entries: {

    }
}
*/

//const supportedSections = ["items", "soldiers", "armors", "events", "commendations", "soldierTransforms"];
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
    { section: "ufopaedia", key: "id", omit: (x, rs, key) => (rs[key]) }
];

function generateSection(ruleset, rules, metadata) {
    const { section: sectionName, key: keyField, filter, omit } = metadata;

    const sectionData = rules[sectionName];
    
    sectionData.forEach(entry => {
        const name = entry[keyField];
        if(sectionName === "armors") {
            console.log(name);
        }

        if(entry.delete && ruleset[entry.delete]) { //process delete
            delete ruleset[entry.delete][sectionName];
            if(!Object.keys(ruleset[entry.delete]).length) {
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

function backLink(entries, id, targetSection, list, field) {
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
        backLink(ruleset.entries, key, "research", research.dependencies, "leadsTo");
        backLink(ruleset.entries, key, "research", research.unlocks, "unlockedBy");
        backLink(ruleset.entries, key, "research", research.getOneFree, "freeFrom");
        backLink(ruleset.entries, key, "research", [research.lookup], "seeAlso"); //lookup is just a single entry, so we gotta put it in a list.
        backLink(ruleset.entries, key, "research", manufacture.requires, "manufacture");
        backLink(ruleset.entries, key, "items", manufacture.producedItems && Object.keys(manufacture.producedItems), "manufacture");
        backLink(ruleset.entries, key, "items", manufacture.requiredItems && Object.keys(manufacture.requiredItems), "componentOf");
        backLink(ruleset.entries, key, "items", [craftWeapons.launcher], "craftWeapons");
        backLink(ruleset.entries, key, "items", [craftWeapons.clip], "craftAmmo");
        backLink(ruleset.entries, key, "facilities", facilities.buildOverFacilities, "upgradesTo");
        backLink(ruleset.entries, key, "soldiers", [manufacture.spawnedPersonType], "manufacture");
        if(entry.items) {
            const compatibleAmmo = getCompatibleAmmo(entry);
            if(compatibleAmmo) {
                entry.items.allCompatibleAmmo = compatibleAmmo;
            }
        }
        if(entry.facilities?.prisonType) {
            ruleset.prisons[entry.facilities.prisonType] = key;
        }
        backLink(ruleset.entries, key, "items", entry.items?.allCompatibleAmmo, "ammoFor");

        
        //augmentServices(ruleset.entries, key, facilities.provideBaseFunc);
    }
    return ruleset;
}