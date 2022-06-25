export function getPossibleRaces(id, ruleset) {
    const possibleRaces = new Set();
    const entry = ruleset.entries[id];
    const alienDeployments = entry.alienDeployments;
    const alienRace = alienDeployments?.race;
    const randomRace = alienDeployments?.randomRace;
    const prevStage = alienDeployments?.$prevStage;
    const deploymentData = ruleset.lookups.deploymentData;

    if(randomRace) randomRace.forEach(x => possibleRaces.add(x));
    if(alienRace) possibleRaces.add(alienRace);
    if(deploymentData[id]) {
        deploymentData[id].races.forEach(x => possibleRaces.add(x));
    }
    if(prevStage) {
        prevStage.forEach(stage => {
            getPossibleRaces(stage, ruleset).forEach(x => possibleRaces.add(x));
        });
    }
    
    return possibleRaces;
}

function getSpawnedUnits(items, units, rs) {
    if(!items) return;
    items.forEach(k => {
        if(!rs.entries[k]) { 
            console.error(`Item Key ${k} not found when looking for spawned units`);
            return;
        }
        const item = rs.entries[k].items;
        if(item.spawnUnit) {
            units.add(item.spawnUnit);
        }
    });
}

function getRelatedUfos(key, ruleset) {
    const entry = ruleset.entries[key];
    const deployment = entry.alienDeployments;
    const ufo = entry.ufos;
    const related = [];

    if(deployment.customUfo) {
        related.push(deployment.customUfo);
    } else if(ufo) {
        related.push(key);
        const customRaceUfos = new Set();
        Object.values(ufo.raceBonus ?? {}).forEach(({ craftCustomDeploy }) => { if(craftCustomDeploy) customRaceUfos.add(craftCustomDeploy) });
        related.push(...customRaceUfos);
    }
    return related;
}

export function mapUnitSources(backLinkSet, ruleset) {
    Object.keys(ruleset.entries).filter(x => ruleset.entries[x].alienDeployments).forEach(deploymentKey => {
        const deploymentObj = ruleset.entries[deploymentKey]?.alienDeployments;

        if(!deploymentObj) {
            console.error(`No alienDeployment found for ${deploymentKey}!`);
            return;
        };

        const races = getPossibleRaces(deploymentKey, ruleset);

        if(!races.size) {
            console.warn(`No races found for deployment ${deploymentKey}!`)
        }
        races.forEach(raceId => { //for each possible race
            const raceObj = ruleset.entries[raceId]?.alienRaces;
            if(!raceObj) {
                console.error(`No alienRaces ${raceId} found for ${deploymentKey}!`);
                return;
            }

            const roster = raceObj.membersRandom ?? raceObj.members.map(x => [x]);
            //normal deployments
            deploymentObj.data.forEach(loadout => {  // for each loadout
                const potentialUnits = loadout.customUnitType ? [loadout.customUnitType] : roster[loadout.alienRank];
                backLinkSet(ruleset.entries, deploymentKey, potentialUnits, "units", "$deployedIn");
            });

            // look at reinforcements.
            //eslint-disable-next-line no-unused-expressions
            deploymentObj.reinforcements?.forEach(reinforcement => {
                reinforcement.data.forEach(loadout => {  // for each loadout
                    const potentialUnits = loadout.customUnitType ? [loadout.customUnitType] : roster[loadout.alienRank];
                    backLinkSet(ruleset.entries, deploymentKey, potentialUnits, "units", "$deployedIn");
                });
            });
        });

        const spawnedUnits = new Set();
        // look at terrain items for spawners
        getSpawnedUnits(deploymentObj.$terrainItems, spawnedUnits, ruleset);
        getSpawnedUnits(deploymentObj.$terrainRandomItems, spawnedUnits, ruleset);

        // Find units created via unit spawners
        const relatedUfoKeys = getRelatedUfos(deploymentKey, ruleset).concat(deploymentObj.$customCrafts || []);
        const relatedUfos = relatedUfoKeys.map(k => ruleset.entries[k]?.ufos || ruleset.entries[k]?.crafts);
        ruleset.entries[deploymentKey].alienDeployments.$relatedUfos = relatedUfoKeys;


        //not all relatedUfos are real, some are variants that are deployment only.
        relatedUfos.filter(x => x).forEach(relatedUfo => {
            getSpawnedUnits(relatedUfo.$ufoItems, spawnedUnits, ruleset);
            getSpawnedUnits(relatedUfo.$ufoRandomItems, spawnedUnits, ruleset);
        });
        ruleset.entries[deploymentKey].alienDeployments.$spawnedUnits = [...spawnedUnits];
        backLinkSet(ruleset.entries, deploymentKey, [...spawnedUnits], "units", "$deployedIn");
    });
}
