import React from "react";
import Table from "react-bootstrap/Table";
import useLink from "../../hooks/useLink";
import useLocale from "../../hooks/useLocale";
import { ListValue, Money, SectionHeader, SimpleValue } from "../ComponentUtils.js";


const battleType = [
    "None (0)",
    "Firearm (1)",
    "Ammo (2)",
    "Melee (3)",
    "Grenade (4)",
    "Proximity Grenade (5)",
    "Medi-Kit (6)",
    "Motion Scanner (7)",
    "Mind Probe (8)",
    "Psi-Amp (9)",
    "Electro-flare (10)",
    "Corpse (11)"
];

export default function Item({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const entry = ruleset.entries[id];
    const items = entry.items;

    if(!items) return null;

    if(Object.keys(items).length <= 1) {
        return null; //empty object.
    }
    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Item"/>
            <tbody>
                <SimpleValue label="Type" value={items.battleType}>
                    {x => battleType[x]}
                </SimpleValue>
                <SimpleValue label="Cost" value={items.costBuy}>{ Money }</SimpleValue>
                <SimpleValue label="Sell Price" value={items.costSell}>{ Money }</SimpleValue>
                <SimpleValue label="Weight" value={items.weight}/>
                <SimpleValue label="Storage Space" value={items.size}/>
                {!!items.invWidth && !!items.invHeight && <SimpleValue label="Inventory Shape" value={`${items.invWidth}x${items.invHeight}`}/>}
            </tbody>
            <ListValue label="Categories" values={items.categories}>{ lc }</ListValue>
            <ListValue label="Required to Purchase" values={items.requiresBuy}>{ linkFn }</ListValue>
            <ListValue label="Required to Use" values={items.requires}>{ linkFn }</ListValue>
            <ListValue label="Ammunition For" values={items.ammoFor}>{ linkFn }</ListValue>
            <ListValue label="Compatible Ammunition" values={items.allCompatibleAmmo}>{ linkFn }</ListValue>
            <ListValue label="Craft Weapon Entry" values={items.craftWeapons}>{ linkFn }</ListValue>
            <ListValue label="Craft Ammo For" values={items.craftAmmo}>{ linkFn }</ListValue>
        </Table>
    )
}