import React, {useState, useMemo} from "react";
import {Link} from "react-router-dom";

import {getLabel} from "../model/RuleLoader";

export default function Sidebar({ db: { rules, strings }, language = "en-US" }) {
    const [filter, setFilter] = useState("");

    const ruleList = useMemo(() => Object.values(rules)
    .filter(x => !filter || getLabel(x, strings[language]).toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
        return getLabel(a, strings[language]) < getLabel(b, strings[language]) ? -1 : 1;
    }), [rules, strings, language, filter]);

    return (
        <div className="sidebar">
            <input type="text" className="filter" value={filter} onChange={e => setFilter(e.target.value)}/>
            <div className="listContainer">
                <ul>
                    { ruleList.map(x => (
                        <li key={x.name}>
                            <Link to={`/${x.name}`}>{getLabel(x, strings[language])}</Link>
                        </li>))}
                </ul>
            </div>
        </div>
    );
}