import React, { useCallback } from "react";
import Table from "react-bootstrap/Table";
import { SectionHeader, ListValue } from "../../ComponentUtils.js";

function Trigger({ mission, value, lc, inventoryFn }) {
    const booleanInventory = useCallback(([k, v]) => inventoryFn([k, `${v}`]), [inventoryFn]);
    return (
        <React.Fragment>
            <SectionHeader label={`Mission Triggers: ${lc(mission)}`}/>
            <ListValue label="Research Triggers" values={Object.entries(value.researchTriggers || {})}>{ booleanInventory }</ListValue>
            <ListValue label="Item Triggers" values={Object.entries(value.itemTriggers || {})}>{ booleanInventory }</ListValue>
            <ListValue label="Facility Triggers" values={Object.entries(value.facilityTriggers || {})}>{ booleanInventory }</ListValue>
            <ListValue label="XCOM Base In Region" values={value.xcomBaseInRegionTriggers} />
            <ListValue label="XCOM Base In Country" values={value.xcomBaseInCountryTriggers} />
        </React.Fragment>
    )
}
export default function Triggers({ ruleset, lc, inventoryFn, id }) {
    const triggers = ruleset.lookups.triggersByDeployment[id];
    if(!triggers) return null;

    return (
        <Table bordered striped size="sm" className="auto-width">
            { Object.entries(triggers)
                .map(([missionId, triggerObj]) => 
                        (<Trigger key={missionId} mission={missionId} value={triggerObj} lc={lc} inventoryFn={inventoryFn}/>))}
        </Table>
    );
}