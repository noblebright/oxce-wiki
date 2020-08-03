import React, {useMemo} from "react";
import Table from "react-bootstrap/Table";

import useLocale from "../../hooks/useLocale";
import { SectionHeader, ListHeader, SimpleValue, ListValue } from "../ComponentUtils.js";
import useLink from "../../hooks/useLink";

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

    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Item"/>
            <tbody>
                <SimpleValue label="Type" value={battleType[items.battleType]}/>
                {items.costBuy && <SimpleValue label="Cost" value={items.costBuy}/>}
                <SimpleValue label="Sell Price" value={items.costSell ?? "N/A"}/>
                <SimpleValue label="Weight" value={items.weight}/>
                <SimpleValue label="Storage Space" value={items.size}/>
                {items.invWidth && items.invHeight && <SimpleValue label="Inventory Shape" value={`${items.invWidth}x${items.invHeight}`}/>}
            </tbody>
            {items.categories && <ListValue label="Categories" values={items.categories}>{ lc }</ListValue>}
            {items.requiresBuy && <ListValue label="Required to Purchase" values={items.requiresBuy}>{ linkFn }</ListValue>}
            {items.ammoFor && <ListValue label="Ammunition For" values={items.ammoFor}>{ linkFn }</ListValue>}
            {items.allCompatibleAmmo && <ListValue label="Compatible Ammunition" values={items.allCompatibleAmmo}>{ linkFn }</ListValue>}
        </Table>
    )
}