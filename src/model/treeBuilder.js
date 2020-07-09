import { getLabel } from "./RuleLoader";

export function buildTechTree(rules, id, ctx = {}, maxDepth = 5) {
    const node = rules[id];
    if(!ctx[node.name]) {
        ctx[node.name] = { id: node.name, depends: {}, unlockedBy: {}, lookupOf: {}};
    }
    const nodeDef = ctx[node.name];

    if(maxDepth === 0) {
        return ctx;
    }
    
    if(node.research) {
        const research = node.research;
        if(research.lookupOf) {
            if(research.lookupOf.length < 10) {
                research.lookupOf.forEach(x => {
                    nodeDef.lookupOf[x] = true;
                    if(!ctx[x]) {
                        buildTechTree(rules, x, ctx, maxDepth - 1);
                    }
                });
            } else {
                nodeDef.culled = true;
            }
        }
        if(research.unlockedBy) {
            if(research.unlockedBy.length < 10) {
                research.unlockedBy.forEach(x => {
                    nodeDef.unlockedBy[x] = true;
                    if(!ctx[x]) {
                        buildTechTree(rules, x, ctx, maxDepth - 1);
                    }
                });
            } else {
                nodeDef.culled = true;
            }
        }
        if(research.dependencies && (!research.unlockedBy || research.dependencies.length < 5)) {
            if(research.dependencies.length < 10) {
                research.dependencies.forEach(x => {
                    nodeDef.depends[x] = true;
                    if(!ctx[x]) {
                        buildTechTree(rules, x, ctx, maxDepth - 1);
                    }
                });
            } else {
                nodeDef.culled = true;
            }
        }
    }
    return ctx;
}

function eqSet(as, bs) {
    if (as.size !== bs.size) return false;
    for (var a of as) if (!bs.has(a)) return false;
    return true;
}

export function buildCytoTree(rules, locale, id) {
    const normalizedTree = buildTechTree(rules, id);
    const elements = [];
    const depNodes = new Set();

    Object.keys(normalizedTree).forEach(id => {
        elements.push({ group: "nodes", data: { id, label: `${getLabel(id, locale)}${normalizedTree[id].culled ? " (collapsed)" : ""}` }});
    });

    //separate pass for edges, because nodes need to exist first.
    Object.values(normalizedTree).forEach(({id, depends, unlockedBy, lookupOf}) => {
        Object.keys(unlockedBy).forEach(unlock => {
            const edgeId = `${unlock}=>${id}`;
            elements.push({ group: "edges", data: { id: edgeId, source: unlock, target: id }});
        });

        Object.keys(lookupOf).forEach(lookup => {
            const edgeId = `${lookup}=>${id}`;
            elements.push({ group: "edges", data: { id: edgeId, source: lookup, target: id }});
        });

        if(!eqSet(new Set(Object.keys(unlockedBy)), new Set(Object.keys(depends)))) { //don't show dep edges if all dep edges are also unlock edges
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

    return elements;
}