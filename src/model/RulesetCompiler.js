import deepmerge from "deepmerge";
import { getSupportedLanguages } from "./utils";

/*
{
    languages: { en-US: {}, en-GB: {}, ...}
    entries: {

    }
}
*/

//const supportedSections = ["craftWeapons", "crafts", "facilities", "items", "manufacture", "research", "ufopedia", "ufos", "units"];
const supportedSections = [
    { section: "items", key: "type", filter: (x, rs, key) => x.recover !== false },
    { section: "manufacture", key: "name" },
    { section: "research", key: "name" },
    { section: "ufopaedia", key: "id", filter: (x, rs, key) => (rs[key]) }
];

function compileSection(ruleset, rules, metadata) {
    const { section: sectionName, key: keyField, filter } = metadata;

    const sectionData = rules[sectionName];
    
    sectionData.forEach(entry => {
        const name = entry[keyField];
        if(entry.delete && ruleset[entry.delete]) {
            delete ruleset[entry.delete][sectionName];
            return;
        }
        if(!name) {
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

export default function compile(base, mod) {
    const ruleset = { languages: {}, entries: {} };
    
    //add languages
    const supportedLanguages = getSupportedLanguages(base, mod);
    supportedLanguages.forEach(key => {
        ruleset.languages[key] = mod[key] ? deepmerge(base[key], mod[key]) : base[key];
    });

    //add entries
    supportedSections.forEach(metadata => {
        compileSection(ruleset.entries, base, metadata);
        compileSection(ruleset.entries, mod, metadata);
    });

    return ruleset;
}