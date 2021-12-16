export function getPossibleRaces(id, ruleset) {
    const possibleRaces = new Set();
    const entry = ruleset.entries[id];
    const alienDeployments = entry.alienDeployments;
    const alienRace = alienDeployments?.race;
    const randomRace = alienDeployments?.randomRace;
    const prevStage = alienDeployments?.$prevStage;
    const raceByDeployment = ruleset.lookups.raceByDeployment;

    if(randomRace) randomRace.forEach(x => possibleRaces.add(x));
    if(alienRace) possibleRaces.add(alienRace);
    if(raceByDeployment[id]) {
        raceByDeployment[id].forEach(x => possibleRaces.add(x));
    }
    if(raceByDeployment[prevStage]) {
        raceByDeployment[prevStage].forEach(x => possibleRaces.add(x)); //check previous stage if this is the second part of a two-parter.
    }
    return possibleRaces;
}

function getSpawnedUnits(items, units, rs) {
    if(!items) return;
    items.forEach(k => {
        const item = rs.entries[k].items;
        if(item.spawnUnit) {
            units.add(item.spawnUnit);
        }
    });
}

export function mapUnitSources(backLinkSet, ruleset) {
    Object.keys(ruleset.lookups.raceByDeployment).forEach(deploymentKey => {
        const deploymentObj = ruleset.entries[deploymentKey]?.alienDeployments;

        if(!deploymentObj) {
            console.error(`No alienDeployment found for ${deploymentKey}!`);
            return;
        };

        const races = getPossibleRaces(deploymentKey, ruleset);

        if(!races.size) {
            console.error(`No races found for deployment ${deploymentKey}!`)
        }
        races.forEach(raceId => { //for each possible race
            const raceObj = ruleset.entries[raceId].alienRaces;
            if(!raceObj) {
                console.error(`No alienRaces found for ${raceId}!`);
                return;
            }

            const roster = raceObj.membersRandom ?? raceObj.members.map(x => [x]);
            deploymentObj.data.forEach(loadout => {  // for each loadout
                const potentialUnits = roster[loadout.alienRank];
                backLinkSet(ruleset.entries, deploymentKey, potentialUnits, "units", "$deployedIn");
            });
        });

        // Find units created via unit spawners
        const relatedUfoKey = deploymentObj.customUfo || deploymentKey;
        const relatedUfo = ruleset.entries[relatedUfoKey]?.ufos;
        if(relatedUfo) {
            const spawnedUnits = new Set();
            getSpawnedUnits(relatedUfo.ufoItems, spawnedUnits, ruleset);
            getSpawnedUnits(relatedUfo.ufoRandomItems, spawnedUnits, ruleset);
            ruleset.entries[deploymentKey].alienDeployments.$relatedUfo = relatedUfoKey;
            ruleset.entries[deploymentKey].alienDeployments.$spawnedUnits = [...spawnedUnits];
            backLinkSet(ruleset.entries, deploymentKey, [...spawnedUnits], "units", "$deployedIn");
        }
    });
}