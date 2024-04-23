import React from "react";

import { StatRecovery, UnitStats, SectionHeader, SimpleValue } from "../ComponentUtils.jsx";
import useBonusString from "../../hooks/useBonusString.js";

export default function SoldierBonus({bonus, lc, showHeader = true}) {
    const bonusFn = useBonusString(lc);
    if(!bonus) return null;
    
    return (
        <React.Fragment>
            { showHeader && <SectionHeader label="Soldier Bonus"/> }
            <tbody>
                <SimpleValue showZero label={lc("STR_FRONT_ARMOR")} value={bonus.frontArmor}/>
                <SimpleValue showZero label={lc("STR_LEFT_ARMOR")} value={bonus.sideArmor + (bonus.leftArmorDiff || 0) }/>
                <SimpleValue showZero label={lc("STR_RIGHT_ARMOR")} value={bonus.sideArmor}/>
                <SimpleValue showZero label={lc("STR_REAR_ARMOR")} value={bonus.rearArmor}/>
                <SimpleValue showZero label={lc("STR_UNDER_ARMOR")} value={bonus.underArmor}/>
                <SimpleValue label="Night Vision" value={bonus.visibilityAtDark}/>
            </tbody>
            <UnitStats label="Stat Bonuses" showZero={false} stats={bonus.stats} lc={lc} />
            <StatRecovery label="Stat Recovery" recovery={bonus.recovery} bonusFn={bonusFn} lc={lc} />
        </React.Fragment>
    )
}