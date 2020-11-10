import deepmerge from "deepmerge";
import { getSupportedLanguages } from "./utils";
import { joinRaces, compileMissions } from "./MissionMapper";
import { mapItemSources } from "./ItemSourceMapper";
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
    { section: "soldierTransformation", key: "name"},
    { section: "commendations", key: "type"},
    { section: "armors", key: "type" },
    { section: "alienDeployments", key: "type"},
    { section: "alienRaces", key: "id", filter: (x, rs, key) => (Object.keys(rs[key]).length > 1) }, //filter is run post-add, so there will always be at least one section.
    { section: "terrains", key: "name", filter: (x, rs, key) => (Object.keys(rs[key]).length > 1) },
    { section: "ufopaedia", key: "id", omit: (x, rs, key) => (rs[key]) }
];

const supportedLookups = [
    { section: "soldierBonuses", key: "name" }
];

function generateSection(ruleset, rules, metadata) {
    const { section: sectionName, key: keyField, filter, omit } = metadata;

    const sectionData = rules[sectionName] || [];
    
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

function generateLookup(ruleset, rules, metadata) {
    const { section: sectionName, key: keyField, omit } = metadata;

    const sectionData = rules[sectionName] || [];
    
    if(!ruleset[sectionName]) {
        ruleset[sectionName] = {};
    }
    
    const lookup = ruleset[sectionName];

    sectionData.forEach(entry => {
        const name = entry[keyField];

        if(entry.delete) { //process delete
            if(lookup[entry.delete]){
                delete lookup[entry.delete];
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
        if(!lookup[name]) {
            lookup[name] = entry;
        } else {
            Object.assign(lookup[name], entry);
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

function getKillCriteriaItems(ruleset, killCriteria) {
    const items = new Set();
    if(!killCriteria) {
        return null;
    }
    killCriteria.forEach(orCriteria => {
        orCriteria.forEach(([count, details]) => {
            details.forEach(detail => {
                if(ruleset[detail]?.items) {
                    items.add(detail);
                }
            });
        })
    });
    return [...items];
}

const globalKeys = ["maxViewDistance"];

export default function compile(base, mod) {
    const ruleset = { languages: {}, entries: {}, sprites: {}, sounds: {}, prisons: {}, globalVars: {}, lookups: {} };
    
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

    //add lookups
    supportedLookups.forEach(metadata => {
        generateLookup(ruleset.lookups, base, metadata);
        generateLookup(ruleset.lookups, mod, metadata);
    });

    //add sprites
    generateAssets(ruleset.sprites, base.extraSprites);
    generateAssets(ruleset.sprites, mod.extraSprites);

    //add sounds
    generateAssets(ruleset.sounds, base.extraSounds);
    generateAssets(ruleset.sounds, mod.extraSounds);

    //handle globe/region/mission/missionscript/deployment relationships
    compileMissions(ruleset.lookups, base);
    compileMissions(ruleset.lookups, mod);
    joinRaces(ruleset.lookups);

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
        const soldierTransformation = entry.soldierTransformation || {};
        const commendations = entry.commendations || {};

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
        backLink(ruleset.entries, key, soldierTransformation.requires, "research", "$allowsTransform");
        backLink(ruleset.entries, key, soldierTransformation.allowedSoldierTypes, "soldiers", "$allowedTransform");
        backLink(ruleset.entries, key, getKillCriteriaItems(ruleset.entries, commendations.killCriteria), "items", "$givesCommendation");
        backLinkSet(ruleset.entries, key, [alienDeployments.nextStage], "alienDeployments", "$prevStage");
        backLinkSet(ruleset.entries, key, [research.spawnedItem], "items", "foundFrom");

        if(ufos.raceBonus) {
            Object.entries(ufos.raceBonus).forEach(([race, data]) => {
                if(data.craftCustomDeploy) {
                    ruleset.lookups.raceByDeployment[data.craftCustomDeploy] = ruleset.lookups.raceByDeployment[data.craftCustomDeploy] || new Set();
                    ruleset.lookups.raceByDeployment[data.craftCustomDeploy].add(race);
                    backLinkSet(ruleset.entries, key, [data.craftCustomDeploy], "alienDeployments", "$variant");
                }
                if(data.missionCustomDeploy) {
                    ruleset.lookups.raceByDeployment[data.missionCustomDeploy] = ruleset.lookups.raceByDeployment[data.missionCustomDeploy] || new Set();
                    ruleset.lookups.raceByDeployment[data.missionCustomDeploy].add(race);
                    backLinkSet(ruleset.entries, key, [data.missionCustomDeploy], "alienDeployments", "$variant");
                }
            });
        }

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

        mapItemSources(backLinkSet, ruleset, key);

        //augmentServices(ruleset.entries, key, facilities.provideBaseFunc);
    }

    backlinkSets.forEach(([obj, key]) => { //convert Sets back into Arrays
        if(obj[key] instanceof Set) {
            obj[key] = [...obj[key]];
        }
    });
    return ruleset;
}