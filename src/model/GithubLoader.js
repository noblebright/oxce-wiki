import { loadJSON } from "./utils.js";

export default class GithubLoader {
    constructor(repoName) {
        this.repoName = repoName;
    }

    getUrl(sha, path, foldCase) {
        const correctedPath = foldCase ? foldCase[path.toLowerCase()] : path;
        return `https://raw.githubusercontent.com/${this.repoName}/${sha}/${correctedPath}`;
    }

    async loadVersions(branchName = "master") {
        const [branches, tags] = await Promise.all([
            loadJSON(`https://api.github.com/repos/${this.repoName}/branches?per_page=100`, true),
            loadJSON(`https://api.github.com/repos/${this.repoName}/tags`, true)
        ]);

        const branch = branches.find(x => x.name === branchName)
        this.versions = {
            [branchName]: branch.commit
        };

        tags.forEach(x => {
            this.versions[x.name] = x.commit;
        });
        return this.versions;
    }

    async loadFileList(sha, startPaths) {
        const commitUrl = `https://api.github.com/repos/${this.repoName}/commits/${sha}`;
        const commitData = await loadJSON(commitUrl, true);
        const treeUrl = commitData.commit.tree.url;
        const treeData = await loadJSON(`${treeUrl}?recursive=true`, true);
        const fileList = treeData.tree;

        const languageFiles = {};
        const ruleFiles = {};
        const foldCase = {};

        fileList.forEach(file => {
            if (startPaths && !startPaths.find(x => file.path.startsWith(x))) {
                return;
            }

            // normalize case so we can properly rewrite asset paths
            foldCase[file.path.toLowerCase()] = file.path;

            if (file.path.match(/Language\/.*\.yml/)) {
                languageFiles[file.sha] = this.getUrl(sha, file.path);
            }
            if (file.path.match(/.*\.rul$/)) {
                ruleFiles[file.sha] = this.getUrl(sha, file.path);
            }
        });
        return [languageFiles, ruleFiles, foldCase];
    }
}