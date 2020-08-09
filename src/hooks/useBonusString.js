const statTypes = {
    flatOne: { value: (x) => !Array.isArray(x) ? x : x.reduce((acc, item, idx) => acc += Math.pow(item, idx + 1), 0) },
    flatHundred: { value: (x) => !Array.isArray(x) ? 100 * x : x.reduce((acc, item, idx) => acc += 100 * Math.pow(item, idx + 1), 0) },
    psi: { vFn: lc => `${lc("STR_PSIONIC_SKILL")} * ${lc("STR_PSIONIC_STRENGTH")}` },
    psiSkill: { value: "STR_PSIONIC_SKILL" },
    psiStrength: { value: "STR_PSIONIC_STRENGTH" },
    throwing: { value: "STR_THROWING_ACCURACY" },
    bravery: { value: "STR_BRAVERY" },
    firing: { value: "STR_FIRING_ACCURACY" },
    health: { value: "STR_HEALTH", total: true },
    mana: { value: "STR_MANA_POOL", total: true },
    tu: { value: "STR_TIME_UNITS", total: true },
    reactions: { value: "STR_REACTIONS" },
    stamina: { value : "STR_STAMINA", total: true },
    melee: { value: "STR_MELEE_ACCURACY" },
    strengthMelee: { vFn: lc => `${lc("STR_STRENGTH")} * ${lc("STR_MELEE_ACCURACY")}` },
    strengthThrowing: { vFn: lc => `${lc("STR_STRENGTH")} * ${lc("STR_THROWING_ACCURACY")}` },
    firingReactions: { vFn: lc => `${lc("STR_FIRING_ACCURACY")} * ${lc("STR_REACTIONS")}` },
    rank: { value: "STR_RANK" },
    fatalWounds: { value: "STR_FATAL_WOUNDS" },
    healthCurrent: { value: "STR_HEALTH" },
    manaCurrent: { value: "STR_MANA_CURRENT" },
    tuCurrent: { value: "STR_TIME_UNITS" },
    energyCurrent: { value: "STR_ENERGY" },
    moraleCurrent: { value: "STR_MORALE" },
    stunCurrent: { value: "STR_STUN" },
    healthNormalized: { value: "STR_HEALTH", normalized: true },
    manaNormalized: { value: "STR_MANA", normalized: true },
    tuNormalized: { value: "STR_TIME_UNITS", normalized: true },
    energyNormalized: { value: "STR_ENERGY", normalized: true },
    moraleNormalized: { value: "STR_MORALE", normalized: true },
    stunNormalized: { value: "STR_STUN", normalized: true },
    energyRegen: { value: "STR_ENERGY" },
}

const useBonusString = lc => formula => {
    const bonuses = [];
    const penalties = [];

    Object.keys(formula).forEach(key => {
        const statDef = statTypes[key];
        if(typeof statDef.value === "function") {
            const value = statDef.value(formula[key]);
            if(value > 0) bonuses.push(Math.abs(value));
            if(value < 0) penalties.push(Math.abs(value));    
         } else if(typeof formula[key] === "number") {
            const { value: labelKey, vFn, normalized, total } = statDef;
            const value = formula[key];
            const label = vFn ? vFn(lc) : lc(labelKey);

            const str = `${Math.abs(value)}${ normalized ? " * %" : " * "}${ total ? `${lc("STR_TOTAL")} `: ""}${label}`;
            if(value > 0) bonuses.push(str);
            if(value < 0) penalties.push(str);
        } else { //array of polynomial coefficients
            const coefficients = formula[key];
            const { value: labelKey, vFn, parens, normalized, total } = statDef;
            const label = vFn ? vFn(lc) : lc(labelKey);

            coefficients.forEach((co, idx) => {
                const str = `${Math.abs(co)}${ normalized ? " * %" : " * "}${ total ? `${lc("STR_TOTAL")} `: ""}${vFn ? `(${label})` : label}${idx ? `^${idx + 1}`: ""}`;
                if(co > 0) bonuses.push(str);
                if(co < 0) penalties.push(str);
            });
        }
    });
    return `${bonuses.length ? bonuses.join(" + ") : ""}${penalties.length ? ` - ${penalties.join(" - ")}` : ""}`;
};

export default useBonusString;