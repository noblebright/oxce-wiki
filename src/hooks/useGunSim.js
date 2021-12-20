import { useReducer, useCallback } from "react";

const alphaSort = lc => (a, b) => lc(a) > lc(b) ? 1 : -1;
const getArmorList = (state, soldier, lc) => {
    const usableArmors = state.entries[soldier].soldiers?.usableArmors;
    return usableArmors ? usableArmors.sort(alphaSort(lc)) : [state.entries[soldier].units.armor]; // no usable armors = vanilla HWP
}
const getAmmoList = (state, weapon, lc) => {
    const ammoList = state.entries[weapon].items.allCompatibleAmmo;
    return ammoList ? ammoList.sort(alphaSort(lc)) : [];
}

const reductions = {
    setStat: (state, action) => ({ ...state, stat: action.payload }),
    setSoldier: (state, action) => {
        const armorList = getArmorList(state, action.payload, action.meta);
        return { ...state, soldier: action.payload, armorList, armor: armorList[0] };
    },
    setArmor: (state, action) => ({ ...state, armor: action.payload }),
    setWeapon: (state, action) => {
        const ammoList = getAmmoList(state, action.payload, action.meta);
        return { ...state, weapon: action.payload, ammoList, ammo: ammoList[0] };
    },
    setAmmo: (state, action) => ({ ...state, ammo: action.payload }),
    setTarget: (state, action) => ({ ...state, target: action.payload }),
    setKneeling: (state, action) => ({ ...state, kneeling: action.payload }),
    setOneHanded: (state, action) => ({ ...state, oneHanded: action.payload }),
    setDirection: (state, action) => ({ ...state, direction: action.payload })
};

const gunReducer = (state, action) => {
    return reductions[action.type] ? reductions[action.type](state, action) : state;
}

const init = lc => state => {
    const sortFn = alphaSort(lc);
    state.stat = "statCaps";
    state.direction = "front";
    state.soldierList = Object.keys(state.entries).filter(x => state.entries[x].soldiers) // normal soldiers
                        .concat(state.lookups.hwps) // vanilla-style hwps
                        .sort(sortFn);
    state.soldier = state.soldierList[0];
    state.armorList = getArmorList(state, state.soldier, lc);
    state.armor = state.armorList[0];
    state.weaponList = Object.keys(state.entries).filter(x => {
        const item = state.entries[x].items;
        return item && item.battleType === 1 && 
                !item.arcingShot &&  // FIXME: Handle more corner cases for arcing (confAimed et. al.)
                item.recover !== false
    }).sort(sortFn);
    state.weapon = state.weaponList[0];
    state.ammoList = getAmmoList(state, state.weapon, lc);
    state.ammo = state.ammoList[0];
    state.targetList = Object.keys(state.entries).filter(x => state.entries[x].units).sort(sortFn);
    state.target = state.targetList[0];
    state.kneeling = false;
    state.oneHanded = false;
    return state;
}

export default function useGunSim(ruleset, lc) {
    const actions = {};
    const { entries, lookups } = ruleset;
    const [state, dispatch] = useReducer(gunReducer, { entries, lookups }, init(lc));

    actions.setStat = useCallback(payload => dispatch({ type: "setStat", payload }), [dispatch]);
    actions.setSoldier = useCallback((payload, meta) => dispatch({ type: "setSoldier", payload, meta }), [dispatch]);
    actions.setArmor = useCallback(payload => dispatch({ type: "setArmor", payload }), [dispatch]);
    actions.setWeapon = useCallback((payload, meta) => dispatch({ type: "setWeapon", payload, meta }), [dispatch]);
    actions.setAmmo = useCallback(payload => dispatch({ type: "setAmmo", payload }), [dispatch]);
    actions.setTarget = useCallback(payload => dispatch({ type: "setTarget", payload }), [dispatch]);
    actions.setKneeling = useCallback(payload => dispatch({ type: "setKneeling", payload }), [dispatch]);
    actions.setOneHanded = useCallback(payload => dispatch({ type: "setOneHanded", payload }), [dispatch]);
    actions.setDirection = useCallback(payload => dispatch({ type: "setDirection", payload }), [dispatch]);
    return [state, actions];
}