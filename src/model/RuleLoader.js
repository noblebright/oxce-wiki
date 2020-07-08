import yaml from "js-yaml";

export function getLabel(entry, locale) {
    if(!entry) {
        return null;
    }
    if(typeof entry === "string") {
        return locale[entry] || entry;
    }
    return locale[entry.name] || entry.name;
}

export default class RuleLoader {
    constructor(ruleUrls, languageUrls) {
        this.ruleUrls = ruleUrls;
        this.languageUrls = languageUrls;
        this.rules = null;
        this.strings = null;
    }

    load() {
        this.rules = {};
        this.strings = {};
        return Promise.all([this.loadRules(), this.loadLanguages()])
            .then(() => this.augmentResearch())
            .then(() => Promise.resolve({rules: this.rules , strings: this.strings, loaded: true}));
    }

    loadRules() {
        const promises = this.ruleUrls.map(url => fetch(url).then(res => res.text()));
        return Promise.all(promises).then(yamlTexts => {
            //load all rule yaml
            const ruleData = yamlTexts.map(yamlText => yaml.safeLoad(yamlText));
            ruleData.forEach(ruleFile => {
                //load all sections in each rule file
                Object.keys(ruleFile).forEach(sectionName => {
                    //process each entry in each section
                    ruleFile[sectionName].forEach(entry => {
                        if(entry.delete) {
                            delete this.rules[entry.delete];
                            return;
                        }
                        if(!entry.name) return; //-delete or malformed
                        if(!this.rules[entry.name]) {
                            //never seen this before.
                            this.rules[entry.name] = { name: entry.name, [sectionName]: entry };
                        } else {
                            Object.assign(this.rules[entry.name], { [sectionName]: entry });
                        }
                    });
                });
            });
        });
    }

    loadLanguages() {
        const promises = this.languageUrls.map(url => fetch(url).then(res => res.text()));
        return Promise.all(promises).then(yamlTexts => {
            const langFiles = yamlTexts.map(yamlText => yaml.safeLoad(yamlText));
            langFiles.forEach(langFile => {
                Object.keys(langFile).forEach(language => {
                    if(!this.strings[language]) {
                        this.strings[language] = {};
                    }
                    Object.assign(this.strings[language], langFile[language]);
                });
            });
        });
    }

    augmentResearch() {
        Object.values(this.rules).forEach(entry => {
            if(!entry.research) return;
            const research = entry.research;
            (research.dependencies || []).forEach(dependency => {
                if(this.rules[dependency] && this.rules[dependency].research) {
                    const dependentObj = this.rules[dependency].research;
                    if(!dependentObj.leadsTo) {
                        dependentObj.leadsTo = [];
                    }
                    dependentObj.leadsTo.push(entry.name);
                } else {
                    console.warn(`${entry.name} depends on non-existant topic ${dependency}!`);
                }
            });
            (research.unlocks || []).forEach(unlock => {
                if(this.rules[unlock] && this.rules[unlock].research) {
                    const dependentObj = this.rules[unlock].research;
                    if(!dependentObj.unlockedBy) {
                        dependentObj.unlockedBy = [];
                    }
                    dependentObj.unlockedBy.push(entry.name);
                } else {
                    console.warn(`${entry.name} unlocks non-existant topic ${unlock}!`);
                }
            });
            if(research.lookup) {
                const dependentObj = this.rules[research.lookup]?.research;
                if(dependentObj) {
                    if(!dependentObj.lookupOf) {
                        dependentObj.lookupOf = [];
                    }
                    dependentObj.lookupOf.push(entry.name);
                }
            }
        });
    }
}