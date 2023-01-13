import { loadJSON } from "./utils";
import GithubLoader from "./GithubLoader";
import FallbackDB from "./FallbackDB";

function initDexie() {
    const db = new Dexie("xcom");
    
    db.version(3).stores({
        config: "key",
        versions: "repo,lastFetched",
        files: "fileSha,lastUsed",
        rulesets: "sha,lastUsed",
        fileList: "sha,lastUsed",
        precompiled: null
    });
    return db;
}

let dbConn;

async function getDB() {
    try {
        if(dbConn) {
            return dbConn;
        }
        const db = initDexie();
        await db.open();
        return db;
    } catch (e) {
        return FallbackDB;
    }
}

async function checkCache(cacheFn, missFn, expiresInHours, hitFn) {
    const cachedObj = await cacheFn();
    if(!cachedObj || !cachedObj.lastFetched || ((Date.now() - cachedObj.lastFetched) > (1000 * 60 * 60 * expiresInHours))) { //check once per day
        return await missFn();
    } else {
        hitFn?.();
        return cachedObj;
    }
    
}

class L1L2DB {
    constructor(callback) {
        this.callback = callback;
    }

    async connect() {
        this.db = await getDB();
    }

    async getCurrentLanguage() {
        return await this.db.config.get("currentLanguage");
    }
    
    async getConfig() {
        const callback = this.callback;
        return checkCache(
            async () => this.db.config.get("config"),
            async () => {
                callback && callback(["LOADING_CONFIG"]);
                const config = await loadJSON("/config.json");
                config.lastFetched = Date.now();
                await db.config.clear();
                await db.config.put({key: "config", ...config });
                return config;
            },
            24
        );
    }
    
    async getVersions(repo, branchName) {
        const callback = this.callback;
        return checkCache(
            async () => this.db.versions.get(repo),
            async () => {
                const loader = new GithubLoader(repo);
                const versions = await loader.loadVersions(branchName);
                console.log(`fetching version info for ${repo}...`);
                callback && callback(["LOADING_VERSIONS", repo]);
                await db.versions.put({ repo, lastFetched: Date.now(), versions });
                return versions;
            },
            1,
            () => console.log(`cached version info found for ${repo}`)
        )
    }

    async getFileList(repo, sha, path) {
        const callback = this.callback;
        const cachedList = await this.db.fileList.get(sha);
        if(cachedList) {
            console.log(`cached file list found for ${sha}...`);
            return cachedList.fileList;
        }
        
        const loader = new GithubLoader(repo);
        console.log(`loading filelist for ${repo}@${sha}`);
        callback && callback(["LOADING_FILELIST", repo, sha]);
        const fileList = await loader.loadFileList(sha, path);
        await db.fileList.put({ sha, fileList, lastUsed: Date.now() });
        return fileList;
    }

    async getRuleset(sha) {
        const cachedRuleset = await this.db.rulesets.get(sha);
        if(cachedRuleset) {
            console.log(`Pre-parsed ruleset found for ${sha}...`);
            return cachedRuleset.fileList;
        }
        return null;
    }

    async delete() {
        this.db.delete();
    }

    async putL2(l2Entries) {
        this.db.files.bulkPut(l2Entries);
    }

    async putL1(entry) {
        this.db.rulesets.put(entry);
    }
}

export default L1L2DB;