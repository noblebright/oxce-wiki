import React, { useMemo } from "react";

import { getLabel } from "../../model/RuleLoader";
import { SimpleValue, ListValue, getInventoryEntry, useLink } from "./utils";


function getItemTable(randomList) {
	let denominator = 0;
	const rows = randomList.map(([weight, items]) => {
		denominator += weight;
		return [weight, Object.entries(items)];
	});
	return { denominator, rows};
}

function RandomProduction({ label = "Random Production!", values, locale }) {
    const { denominator, rows } = useMemo(() => getItemTable(values), [values]);
    const linkFn = useLink(locale);
    return (
        <React.Fragment>
            <tr><th>{label}</th></tr>
            { rows.map(
                ([weight, items], idx) => (
                <React.Fragment key={idx}>
                    <tr><th colSpan="2"> {weight}/{denominator} ({(weight * 100 / denominator).toFixed(2)}%)</th></tr>
                    { items.length === 0 ? <tr><td colSpan="2">NOTHING!</td></tr>: items.map(([key, count], subId) => (
                        <tr key={subId}><td>{linkFn(key)}</td><td>{count}</td></tr>
                    ))}
                </React.Fragment>
            ))}
        </React.Fragment>
    );
}

export default function ManufactureEntry({ entry, locale }) {
    const linkFn = useLink(locale);
    const manufacture = entry.manufacture;
    const inventoryFn = getInventoryEntry(locale);
    return (
        <div className="ManufactureEntry">
            <table>
                <thead>
                    <tr><th colSpan="2">Manufacturing</th></tr>
                </thead>
                <tbody>
                    <SimpleValue label="Category" value={getLabel(manufacture.category, locale)}/>
                    <SimpleValue label="Cost" value={manufacture.cost}/>
                    <SimpleValue label="Time" value={manufacture.time}/>
                    {manufacture.cost && entry.items?.costSell && <SimpleValue label="Profitability" value={`$${Math.trunc((entry.items.costSell - manufacture.cost) / manufacture.time)}/engineer hour`}/>}
                    {manufacture.requires && <ListValue label="Requires Research" values={manufacture.requires}>{ linkFn }</ListValue>}
                    {manufacture.requiresBaseFunc && <ListValue label="Requires Service" values={manufacture.requiresBaseFunc}>{ x => getLabel(x, locale) }</ListValue>}
                    {manufacture.requiredItems && <ListValue label="Requires Items" values={Object.entries(manufacture.requiredItems)}>{ inventoryFn }</ListValue>}
                    {manufacture.randomProducedItems && <RandomProduction label="Random Production" values={manufacture.randomProducedItems} locale={locale}/>}
                </tbody>
            </table>
        </div>
    );
}