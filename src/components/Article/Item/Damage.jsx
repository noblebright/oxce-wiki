import React from "react";

import useBonusString from "../../../hooks/useBonusString.js";
import { getDamageKey, getBlastRadiusObj } from "../../../model/utils.js";
import { defaultDTProps as defaultProps } from "../../../model/Constants.js";


export default function Damage({ items, lc, children, melee }) {
    const bonusFn = useBonusString(lc);
    const damageType = melee ? items.meleeAlter?.ResistType || items.meleeType : items.damageAlter?.ResistType || items.damageType;
    const damageLabel = lc(getDamageKey(damageType));
    const damageBonus = melee ? items.meleeBonus : items.damageBonus;
    const bonusDamage = damageBonus || (items.strengthApplied ? { "strength": 1 } : undefined);
    const alter = items.damageAlter;
    const blastRadiusObj = getBlastRadiusObj(alter, items.blastRadius);
    const mergedAlter = { ...defaultProps[damageType], ...alter, ...blastRadiusObj };
    const noDamage = mergedAlter.RandomType === 5;
    const power = melee ? items.meleePower : items.power;

    return (
        <React.Fragment>
            <div>{power || ""}{bonusDamage ? `${(power && " + ") || ""}${bonusFn(bonusDamage)}` : ""}{items.shotgunPellets ? `x${items.shotgunPellets}` : ""}</div>
            {noDamage && <div>(No Damage)</div>}
            <div className="damageType">{damageLabel}</div>
            {children}
        </React.Fragment>
    )
}