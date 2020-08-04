import React from "react";
import Table from "react-bootstrap/Table";

import Sprite from "./Sprite";
import { SectionHeader, SimpleValue, ListValue } from "../ComponentUtils.js";
import useLocale from "../../hooks/useLocale";
import useInventory from "../../hooks/useInventory";
import useLink from "../../hooks/useLink";

const getCost = (facilities, type) => Object.keys(facilities.buildCostItems).map(key => [key, facilities.buildCostItems[key][type]]);

function ItemCosts({facilities, children}) {
    if(!facilities.buildCostItems) return null;
    const build = getCost(facilities, "build").filter(x => x[1]); //strip out empty values
    const refund = getCost(facilities, "refund").filter(x => x[1]);
    return (
        <React.Fragment>
            {build.length && <ListValue label="Items Required" values={build}>{ children }</ListValue>}
            {refund.length && <ListValue label="Items Refunded" values={refund}>{ children }</ListValue>}
        </React.Fragment>
    )
}

const rightClickType = ["default", "Prison", "Manufacturing", "Research", "Training", "Psi Training", "Agents", "Sell Screen"];

export default function Research({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const inventoryFn = useInventory(linkFn);
    const facilities = ruleset.entries[id].facilities;

    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Facility"/>
            <tbody>
                <SimpleValue label="Sprite" value={<Sprite ruleset={ruleset} file="BASEBITS.PCK" id={facilities.size === 2 ? facilities.spriteShape : facilities.spriteFacility} size={facilities.size} />}/>
                <SimpleValue label="Build Cost" value={`$${facilities.buildCost}`}/>
                <SimpleValue label="Build Time" value={`${facilities.buildTime} Hours` }/>
                <SimpleValue label="Monthly Cost" value={`$${facilities.monthlyCost}` }/>
                <SimpleValue label="Size" value={facilities.size || 1}/>
                {facilities.maxAllowedPerBase && <SimpleValue label="Max Allowed" value={facilities.maxAllowedPerBase}/>}
                {facilities.manaRecoveryPerDay && <SimpleValue label="Mana Recovery" value={`${facilities.manaRecoveryPerDay}/day`}/>}
                {facilities.lift && <SimpleValue label="Access Lift?" value="TRUE"/>}
                {facilities.grav && <SimpleValue label="Grav Shield?" value="TRUE"/>}
                {facilities.mind && <SimpleValue label="Mind Shield?" value="TRUE"/>}
                {facilities.canBeBuiltOver && <SimpleValue label="Can Be Built Over" value="TRUE"/>}
                {facilities.hyper && <SimpleValue label="Hyperwave Decoder?" value="TRUE"/>}
                {facilities.refundValue && <SimpleValue label="Demolish Refund" value={facilities.refundValue}/>}
                {facilities.aliens && <SimpleValue label="Holding Capacity" value={facilities.aliens}/>}
                {facilities.labs && <SimpleValue label="Lab Capacity" value={facilities.labs}/>}
                {facilities.personnel && <SimpleValue label="Barracks Capacity" value={facilities.personnel}/>}
                {facilities.prisonType && <SimpleValue label="Prison Type" value={facilities.prisonType}/>}
                {facilities.workshops && <SimpleValue label="Workshop Capacity" value={facilities.workshops}/>}
                {facilities.storage && <SimpleValue label="Storage Capacity" value={facilities.storage}/>}
                {facilities.radarRange && <SimpleValue label="Radar Range" value={facilities.radarRange}/>}
                {facilities.radarChance && <SimpleValue label="Radar Chance" value={`${facilities.radarChance}%`}/>}
                {facilities.defense && <SimpleValue label="Defense Power" value={facilities.defense}/>}
                {facilities.hitRatio && <SimpleValue label="Hit Chance" value={`${facilities.hitRatio}%`}/>}
                {facilities.sickBayAbsoluteBonus && <SimpleValue label="Health Recovery (Flat)" value={`+${facilities.sickBayAbsoluteBonus} Health/day`}/>}
                {facilities.sickBayRelativeBonus && <SimpleValue label="Health Recover (%)" value={`+${facilities.sickBayRelativeBonus}% of Max HP Health/day`}/>}
                {facilities.trainingRooms && <SimpleValue label="Training Capacity" value={facilities.trainingRooms}/>}
                {facilities.rightClickActionType && <SimpleValue label="Training Capacity" value={rightClickType[facilities.rightClickActionType]}/>}
            </tbody>
            {facilities.requires && <ListValue label="Required Research" values={facilities.requires}>{ linkFn }</ListValue>}
            {facilities.requiresBaseFunc && <ListValue label="Required Services" values={facilities.requiresBaseFunc}>{ linkFn }</ListValue>}
            {facilities.provideBaseFunc && <ListValue label="Services Provided" values={facilities.provideBaseFunc}>{ lc }</ListValue>}
            {facilities.forbiddenBaseFunc && <ListValue label="Services Forbidden" values={facilities.forbiddenBaseFunc}>{ lc }</ListValue>}
            {facilities.buildOverFacilities && <ListValue label="Upgrades From" values={facilities.buildOverFacilities}>{ linkFn }</ListValue>}
            {facilities.buildCostItems && <ItemCosts facilities={facilities}>{ inventoryFn }</ItemCosts>}
        </Table>
    )
}