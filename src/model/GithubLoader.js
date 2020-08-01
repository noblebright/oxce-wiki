import { loadJSON } from "./utils";

export default class GithubLoader {
    constructor(repoName) {
        this.repoName = repoName;
    }

    async loadVersions() {
        const branches = await loadJSON(`https://api.github.com/repos/${this.repoName}/branches`);
        const tags = await loadJSON(`https://api.github.com/repos/${this.repoName}/tags`);
        
        const master = branches.find(x => x.name === "master")
        this.versions = {
            master: master.commit
        };

        tags.forEach(x => {
            this.versions[x.name] = x.commit;
        });
        return this.versions;
    }

    async loadSHA(sha, startPath) {
        const commitUrl = `https://api.github.com/repos/${this.repoName}/commits/${sha}`;
        const commitData = await loadJSON(commitUrl);
        const treeUrl = commitData.commit.tree.url;
        const treeData = await loadJSON(`${treeUrl}?recursive=true`);
        const fileList = treeData.tree;
        
        const languageFiles = new Set();
        const ruleFiles = new Set();        
        fileList.forEach(file => {
            if(startPath && !file.path.startsWith(startPath)) {
                return;
            }
            if(file.path.match(/Language\/.*\.yml/)) {
                languageFiles.add(`https://raw.githubusercontent.com/${this.repoName}/${sha}/${file.path}`);
            }
            if(file.path.match(/.*\.rul/)) {
                ruleFiles.add(`https://raw.githubusercontent.com/${this.repoName}/${sha}/${file.path}`);
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