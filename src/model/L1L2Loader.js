import L1L2DB from "./L1L2DB";
import YamlService from "./YamlService";
import { getModuleSupportedLanguages, loadText } from "./utils";

function rewriteFilePaths(ruleset, loader, sha, foldCase) {
    const rewriter = entry => {
        if(entry.fileSingle) {
            const path = entry.fileSingle;
            entry.fileSingle = loader.getUrl(sha, path, foldCase); //rewrite to github raw content url
        } else {
            Object.keys(entry.files ?? []).forEach(key => {
                const path = entry.files[key];
                entry.files[key] = loader.getUrl(sha, path, foldCase); //rewrite to github raw content url
            });
        }
    }
    ruleset.extraSprites && ruleset.extraSprites.forEach(rewriter);
    ruleset.extraSounds && ruleset.extraSounds.forEach(rewriter);
}

function rewriteLocalization(ruleset) {
    if(!ruleset.extraStrings) return;
    ruleset.extraStrings.forEach(({type, strings}) => {
        if(!ruleset[type]) {
            ruleset[type] = {};
        }
        Object.assign(ruleset[type], strings);
    });
}

async function loadRuleset({ repo, branch, path }, db, { onL2Miss }) {
    const versions = await db.getVersions(repo, branch);
    if(!versions[branch]?.sha) {
        throw new Error(`Unknown module ref: ${repo}@${branch}`);
    }

    // get commit sha
    const sha = versions[branch].sha;

    // check L1
    const ruleset = await db.getRuleset(sha);
    if(ruleset) {
        console.log(`Found pre-computed ruleset for ${repo}@${branch}`);
        return ruleset;
    }

    console.log(`L1 cache miss for ${repo}@${branch}`);
    const [languageFiles, ruleFiles, foldCase] = await db.getFileList(repo, sha, path);
    const files = [...Object.entries(languageFiles), ...Object.entries(ruleFiles)];
    
    //fetch all available files from L2
    const cacheFetch = await db.files.bulkGet(files.map(([fileSha, url]) => fileSha));
    const cacheMisses = [];
    
    //Fill in cache misses with network calls
    const promises = cacheFetch.map(async (record, i) => {
        if(record) return record.data;

        const [sha, url] = files[i];
        console.log(`cache miss on ${url}`);
        const text = await loadText(url);
        const result = YamlService.parse(text);
        if(!result) {
            console.warn(`Skipping empty file: ${url}`);
        }
        cacheMisses.push({ fileSha: sha, data: result ?? {}, lastUsed: Date.now()});
        return result ?? {};
    });

    const parsedFiles = await Promise.all(promises);
    
    // write new entries into L2, but don't wait.
    db.putL2(cacheMisses);

    console.log(`generating ruleset for ${repo}@${sha}`);
    const rawRuleset = YamlService.mergeList(parsedFiles);
    const loader = new GithubLoader(repo);
    
    // mutators
    rewriteLocalization(rawRuleset);
    rewriteFilePaths(rawRuleset, loader, sha, foldCase);

    // write new entry into L1, but don't wait
    db.putL1(rawRuleset);
    return rawRuleset;
}

export async function load(version, compiler, callback) {
    const db = new L1L2DB(callback);
    await db.connect();

    const config = await db.getConfig();
    const modules = config.modules;
    modules.at(-1).branch = version; // patch in the version we want for the last module.

    let rulesList;
    try {
        ruleLists = await Promise.all(modules.map(module => loadRuleset(module, db)));
    } catch (e) {
        // If parsing goes south, delete the db.
        console.error(e);
        await db.delete();
        throw e;
    }

    const supportedLanguages = getModuleSupportedLanguages(modules);
    console.log(`supported languages:`, supportedLanguages);
    callback && callback(["COMPILING_RULESET"]);
    const ruleset = compiler(rulesList, supportedLanguages);

    return { config, supportedLanguages, ruleset };
}

export async function updateLanguage(value) {
    return db.config.put({ key: "currentLanguage", value });
}
  
export async function clearDB() {
    await db.delete();
    window.location.reload();
}
  
export async function getMetadata(callback) {
    const db = new L1L2DB(callback);
    await db.connect();
    let result;
    try {
        const config = await db.getConfig();
        const currentLanguage = await db.getCurrentLanguage();
        const { repo, branch } = config.modules[config.modules.length - 1];
        const modVersions = await db.getVersions(repo, branch);
        result = { modVersions, config, currentLanguage, defaultVersion: branch };
    } catch (e) {
        await db.delete();
    }

    return result;
}
