import React, { useState } from "react";
import { Table, Button } from "react-bootstrap";

import {
  Percent,
  BooleanValue,
  Money,
  Hours,
  UnitStats,
  SectionHeader,
  SimpleValue,
  HeightStats,
  ListValue,
  ListHeader,
} from "../ComponentUtils.jsx";
import useLocale from "../../hooks/useLocale.js";
import useLink from "../../hooks/useLink.jsx";
import SoldierBonus from "./SoldierBonus.jsx";

const dogfightLookup = {
  bravery: "STR_BRAVERY",
  firing: "STR_FIRING_ACCURACY",
  reactions: "STR_REACTIONS",
};

function RandomTransformationBonuses({ ruleset, value, lc }) {
  const [show, setShow] = useState(
    value ? Object.keys(value).length <= 10 : false
  );

  if (!value || !Object.keys(value).length) {
    return null;
  }
  const denominator = Object.values(value).reduce((acc, x) => acc + x);
  return (
    <React.Fragment>
      <ListHeader
        label={
          <span>
            Random Starting Transformation
            <Button
              onClick={() => setShow((x) => !x)}
              variant="link"
              style={{ color: "lightblue", padding: "0", float: "right" }}
            >
              ({show ? "hide" : "show"})
            </Button>
          </span>
        }
      />
      <tbody className={show ? "hide" : ""}>
        <tr>
          <td colSpan="2">{Object.values(value).length} items hidden</td>
        </tr>
      </tbody>
      <tbody className={show ? "" : "hide"}>
        {Object.entries(value)
          .sort((a, b) => b[1] - a[1])
          .map(([bonus, weight]) => (
            <tr key={bonus}>
              <td className="ListValue" key={bonus}>
                {lc(bonus)} {weight}/{denominator} (
                {((weight * 100) / denominator).toFixed(2)}%)
              </td>
              <td>
                <Table>
                  <SoldierBonus
                    lc={lc}
                    bonus={ruleset.lookups.soldierBonuses[bonus]}
                    showHeader={false}
                  />
                </Table>
              </td>
            </tr>
          ))}
      </tbody>
    </React.Fragment>
  );
}

export default function Soldiers({ ruleset, lang, id, version }) {
  const lc = useLocale(lang, ruleset);
  const linkFn = useLink(version, lc);
  const soldiers = ruleset.entries[id].soldiers;

  if (!soldiers) return null;

  const dogfightFn = ([id, quantity]) => (
    <React.Fragment>
      <span className="InventoryQuantity">{quantity}%</span>{" "}
      {lc(dogfightLookup[id])}
    </React.Fragment>
  );

  return (
    <Table bordered striped size="sm" className="auto-width">
      <SectionHeader label="Soldiers" />
      <tbody>
        <SimpleValue label="Default Armor" value={soldiers.armor}>
          {linkFn}
        </SimpleValue>
        <BooleanValue label="Promotable?" value={soldiers.allowPromotion} />
        <BooleanValue label="Pilot?" value={soldiers.allowPiloting} />
        <SimpleValue label="Purchase Cost" value={soldiers.costBuy}>
          {Money}
        </SimpleValue>
        <SimpleValue label="Monthly Salary" value={soldiers.costSalary}>
          {Money}
        </SimpleValue>
        <SimpleValue label="Monthly Buy Limit" value={soldiers.monthlyBuyLimit}>
          {Money}
        </SimpleValue>
        <SimpleValue
          label={`Monthly Salary (${lc("STR_SQUADDIE")})`}
          value={soldiers.costSalarySquaddie}
        >
          {Money}
        </SimpleValue>
        <SimpleValue
          label={`Monthly Salary (${lc("STR_SERGEANT")})`}
          value={soldiers.costSalarySergeant}
        >
          {Money}
        </SimpleValue>
        <SimpleValue
          label={`Monthly Salary (${lc("STR_CAPTAIN")})`}
          value={soldiers.costSalaryCaptain}
        >
          {Money}
        </SimpleValue>
        <SimpleValue
          label={`Monthly Salary (${lc("STR_COLONEL")})`}
          value={soldiers.costSalaryColonel}
        >
          {Money}
        </SimpleValue>
        <SimpleValue
          label={`Monthly Salary (${lc("STR_COMMANDER")})`}
          value={soldiers.costSalaryCommander}
        >
          {Money}
        </SimpleValue>
        <HeightStats entity={soldiers} />
        <SimpleValue label="Special Weapon" value={soldiers.specialWeapon}>
          {linkFn}
        </SimpleValue>
        <SimpleValue label="Score" value={soldiers.value} />
        <SimpleValue label="Transfer Time" value={soldiers.transferTime}>
          {Hours}
        </SimpleValue>
        <SimpleValue
          label="Morale Loss When Killed"
          value={soldiers.moraleLossWhenKilled}
        >
          {Percent}
        </SimpleValue>
      </tbody>
      <ListValue label="Requires Research" values={soldiers.requires}>
        {linkFn}
      </ListValue>
      <ListValue label="Manufacture Process" values={soldiers.manufacture}>
        {linkFn}
      </ListValue>
      <ListValue
        label="Requires Services"
        values={soldiers.requiresBuyBaseFunc}
      >
        {linkFn}
      </ListValue>
      <ListValue label="Available Armors" values={soldiers.usableArmors}>
        {linkFn}
      </ListValue>
      <ListValue
        label="Available Transforms"
        values={soldiers.$allowedTransform}
      >
        {linkFn}
      </ListValue>
      <UnitStats min={soldiers.minStats} max={soldiers.maxStats} lc={lc} />
      <UnitStats
        label="Training Caps"
        stats={soldiers.trainingStatCaps}
        lc={lc}
      />
      <UnitStats label="Stat Caps" stats={soldiers.statCaps} lc={lc} />
      <RandomTransformationBonuses
        ruleset={ruleset}
        value={soldiers.spawnedSoldier?.randomTransformationBonuses}
        lc={lc}
      />
      <ListValue
        label="Dogfight Experience Chance"
        values={Object.entries(soldiers.dogfightExperience || {})}
      >
        {dogfightFn}
      </ListValue>
    </Table>
  );
}
