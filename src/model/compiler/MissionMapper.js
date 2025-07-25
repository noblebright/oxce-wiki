const LOOKUP_TABLES = ["deploymentsByGlobeTexture", "deploymentData"];

export function initializeLookups(lookups) {
  LOOKUP_TABLES.forEach((x) => {
    if (!lookups[x]) {
      lookups[x] = {};
    }
  });
}

function getWeightValues(weightObj) {
  const values = new Set();
  if (!weightObj) return values;

  Object.values(weightObj).forEach((x) => {
    //x is object of key/weight
    Object.keys(x).forEach((v) => {
      values.add(v);
    });
  });
  return values;
}

export function processGlobe(lookups, rules) {
  //eslint-disable-next-line no-unused-expressions
  rules.globe?.textures?.forEach?.((texture) => {
    if (!texture.deployments) return; //normal terrain, e.g. desert
    lookups.deploymentsByGlobeTexture[texture.id] = Object.keys(
      texture.deployments
    );
  });
}

function getGlobeTextures(regions, ruleset, scriptObj, spawnZone = -1) {
  const textureDeploys = new Set();
  regions.forEach((region) => {
    const regionObj = ruleset.lookups.regions[region];
    if (!regionObj) {
      console.error(
        `Region ${region} not found, referenced by ${scriptObj.type}`
      );
      return;
    }

    //TODO: Verify this behavior when spawnZone is invalid.
    if (spawnZone !== -1 && regionObj.missionZones.length > spawnZone) {
      const zone = regionObj.missionZones[spawnZone];
      zone.forEach(([lat, lng, width, height, id]) => {
        if (id) textureDeploys.add(id);
      });
    } else {
      regionObj.missionZones.forEach((zone) => {
        zone.forEach(([lat, lng, width, height, id]) => {
          if (id) textureDeploys.add(id);
        });
      });
    }
  });
  return [...textureDeploys]
    .map((id) => ruleset.lookups.deploymentsByGlobeTexture[id])
    .flat();
}

const backlinkSets = [];

function backlinkTriggers(
  ruleset,
  scriptObj,
  triggerSection,
  section,
  deployment
) {
  Object.keys(scriptObj[triggerSection]).forEach((key) => {
    if (!ruleset.entries[key][section]) {
      console.warn(
        `Unknown ${section} "${key}" found in missionScript ${scriptObj.type}`
      );
      return;
    }
    if (!ruleset.entries[key][section].$deploymentTrigger) {
      ruleset.entries[key][section].$deploymentTrigger = new Set();
      backlinkSets.push([key, section]);
    }
    ruleset.entries[key][section].$deploymentTrigger.add(deployment);
  });
}
const backLinkSections = [
  ["researchTriggers", "research"],
  ["itemTriggers", "items"],
  ["facilityTriggers", "facilities"],
];

function addDeploymentEntry(ruleset, deployment, script, race, craft) {
  if (!ruleset.lookups.deploymentData[deployment]) {
    ruleset.lookups.deploymentData[deployment] = {
      races: new Set(),
      crafts: new Set(),
      scripts: new Set(),
    };
  }
  const data = ruleset.lookups.deploymentData[deployment];
  const scriptObj = ruleset.lookups.missionScripts[script];
  if (!scriptObj) return;
  backLinkSections.forEach(([triggerSection, section]) => {
    if (scriptObj[triggerSection]) {
      backlinkTriggers(ruleset, scriptObj, triggerSection, section, deployment);
    }
  });
  data.races.add(race);
  if (craft) data.crafts.add(craft);
  data.scripts.add(script);
}

const processedMissions = new Set();
let extraMissions = {};
const addExtraMission = (ruleset, source, k, race) => {
  const missionObj = ruleset.lookups.alienMissions[k];
  missionObj.$spawnedFrom ??= new Set();
  missionObj.$spawnedFrom.add(source);
  extraMissions[k] ??= new Set();
  extraMissions[k].add(race);
};

function addDeploymentData(
  ruleset,
  script,
  race,
  craft,
  deployment,
  objective
) {
  if (craft) {
    // craft-based overrides
    const craftObj = ruleset.entries[craft]?.ufos;
    if (!craftObj) {
      console.error(
        `Unable to find entry for ufo ${craft}, referenced from script ${script}`
      );
    } else {
      if (craftObj.raceBonus?.[race]) {
        if (!objective) {
          deployment = craftObj.raceBonus[race].craftCustomDeploy || deployment;
        } else {
          deployment =
            craftObj.raceBonus[race].missionCustomDeploy || deployment;
        }
      } else {
        if (!objective) {
          deployment = craftObj.craftCustomDeploy || deployment;
        } else {
          deployment = craftObj.missionCustomDeploy || deployment;
        }
      }
    }
  }
  let deploymentObj = ruleset.entries[deployment]?.alienDeployments;
  if (!deploymentObj) {
    // This is only a warning, because it's expected behavior for e.g. fight-to-the-death HK UFOs
    console.warn(`Unable to find alienDeployment for key: ${deployment}`);
  } else {
    const upgradeMissions = [
      ...getWeightValues(deploymentObj.alienBaseUpgrades),
    ];
    const huntMissions = [...getWeightValues(deploymentObj.huntMissionWeights)];
    const genMissions = deploymentObj.genMission
      ? Object.keys(deploymentObj.genMission)
      : [];

    huntMissions.forEach((mission) =>
      addExtraMission(ruleset, deployment, mission, race)
    );
    genMissions.forEach((mission) =>
      addExtraMission(ruleset, deployment, mission, race)
    );

    upgradeMissions.forEach((mission) => {
      //Synthetic mission for base upgrade deployments
      const missionName = `UPGRADE$${mission}`;
      ruleset.lookups.alienMissions[missionName] ??= {
        type: missionName,
        objective: 2,
        $synthetic: true,
        siteType: mission,
      };
      addExtraMission(ruleset, deployment, missionName, race);
    });
    while (deploymentObj) {
      addDeploymentEntry(ruleset, deployment, script, race, craft);
      if (deploymentObj.nextStage) {
        deploymentObj =
          ruleset.entries[deploymentObj.nextStage]?.alienDeployments;
        if (!deploymentObj) {
          console.error(
            `Unable to find alienDeployment for key: ${deployment}`
          );
        }
      } else {
        deploymentObj = null;
      }
    }
  }
}

function handleTextureDeployment(
  ruleset,
  scriptObj,
  missionObj,
  regions,
  race,
  craft = null
) {
  if (missionObj.siteType) {
    // Option B
    addDeploymentData(
      ruleset,
      scriptObj.type,
      race,
      craft,
      missionObj.siteType
    );
  } else {
    // Option A
    const globeDeployments = getGlobeTextures(
      regions,
      ruleset,
      scriptObj,
      missionObj.spawnZone
    );
    globeDeployments.forEach((deploymentId) => {
      addDeploymentData(
        ruleset,
        scriptObj.type,
        race,
        craft,
        deploymentId,
        true
      );
    });
  }
}

// Comments below from: https://openxcom.org/forum/index.php/topic,6557.msg104669.html#msg104669
function compileSite(ruleset, scriptObj, missionObj, regions, race) {
  if (missionObj.objective === 2 && !missionObj.waves) {
    addDeploymentData(
      ruleset,
      scriptObj.type,
      race,
      undefined,
      missionObj.siteType ?? scriptObj.type
    );
    return;
  }
  if (
    missionObj.waves.length === 1 &&
    !ruleset.entries[missionObj.waves[0].ufo]?.ufos
  ) {
    // insta-pop site missions
    const ufo = missionObj.waves[0].ufo;

    if (ruleset.entries[ufo]?.alienDeployments) {
      // Type 1:
      // - no UFOs involved
      // - only 1 wave
      // - the wave specifies the alien deployment directly (e.g. `ufo: STR_ARTIFACT_SITE_P1 # spawn this site directly`)
      // - example (1): STR_ALIEN_ARTIFACT (TFTD)
      // Support for non-point areas: yes, without any additional ruleset changes required
      addDeploymentData(ruleset, scriptObj.type, race, null, ufo);
    } else {
      // Type 2:
      // - no UFOs involved
      // - only 1 wave
      // - the wave does NOT specify the alien deployment directly (e.g. `ufo: dummy #don't spawn a ufo, we only want the site`)
      //   -> option A: alien deployment is chosen randomly = from the area's texture definition
      //   -> option B: alien deployment is specified by the mission's `siteType` (overrides option A if both are defined)
      // - example (2A): STR_ALIEN_SHIP_ATTACK (TFTD)
      // - example (2B): none in vanilla, only mods
      handleTextureDeployment(ruleset, scriptObj, missionObj, regions, race);
    }
  } else {
    // Alien Terror-style mission, with ufos deploying into a site mission, can be shot down on the way in.
    // Type 3:
    // - with UFOs waves
    // - only 1 wave with `objective: true`
    // - the wave does NOT specify the alien deployment (because it already specifies the UFO type)
    //   -> option A: alien deployment is chosen randomly = from the area's texture definition
    //   -> option B: alien deployment is specified by the mission's `siteType` (overrides option A if both are defined)
    // - example (3A): STR_ALIEN_SURFACE_ATTACK (TFTD)
    // - example (3B): none in vanilla, only mods
    // Support for non-point areas: yes, but it is recommended to use one more wave attribute: `objectiveOnTheLandingSite: true`
    //   -> false: UFO always lands in the top-left corner of the area; site spawns randomly inside the area
    //   ->  true: UFO lands randomly inside the area; site spawns exactly on the UFO landing site
    if (missionObj.siteType) {
      addDeploymentData(
        ruleset,
        scriptObj.type,
        race,
        null,
        missionObj.siteType
      );
    }
    missionObj.waves.forEach((wave) => {
      addDeploymentData(ruleset, scriptObj.type, race, wave.ufo, wave.ufo);
      if (wave.objective) {
        handleTextureDeployment(
          ruleset,
          scriptObj,
          missionObj,
          regions,
          race,
          wave.ufo
        );
      }
    });
  }
}

function handleMission(
  mission,
  ruleset,
  script,
  regions,
  scriptRaces,
  processIfNoRace = false
) {
  const missionObj = ruleset.lookups.alienMissions[mission];
  if (!missionObj) {
    console.error(
      `Unable to find mission object ${mission} for script ${script.type}`
    );
    return;
  }
  processedMissions.add(mission);
  const missionRaces = getWeightValues(missionObj.raceWeights);
  // force processing of intercept-only missions
  const defaultedMissionRaces =
    processIfNoRace && !missionRaces.size ? new Set(["dummy"]) : missionRaces;
  const possibleRaces = scriptRaces.size ? scriptRaces : defaultedMissionRaces;
  possibleRaces.forEach((race) => {
    switch (missionObj.objective) {
      case 1: // infiltrations, work the same as terror (type 3) site-based missions
      case 2: // base-based missions
      case 3: // site-based missions
        compileSite(ruleset, script, missionObj, regions, race);
        break;
      default:
        const processUfo = (ufo) => {
          if (processIfNoRace && ruleset.entries[ufo].hide !== false) {
            console.log(`unhiding ufo: ${ufo}`);
            // set to false (as opposed to undefined) to force-show this ufo.
            // See RulesetCompiler for logic to hide deployments missing races.
            ruleset.entries[ufo].hide = false;
          }
          addDeploymentData(ruleset, script.type, race, ufo, ufo);
        };

        if (missionObj.spawnUfo) {
          processUfo(missionObj.spawnUfo);
        }

        missionObj.waves.forEach((wave) => {
          processUfo(wave.ufo);
        });
    }
  });
}
export function compileMissions(ruleset) {
  Object.values(ruleset.lookups.missionScripts).forEach((script) => {
    const missions = getWeightValues(script.missionWeights);
    const regions = getWeightValues(script.regionWeights);
    const scriptRaces = getWeightValues(script.raceWeights);
    missions.forEach((mission) =>
      handleMission(mission, ruleset, script, regions, scriptRaces)
    );
  });
  Object.entries(extraMissions).forEach(([mission, races]) => {
    //skip already processed missions
    if (processedMissions.has(mission)) return;

    // create synthetic missionScript for base-spawned missions
    const missionObj = ruleset.lookups.alienMissions[mission];
    const baseSpawnScript = {
      type: `BASE_SPAWN$${mission}`,
      $synthetic: true,
      $spawnedFrom: [...missionObj.$spawnedFrom],
    };
    ruleset.lookups.missionScripts[baseSpawnScript.type] ??= baseSpawnScript;
    // force processing for intercept-only missions
    handleMission(mission, ruleset, baseSpawnScript, new Set(), races, true);
  });

  // cleanup mission cache
  processedMissions.clear();
  extraMissions = {};

  // cleanup sets
  backlinkSets.forEach(([key, section]) => {
    ruleset.entries[key][section].$deploymentTrigger = [
      ...ruleset.entries[key][section].$deploymentTrigger,
    ];
  });

  backlinkSets.length = 0;
}
