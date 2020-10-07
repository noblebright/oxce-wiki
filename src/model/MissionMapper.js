const LOOKUP_TABLES = ["deploymentsById", "deploymentsByRegion", "missionsByRegion", "regionsByDeployment", "raceByRegion", "raceByMission", "missionsByDeployment", "deploymentsByMission"];

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

function deleteRelation(src, dest, srcKey) {
    const destKeys = lookups[src][key];
    destKeys.forEach(x => {
        lookups[dest][x].delete(srcKey);
    });
    delete lookups[src][key];
}

function processRegions(lookups, rules) {
    //eslint-disable-next-line no-unused-expressions
    rules.regions?.forEach?.(region => {
        const {type, missionZones} = region;
        const missionIds = new Set();
        if(region.delete) {
            deleteRelation("deploymentsByRegion", "regionsByDeployment", region.delete);
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
            lookups.deploymentsByRegion[type].forEach(deployment => {
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

        regions.forEach(region => {
            lookups.missionsByRegion[region] = lookups.missionsByRegion[region] || new Set();
            lookups.raceByRegion[region] = lookups.raceByRegion[region] || new Set();

            missions.forEach(mission => lookups.missionsByRegion[region].add(mission));
            races.forEach(race => lookups.raceByRegion[region].add(race));
        });
        
    })
}

function processMissions(lookups, rules) {
    //eslint-disable-next-line no-unused-expressions
    rules.alienMissions?.forEach?.(mission => {
        if(mission.delete) {
            delete lookups.raceByMission[mission.delete];
            deleteRelation("deploymentsByMission", "missionsByDeployment", mission.delete);
            return;
        }
        
        const races = getWeightValues(mission.raceWeights);
        //ignore ufos for site-type missions.
        const ufos = new Set(mission.objective === 3 ? [] : mission.waves.map(x => x.ufo);
        lookups.raceByMission[mission.type] = races;
        
        regions.forEach(region => {
            lookups.missionsByRegion[region] = lookups.missionsByRegion[region] || new Set();
            lookups.raceByRegion[region] = lookups.raceByRegion[region] || new Set();

            missions.forEach(mission => lookups.missionsByRegion[region].add(mission));
            races.forEach(race => lookups.raceByRegion[region].add(race));
        });
        
    })
}

export default function compileMissions(lookups, rules) {
    initializeLookups(lookups);

    processDeployments(lookups, rules);
    processRegions(lookups, rules);
    processMissionScripts(lookups, rules);
}
