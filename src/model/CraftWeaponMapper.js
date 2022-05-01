export function getCraftSlots(crafts) {
    const slotTypes = new Set();
    if(!crafts || !crafts.weaponTypes) return slotTypes;

    for(let i = 0; i < crafts.weaponTypes.length; i++) {
        let types = crafts.weaponTypes[i];
        if(!Array.isArray(types)) { types = [types]; }
        types.forEach(type => {
            slotTypes.add(type);
        });
    }
    return slotTypes;
}

export function mapCraftsWeapons(lookups, entry) {
    // craft weapon mappings
    const craftWeapons = entry.craftWeapons || {};

    if(craftWeapons.weaponType !== undefined) {
        if(!lookups.weaponsBySlot[craftWeapons.weaponType]) {
            lookups.weaponsBySlot[craftWeapons.weaponType] = new Set();
        }
        lookups.weaponsBySlot[craftWeapons.weaponType].add(craftWeapons.type);
    }

    // craft slot mappings
    getCraftSlots(entry.crafts).forEach(type => {
        if(!lookups.craftsBySlot[type]) {
            lookups.craftsBySlot[type] = new Set();
        }
        lookups.craftsBySlot[type].add(entry.crafts.type); //add craft key
    });
}