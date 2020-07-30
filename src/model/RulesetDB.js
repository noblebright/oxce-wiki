import Dexie from "dexie";
import yaml from "js-yaml";
import deepmerge from "deepmerge";

import GithubLoader from "./GithubLoader";

const loadJSON = url => fetch(url).then(res => res.json());
const loadText = url => fetch(url).then(res => res.text());

let config;
async function getConfig(callback) {
    if(!config) {
        callback && callback("LOADING_CONFIG");
        config = await loadJSON("/config.json");
    }
    return Promise.resolve(config);
}

function initDexie() {
    const db = new Dexie("xcom");
    db.version(1).stores({
        versions: "repo,lastFetched",
        rulesets: "sha,lastFetched",
        precompiled: "[baseSha+modSha], lastFetched"
    });
    return db;
}

async function getVersions(db, repo, callback) {
    const repoVersions = await db.versions.get(repo);

    if(!repoVersions || ((Date.now() - repoVersions.lastFetched) <  - 1000 * 60 * 60 * 24)) {
        const loader = new GithubLoader(repo);
        const versions = await loader.loadVersions();
        console.log(`fetching version info for ${repo}...`);
        callback && callback(["LOADING_VERSIONS", repo]);
        await db.versions.put({ repo, lastFetched: Date.now(), versions });
        return versions;
    } 
    
    console.log(`cached version info found for ${repo}`);
    return repoVersions.versions;
}

async function getRuleset(db, repo, sha, path, callback) {
    const ruleset = await db.rulesets.get(sha);
    if(ruleset) {
        console.log(`cached ruleset info found for ${sha}...`);
        return ruleset;
    }
    const loader = new GithubLoader(repo);
    console.log(`loading filelist for ${repo}@${sha}`);
    callback && callback(["LOADING_FILELIST", repo, sha]);
    const fileList = await loader.loadSHA(sha, path);
    console.log(`generating ruleset for ${repo}@${sha}`);
    const newRuleset = await generateRuleset(fileList, callback);
    await db.rulesets.put({ sha, ruleset: newRuleset, lastFetched: Date.now() });
    return newRuleset;
}

async function generateRuleset([languageFiles, ruleFiles], callback) {
    const files = [...languageFiles, ...ruleFiles];
    let processed = 0;
    callback && callback(["LOADING_FILELIST", null, processed, files.length]);
    const promises = files.map(url => 
        loadText(url).then(x => {
            try {
                const result = yaml.safeLoad(x, { json: true });
                processed++;
                callback && callback(["LOADING_FILELIST", url, processed, files.length]);
                return result;
            } catch (e) {
                console.error(url);
                throw e;
            }
        })
    );
    const fileContents = await Promise.all(promises);
    return fileContents.reduce((acc, obj) => deepmerge(acc, obj));
}


export async function load(version, callback) {
    const db = initDexie();

    const {baseRepo, basePath, modRepo} = await getConfig(callback);

    const baseVersions = await getVersions(db, baseRepo, callback);
    const modVersions = await getVersions(db, modRepo, callback);

    const baseSha = baseVersions.master.sha; //
    const baseRuleset = await getRuleset(db, baseRepo, baseSha, basePath, callback);
    const modSha = modVersions[version]?.sha;

    if(!modSha) {
        throw new Error(`Unknown mod version: ${version}`);
    }

    const modRuleset = await getRuleset(db, modRepo, modSha, callback);
    callback && callback("LOAD_COMPLETE");
    return [baseRuleset, modRuleset];
}

window.xcom = load;