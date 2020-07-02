import React, {useState, useMemo} from "react";
import {getLabel} from "../model/RuleLoader";

export default function Sidebar({ db: { rules, strings }, language = "en-US", onClick: handleClick}) {
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
                    { ruleList.map(x => (<li key={x.name}><a href={`#${x.name}`} onClick={() => handleClick?.(x.name)}>{getLabel(x, strings[language])}</a></li>))}
                </ul>
            </div>
        </div>
    );
}