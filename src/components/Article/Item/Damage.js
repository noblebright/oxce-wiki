import React from "react";

import useBonusString from "../../../hooks/useBonusString";
import { getDamageKey } from "../../ComponentUtils";

export default function Damage({ items, lc, children }) {
    const bonusFn = useBonusString(lc);
    const damageLabel = lc(getDamageKey(items.damageAlter?.resistType || items.damageType));
    return (
        <React.Fragment>
            <div>{items.power || ""}{items.damageBonus ? `${(items.power && " + ") || ""}${bonusFn(items.damageBonus)}` : ""}</div>
            <div className="damageType">{damageLabel}</div>
            {children}
        </React.Fragment>
    )
}