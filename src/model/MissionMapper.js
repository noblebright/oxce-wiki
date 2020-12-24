const LOOKUP_TABLES = ["deploymentsById", "deploymentsByRegion", "missionsByRegion", "regionsByDeployment", "raceByRegion", "raceByMission", "missionsByDeployment", "deploymentsByMission", "raceByDeployment"];

function initializeLookups(lookups) {
    LOOKUP_TABLES.forEach(x => {
        if(!lookups[x]) {
            lookups[x] = {};
        }
    });
}

function processDeployments(lookups, rules) {
    //eslint-disable-next-line no-unused-expressions
    rules.globe?.textures?.forEach?.(texture => {
        if(!texture.deployments) return; //normal terrain, e.g. desert
        lookups.deploymentsById[texture.id] = Object.keys(texture.deployments);
    });
}

function deleteRelation(lookups, src, dest, srcKey) {
    const destKeys = lookups[src][srcKey] || new Set();
    destKeys.forEach(x => {
        lookups[dest][x].delete(srcKey);
    });
    delete lookups[src][srcKey];
}

function processRegions(lookups, rules) {
    //eslint-disable-next-line no-unused-expressions
    rules.regions?.forEach?.(region => {
        const {type, missionZones} = region;
        const missionIds = new Set();
        if(region.delete) {
            deleteRelation(lookups, "deploymentsByRegion", "regionsByDeployment", region.delete);
            delete lookups.missionsByRegion[region.delete];
            delete lookups.raceByRegion[region.delete];
            return;
        }
        //eslint-disable-next-line no-unused-expressions
        missionZones?.forEach(missionZoneList => {
            missionZoneList.forEach(missionZone => {
                if(missionZone.length <= 4) return; //A normal, non-deployment zone
                missionIds.add(missionZone[4]); //Add associated mission to list
            });
        });
        if(missionIds.size) {
            const deploymentsByRegion = [...missionIds].reduce((acc, x) => {
                if(!lookups.deploymentsById[x]) console.warn(`no deployment corresponding to region: ${x}`);
                lookups.deploymentsById[x].forEach(deployment => acc.add(deployment));
                return acc;
            }, new Set());
            lookups.deploymentsByRegion[type] = deploymentsByRegion;
            deploymentsByRegion.forEach(deployment => {
                lookups.regionsByDeployment[deployment] = lookups.regionsByDeployment[deployment] || new Set();
                lookups.regionsByDeployment[deployment].add(type);
            });
        }
    });
}

function getWeightValues(weightObj) {
    const values = new Set();
    if(!weightObj) return values;

    Object.values(weightObj).forEach(x => { //x is key-object pair of region/weight
        Object.keys(x).forEach(v => {
            values.add(v);
        });
    });
    return values;
}

function processMissionScripts(lookups, rules) {
    //eslint-disable-next-line no-unused-expressions
    rules.missionScripts?.forEach?.(script => {
        const regions = getWeightValues(script.regionWeights);
        const missions = getWeightValues(script.missionWeights);
        const races = getWeightValues(script.raceWeights);

        if(!regions.size) { // ufo-based missions
            missions.forEach(mission => {
                const deployments = lookups.deploymentsByMission[mission] || new Set();
                deployments.forEach(deployment => {
                    lookups.missionsByDeployment[deployment] = lookups.missionsByDeployment[deployment] || new Set();
                    lookups.missionsByDeployment[deployment].add(mission);
                    lookups.deploymentsByMission[mission] = lookups.deploymentsByMission[mission] || new Set();
                    lookups.deploymentsByMission[mission].add(deployment);
                    lookups.raceByDeployment[deployment] = lookups.raceByDeployment[deployment] || new Set();
                    races.forEach(race => {
                        lookups.raceByDeployment[deployment].add(race);
                    });
                });
                races.forEach(race => {
                    lookups.raceByMission[race] = lookups.raceByMission[race] || new Set();
                    lookups.raceByMission[race].add(mission);
                });
            });
        } else { // site-based missions
            regions.forEach(region => {
                lookups.missionsByRegion[region] = lookups.missionsByRegion[region] || new Set();
                lookups.raceByRegion[region] = lookups.raceByRegion[region] || new Set();
                missions.forEach(mission => {
                    lookups.missionsByRegion[region].add(mission);
                    const deployments = lookups.deploymentsByRegion[region] || new Set();
                    deployments.forEach(deployment => {
                        lookups.missionsByDeployment[deployment] = lookups.missionsByDeployment[deployment] || new Set();
                        lookups.missionsByDeployment[deployment].add(mission);
                    });
                });
                races.forEach(race => lookups.raceByRegion[region].add(race));
            });
        }
    })
}

function getDeployments(mission) {
    switch(mission.objective) {
        case 1: // infiltration
            return new Set(mission.siteType ? [mission.siteType] : []);
        case 2: // alien base
            return new Set(mission.siteType ? [mission.siteType] : ["STR_ALIEN_BASE_ASSAULT"]);
        case 3: // site-based missions
            return new Set();
        default: 
            return new Set(mission.waves.map(x => x.ufo));
    }
}

function processMissions(lookups, rules) {
    //eslint-disable-next-line no-unused-expressions
    rules.alienMissions?.forEach?.(mission => {
        if(mission.delete) {
            delete lookups.raceByMission[mission.delete];
            deleteRelation(lookups, "deploymentsByMission", "missionsByDeployment", mission.delete);
            return;
        }
        
        const races = getWeightValues(mission.raceWeights);
        //ignore ufos for site-type missions.
        const ufos = getDeployments(mission);
        lookups.raceByMission[mission.type] = races;
        
        lookups.deploymentsByMission[mission.type] = lookups.deploymentsByMission[mission.type] || new Set();
        ufos.forEach(deployment => { //ufos are also deployments for purposes of missions
            lookups.deploymentsByMission[mission.type].add(deployment);
            lookups.missionsByDeployment[deployment] = lookups.missionsByDeployment[deployment] || new Set();
            lookups.missionsByDeployment[deployment].add(mission.type);
        });
    })
}

export function joinRaces(lookups) {
    Object.entries(lookups.regionsByDeployment).forEach(([key, regions]) => {
        lookups.raceByDeployment[key] = lookups.raceByDeployment[key] || new Set();
        regions.forEach(region => {
            const races = lookups.raceByRegion[region] ?? new Set();
            races.forEach(x => lookups.raceByDeployment[key].add(x));
        });
    });
    Object.entries(lookups.missionsByDeployment).forEach(([key, missions]) => {
        lookups.raceByDeployment[key] = lookups.raceByDeployment[key] || new Set();
        missions.forEach(mission => {
            const races = lookups.raceByMission[mission] ?? new Set();
            races.forEach(x => lookups.raceByDeployment[key].add(x));
        });
    })
}

export function compileMissions(lookups, rules) {
    initializeLookups(lookups);

    processDeployments(lookups, rules);
    processRegions(lookups, rules);
    processMissionScripts(lookups, rules);
    processMissions(lookups, rules);
}
