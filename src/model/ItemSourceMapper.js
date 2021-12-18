const terrainGroupCache = {};

function getTerrainGroups(terrainKey, ruleset) {
    const terrainObj = ruleset.lookups.terrains[terrainKey];
    
    if(!terrainGroupCache[terrainKey]) {
        if(!terrainObj) {
            console.error(`No mapBlocks found for terrainKey ${terrainKey}`);
        }
        terrainGroupCache[terrainKey] = terrainObj.mapBlocks.reduce((acc, block, idx) => {
            // concat handles both array and non-arrays
            const groups = [].concat(block.groups || 0);
            groups.forEach(groupIdx => { 
                acc[groupIdx] = (acc[groupIdx] || []); 
                acc[groupIdx].push(idx); // id of a mapBlock is its index in the array.
            }); 
            return acc;
        }, []);
    }
    return terrainGroupCache[terrainKey];
}

function getMapBlockItems(block, items, randomItems) {
    if(block.items) {
        Object.keys(block.items).forEach(x => items.add(x));
    }
    if(block.randomizedItems) {
        block.randomizedItems.forEach(random => {
            random.itemList.forEach(x => randomItems.add(x));
        })
    }
}

export function mapItemSources(backLinkSet, ruleset, key) {
    const entry = ruleset.entries[key];
    const alienDeployments = entry.alienDeployments || {};
    const ufos = entry.ufos || {};
    const units = entry.units || {};

    //Items from UFOs
    const ufoResults = ufos.battlescapeTerrainData?.mapBlocks?.reduce((acc, block) => {
        const [items, randomItems] = acc;
        getMapBlockItems(block, items, randomItems);
        return acc;
    }, [new Set(), new Set()]);

    const [ufoItems, ufoRandomItems] = ufoResults || [];

    if(ufoItems && ufoItems.size) {
        entry.ufos.ufoItems = [...ufoItems];
        backLinkSet(ruleset.entries, key, [...ufoItems], "items", "$foundFrom");
    }
    if(ufoRandomItems && ufoRandomItems.size) {
        entry.ufos.ufoRandomItems = [...ufoRandomItems];
        backLinkSet(ruleset.entries, key, [...ufoRandomItems], "items", "$foundFrom");
    }

    //Items from Units
    const unitItems = units.builtInWeaponSets?.reduce((acc, weaponSet) => {
        weaponSet.forEach(item => acc.add(item));
        return acc;
    }, new Set());
    backLinkSet(ruleset.entries, key, unitItems && [...unitItems], "items", "$foundFrom");

    const [deploymentItems, deploymentRandomItems] = getDeploymentItems(alienDeployments, ruleset);
    backLinkSet(ruleset.entries, key, deploymentItems && [...deploymentItems], "items", "$foundFrom");
    backLinkSet(ruleset.entries, key, deploymentRandomItems && [...deploymentRandomItems], "items", "$foundFrom");
}

function handleCommand(command, terrainKey, ruleset, items, randomItems) {
    let blockObjs;
    
    //FIXME: Too lazy to do real lookups on globe geometry, default globeTerrain special value
    if(terrainKey === "globeTerrain") {
        terrainKey = Object.keys(ruleset.lookups.terrains)[0];
    }

    const terrainObj = ruleset.lookups.terrains[terrainKey];

    if(command.blocks !== undefined) { // direct index of blocks. could be numeric 0
        // concat handles both array and non-arrays
        blockObjs = [].concat(command.blocks).map(blockId => terrainObj.mapBlocks[blockId]);
    } else { // groups
        const groupCache = getTerrainGroups(terrainKey, ruleset);
        // concat handles both array and non-arrays
        blockObjs = [].concat(command.groups || 0).map(groupId => groupCache[groupId]).filter(x => x).flat().map(blockId => terrainObj.mapBlocks[blockId]);
    }

    blockObjs.filter(x => x.items || x.randomizedItems).forEach(block => {
        getMapBlockItems(block, items, randomItems);
    });
}

function getDeploymentItems(alienDeployments, ruleset) {
    const items = new Set();
    const randomItems = new Set();

    //Items from alienDeployments
    //eslint-disable-next-line no-unused-expressions
    alienDeployments.data?.forEach(deployment => {
        deployment.itemSets.forEach(itemSet => {
            itemSet.forEach(item => {
                items.add(item);
            });
        });
    });

    //eslint-disable-next-line no-unused-expressions
    alienDeployments.terrains?.forEach(terrainKey => {
        const baseTerrain = ruleset.lookups.terrains[terrainKey];
        const scriptKey = alienDeployments.script ?? baseTerrain.script ?? "DEFAULT";
        const script = ruleset.lookups.mapScripts[scriptKey];
        
        script.commands.filter(x => x.type === "addBlock").forEach(command => { //for each command
            const commandTerrains = new Set(command.randomTerrain || [command.terrain || terrainKey]);
            
            commandTerrains.forEach(commandTerrainKey => { //for each possible terrain for this command
                if(command.verticalLevels !== undefined) { //towers and shit
                    command.verticalLevels.forEach(levelCommand => { //for each level
                        const levelTerrains = new Set(levelCommand.randomTerrain || [levelCommand.terrain || commandTerrainKey]);
                        levelTerrains.forEach(levelTerrainKey => { // for each possible terrain in the level
                            handleCommand(levelCommand, levelTerrainKey, ruleset, items, randomItems);
                        });
                    });
                } else {
                    handleCommand(command, commandTerrainKey, ruleset, items, randomItems);
                }
            })
        });
    });
    return [items, randomItems];
}