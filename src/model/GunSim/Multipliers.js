const specialMods = {
    flatOne: () => 1,
    flatHundred: () => 100,
    psi: stat => stat.psiSkill * stat.psiStrength,
    // psiSkill: { value: "STR_PSIONIC_SKILL" },
    // psiStrength: { value: "STR_PSIONIC_STRENGTH" },
    // throwing: { value: "STR_THROWING_ACCURACY" },
    // bravery: { value: "STR_BRAVERY" },
    // firing: { value: "STR_FIRING_ACCURACY" },
    // health: { value: "STR_HEALTH", total: true },
    // mana: { value: "STR_MANA_POOL", total: true },
    // tu: { value: "STR_TIME_UNITS", total: true },
    // reactions: { value: "STR_REACTIONS" },
    // stamina: { value : "STR_STAMINA", total: true },
    // melee: { value: "STR_MELEE_ACCURACY" },
    // strength: { value: "STR_STRENGTH" },
    strengthMelee: stat => stat.strength * stat.melee,
    strengthThrowing: stat => stat.strength * stat.throwing ,
    firingReactions: stat =>  stat.firing * stat.reactions,
    rank: () => 1,
    fatalWounds: () => 0,
    healthCurrent: stat => stat.health,
    manaCurrent: stat => stat.mana,
    tuCurrent: stat => stat.tu,
    energyCurrent: stat => stat.energy,
    moraleCurrent: stat => 100,
    stunCurrent: stat => 0,
    healthNormalized: () => 1,
    manaNormalized: () => 1,
    tuNormalized: () => 1,
    energyNormalized: () => 1,
    moraleNormalized: () => 1,
    stunNormalized: () => 1,
    energyRegen: () => 0,
}

export function getMultiplier(multipliers, stats) {
    let accMultiplier = 0;
    Object.keys(multipliers).forEach(stat => {
        const statValue = specialMods[stat] ? specialMods[stat](stats) : stats[stat];
        if(Array.isArray(multipliers[stat])) { // handle array case
            for(let i = 0; i < multipliers[stat].length; i++) {
                accMultiplier += (statValue ** (i + 1)) * multipliers[stat][i];
            }
        } else {
            accMultiplier += statValue * multipliers[stat];
        }
    });
    return accMultiplier;
}
