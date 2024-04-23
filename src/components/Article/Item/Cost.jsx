import React from "react";

const costKeys = ["time", "energy", "morale", "mana", "health"];
const costStrings = ["STR_TIME_UNITS", "STR_ENERGY", "STR_MORALE", "STR_MANA_POOL", "STR_HEALTH"];

export function hasCost(value, suffix) {
    const costObj = value[`cost${suffix}`];
    const tu = value[`tu${suffix}`];

    return (costObj && costObj.time) || tu;
}

function isFlat(value, suffix, resource) {
    switch(true) {
        case value[`flat${suffix}`]?.[resource] !== undefined:  // flatSuffix (e.g. flatMelee.time === true)
            return value[`flat${suffix}`][resource];
        case value["flatRate"] && resource === "time": //flatRate is always TU only
            return true; 
        case resource === "time": //TU is % by default
            return false; 
        default: //non-TU resources are flat by default
            return true; 
    }
}

const Cost = ({value, suffix, lc, defaultTu}) => {
    const costObj = value[`cost${suffix}`];
    const tu = value[`tu${suffix}`];

    if((!costObj || !costObj.time) && !tu && !defaultTu) return null;

    const cost = {...{ time: tu || defaultTu }, ...costObj};
    return (
        <React.Fragment>
            { costKeys.map((key, idx) => (cost[key] ? <div key={key}><span>{cost[key]}{isFlat(value, suffix, key) ? "" : "%"}</span> <span>{lc(costStrings[idx])}</span></div> : null)) }
        </React.Fragment>
    );
};

export default Cost;