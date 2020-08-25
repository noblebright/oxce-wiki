import React from "react";

const costKeys = ["time", "energy", "morale", "mana", "health"];
const costStrings = ["STR_TIME_UNITS", "STR_ENERGY", "STR_MORALE", "STR_MANA_POOL", "STR_HEALTH"];

export function hasCost(value, suffix) {
    const costObj = value[`cost${suffix}`];
    const tu = value[`tu${suffix}`];

    return (costObj && costObj.time) || tu;
}

const Cost = ({value, suffix, lc, defaultTu}) => {
    const costObj = value[`cost${suffix}`];
    const tu = value[`tu${suffix}`];

    if((!costObj || !costObj.time) && !tu && !defaultTu) return null;

    const cost = {...{ time: tu || defaultTu }, ...costObj};
    return (
        <React.Fragment>
            { costKeys.map((key, idx) => (cost[key] ? <div key={key}><span>{cost[key]}{value["flatRate"] || cost[`flat${suffix}`] || key !== costKeys[0] ? "" : "%"}</span> <span>{lc(costStrings[idx])}</span></div> : null)) }
        </React.Fragment>
    );
};

export default Cost;