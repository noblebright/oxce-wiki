import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import { getLabel } from "../../model/RuleLoader";
import { SimpleValue, ListValue, getInventoryEntry } from "./utils";


function getItemTable(randomList) {
	let denominator = 0;
	const rows = randomList.map(([weight, items]) => {
		denominator += weight;
		return [weight, Object.entries(items)];
	});
	return { denominator, rows};
}

function RandomProduction({ label, values, locale }) {
    const { denominator, rows } = useMemo(() => getItemTable(values), [values]);
    return (
        <React.Fragment>
            <tr><th>Random Production!</th></tr>
            { rows.map(
                ([weight, items], idx) => (
                <React.Fragment key={idx}>
                    <tr><th colSpan="2"> {weight}/{denominator} ({(weight * 100 / denominator).toFixed(2)}%)</th></tr>
                    { items.length === 0 ? <tr><td colSpan="2">NOTHING!</td></tr>: items.map(([key, count], subId) => (
                        <tr key={subId}><td>{getLabel(key, locale)}</td><td>{count}</td></tr>
                    ))}
                </React.Fragment>
            ))}
        </React.Fragment>
    );
}

export default function ManufactureEntry({ entry, locale }) {
    const linkFn = id => <Link to={`/${id}`}>{getLabel(id, locale)}</Link>;
    const inventoryFn = getInventoryEntry(locale);
    return (
        <div className="ManufactureEntry">
            <table>
                <thead>
                    <tr><th colSpan="2">Manufacturing</th></tr>
                </thead>
                <tbody>
                    <SimpleValue label="Category" value={getLabel(entry.category, locale)}/>
                    <SimpleValue label="Cost" value={entry.cost}/>
                    <SimpleValue label="Time" value={entry.time}/>
                    {entry.requires && <ListValue label="Requires Research" values={entry.requires}>{ linkFn }</ListValue>}
                    {entry.requiresBaseFunc && <ListValue label="Requires Service" values={entry.requiresBaseFunc}>{ x => getLabel(x, locale) }</ListValue>}
                    {entry.requiredItems && <ListValue label="Requires Items" values={Object.entries(entry.requiredItems)}>{ inventoryFn }</ListValue>}
                    {entry.randomProducedItems && <RandomProduction label="Random Production" values={entry.randomProducedItems} locale={locale}/>}
                </tbody>
            </table>
        </div>
    );
}