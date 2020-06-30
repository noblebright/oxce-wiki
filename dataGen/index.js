const yaml = require("js-yaml");
const fs = require("fs");
let doc = yaml.safeLoad(fs.readFileSync("D:\\oxce\\user\\mods\\XComFiles\\Ruleset\\research_XCOMFILES.rul", "utf8"));
let xcom1 = yaml.safeLoad(fs.readFileSync("D:\\oxce\\standard\\xcom1\\research.rul", "utf8"));
let xcom1Labels = yaml.safeLoad(fs.readFileSync("D:\\oxce\\standard\\xcom1\\Language\\en-US.yml", "utf8"));
let labels = yaml.safeLoad(fs.readFileSync("D:\\oxce\\user\\mods\\XComFiles\\Language\\en-US.yml", "utf8"));
let en = labels["en-US"];
let graph = {};
let x1graph = {};

for(let item of doc.research) {
    if(item.delete || !item.name) continue; //skip deleting the existing stuff or weird malformed stuff
    const { name, cost, dependencies, needItem, unlocks } = item;
    graph[name] = { name, cost, dependencies, needItem, unlocks };
}

for(let item of xcom1.research) {
    if(item.delete || !item.name) continue; //skip deleting the existing stuff or weird malformed stuff
    const { name, cost, dependencies, needItem, unlocks } = item;
    x1graph[name] = { name, cost, dependencies, needItem, unlocks };
}

// { name, cost, dependencies, needItem, unlocks, leadsTo, unlockedBy }
let entries = [];

const addedFromVanilla = {};
const depsNodes = {};

function addNode(entries, name) {
    if(!graph[name] && !addedFromVanilla[name]) {
        addedFromVanilla[name] = true;
        const vanillaNode = x1graph[name];
        if(vanillaNode) {
            console.log(`ADDING FROM VANILLA: ${name}`);
            entries.push({ group: "nodes", data: { id: name, label: xcom1Labels[name] || labels[name] || name, cost: vanillaNode.cost, needItem: vanillaNode.needItem }});
        } else {
            console.log(`ADDING FROM MISSING: ${name}`);
            entries.push({ group: "nodes", data: { id: name, label: `MISSING NODE: ${name}`, missing: true }});
        }
    }
}

Object.values(graph).forEach(item => {
    entries.push({ group: "nodes", data: { id: item.name, cost: item.cost, needItem: item.needItem, label: en[item.name] || item.name }});
    if(item.unlocks) {
        item.unlocks.forEach(unlock => {            
            addNode(entries, unlock);
            entries.push({ group: "edges", data: { id: `${item.name}=>${unlock}`, source: item.name, target: unlock }});
        });
    }
    
    if(item.dependencies && item.dependencies.length > 0) {
        if(item.dependencies.length > 1) {
            const hasUnlocks = item.dependencies.find(key => graph[key] && graph[key].unlocks && graph[key].unlocks.includes(item.name));
            if(!hasUnlocks) { //only show dep tree if there's no way to unlock it normally.
                item.dependencies.forEach(dep => {
                    const depNode = `${item.name}_deps`;
                    addNode(entries, dep);
                    if(!depsNodes[depNode]) {
                        depsNodes[depNode] = true;
                        entries.push({ group: "nodes", data: { id: depNode, label: "all", synthetic: true }}); //make a deps node
                        entries.push({ group: "edges", data: { id: `${depNode}=>${item.name}`, source: `${item.name}_deps`, target: item.name }}); //deps node to real node
                    }                    
                    entries.push({ group: "edges", data: { id: `${dep}=>${depNode}`, source: dep, target: depNode }}); //deps to dep node
                });
            }
        } else { //effectively unlock, since only 1 dependency.
            const dep = item.dependencies[0];
            addNode(entries, dep);
            entries.push({ group: "edges", data: { id: `${dep}=>${item.name}`, source: dep, target: item.name }}); //single dep case
        }
        
    }
});

fs.writeFileSync("../public/graph.json", JSON.stringify(entries, null, 2));