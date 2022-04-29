import Dexie from "dexie";
import yaml from "js-yaml";
import deepmerge from "deepmerge";

import { loadJSON, loadText, getModuleSupportedLanguages } from "./utils";
import GithubLoader from "./GithubLoader";
import FallbackDB from "./FallbackDB";
import { schema } from "./YamlSchema";

function initDexie() {
    const db = new Dexie("xcom");
    
    db.version(2).stores({
        config: "key",
        versions: "repo,lastFetched",
        files: "fileSha,lastUsed",
        rulesets: null,
        fileList: "sha,lastFetched",
        precompiled: null
    });
    return db;
}

async function getDB() {
    try {
        const db = initDexie();
        await db.open();
        return db;
    } catch (e) {
        return FallbackDB;
    }
}

let db;

async function getConfig(callback) {
    const configObj = await db.config.get("config");
    if(!configObj || !configObj.lastFetched || ((Date.now() - configObj.lastFetched) > (1000 * 60 * 60 * 24))) { //check once per day
        callback && callback(["LOADING_CONFIG"]);
        const config = await loadJSON("/config.json");
        config.lastFetched = Date.now();
        await db.config.clear();
        await db.config.put({key: "config", ...config });
        return config;
    }
    return configObj;
}

async function getVersions(repo, branchName, callback) {
    const repoVersions = await db.versions.get(repo);
    
    if(!repoVersions || !repoVersions.lastFetched || ((Date.now() - repoVersions.lastFetched) > (1000 * 60 * 60))) { //check once per hour
        const loader = new GithubLoader(repo);
        const versions = await loader.loadVersions(branchName);
        console.log(`fetching version info for ${repo}...`);
        callback && callback(["LOADING_VERSIONS", repo]);
        await db.versions.put({ repo, lastFetched: Date.now(), versions });
        return versions;
    } 
    
    console.log(`cached version info found for ${repo}`);
    return repoVersions.versions;
}

function rewriteFilePaths(ruleset, loader, sha) {
    const rewriter = entry => {
        if(entry.fileSingle) {
            const path = entry.fileSingle;
            entry.fileSingle = loader.getUrl(sha, path); //rewrite to github raw content url
        } else {
            Object.keys(entry.files ?? []).forEach(key => {
                const path = entry.files[key];
                entry.files[key] = loader.getUrl(sha, path); //rewrite to github raw content url
            });
        }
    }
    ruleset.extraSprites && ruleset.extraSprites.forEach(rewriter);
    ruleset.extraSounds && ruleset.extraSounds.forEach(rewriter);
    return ruleset;
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

async function getFileList(repo, sha, path, callback) {
    const cachedList = await db.fileList.get(sha);
    if(cachedList) {
        console.log(`cached file list found for ${sha}...`);
        return cachedList.fileList;
    }
    
    const loader = new GithubLoader(repo);
    console.log(`loading filelist for ${repo}@${sha}`);
    callback && callback(["LOADING_FILELIST", repo, sha]);
    const fileList = await loader.loadFileList(sha, path);
    await db.fileList.put({ sha, fileList, lastFetched: Date.now() });
    return fileList;
}

async function generateRuleset(module, db, callback) {
    const [languageFiles, ruleFiles] = module.fileList;
    const files = [...Object.entries(languageFiles), ...Object.entries(ruleFiles)];
    let processed = 0;
    //fetch all available files from indexDB
    const cacheFetch = await db.files.bulkGet(files.map(([fileSha, url]) => fileSha));
    const cacheMisses = [];

    //Fill in cache misses with network calls
    const promises = cacheFetch.map(async (record, i) => {
        if(record) return record.data;

        const [sha, url] = files[i];
        console.log(`cache miss on ${url}`);
        return loadText(url).then(text => {
            cacheMisses.push({ fileSha: sha, data: text, lastUsed: Date.now()});
            return text;
        });
    });
    const textContents = await Promise.all(promises);
    //after the bodies are loaded, store all cache misses in one shot
    await db.files.bulkPut(cacheMisses);
    const fileContents = [];
    for(let processed = 0; processed < textContents.length; processed++) {
        const rawText = textContents[processed];
        const url = files[processed][1];
        try {
            const result = yaml.load(rawText, { json: true, schema });
            callback && callback(["LOADING_FILE", url, processed, files.length]);
            await new Promise(r => setTimeout(r, 16)); //yield so react can update the progress bar
            fileContents.push(result);
        } catch (e) {
            console.error(url);
            throw e;
        }
    }
    console.log(`generating ruleset for ${module.repo}@${module.commit}`);
    const rawRuleset = fileContents.reduce((acc, obj) => deepmerge(acc, obj, { clone: false }));
    const loader = new GithubLoader(module.repo);
    
    rewriteLocalization(rawRuleset);
    return rewriteFilePaths(rawRuleset, loader, module.commit);
}

export async function updateLanguage(value) {
  return db.config.put({ key: "currentLanguage", value });
}

export async function clearDB() {
    await db.delete();
    window.location.reload();
}

export async function getMetadata(callback) {
    if(!db) {
        db = await getDB();
    }
    const config = await getConfig();
    const currentLanguage = await db.config.get("currentLanguage");
    const { repo, branch } = config.modules[config.modules.length - 1];
    const modVersions = await getVersions(repo, branch, callback);

    return { modVersions, config, currentLanguage };
}

function getCommit(module, modules, i, version) {
  let modVersion;
  if(i === modules.length - 1) {
    modVersion = version;
  } else {
    modVersion = modules[i].branch;
  }
  if(!module.versions[modVersion]?.sha) {
    throw new Error(`Unknown module ref: ${module.repo}@${modVersion}`);
  }

  //decorate module with commit
  return Promise.resolve(module.versions[modVersion]?.sha);
}

const loadPipeline = [
  { key: "versions", loader: (module, callback) => getVersions(module.repo, module.branch, callback) },
  { key: "commit", loader: (module, callback, { i, modules, version }) => getCommit(module, modules, i, version) },
  { key: "fileList", loader: (module, callback) => getFileList(module.repo, module.commit, module.path, callback) },
  { key: "ruleset", loader: (module, callback) => generateRuleset(module, db, callback) }
];

export async function load(version, compiler, callback) {
    if(!db) {
        db = await getDB();
    }
    const config = await getConfig();
    const modules = config.modules;

    for(const stage of loadPipeline) {
      console.time(stage.key);
      for(let i = 0; i < modules.length; i++) {
        const module = modules[i];
        modules[i][stage.key] = await stage.loader(module, callback, { i, modules, version });
      }
      console.timeEnd(stage.key);
    }


    const supportedLanguages = getModuleSupportedLanguages(modules);
    console.log(`supported languages:`, supportedLanguages);
    callback && callback(["COMPILING_RULESET"]);
    const rulesList = modules.map(x => x.ruleset);
    const ruleset = compiler(rulesList, supportedLanguages);
    return { config, supportedLanguages, ruleset };
}

window.xcom = load;
window.dexie = Dexie;