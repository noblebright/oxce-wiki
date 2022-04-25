import { loadJSON } from "./utils";

export default class GithubLoader {
    constructor(repoName) {
        this.repoName = repoName;
    }

    getUrl(sha, path) {
        return `https://raw.githubusercontent.com/${this.repoName}/${sha}/${path}`;
    }

    async loadVersions(branchName = "master") {
        const branches = await loadJSON(`https://api.github.com/repos/${this.repoName}/branches`, true);
        const tags = await loadJSON(`https://api.github.com/repos/${this.repoName}/tags`, true);
        
        const branch = branches.find(x => x.name === branchName)
        this.versions = {
            [branchName]: branch.commit
        };

        tags.forEach(x => {
            this.versions[x.name] = x.commit;
        });
        return this.versions;
    }

    async loadSHA(sha, startPaths) {
        const commitUrl = `https://api.github.com/repos/${this.repoName}/commits/${sha}`;
        const commitData = await loadJSON(commitUrl, true);
        const treeUrl = commitData.commit.tree.url;
        const treeData = await loadJSON(`${treeUrl}?recursive=true`, true);
        const fileList = treeData.tree;
        
        const languageFiles = new Set();
        const ruleFiles = new Set();        
        fileList.forEach(file => {
            if(startPaths && !startPaths.find(x => file.path.startsWith(x))) {
                return;
            }
            if(file.path.match(/Language\/.*\.yml/)) {
                languageFiles.add(this.getUrl(sha, file.path));
            }
            if(file.path.match(/.*\.rul/)) {
                ruleFiles.add(this.getUrl(sha, file.path));
            }
        });
        return [languageFiles, ruleFiles];
    }

    async loadFileList(sha, startPaths) {
        const commitUrl = `https://api.github.com/repos/${this.repoName}/commits/${sha}`;
        const commitData = await loadJSON(commitUrl, true);
        const treeUrl = commitData.commit.tree.url;
        const treeData = await loadJSON(`${treeUrl}?recursive=true`, true);
        const fileList = treeData.tree;
        
        const languageFiles = {};
        const ruleFiles = {};
        fileList.forEach(file => {
            if(startPaths && !startPaths.find(x => file.path.startsWith(x))) {
                return;
            }
            if(file.path.match(/Language\/.*\.yml/)) {
                languageFiles[file.sha] = this.getUrl(sha, file.path);
            }
            if(file.path.match(/.*\.rul$/)) {
                ruleFiles[file.sha] = this.getUrl(sha, file.path);
            }
        });
        return [languageFiles, ruleFiles];
    }

    async load(version) {
        const versionRecord = this.versions[version];
        if(!versionRecord) {
            throw new Error(`Unknown version: ${version}. Did you loadVersions() first?`);
        }
        return this.loadSHA(versionRecord.sha);
    }
}