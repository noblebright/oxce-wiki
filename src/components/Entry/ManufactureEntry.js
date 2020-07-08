import React from "react";
import { Link } from "react-router-dom";

import { getLabel } from "../../model/RuleLoader";
import { SimpleValue, ListValue } from "./utils";

export default function ManufactureEntry({ entry, locale }) {
    const linkFn = id => <Link to={`/${id}`}>{getLabel(id, locale)}</Link>;

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
                    {entry.requiredItems && <ListValue label="Requires Items" values={Object.entries(entry.requiredItems)}>
                        { ([id, quantity]) => <React.Fragment><Link to={`/${id}`}>{getLabel(id, locale)}</Link>: {quantity}</React.Fragment> }
                    </ListValue>}
                </tbody>
            </table>
        </div>
    );
}