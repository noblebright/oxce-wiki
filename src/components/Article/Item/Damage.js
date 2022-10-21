import React from "react";

import useBonusString from "../../../hooks/useBonusString";
import { getDamageKey } from "../../../model/utils";

export default function Damage({ items, lc, children, melee }) {
    const bonusFn = useBonusString(lc);
    const damageType = melee ? items.meleeAlter?.ResistType || items.meleeType : items.damageAlter?.ResistType || items.damageType;
    const damageLabel = lc(getDamageKey(damageType));
    const damageBonus = melee ? items.meleeBonus : items.damageBonus;
    const bonusDamage = damageBonus || (items.strengthApplied ? { "strength": 1 } : undefined );
    const power = melee ? items.meleePower : items.power;
    return (
        <React.Fragment>
            <div>{power || ""}{bonusDamage ? `${(power && " + ") || ""}${bonusFn(bonusDamage)}` : ""}{items.shotgunPellets ? `x${items.shotgunPellets}` : ""}</div>
            <div className="damageType">{damageLabel}</div>
            {children}
        </React.Fragment>
    )
}