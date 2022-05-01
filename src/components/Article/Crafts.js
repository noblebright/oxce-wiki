import React from "react";
import Table from "react-bootstrap/Table";
import useLink from "../../hooks/useLink";
import useLocale from "../../hooks/useLocale";
import { BooleanValue, Hours, ListValue, Money, SectionHeader, SimpleValue } from "../ComponentUtils.js";
import CraftStats from "./CraftStats";
import { getCraftSlots } from "../../model/CraftWeaponMapper";

function WeaponSlots({crafts, lc}) {
    if(!crafts.weapons) return null;
    const weaponEntry = [];

    const weaponTypes = (crafts.weaponTypes || [0,0,0,0]).map(x => [].concat(x));
    const weaponStrings = (crafts.weaponStrings || ["STR_WEAPON_ONE", "STR_WEAPON_TWO"]);

    for(let i = 0; i < crafts.weapons; i++) {
        weaponEntry.push([`Weapon Slot ${i + 1}`, `${lc(weaponStrings[i])} (Type: ${weaponTypes[i].join(", ")})`]);
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
    const crafts = ruleset.entries[id].crafts;

    if(!crafts) return null;

    const slots = [...getCraftSlots(crafts)];
    const equipment = slots.reduce((acc, slot) => {
        const lookup = ruleset.lookups.weaponsBySlot[slot] || [];
        lookup.forEach(x => acc.add(x));
        return acc;
    }, new Set());

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
                <SimpleValue label="Refuel Item" value={crafts.refuelItem}>{ linkFn }</SimpleValue>
                <SimpleValue label="Refuel Rate (per 30 min)" value={crafts.repairRate}/>
                <SimpleValue label="Transfer Time" value={crafts.transferTime}>{ Hours }</SimpleValue>
                <SimpleValue label="Score Loss (when destroyed)" value={crafts.score}/>
                <BooleanValue label="Keep Craft After Failed Mission?" value={crafts.keepCraftAfterFailedMission}/>
                <BooleanValue label="Space Capable?" value={crafts.spacecraft}/>
                <BooleanValue label="Notify When Refueled?" value={crafts.notifyWhenRefueled}/>
                <BooleanValue label="Auto Patrol?" value={crafts.autoPatrol}/>
                <SimpleValue label="Max Altitude" value={crafts.maxAltitude}/>
                <SimpleValue label="Max Items" value={crafts.maxItems}/>
                <CraftStats stats={crafts}/>
           </tbody>
            <ListValue label="Required Research" values={crafts.requires}>{ linkFn }</ListValue>
            <ListValue label="Required Services" values={crafts.requiresBaseBuyFunc}>{ linkFn }</ListValue>
            <ListValue label="Available Equipment" values={[...equipment]}>{ linkFn }</ListValue>
        </Table>
    )
}