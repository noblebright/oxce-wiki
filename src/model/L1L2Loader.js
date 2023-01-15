import L1L2DB from "./L1L2DB";
import YamlService from "./YamlService";
import GithubLoader from "./GithubLoader";
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

async function loadRuleset({ repo, branch, path }, db, callback) {
    callback && callback(["LOADING_VERSIONS", repo]);
    const versions = await db.getVersions(repo, branch);
    if(!versions[branch]?.sha) {
        throw new Error(`Unknown module ref: ${repo}@${branch}`);
    }

    // get commit sha
    const sha = versions[branch].sha;

    // check L1
    callback && callback(["LOADING_FILELIST", repo, sha, 1]);
    const ruleset = await db.getRuleset(sha);
    if(ruleset) {
        console.log(`Found pre-computed ruleset for ${repo}@${branch}`);
        callback && callback(["LOADING_FILELIST_COMPLETE", repo, sha, 1]);
        return YamlService.hydrate(ruleset);
    }

    console.log(`L1 cache miss for ${repo}@${branch}`);
    const [languageFiles, ruleFiles, foldCase] = await db.getFileList(repo, sha, path);
    const files = [...Object.entries(languageFiles), ...Object.entries(ruleFiles)];
    
    //fetch all available files from L2
    const cacheFetch = await db.getL2(files.map(([fileSha, url]) => fileSha));
    const cacheMisses = [];
    
    const loader = new GithubLoader(repo);

    callback && callback(["LOADING_FILELIST", repo, sha, cacheFetch.length]);
    const promises = cacheFetch.map(async (record, i) => {
        const [fileSha, url] = files[i];

        // found in L2, so use that.
        if(record)  {
            callback && callback(["LOADING_FILE", url, 1]);
            return YamlService.hydrate(record.data);
        }

        //Fill in cache misses with network calls
        console.log(`cache miss on ${url}`);
        const text = await loadText(url);
        const result = YamlService.parse(text);
        if(!result) {
            console.warn(`Skipping empty file: ${url}`);
            callback && callback(["LOADING_FILE", url, 1]);
            return {};
        } else {
            const [rules] = result; // result is dehydrated, pull out the rules part for rewriting

            // mutate ruleset as necessary
            rewriteLocalization(rules);
            rewriteFilePaths(rules, loader, sha, foldCase);

            // only cache successfully parsed files
            cacheMisses.push({ fileSha, data: result, lastUsed: Date.now()});
        }
        callback && callback(["LOADING_FILE", url, 1]);
        return YamlService.hydrate(result);
    });

    const parsedFiles = await Promise.all(promises);
    
    // write new entries into L2, but don't wait.
    db.putL2(cacheMisses);

    console.log(`generating ruleset for ${repo}@${sha}`);
    const rawRuleset = YamlService.mergeList(parsedFiles);
    
    // write new entry into L1, but don't wait
    callback && callback(["LOADING_FILELIST_COMPLETE", repo, sha, 1]);
    db.putL1(sha, YamlService.dehydrate(rawRuleset));
    return rawRuleset;
}

export async function load(version, compiler, callback) {
    console.time("fullLoad");
    const db = new L1L2DB();
    await db.connect();

    callback && callback(["LOADING_CONFIG"]);
    const config = await db.getConfig();
    const modules = config.modules;
    modules.at(-1).branch = version; // patch in the version we want for the last module.

    let rulesList;
    try {
        rulesList = await Promise.all(modules.map(m => loadRuleset(m, db, callback)));
    } catch (e) {
        // If parsing goes south, delete the db.
        console.error(e);
        await db.delete();
        callback && callback(["ERROR", e]);
        console.timeEnd("fullLoad");
        throw e;
    }

    const supportedLanguages = getModuleSupportedLanguages(rulesList);
    console.log(`supported languages:`, supportedLanguages);
    callback && callback(["COMPILING_RULESET"]);
    await new Promise(r => setTimeout(r, 16)); //yield so react can update the progress bar
    const ruleset = compiler(rulesList, supportedLanguages);
    console.timeEnd("fullLoad");
    return { config, supportedLanguages, ruleset };
}

export async function updateLanguage(value) {
    const db = new L1L2DB();
    await db.connect();
    return db.config.put({ key: "currentLanguage", value });
}
  
export async function clearDB() {
    const db = new L1L2DB();
    await db.connect();
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
