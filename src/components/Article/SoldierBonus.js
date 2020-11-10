import React from "react";

import { StatRecovery, UnitStats, SectionHeader, SimpleValue } from "../ComponentUtils.js";
import useBonusString from "../../hooks/useBonusString";

export default function SoldierBonus({bonus, lc, showHeader = true}) {
    const bonusFn = useBonusString(lc);
    if(!bonus) return null;
    
    return (
        <React.Fragment>
            { showHeader && <SectionHeader label="Soldier Bonus"/> }
            <tbody>
                <SimpleValue label="Night Vision" value={bonus.visibilityAtDark}/>
            </tbody>
            <UnitStats label="Stat Bonuses" showZero={false} stats={bonus.stats} lc={lc} />
            <StatRecovery label="Stat Recovery" recovery={bonus.recovery} bonusFn={bonusFn} lc={lc} />
        </React.Fragment>
    )
}