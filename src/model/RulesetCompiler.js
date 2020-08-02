import deepmerge from "deepmerge";
import { getSupportedLanguages } from "./utils";

/*
{
    languages: { en-US: {}, en-GB: {}, ...}
    entries: {

    }
}
*/

//const supportedSections = ["craftWeapons", "crafts", "facilities", "items", "ufos", "units"];
const supportedSections = [
    { section: "items", key: "type", filter: (x, rs, key) => x.recover !== false && (x.battleType !== 11 || x.recoverCorpse !== false)},
    { section: "manufacture", key: "name" },
    { section: "research", key: "name" },
    { section: "facilities", key: "type" },
    { section: "ufopaedia", key: "id", filter: (x, rs, key) => (rs[key]) }
];

function generateSection(ruleset, rules, metadata) {
    const { section: sectionName, key: keyField, filter } = metadata;

    const sectionData = rules[sectionName];
    
    sectionData.forEach(entry => {
        const name = entry[keyField];
        if(entry.delete && ruleset[entry.delete]) { //process delete
            delete ruleset[entry.delete][sectionName];
            return;
        }
        if(!name) { //malformed entry
            return;
        }
        if(filter && !filter(entry, ruleset, name)) {
            //skipped due to filter.
            return;
        }
        if(!ruleset[name]) {
            ruleset[name] = { [sectionName]: entry };
        } else {
            const mergedEntry = Object.assign({}, ruleset[name][sectionName], entry); //if there's an existing entry, merge new data into it.
            Object.assign(ruleset[name], { [sectionName]: mergedEntry });
        }
    });
}

function backLink(entries, id, targetSection, list, field) {
    if (!list) return;
    for (let key of list) {
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

export default function compile(base, mod) {
    const ruleset = { languages: {}, entries: {} };
    
    //add languages
    const supportedLanguages = getSupportedLanguages(base, mod);
    supportedLanguages.forEach(key => {
        ruleset.languages[key] = mod[key] ? deepmerge(base[key], mod[key]) : base[key];
    });

    //add entries
    supportedSections.forEach(metadata => {
        generateSection(ruleset.entries, base, metadata);
        generateSection(ruleset.entries, mod, metadata);
    });

    for(let key in ruleset.entries) {
        const entry = ruleset.entries[key];
        const research = entry.research || {};
        const manufacture = entry.manufacture || {};
        const facilities = entry.facilities || {};
        backLink(ruleset.entries, key, "research", research.dependencies, "leadsTo");
        backLink(ruleset.entries, key, "research", research.unlocks, "unlockedBy");
        backLink(ruleset.entries, key, "research", research.lookup, "seeAlso");
        backLink(ruleset.entries, key, "research", manufacture.requires, "manufacture");
        backLink(ruleset.entries, key, "items", manufacture.producedItems && Object.keys(manufacture.producedItems), "manufacture");
        backLink(ruleset.entries, key, "items", manufacture.requiredItems && Object.keys(manufacture.requiredItems), "componentOf");
        //augmentServices(ruleset.entries, key, facilities.provideBaseFunc);
    }
    return ruleset;
}