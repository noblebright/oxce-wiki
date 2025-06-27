import React, { useCallback } from "react";
import { Table } from "react-bootstrap";
import { SectionHeader, ListValue } from "../../ComponentUtils.jsx";
import useLink from "../../../hooks/useLink.jsx";

function Trigger({ mission, value, version, lc, inventoryFn }) {
  const booleanInventory = useCallback(
    ([k, v]) => inventoryFn([k, `${v}`]),
    [inventoryFn]
  );
  const linkFn = useLink(version, lc);
  return (
    <React.Fragment>
      <SectionHeader label={`Mission Triggers: ${lc(mission)}`} />
      <ListValue
        label="Research Triggers"
        values={Object.entries(value.researchTriggers || {})}
      >
        {booleanInventory}
      </ListValue>
      <ListValue
        label="Item Triggers"
        values={Object.entries(value.itemTriggers || {})}
      >
        {booleanInventory}
      </ListValue>
      <ListValue
        label="Facility Triggers"
        values={Object.entries(value.facilityTriggers || {})}
      >
        {booleanInventory}
      </ListValue>
      <ListValue
        label="XCOM Base In Region"
        values={value.xcomBaseInRegionTriggers}
      />
      <ListValue
        label="XCOM Base In Country"
        values={value.xcomBaseInCountryTriggers}
      />
      <ListValue label="Spawned From Base" values={value.$spawnedFrom}>
        {linkFn}
      </ListValue>
    </React.Fragment>
  );
}
const triggerKeys = [
  "researchTriggers",
  "itemTriggers",
  "facilityTriggers",
  "xcomBaseInRegionTriggers",
  "xcomBaseInCountryTriggers",
  "$spawnedFrom",
];

function getTriggers(lookups, id) {
  const triggers = {};
  const deploymentData = lookups.deploymentData[id];
  let hasTriggers = false;

  //eslint-disable-next-line no-unused-expressions
  deploymentData?.scripts.forEach((script) => {
    const scriptObj = lookups.missionScripts[script];
    const triggerConditions = {};
    let hasConditions = false;
    triggerKeys.forEach((key) => {
      if (scriptObj[key]) {
        triggerConditions[key] = scriptObj[key];
        hasConditions = true;
      }
    });
    if (hasConditions) {
      hasTriggers = true;
      triggers[script] = triggerConditions;
    }
  });
  return hasTriggers ? triggers : null;
}

export default function Triggers({ ruleset, lc, version, inventoryFn, id }) {
  const triggers = getTriggers(ruleset.lookups, id);
  if (!triggers) return null;

  return (
    <Table bordered striped size="sm" className="auto-width">
      {Object.entries(triggers).map(([missionId, triggerObj]) => (
        <Trigger
          key={missionId}
          mission={missionId}
          value={triggerObj}
          lc={lc}
          version={version}
          inventoryFn={inventoryFn}
        />
      ))}
    </Table>
  );
}
