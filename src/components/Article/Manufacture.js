import React, { useMemo } from "react";
import {Table} from "react-bootstrap";
import useInventory from "../../hooks/useInventory.js";
import useLink from "../../hooks/useLink.js";
import useLocale from "../../hooks/useLocale.js";
import { ListHeader, ListValue, Money, SectionHeader, SimpleValue } from "../ComponentUtils.js";


function getItemTable(randomList) {
    let denominator = 0;
    if(!randomList) return {};
    const rows = randomList.map(([weight, items]) => {
        denominator += weight;
        return [weight, Object.entries(items)];
    }).sort((a, b) => b[0] - a[0]);
    return { denominator, rows };
}

function RandomProduction({label, values, children}) {
    const { denominator, rows } = useMemo(() => getItemTable(values), [values]);
    if(!values) return null;
    return (
        <React.Fragment>
            <ListHeader label={label} />
            <tbody>
            { rows.map(
                ([weight, items], idx) => (
                <tr key={idx}>
                    <td>
                        { items.length === 0 ? "NOTHING!" : items.map((item, subId) => <div key={subId}>{children(item)}</div>)}
                    </td>
                    <td> {weight}/{denominator} ({(weight * 100 / denominator).toFixed(2)}%)</td>
                </tr>
            ))}
            </tbody>
        </React.Fragment>
    );

}

export default function Manufacture({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const entry = ruleset.entries[id];
    const inventoryFn = useInventory(linkFn);
    const manufacture = entry.manufacture;
    
    if(!manufacture) return null;
    
    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Manufacture"/>
            <tbody>
                <SimpleValue label="Category" value={lc(manufacture.category)}/>
                <SimpleValue label="Cost" value={manufacture.cost}>{ Money }</SimpleValue>
                <SimpleValue label="Time" value={manufacture.time}>
                    { x => `${x} Engineer Hours`}
                </SimpleValue>
                <SimpleValue label="Create Staff" value={manufacture.spawnedPersonType}>
                    { x => ["STR_ENGINEER", "STR_SCIENTIST"].includes(x) ? lc(x) : linkFn(x) }
                </SimpleValue>
                {!!manufacture.cost && !!entry.items?.costSell && <SimpleValue label="Profitability" value={`$${Math.trunc((entry.items.costSell - manufacture.cost) / manufacture.time)}/engineer hour`}/>}
            </tbody>
            <ListValue label="Requires Research" values={manufacture.requires}>{ linkFn }</ListValue>
            <ListValue label="Requires Service" values={manufacture.requiresBaseFunc}>{ linkFn }</ListValue>
            <ListValue label="Requires Items" values={Object.entries(manufacture.requiredItems || {})}>{ inventoryFn }</ListValue>
            <ListValue label="Produced Items" values={Object.entries(manufacture.producedItems || {})}>{ inventoryFn }</ListValue>
            <RandomProduction label="Random Production" values={manufacture.randomProducedItems}>{ inventoryFn }</RandomProduction>
        </Table>
    )
}