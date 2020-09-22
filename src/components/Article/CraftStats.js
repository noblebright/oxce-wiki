import React from "react";
import { SimpleValue, Percent } from "../ComponentUtils";

export default function CraftStats({stats}) {
  if(!stats) return null;
  return (
    <React.Fragment>
      <SimpleValue label="Acceleration" value={stats.accel}/>
      <SimpleValue label="Radar Range" value={stats.radarRange}/>
      <SimpleValue label="Radar Detection Chance" value={stats.radarChance}>{ Percent }</SimpleValue>
      <SimpleValue label="Sight Range" value={stats.sightRange}/>
      <SimpleValue label="Max Fuel" value={stats.fuelMax}/>
      <SimpleValue label="Max Health" value={stats.damageMax}/>
      <SimpleValue label="Max Speed" value={stats.speedMax}/>
      <SimpleValue label="Max Shields" value={stats.shieldCapacity}/>
      <SimpleValue label="Shield Recharge (Dogfight)" value={stats.shieldRecharge}/>
      <SimpleValue label="Shield Recharge (Flight)" value={stats.shieldRechargedInGeoscape}/>
      <SimpleValue label="Shield Recharge (Base)" value={stats.shieldRechargedAtBase}/>
      <SimpleValue label="Shield Bleedthrough" value={stats.shieldBleedThrough}>{ Percent }</SimpleValue>
      <SimpleValue label="Accuracy Bonus" value={stats.hitBonus}>{ Percent }</SimpleValue>
      <SimpleValue label="Power Bonus" value={stats.powerBonus}>{ Percent }</SimpleValue>
      <SimpleValue label="Dodge Bonus" value={stats.avoidBonus}>{ Percent }</SimpleValue>
      <SimpleValue label="Armor" value={stats.armor}/>
    </React.Fragment>
  )
}