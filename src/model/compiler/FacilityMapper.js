import { makeObjectPath } from "../utils";

export function mapPrisons(lookups, entry) {
    const prisons = lookups.prisons;
    if(entry?.facilities?.prisonType !== undefined) {
        const prisonType = entry.facilities.prisonType;
        if(!prisons[prisonType]) {
            prisons[prisonType] = { holds: new Set(), provides: new Set() };
        }
        prisons[prisonType].provides.add(entry.facilities.type);
    }
    if(entry?.items?.liveAlien) {
        const prisonType = entry.items.prisonType ?? 0;
        if(!prisons[prisonType]) {
            prisons[prisonType] = { holds: new Set(), provides: new Set() };
        }
        prisons[prisonType].holds.add(entry.items.type);
    }
}

const BUY = ["requiresBuyBaseFunc", "requiredToBuy"];
const serviceMapping = {
    facilities: [
        ["provideBaseFunc", "providedBy"],
        ["requiresBaseFunc", "requiredToBuild"],
        ["forbiddenBaseFunc", "preventsBuild"],
    ],
    crafts: [BUY],
    items: [BUY],
    soldiers: [BUY],
    soldierTransformation: [["requiresBaseFunc", "requiredToTransform"]],
    research: [["requiresBaseFunc", "requiredToResearch"]],
    manufacture: [["requiresBaseFunc", "requiredToManufacture"]]
}

let serviceCache;

export function mapServices(entry, id) {
    if(!serviceCache) serviceCache = {};
    Object.keys(entry).forEach(key => {
        if(serviceMapping[key]) {
            const entity = entry[key];
            const serviceTypes = serviceMapping[key];
            serviceTypes.forEach(([entityKey, serviceKey]) => {
                const services = entity[entityKey] ?? []; // e.g. research.requiresBaseFunc
                services.forEach(service => {
                    if(!serviceCache[service]) {
                        serviceCache[service] = {};
                    }
                    const serviceEntity = serviceCache[service];
                    if(!serviceEntity[serviceKey]) {
                        serviceEntity[serviceKey] = new Set();
                    }
                    serviceEntity[serviceKey].add(id); // e.g. entries["STR_SECTOID"].services["requiredToResearch"].add("STD_LAB")
                });
            })
        }
    });
}

function makeGlobalService(ruleset, varName, serviceKey) {
    if(ruleset.globalVars[varName]) {
        ruleset.globalVars[varName].forEach(service => {
            const serviceObj = makeObjectPath(ruleset.entries, [service, "services", "globals"]);
            serviceObj[serviceKey] = true;
        });
    }
}

export function resolveServices(ruleset) {
    const entries = ruleset.entries;
    Object.entries(serviceCache).forEach(([key, values]) => {
        if(!entries[key]) {
            entries[key] = {};
        }
        // services count as a reason to show the entity.
        delete entries[key].hide;
        const serviceObj = Object.entries(values).reduce((acc, [key, value]) => {
            acc[key] = [...value];
            return acc;
        }, {});
        entries[key].services = serviceObj;
    });
    serviceCache = undefined; //release cache when done. 
    makeGlobalService(ruleset, "hireEngineersRequiresBaseFunc", "requiredToHireEngineers");
    makeGlobalService(ruleset, "hireScientistsRequiresBaseFunc", "requiredToHireScientists");
}