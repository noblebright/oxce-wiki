import React from "react";
import Table from "react-bootstrap/Table";

import { SectionHeader, Percent, Hours, Money, BooleanValue, SimpleValue, ListValue } from "../ComponentUtils.js";
import useLocale from "../../hooks/useLocale";
import useInventory from "../../hooks/useInventory";
import useLink from "../../hooks/useLink";

function WeaponSlots({crafts, lc}) {
    if(!crafts.weapons) return null;
    const weaponEntry = [];

    for(let i = 0; i < crafts.weapons; i++) {
        const weaponTypes = Array.isArray(crafts.weaponTypes[i]) ? crafts.weaponTypes[i] : [crafts.weaponTypes[i]];
        weaponEntry.push([`Weapon Slot ${i + 1}`, `${lc(crafts.weaponStrings[i])} (Type: ${weaponTypes.join(", ")})`]);
    }
    return (
        <React.Fragment>
            { weaponEntry.map(([label, value], idx) => <SimpleValue key={idx} label={label} value={value}/>)}
        </React.Fragment>
    )
}
export default function Crafts({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const inventoryFn = useInventory(linkFn);
    const crafts = ruleset.entries[id].crafts;

    if(!crafts) return null;

    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Craft"/>
            <tbody>
                <SimpleValue label="Weapon Slots" value={crafts.weapons}/>
                <WeaponSlots crafts={crafts} lc={lc}/>
                <SimpleValue label="Soldier Capacity" value={crafts.soldiers}/>
                <SimpleValue label="Vehicle Capacity" value={crafts.vehicles}/>
                <SimpleValue label="Pilots Required" value={crafts.pilots}/>
                <BooleanValue label="Allow Landing?" value={crafts.allowLanding}/>
                <SimpleValue label="Purchase Cost" value={crafts.costBuy}>{ Money }</SimpleValue>
                <SimpleValue label="Rental Cost" value={crafts.costRent}>{ Money }</SimpleValue>
                <SimpleValue label="Sale Price" value={crafts.costSell}>{ Money }</SimpleValue>
                <BooleanValue label="Show in Monthly Costs" value={crafts.forceShowInMonthlyCosts}/>
                <SimpleValue label="Refuel Item" value={crafts.refuelItem}> { linkFn } </SimpleValue>
                <SimpleValue label="Refuel Rate (per 30 min)" value={crafts.repairRate}/>
                <SimpleValue label="Transfer Time" value={crafts.transferTime}>{ Hours }</SimpleValue>
                <SimpleValue label="Score Loss (when destroyed)" value={crafts.score}/>
                <BooleanValue label="Keep Craft After Failed Mission?" value={crafts.keepCraftAfterFailedMission}/>
                <BooleanValue label="Space Capable?" value={crafts.spacecraft}/>
                <BooleanValue label="Notify When Refueled?" value={crafts.notifyWhenRefueled}/>
                <BooleanValue label="Auto Patrol?" value={crafts.autoPatrol}/>
                <SimpleValue label="Max Altitude" value={crafts.maxAltitude}/>
                <SimpleValue label="Max Items" value={crafts.maxItems}/>
                <SimpleValue label="Max Fuel" value={crafts.fuelMax}/>
                <SimpleValue label="Max Health" value={crafts.damageMax}/>
                <SimpleValue label="Max Speed" value={crafts.speedMax}/>
                <SimpleValue label="Max Shields" value={crafts.shieldCapacity}/>
                <SimpleValue label="Shield Recharge (Dogfight)" value={crafts.shieldRecharge}/>
                <SimpleValue label="Shield Recharge (Flight)" value={crafts.shieldRechargedInGeoscape}/>
                <SimpleValue label="Shield Recharge (Base)" value={crafts.shieldRechargedAtBase}/>
                <SimpleValue label="Shield Bleedthrough" value={crafts.shieldBleedThrough}>{ Percent }</SimpleValue>
                <SimpleValue label="Acceleration" value={crafts.accel}/>
                <SimpleValue label="Radar Range" value={crafts.radarRange}/>
                <SimpleValue label="Radar Detection Chance" value={crafts.radarChance}>{ Percent }</SimpleValue>
                <SimpleValue label="Sight Range" value={crafts.sightRange}/>
                <SimpleValue label="Accuracy Bonus" value={crafts.hitBonus}>{ Percent }</SimpleValue>
                <SimpleValue label="Power Bonus" value={crafts.powerBonus}>{ Percent }</SimpleValue>
                <SimpleValue label="Dodge Bonus" value={crafts.avoidBonus}>{ Percent }</SimpleValue>
                <SimpleValue label="Armor" value={crafts.armor}/>
           </tbody>
            <ListValue label="Required Research" values={crafts.requires}>{ linkFn }</ListValue>
            <ListValue label="Required Services" values={crafts.requiresBaseBuyFunc}>{ linkFn }</ListValue>
        </Table>
    )
}