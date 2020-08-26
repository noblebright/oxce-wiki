import React from "react";

import useBonusString from "../../../hooks/useBonusString";
import { getDamageKey } from "../../ComponentUtils";

export default function Damage({ items, lc, children }) {
    const bonusFn = useBonusString(lc);
    const damageLabel = lc(getDamageKey(items.damageAlter?.resistType || items.damageType));
    const bonusDamage = items.damageBonus || (items.strengthApplied ? { "strength": 1 } : undefined );
    return (
        <React.Fragment>
            <div>{items.power || ""}{bonusDamage ? `${(items.power && " + ") || ""}${bonusFn(bonusDamage)}` : ""}{items.shotgunPellets ? `x${items.shotgunPellets}` : ""}</div>
            <div className="damageType">{damageLabel}</div>
            {children}
        </React.Fragment>
    )
}