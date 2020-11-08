import React from "react";

import { StatRecovery, UnitStats, SectionHeader, SimpleValue } from "../ComponentUtils.js";

export default function SoldierBonus({bonus, lc, showHeader = true}) {
    if(!bonus) return null;
    
    return (
        <React.Fragment>
            { showHeader && <SectionHeader label="Soldier Bonus"/> }
            <tbody>
                <SimpleValue label="Night Vision" value={bonus.visibilityAtDark}/>
            </tbody>
            <UnitStats label="Stat Bonuses" showZero={false} stats={bonus.stats} lc={lc} />
            <StatRecovery label="Stat Recovery" stats={bonus.recovery} lc={lc} />
        </React.Fragment>
    )
}