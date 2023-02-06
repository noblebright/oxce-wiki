import React from "react";
import {Table} from "react-bootstrap";
import useLink from "../../hooks/useLink.js";
import useLocale from "../../hooks/useLocale.js";
import useSprite from "../../hooks/useSprite.js";
import { BooleanValue, Hours, ListValue, Money, SectionHeader, SimpleValue, Percent } from "../ComponentUtils.js";
import CraftStats from "./CraftStats.js";
import { getCraftSlots } from "../../model/compiler/CraftWeaponMapper.js";

function WeaponSlots({crafts, lc}) {
    if(!crafts.weapons) return null;
    const weaponEntry = [];

    const weaponTypes = (crafts.weaponTypes || [0,0,0,0]).map(x => [].concat(x));
    const weaponStrings = (crafts.weaponStrings || ["STR_WEAPON_ONE", "STR_WEAPON_TWO"]);

    const definedWeapons = Math.min(crafts.weapons, weaponTypes.length, weaponStrings.length);

    if(definedWeapons * 3 - crafts.weapons - weaponTypes.length - weaponStrings.length !== 0) {
        console.warn(`${crafts.type} Definition mismatch for weapons, weaponTypes, and weaponStrings`);
    }
    for(let i = 0; i < definedWeapons; i++) {
        weaponEntry.push([`Weapon Slot ${i + 1}`, `${lc(weaponStrings[i])} (Type: ${weaponTypes[i].join(", ")})`]);
    }
    return (
        <React.Fragment>
            { weaponEntry.map(([label, value], idx) => <SimpleValue key={idx} label={label} value={value}/>)}
        </React.Fragment>
    )
}

// from src/Savegame/Craft.cpp
function getFuelConsumption(crafts) {
    return crafts.refuelItem ? 1 : Math.floor(crafts.speedMax / 100);
}

// from src/fmath.h
function Nautical(x)
{
	return x * (1 / 60.0) * (Math.PI / 180.0);
}

// from src/Savegame/MovingTarget.cpp
function getRadianSpeed(speed) {
    return Nautical(speed) / 720.0;   
}

// from src/fmath.h
function getXcomDistance(nautical) //go back to nm from radians
{
    return nautical * 60.0 * (180.0 / Math.PI);
}

export default function Crafts({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const spriteFn = useSprite(ruleset, "BASEBITS.PCK", 32, 48); //BIGOBS.PCK, 32px x 48px
    const crafts = ruleset.entries[id].crafts;

    if(!crafts) return null;

    const slots = [...getCraftSlots(crafts)];
    const equipment = slots.reduce((acc, slot) => {
        const lookup = ruleset.lookups.weaponsBySlot[slot] || [];
        lookup.forEach(x => acc.add(x));
        return acc;
    }, new Set());


    const range = getXcomDistance(crafts.fuelMax / 2.0 / getFuelConsumption(crafts) * getRadianSpeed(crafts.speedMax) * 120);

    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Craft"/>
            <tbody>
                <SimpleValue label="Sprite" value={spriteFn(crafts.sprite + 33)}/>
                <SimpleValue label="Weapon Slots" value={crafts.weapons}/>
                <WeaponSlots crafts={crafts} lc={lc}/>
                <SimpleValue label="Soldier Capacity" value={crafts.soldiers}/>
                <SimpleValue label="Vehicle Capacity" value={crafts.vehicles}/>
                <SimpleValue label="Pilots Required" value={crafts.pilots}/>
                <BooleanValue label="Allow Landing?" value={crafts.allowLanding}/>
                <BooleanValue label="Undetectable?" value={crafts.undetectable}/>
                <SimpleValue label="Purchase Cost" value={crafts.costBuy}>{ Money }</SimpleValue>
                <SimpleValue label="Monthly Buy Limit" value={crafts.monthlyBuyLimit}>{Money}</SimpleValue>
                <SimpleValue label="Rental Cost" value={crafts.costRent}>{ Money }</SimpleValue>
                <SimpleValue label="Sale Price" value={crafts.costSell}>{ Money }</SimpleValue>
                <BooleanValue label="Show in Monthly Costs" value={crafts.forceShowInMonthlyCosts}/>
                <SimpleValue label="Refuel Item" value={crafts.refuelItem}>{ linkFn }</SimpleValue>
                <SimpleValue label="Repair Rate (per 30 min)" value={crafts.repairRate}/>
                <SimpleValue label="Transfer Time" value={crafts.transferTime}>{ Hours }</SimpleValue>
                <SimpleValue label="Score Loss (when destroyed)" value={crafts.score}/>
                <BooleanValue label="Keep Craft After Failed Mission?" value={crafts.keepCraftAfterFailedMission}/>
                <BooleanValue label="Space Capable?" value={crafts.spacecraft}/>
                <BooleanValue label="Notify When Refueled?" value={crafts.notifyWhenRefueled}/>
                <BooleanValue label="Auto Patrol?" value={crafts.autoPatrol}/>
                <SimpleValue label="Max Altitude" value={crafts.maxAltitude}/>
                <SimpleValue label="Max Range" value={Math.floor(range)}/>
                <SimpleValue label="Global Coverage" value={Math.floor(range * 100 / 10800)}>{Percent}</SimpleValue>
                <SimpleValue label="Max Items" value={crafts.maxItems}/>
                <CraftStats stats={crafts}/>
           </tbody>
            <ListValue label="Required Research" values={crafts.requires}>{ linkFn }</ListValue>
            <ListValue label="Required Services" values={crafts.requiresBaseBuyFunc}>{ linkFn }</ListValue>
            <ListValue label="Special Mission Capable" values={crafts.$specialMissionAllowed}>{ linkFn }</ListValue>
            <ListValue label="Available Equipment" values={[...equipment]}>{ linkFn }</ListValue>
        </Table>
    )
}