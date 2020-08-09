import React from "react";

import useBonusString from "../../../hooks/useBonusString";
import { getDamageKey } from "../../ComponentUtils";

export default function Damage({ items, lc, children }) {
    const bonusFn = useBonusString(lc);
    const damageLabel = lc(getDamageKey(items.damageAlter?.resistType || items.damageType));
    return (
        <React.Fragment>
            <div>{items.power}{items.damageBonus ? bonusFn(items.damageBonus) : ""}</div>
            <div>{damageLabel}</div>
            {children}
        </React.Fragment>
    )
}