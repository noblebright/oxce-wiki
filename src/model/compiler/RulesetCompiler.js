import deepmerge from "deepmerge";
import { initializeLookups, processGlobe, compileMissions } from "./MissionMapper.js";
import { mapItemSources } from "./ItemSourceMapper.js";
import { mapEventScripts } from "./EventMapper.js";
import { mapUnitSources, getPossibleRaces } from "./UnitSourceMapper.js";
import { customMerge } from "../YamlService.js";
import { mapCraftsWeapons } from "./CraftWeaponMapper.js";
import { mapPrisons, mapServices, resolveServices } from "./FacilityMapper.js";
import { getDamageKey } from "../utils.js";
/*
{
    languages: { en-US: {}, en-GB: {}, ...}
    entries: {

    }
}
*/

const supportedSections = [
    // skip unrecoverable items, corpses, and unrecoverable corpses.  liveAlien seems to override recover = false.
    { section: "items", key: "type", filter: (x, rs, key) => (x.recover !== false || x.liveAlien === true) && (x.battleType !== 11 || x.recoverCorpse !== false)},
    { section: "manufacture", key: "name" },
    { section: "research", key: "name" },
    { section: "facilities", key: "type" },
    { section: "crafts", key: "type" },
    { section: "craftWeapons", key: "type" },
    { section: "alienDeployments", key: "type"}, // deployments must be before ufos, because ufo are filtered based on deployment
    { section: "ufos", key: "type", filter: (x, rs, key) => (rs[key].alienDeployments) }, // hide all the ufos that are used in site-based missions
    { section: "units", key: "type" },
    { section: "soldiers", key: "type" },
    { section: "soldierTransformation", key: "name"},
    { section: "commendations", key: "type"},
    { section: "events", key: "name"},
    { section: "armors", key: "type" },
    { section: "alienRaces", key: "id", filter: (x, rs, key) => (Object.keys(rs[key]).length > 1) }, //filter is run post-add, so there will always be at least one section.
    { section: "ufopaedia", key: "id", omit: (x, rs, key) => (rs[key]) }
];

const supportedLookups = [
    { section: "soldierBonuses", key: "name" },
    { section: "eventScripts", key: "type" },
    { section: "ufoTrajectories", key: "id" },
    { section: "terrains", key: "name" },
    { section: "mapScripts", key: "type" },
    { section: "startingConditions", key: "type" },
    { section: "enviroEffects", key: "type" },
    { section: "missionScripts", key: "type" },
    { section: "alienMissions", key: "type" },
    { section: "regions", key: "type" },
];

function generateSection(ruleset, rules, metadata) {
    const { section: sectionName, key: keyField, filter, omit } = metadata;

    const sectionData = rules[sectionName] || [];
    
    sectionData.forEach(entry => {
        const name = entry[keyField];

        if(entry.delete) { //process delete
            if(ruleset[entry.delete]){ // delete the section
                delete ruleset[entry.delete][sectionName];
            }
            if(ruleset[entry.delete] && // if there are no sections left for this key, delete the key
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
            const mergedEntry = Object.assign({}, deepmerge(ruleset[name][sectionName], entry, { clone: false, customMerge })); //if there's an existing entry, merge new data into it.
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
            lookup[name] = deepmerge(lookup[name], entry, { clone: false, customMerge });
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
            ruleset[name] = deepmerge(ruleset[name], asset, { clone: false });
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

function getRandomBonusResearch(units) {
    const oneFree = units.getOneFree ?? [];
    const research = new Set(oneFree);
    if(units.getOneFreeProtected) {
        Object.keys(units.getOneFreeProtected).forEach(k => {
            units.getOneFreeProtected[k].forEach(r => research.add(r));
        });
    }
    return [...research];
}

function addToCategory(ruleset, category, key, extraProps = {}) {
    if(!ruleset.entries[category]) {
        ruleset.entries[category] = {};
        ruleset.lookups.categories.push(category);
    }
    if(!ruleset.entries[category].category) {
        ruleset.entries[category].category = {
            entries: []
        };
    }
    ruleset.entries[category].category.entries.push(key);
    Object.assign(ruleset.entries[category].category, extraProps);
}

function generateCategory(ruleset, key) {
    const entry = ruleset.entries[key];
    const items = entry.items;
    
    if(!items?.categories) return;
    items.categories.forEach(category => {
        addToCategory(ruleset, category, key);
    });
}

function getSelfDamageTypes(item) {
    const meleeType = item.meleeAlter?.ResistType ?? item.meleeType;
    const damageType = item.damageAlter?.ResistType ?? item.damageType;
    return [meleeType, damageType].filter(x => x !== undefined).map(getDamageKey);
}

const globalKeys = ["maxViewDistance", "oneHandedPenaltyGlobal", "kneelBonusGlobal", "fireDamageRange", "damageRange", "explosiveDamageRange", "hireEngineersRequiresBaseFunc", "hireScientistsRequiresBaseFunc"];

function resolveRefNode(entries, key) {
    const entry = entries[key];
    Object.keys(entry).forEach(sectionKey => {
        const section = entry[sectionKey];
        if(section.refNode) {
            entry[sectionKey] = Object.assign({}, section.refNode, section);
        }
    });
}

export default function compile(rulesList, supportedLanguages) {
    const ruleset = { languages: {}, entries: {}, sprites: {}, sounds: {}, globalVars: {}, lookups: {} };
    
    //add languages
    console.time("l10n");
    supportedLanguages.forEach(lang => {
        ruleset.languages[lang] = rulesList.reduce((acc, module) => {
            if(module[lang]) {
                acc = deepmerge(acc, module[lang]);
            }
            return acc;
        }, {});
    });
    console.timeEnd("l10n");

    //add globalVars
    globalKeys.forEach(key => {
        rulesList.forEach(rules => {
            if(rules[key] !== undefined) {
                ruleset.globalVars[key] = rules[key];
            }
        });
    });
    
    //add entries
    console.time("entries");
    supportedSections.forEach(metadata => {
        rulesList.forEach(rules => {
            generateSection(ruleset.entries, rules, metadata);
        });
    });
    for(const key in ruleset.entries) {
        resolveRefNode(ruleset.entries, key);
    }
    console.timeEnd("entries");

    //add lookups
    console.time("lookups");
    supportedLookups.forEach(metadata => {
        rulesList.forEach(rules => {
            generateLookup(ruleset.lookups, rules, metadata);
        });
    });
    for(const key in ruleset.lookups) {
        resolveRefNode(ruleset.lookups, key);
    }
    console.timeEnd("lookups")

    console.time("assets");
    //add sprites
    rulesList.forEach(rules => {
        generateAssets(ruleset.sprites, rules.extraSprites);
    });

    //add sounds
    rulesList.forEach(rules => {
        generateAssets(ruleset.sounds, rules.extraSounds);
    });
    console.timeEnd("assets");

    //handle globe/region/mission/missionscript/deployment relationships
    console.time("missionMapping");
    initializeLookups(ruleset.lookups);
    rulesList.forEach(rules => {
        processGlobe(ruleset.lookups, rules);
    });
    compileMissions(ruleset);
    console.timeEnd("missionMapping");

    mapEventScripts(ruleset.lookups);

    const allSoldiers = Object.keys(ruleset.entries).filter(k => ruleset.entries[k].soldiers);

    ruleset.lookups.hwps = [];
    ruleset.lookups.craftsBySlot = {};
    ruleset.lookups.weaponsBySlot = {};
    ruleset.lookups.categories = [];
    ruleset.lookups.prisons = [];

    //add backreferences
    console.time("backrefs");
    for(let key in ruleset.entries) {
        const entry = ruleset.entries[key];
        const research = entry.research || {};
        const manufacture = entry.manufacture || {};
        const facilities = entry.facilities || {};
        const craftWeapons = entry.craftWeapons || {};
        const armors = entry.armors || {};
        const ufos = entry.ufos || {};
        const units = entry.units || {};
        const items = entry.items || {};
        const events = entry.events || {};
        const alienDeployments = entry.alienDeployments || {};
        const soldierTransformation = entry.soldierTransformation || {};
        const commendations = entry.commendations || {};

        generateCategory(ruleset, key);
        
        backLink(ruleset.entries, key, research.dependencies, "research", "leadsTo");
        backLink(ruleset.entries, key, ruleset.lookups.startingConditions[alienDeployments.startingCondition]?.allowedCraft, "crafts", "$specialMissionAllowed");
        backLink(ruleset.entries, key, getRandomBonusResearch(research), "research", "$randomBonusSources");
        backLink(ruleset.entries, key, items.requiresBuy, "research", "$allowsPurchase");
        backLink(ruleset.entries, key, events.researchList, "research", "$fromEvent");
        backLink(ruleset.entries, key, [research.spawnedEvent], "events", "$fromResearch");
        backLink(ruleset.entries, key, research.unlocks, "research", "unlockedBy");
        backLink(ruleset.entries, key, research.getOneFree, "research", "freeFrom");
        backLink(ruleset.entries, key, [research.lookup], "research", "seeAlso"); //lookup is just a single entry, so we gotta put it in a list.
        backLink(ruleset.entries, key, manufacture.requires, "research", "manufacture");
        backLink(ruleset.entries, key, manufacture.producedItems && Object.keys(manufacture.producedItems), "items", "manufacture");
        backLink(ruleset.entries, key, manufacture.requiredItems && Object.keys(manufacture.requiredItems), "items", "componentOf");
        backLink(ruleset.entries, key, facilities.buildCostItems && Object.keys(facilities.buildCostItems).filter(k => facilities.buildCostItems[k].build), "items", "$facilityComponent");
        backLink(ruleset.entries, key, [craftWeapons.launcher], "items", "$craftWeapons");
        backLink(ruleset.entries, key, [craftWeapons.clip], "items", "$craftAmmo");
        backLink(ruleset.entries, key, facilities.buildOverFacilities, "facilities", "upgradesTo");
        backLink(ruleset.entries, key, [manufacture.spawnedPersonType], "soldiers", "manufacture");
        backLink(ruleset.entries, key, [units.armor], "armors", "npcUnits");
        // if there's no units field, and it has a storeItem (ie, can be stored in base), it's usable by all soldiers
        backLink(ruleset.entries, key, armors.units || (entry.armors?.storeItem && allSoldiers), "soldiers", "usableArmors");
        backLink(ruleset.entries, key, [armors.storeItem], "items", "wearableArmors");
        backLink(ruleset.entries, key, soldierTransformation.requires, "research", "$allowsTransform");
        backLink(ruleset.entries, key, soldierTransformation.allowedSoldierTypes, "soldiers", "$allowedTransform");
        backLink(ruleset.entries, key, getKillCriteriaItems(ruleset.entries, commendations.killCriteria), "items", "$givesCommendation");
        backLink(ruleset.entries, key, [alienDeployments.unlockedResearch], "research", "$fromMission");
        backLinkSet(ruleset.entries, key, [alienDeployments.nextStage], "alienDeployments", "$prevStage");
        backLinkSet(ruleset.entries, key, [research.spawnedItem], "items", "$foundFrom");
        backLinkSet(ruleset.entries, key, soldierTransformation.requiredItems && Object.keys(soldierTransformation.requiredItems), "items", "$transformComponent");

        mapCraftsWeapons(ruleset.lookups, entry);
        mapPrisons(ruleset.lookups, entry);
        mapServices(entry, key);

        if(ufos.raceBonus) {
            Object.entries(ufos.raceBonus).forEach(([race, data]) => {
                if(data.craftCustomDeploy) {
                    if(!ufos.$hasVariants) {
                        ufos.$hasVariants = [];
                    }
                    ufos.$hasVariants.push([race, data.craftCustomDeploy]);
                    backLinkSet(ruleset.entries, key, [data.craftCustomDeploy], "alienDeployments", "$variantOf");
                }
                // if(data.missionCustomDeploy) {
                //     backLinkSet(ruleset.entries, key, [data.missionCustomDeploy], "alienDeployments", "$variant");
                // }
            });
        }

        // Vanilla HWP style
        if(entry.items?.fixedWeapon && units.type) {
            ruleset.lookups.hwps.push(key);
        }

        // Add categories for damage types
        if(entry.items) {
            const compatibleAmmo = getCompatibleAmmo(entry);
            const selfDamageTypes = getSelfDamageTypes(entry.items);
            selfDamageTypes.forEach(damageType => {
                addToCategory(ruleset, damageType, key, { damageType: true });
            });
            if(compatibleAmmo) {
                entry.items.$allCompatibleAmmo = compatibleAmmo;
                compatibleAmmo.forEach(ammo => {
                    const ammoDamageTypes = getSelfDamageTypes(ruleset.entries[ammo]);
                    ammoDamageTypes.forEach(damageType => {
                        addToCategory(ruleset, damageType, key, { damageType: true });
                    });     
                });
            }
        }

        // Add category for commendations
        if(entry.commendations) {
            addToCategory(ruleset, "STR_COMMENDATIONS", key);
        }

        backLink(ruleset.entries, key, entry.items?.$allCompatibleAmmo, "items", "ammoFor");

        // setting hide to false done to force show entries for intercept-only ufos
        if(entry.alienDeployments && !getPossibleRaces(key, ruleset).size && entry.hide !== false) {
            entry.hide = true;
        }

        mapItemSources(backLinkSet, ruleset, key);
    }
    console.timeEnd("backrefs");

    console.time("unitSources");
    mapUnitSources(backLinkSet, ruleset);
    console.timeEnd("unitSources");

    resolveServices(ruleset);

    backlinkSets.forEach(([obj, key]) => { //convert Sets back into Arrays
        if(obj[key] instanceof Set) {
            obj[key] = [...obj[key]];
        }
    });
    return ruleset;
}