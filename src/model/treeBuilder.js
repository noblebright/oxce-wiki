import { getLabel } from "./RuleLoader";

export function buildTechTree(rules, id, ctx = {}, maxDepth = 5) {
    const node = rules[id];
    const name = node.research.name;
    if(!ctx[name]) {
        ctx[name] = { id: name, depends: {}, unlockedBy: {}, seeAlso: {}};
    }
    const nodeDef = ctx[name];

    if(maxDepth === 0) {
        return ctx;
    }

    function processLink(base, attribute) {
        if(!base[attribute]) return;
        if(base[attribute].length < 10) {
            base[attribute].forEach(x => {
                nodeDef.seeAlso[x] = true;
                if(!ctx[x]) {
                    buildTechTree(rules, x, ctx, maxDepth - 1);
                }
            });
        } else {
            nodeDef.culled = true;
        }
    }

    if(node.research) {
        const research = node.research;
        processLink(research, "seeAlso");
        processLink(research, "unlockedBy");
        if(research.dependencies && (!research.unlockedBy || research.dependencies.length < 5)) {
            processLink(research, "dependencies");
        }
    }
    return ctx;
}

function subset(as, bs) { //a is a subset of b
    for (var a of as) if (!bs.has(a)) return false;
    return true;
}

export function buildCytoTree(rules, lc, id) {
    const normalizedTree = buildTechTree(rules, id);
    const elements = [];
    const depNodes = new Set();

    Object.keys(normalizedTree).forEach(id => {
        elements.push({ group: "nodes", data: { id, label: `${lc(id)}${normalizedTree[id].culled ? " (collapsed)" : ""}` }});
    });

    const nodeCount = elements.length;

    //separate pass for edges, because nodes need to exist first.
    Object.values(normalizedTree).forEach(({id, depends, unlockedBy, seeAlso}) => {
        Object.keys(unlockedBy).forEach(unlock => {
            const edgeId = `${unlock}=>${id}`;
            elements.push({ group: "edges", data: { id: edgeId, source: unlock, target: id }});
        });

        Object.keys(seeAlso).forEach(lookup => {
            const edgeId = `${lookup}=>${id}`;
            elements.push({ group: "edges", data: { id: edgeId, source: lookup, target: id }});
        });

        if(!subset(new Set(Object.keys(depends)), new Set(Object.keys(unlockedBy)))) { //don't show dep edges if all dep edges are also unlock edges
            if(Object.keys(depends).length > 1) {
                Object.keys(depends).forEach(dep => {
                    const depNodeId = `${id}_deps`;
                    if(!depNodes.has(depNodeId)) {
                        depNodes.add(depNodeId);
                        //all node
                        elements.push({ group: "nodes", data: { id: depNodeId, label: "all", synthetic: true }});
                        //all to id
                        elements.push({ group: "edges", data: { id: `${depNodeId}=>${id}`, source: depNodeId, target: id }});
                    }
                    const edgeId = `${dep}=>${depNodeId}`;
                    //dep to all
                    elements.push({ group: "edges", data: { id: edgeId, source: dep, target: depNodeId }});
                });
            } else if(Object.keys(depends).length > 0) { //if there's only 1 dep, that's functionally equivalent an unlock, no point in rendering the depNode
                const dep = Object.keys(depends)[0];
                const edgeId = `${dep}=>${id}`;
                elements.push({ group: "edges", data: { id: edgeId, source: dep, target: id }});
            }
        }
    });

    return { elements, nodeCount };
}