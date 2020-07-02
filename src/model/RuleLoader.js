import yaml from "js-yaml";

export function getLabel(entry, locale = "en-US") {
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
            .then(() => Promise.resolve({rules: this.rules , strings: this.strings}));
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
        
    }
}