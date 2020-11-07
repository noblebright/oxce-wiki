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

    //Items from alienDeployments
    const deploymentItems = alienDeployments.data?.reduce((acc, deployment) => {
        deployment.itemSets.forEach(itemSet => {
            itemSet.forEach(item => {
                acc.add(item);
            });
        });
        return acc;
    }, new Set()) || null;
    backLinkSet(ruleset.entries, key, deploymentItems && [...deploymentItems], "items", "foundFrom");
    backLinkSet(ruleset.entries, key, [alienDeployments.missionBountyItem], "items", "foundFrom");

    //Items from terrain
    const terrainResults = alienDeployments.terrains?.reduce((acc, terrainKey) => {
        const terrain = ruleset.entries[terrainKey].terrains;
        const [items, randomItems] = acc;
        terrain.mapBlocks.forEach(block => {
            getMapBlockItems(block, items, randomItems);
        });
        return acc;
    }, [new Set(), new Set()]);

    const [terrainItems, terrainRandomItems] = terrainResults || [];

    if(terrainItems && terrainItems.size) {
        entry.alienDeployments.terrainItems = [...terrainItems];
        backLinkSet(ruleset.entries, key, [...terrainItems], "items", "foundFrom");
    }
    if(terrainRandomItems && terrainRandomItems.size) {
        entry.alienDeployments.terrainRandomItems = [...terrainRandomItems];
        backLinkSet(ruleset.entries, key, [...terrainItems], "items", "foundFrom");
    }

    //Items from UFOs
    const ufoResults = ufos.battlescapeTerrainData?.mapBlocks?.reduce((acc, block) => {
        const [items, randomItems] = acc;
        getMapBlockItems(block, items, randomItems);
        return acc;
    }, [new Set(), new Set()]);

    const [ufoItems, ufoRandomItems] = ufoResults || [];

    if(ufoItems && ufoItems.size) {
        entry.ufos.ufoItems = [...ufoItems];
        backLinkSet(ruleset.entries, key, [...ufoItems], "items", "foundFrom");
    }
    if(ufoRandomItems && ufoRandomItems.size) {
        entry.ufos.ufoRandomItems = [...ufoRandomItems];
        backLinkSet(ruleset.entries, key, [...ufoRandomItems], "items", "foundFrom");
    }

    //Items from Units
    const unitItems = units.builtInWeaponSets?.reduce((acc, weaponSet) => {
        weaponSet.forEach(item => acc.add(item));
        return acc;
    }, new Set());
    backLinkSet(ruleset.entries, key, unitItems && [...unitItems], "items", "foundFrom");    
}