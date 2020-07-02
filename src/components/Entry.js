import React from "react";
import {getLabel} from "../model/RuleLoader";
import "./Entry.css";

export default function Entry({ db: {rules, strings}, id, onSelect: setSelect, language = "en-US" }) {
    const entry = rules[id];
    const locale = strings[language];
    return (
        <div className="Entry">
            <h2>{getLabel(entry, locale)}</h2>
            { entry.research && <ResearchEntry locale={locale} entry={entry.research} onSelect={setSelect} language={language}/> }
            <pre>{JSON.stringify(entry, null, 4)}</pre>
        </div>
    )
}

function KeyValue({ label, value }) {
    return (
        <React.Fragment>
            <tr><td>{label}</td><td>{value}</td></tr>
        </React.Fragment>
    );
}

function KeyList({ label, value, children }) {
    return (
        <React.Fragment>
            <tr>
                <td>{label}</td>
                <td><ul>
                    {value.map(x => (<li key={x}>{children(x)}</li>))}
                </ul></td>
            </tr>
        </React.Fragment>
    );
}
function ResearchEntry({ entry, locale, onSelect: setSelect, language = "en-US" }) {
    return (
        <table className="ResearchEntry">
            <thead>
                <tr><th colSpan="2">Research</th></tr>
            </thead>
            <tbody>
                <KeyValue label="Cost" value={entry.cost}/>
                <KeyValue label="Points" value={entry.points}/>
                {entry.needItem && <KeyValue label="Requires Item" value="TRUE"/>}
                {entry.destroyItem && <KeyValue label="Destroys Item" value="TRUE"/>}
                {
                    entry.dependencies && <KeyList label="Dependencies" value={entry.dependencies}>
                        { x => <a href={`#${x}`} onClick={e => { e.preventDefault(); setSelect(x); }}>{getLabel(x, locale)}</a>}
                    </KeyList>
                }
                {
                    entry.leadsTo && <KeyList label="Leads To" value={entry.leadsTo}>
                        { x => <a href={`#${x}`} onClick={e => { e.preventDefault(); setSelect(x); }}>{getLabel(x, locale)}</a>}
                    </KeyList>
                }
                {
                    entry.unlockedBy && <KeyList label="Unlocked By" value={entry.unlockedBy}>
                        { x => <a href={`#${x}`} onClick={e => { e.preventDefault(); setSelect(x); }}>{getLabel(x, locale)}</a>}
                    </KeyList>
                }
                {
                    entry.unlocks && <KeyList label="Unlocks" value={entry.unlocks}>
                        { x => <a href={`#${x}`} onClick={e => { e.preventDefault(); setSelect(x); }}>{getLabel(x, locale)}</a>}
                    </KeyList>
                }
            </tbody>
        </table>
    )
}