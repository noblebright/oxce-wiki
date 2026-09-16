import React, { useCallback } from "react";
import { Table } from "react-bootstrap";
import {
  SectionHeader,
  SimpleValue,
  ContainerValue,
  Percent,
  ListValue,
} from "../../ComponentUtils.jsx";
import useLink from "../../../hooks/useLink.jsx";

function Trigger({ mission, value, version, lc, inventoryFn }) {
  const booleanInventory = useCallback(
    ([k, v]) => inventoryFn([k, `${v}`]),
    [inventoryFn],
  );
  if (mission === "$retaliation") {
    return (
      <React.Fragment>
        <SectionHeader label="Mission Triggers" />
        <tbody>
          <ContainerValue>{lc("STR_ALIEN_RETALIATION")}</ContainerValue>
        </tbody>
      </React.Fragment>
    );
  }
  const linkFn = useLink(version, lc);
  return (
    <React.Fragment>
      <SectionHeader label={`Mission Script: ${lc(mission)}`} />
      <tbody>
        <SimpleValue label="Execution Odds" value={value.executionOdds}>{Percent}</SimpleValue>
        <SimpleValue label="First Month" value={value.firstMonth}/>
        <SimpleValue label="Last Month" value={value.lastMonth}/>
        <SimpleValue label="Start Delay" value={value.startDelay}/>
        <SimpleValue label="Random Delay" value={value.randomDelay}/>
        <SimpleValue label="Minimum Difficulty" value={value.minDifficulty}/>
        <SimpleValue label="Maximum Difficulty" value={value.maxDifficulty}/>
        <SimpleValue label="Minimum Score" value={value.minScore}/>
        <SimpleValue label="Maximum Score" value={value.maxScore}/>
        <SimpleValue label="Minimum Funds" value={value.minFunds}/>
        <SimpleValue label="Maximum Funds" value={value.maxFunds}/>
        <SimpleValue label="Max Runs" value={value.maxRuns === -1 ? undefined : value.maxRuns}/>
      </tbody>
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
        label="Soldier Type Triggers"
        values={Object.entries(value.soldierTypeTriggers || {})}
      >
        {booleanInventory}
      </ListValue>
      <ListValue
        label="Pact Country Triggers"
        values={Object.entries(value.pactCountryTriggers || {})}
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

function getTriggers(lookups, id) {
  const triggers = {};
  const deploymentData = lookups.deploymentData[id];
  let hasRetaliation = false;
  //eslint-disable-next-line no-unused-expressions
  deploymentData?.scripts.forEach((script) => {
    const scriptObj = lookups.missionScripts[script];
    if (scriptObj.$retaliation) hasRetaliation = true;
    triggers[script] = scriptObj;
  });
  // condense retaliations into one trigger entry
  if (hasRetaliation) {
    triggers.$retaliation = true;
  }
  return triggers;
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
