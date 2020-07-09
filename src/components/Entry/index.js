import React from "react";
import { useParams, Redirect } from "react-router-dom";

import { getLabel } from "../../model/RuleLoader";
import ResearchEntry from "./ResearchEntry";
import ManufactureEntry from "./ManufactureEntry";
import ItemsEntry from "./ItemsEntry";
import DebugEntry from "./DebugEntry";

import "./Entry.css";

export default function Entry({ db: {rules, strings}, language = "en-US" }) {
    let { id } = useParams();

    const entry = rules[id];
    
    if(!entry) {
        //We got a non-existant entry.  Kick them to the homepage.
        return (
            <Redirect to="/"/>
        );
    }

    const locale = strings[language];
    

    return (
        <div className="Entry">
            <h2>{getLabel(entry, locale)}</h2>
            { entry.research && <ResearchEntry rules={rules} locale={locale} entry={entry} /> }
            { entry.manufacture && <ManufactureEntry locale={locale} entry={entry} /> }
            { entry.items && <ItemsEntry rules={rules} locale={locale} entry={entry} /> }
            <DebugEntry key={entry.name} entry={entry}/>            
        </div>
    )
}

