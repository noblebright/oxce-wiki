import yaml from "js-yaml";

export function getLabel(entry, locale) {
    if(!entry) {
        return null;
    }
    if(typeof entry === "string") {
        return locale[entry] || entry;
    }
    return locale[entry.name || entry.type] || entry.name || entry.type;
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
            .then(() => {
                this.augmentResearch();
                this.augmentManufacturing();
                this.augmentAmmo();
            })
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
                    if(sectionName === "extended") { //skip extended section for now.
                        return;
                    }
                    //process each entry in each section
                    ruleFile[sectionName].forEach(entry => {
                        if(entry.delete) {
                            if(this.rules[entry.delete]) { //delete if it exists.
                                delete this.rules[entry.delete][sectionName];
                            }
                            return;
                        }
                        const name = entry.name || entry.type;
                        if(!name) return; //malformed
                        
                        // SECTION-SPECIFIC LOGIC
                        if(sectionName === "items") {
                            if(entry.recover === false) //skip unrecoverable items.
                                return;
                        }

                        // END SECTION-SPECIFIC LOGIC
                        if(!this.rules[name]) {
                            //never seen this before.
                            this.rules[name] = { name: name, [sectionName]: entry };
                        } else {
                            const mergedEntry = Object.assign({}, this.rules[name][sectionName], entry); //if there's an existing entry, merge new data into it.
                            Object.assign(this.rules[name], { [sectionName]: mergedEntry });
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

    augmentManufacturing() {
        Object.values(this.rules).forEach(entry => {
            if(!entry.manufacture) return;
            const requireList = entry.manufacture.requires;
            if(requireList) {
                requireList.forEach(id => {
                    if(this.rules[id].research) {
                        const research = this.rules[id].research;
                        if(!research.manufacture) {
                            research.manufacture = [];
                        }
                        research.manufacture.push(entry.name);
                    } else {
                        console.warn(`Manufacturing ${entry.name} requires unknown tech ${id}`);
                    }
                })
            }
        })
    }

    augmentAmmo() {
        Object.values(this.rules).forEach(entry => {
            if(!entry.items) return;
            const ammo = entry.items.ammo;
            const compatibleAmmo = entry.items.compatibleAmmo || [];
            const ammoSet = new Set();
            if(compatibleAmmo) {
                compatibleAmmo.forEach(x => ammoSet.add(x));
            }
            if(ammo) {
                ["0", "1", "2", "3"].forEach(k => {
                    const compatibleAmmo = ammo[k]?.compatibleAmmo;
                    if(compatibleAmmo) {
                        compatibleAmmo.forEach(x => ammoSet.add(x));
                    }
                });
            }
            [...ammoSet].forEach(key => {
                const target = this.rules[key];
                if(!target || !target.items) {
                    console.warn(`Ammo ${key} not found for item ${entry.name}`);
                } else {
                    if(!target.items.compatibleWeapon) {
                        target.items.compatibleWeapon = [];
                    }
                    target.items.compatibleWeapon.push(entry.name);
                }
            });
        })
    }
}