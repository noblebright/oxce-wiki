import React from "react";
import Table from "react-bootstrap/Table";

import FacilitySprite from "./FacilitySprite";
import { BooleanValue, Percent, Money, Hours, PerDay, SectionHeader, SimpleValue, ListValue } from "../ComponentUtils.js";
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
                <SimpleValue label="Sprite" value={<FacilitySprite ruleset={ruleset} file="BASEBITS.PCK" id={facilities.size === 2 ? facilities.spriteShape : facilities.spriteFacility} size={facilities.size} />}/>
                <SimpleValue label="Build Cost" value={facilities.buildCost}> { Money } </SimpleValue>
                <SimpleValue label="Build Time" value={facilities.buildTime}> {Hours} </SimpleValue>
                <SimpleValue label="Monthly Cost" value={facilities.monthlyCost}> { Money } </SimpleValue>
                <SimpleValue label="Size" value={facilities.size || 1}/>
                <SimpleValue label="Max Allowed" value={facilities.maxAllowedPerBase}/>
                <SimpleValue label="Mana Recovery" value={facilities.manaRecoveryPerDay}>{ PerDay }</SimpleValue>
                <BooleanValue label="Access Lift?" value={facilities.lift}/>
                <BooleanValue label="Grav Shield?" value={facilities.grav}/>
                <BooleanValue label="Mind Shield?" value={facilities.mind}/>
                <BooleanValue label="Can Be Built Over" value={facilities.canBeBuiltOver}/>
                <BooleanValue label="Hyperwave Decoder?" value={facilities.hyper}/>
                <SimpleValue label="Demolish Refund" value={facilities.refundValue}>{ Money }</SimpleValue>
                <SimpleValue label="Holding Capacity" value={facilities.aliens}/>
                <SimpleValue label="Lab Capacity" value={facilities.labs}/>
                <SimpleValue label="Barracks Capacity" value={facilities.personnel}/>
                <SimpleValue label="Prison Type" value={facilities.prisonType}/>
                <SimpleValue label="Workshop Capacity" value={facilities.workshops}/>
                <SimpleValue label="Storage Capacity" value={facilities.storage}/>
                <SimpleValue label="Radar Range" value={facilities.radarRange}/>
                <SimpleValue label="Radar Detection Chance" value={facilities.radarChance}>{ Percent }</SimpleValue>
                <SimpleValue label="Defense Power" value={facilities.defense}/>
                <SimpleValue label="Hit Chance" value={facilities.hitRatio}>{ Percent }</SimpleValue>
                <SimpleValue label="Health Recovery (Flat)" value={facilities.sickBayAbsoluteBonus}>
                    { x => `+${x} Health/day` }
                </SimpleValue>
                <SimpleValue label="Health Recover (%)" value={facilities.sickBayRelativeBonus}>
                    { x => `+${x}% of Max HP Health/day` }
                </SimpleValue>
                <SimpleValue label="Training Capacity" value={facilities.trainingRooms}/>
                <SimpleValue label="Right-Click Behavior" value={facilities.rightClickActionType}>
                    { x => rightClickType[x] }
                </SimpleValue>
            </tbody>
            <ListValue label="Required Research" values={facilities.requires}>{ linkFn }</ListValue>
            <ListValue label="Required Services" values={facilities.requiresBaseFunc}>{ linkFn }</ListValue>
            <ListValue label="Services Provided" values={facilities.provideBaseFunc}>{ lc }</ListValue>
            <ListValue label="Services Forbidden" values={facilities.forbiddenBaseFunc}>{ lc }</ListValue>
            <ListValue label="Upgrades From" values={facilities.buildOverFacilities}>{ linkFn }</ListValue>
            <ItemCosts facilities={facilities}>{ inventoryFn }</ItemCosts>
        </Table>
    )
}