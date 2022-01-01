import React from "react";
import Table from "react-bootstrap/Table";

import SoldierBonus from "./SoldierBonus";
import { BooleanValue, Money, Hours, UnitStats, SectionHeader, SimpleValue, ListValue } from "../ComponentUtils.js";
import useLocale from "../../hooks/useLocale";
import useInventory from "../../hooks/useInventory";
import useLink from "../../hooks/useLink";

const UPPER_BOUND_LABEL = [
    "DYNAMIC",
    "SOFT",
    "HARD"
];

export default function SoldierTransformation({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const inventoryFn = useInventory(linkFn);
    const transform = ruleset.entries[id].soldierTransformation;

    if(!transform) return null;
    
    const upperBoundMode = transform.upperBoundType || 
                            (transform.producedSoldierType ? 2 : 1);
    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Soldier Transformation"/>
            <tbody>
                <SimpleValue label="Cost" value={transform.cost}>{ Money }</SimpleValue>
                <SimpleValue label="Transfer Time" value={transform.transferTime}>{ Hours }</SimpleValue>
                <SimpleValue label="Recovery Time" value={transform.recoveryTime}>{ Hours }</SimpleValue>
                <SimpleValue label="Produced Item" value={transform.producedItem}>{ linkFn }</SimpleValue>
                <SimpleValue label="Produced Soldier Type" value={transform.producedSoldierType}>{ linkFn }</SimpleValue>
                <SimpleValue label="Produced Soldier Armor" value={transform.producedSoldierArmor}>{ linkFn }</SimpleValue>
                <SimpleValue label="Produced Item" value={transform.producedItem}>{ linkFn }</SimpleValue>
                <SimpleValue label="Minimum Rank" value={transform.minRank}/>
                <SimpleValue label="Produced Item" value={transform.producedItem}>{ linkFn }</SimpleValue>
                <BooleanValue label="Keep Soldier Armor?" value={transform.keepSoldierArmor}/>
                <BooleanValue label="Creates Clone?" value={transform.createsClone}/>
                <BooleanValue label="Needs Corpse Recovered?" value={transform.needsCorpseRecovered ?? true}/>
                <BooleanValue label="Allows Wounded Soldiers?" value={transform.allowsWoundedSoldiers}/>
                <BooleanValue label="Allows Dead Soldiers?" value={transform.allowsDeadSoldiers}/>
                <BooleanValue label="Allows Live Soldiers?" value={transform.allowsLiveSoldiers ?? true}/>
                <BooleanValue label="Include Bonuses for Min Stats?" value={transform.includeBonusesForMinStats}/>
                <BooleanValue label="Reset Transformations?" value={transform.reset}/>
                <BooleanValue label="Show Stat Gain Range?" value={transform.showMinMax}/>
                <BooleanValue label="Allow Below Minimum Results?" value={transform.lowerBoundAtMinStats ? !transform.lowerBoundAtMinStats : false}/>
                <BooleanValue label="Allow Above Starting Maximum Results?" value={!transform.upperBoundAtMaxStats}/>
                <BooleanValue label="Allow Above Maximum Results?" value={!transform.upperBoundAtStatCaps}/>
                <BooleanValue label="Upper Bound Mode?" value={UPPER_BOUND_LABEL[upperBoundMode]}/>
            </tbody>
            <ListValue label="Requires Research" values={transform.requires}>{ linkFn }</ListValue>
            <ListValue label="Requires Services" values={transform.requiresBaseFunc}>{ lc }</ListValue>
            <ListValue label="Allowed Soldier Types" values={transform.allowedSoldierTypes}>{ linkFn }</ListValue>
            <ListValue label="Required Transformations" values={transform.requiredPreviousTransformations}>{ linkFn }</ListValue>
            <ListValue label="Forbidden Transformations" values={transform.forbiddenPreviousTransformations}>{ linkFn }</ListValue>
            <ListValue label="Requires Items" values={Object.entries(transform.requiredItems || {})}>{ inventoryFn }</ListValue>
            <ListValue label="Required Items" values={transform.requiredItems}>{ linkFn }</ListValue>
            <ListValue label="Required Commendations" values={transform.requiredCommendations}>{ lc }</ListValue>
            <UnitStats showZero={false} label="Required Stats" stats={transform.requiredMinStats} lc={lc} />
            <UnitStats showZero={false} label="Flat Stats Change" stats={transform.flatOverallStatChange} lc={lc} />
            <UnitStats label="Flat Stats Range" min={transform.flatMin} max={transform.flatMax} lc={lc} />
            <UnitStats showZero={false} label="Percent Stats Change" stats={transform.percentOverallStatChange} lc={lc} />
            <UnitStats label="Percent Stats Range" min={transform.percentMin} max={transform.percentMax} lc={lc} />
            <UnitStats showZero={false} label="Percent Gained Stats Change" stats={transform.percentGainedStatChange} lc={lc} />
            <UnitStats label="Percent Gained Stats Range" min={transform.percentGainedMin} max={transform.percentGainedMax} lc={lc} />
            <SoldierBonus bonus={ruleset.lookups.soldierBonuses[transform.soldierBonusType]} lc={lc} />
        </Table>
    )
}