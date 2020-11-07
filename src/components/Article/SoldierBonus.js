import React from "react";
import Table from "react-bootstrap/Table";

import { StatRecovery, UnitStats, SectionHeader, SimpleValue } from "../ComponentUtils.js";

export default function SoldierBonus({bonus, lc}) {
    if(!bonus) return null;
    
    return (
        <React.Fragment>
            <SectionHeader label="Soldier Bonus"/>
            <tbody>
                <SimpleValue label="Night Vision" value={bonus.visibilityAtDark}/>
            </tbody>
            <UnitStats label="Stat Bonuses" showZero={false} stats={bonus.stats} lc={lc} />
            <StatRecovery label="Stat Recovery" stats={bonus.recovery} lc={lc} />
        </React.Fragment>
    )
}