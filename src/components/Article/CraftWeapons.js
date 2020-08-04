import React from "react";
import Table from "react-bootstrap/Table";

import { SectionHeader, Percent, BooleanValue, SimpleValue, ListValue } from "../ComponentUtils.js";
import useLocale from "../../hooks/useLocale";
import useInventory from "../../hooks/useInventory";
import useLink from "../../hooks/useLink";

export default function CraftWeapons({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const inventoryFn = useInventory(linkFn);
    const craftWeapons = ruleset.entries[id].craftWeapons;
    
    if(!craftWeapons) return null;

    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Craft Weapon"/>
            <tbody>
                <SimpleValue label="Weapon Type" value={craftWeapons.weaponType}/>
                <SimpleValue label="Fuel" value={craftWeapons.fuelMax}/>
                <SimpleValue label="Health" value={craftWeapons.damageMax}/>
                <SimpleValue label="Speed" value={craftWeapons.speedMax}/>
                <SimpleValue label="Shields" value={craftWeapons.shieldCapacity}/>
                <SimpleValue label="Shield Recharge (Dogfight)" value={craftWeapons.shieldRecharged}/>
                <SimpleValue label="Shield Recharge (Flight)" value={craftWeapons.shieldRechargedInGeoscape}/>
                <SimpleValue label="Shield Recharge (Base)" value={craftWeapons.shieldRechargedAtBase}/>
                <SimpleValue label="Shield Bleedthrough" value={craftWeapons.shieldBleedThrough}>{ Percent }</SimpleValue>
                <SimpleValue label="Acceleration" value={craftWeapons.accel}/>
                <SimpleValue label="Radar Range" value={craftWeapons.radarRange}/>
                <SimpleValue label="Radar Detection Chance" value={craftWeapons.radarChance}>{ Percent }</SimpleValue>
                <SimpleValue label="Sight Range" value={craftWeapons.sightRange}/>
                <SimpleValue label="Accuracy Mod" value={craftWeapons.hitBonus}>{ Percent }</SimpleValue>
                <SimpleValue label="Power" value={craftWeapons.powerBonus}>{ Percent }</SimpleValue>
                <SimpleValue label="Dodge" value={craftWeapons.avoidBonus}>{ Percent }</SimpleValue>
                <SimpleValue label="Armor" value={craftWeapons.armor}/>
                <SimpleValue label="Damage" value={craftWeapons.damage}/>
                <SimpleValue label="Shield Damage Modifier" value={craftWeapons.shieldDamageModifier}>{ Percent }</SimpleValue>
                <SimpleValue label="Range" value={craftWeapons.range}/>
                <SimpleValue label="Accuracy" value={craftWeapons.accuracy}>{ Percent }</SimpleValue>
                <SimpleValue label="Reload (Cautious)" value={craftWeapons.reloadCautious}/>
                <SimpleValue label="Reload (Standard)" value={craftWeapons.reloadStandard}/>
                <SimpleValue label="Reload (Aggressive)" value={craftWeapons.reloadAggressive}/>
                <SimpleValue label="Ammo Count" value={craftWeapons.ammoMax}/>
                <SimpleValue label="Rearm Rate" value={craftWeapons.rearmRate}/>
                <SimpleValue label="Launcher" value={craftWeapons.launcher}>{ linkFn }</SimpleValue>
                <SimpleValue label="Ammunition" value={craftWeapons.clip}>{ linkFn }</SimpleValue>
                <BooleanValue label="Underwater Only?" value={craftWeapons.underwaterOnly}/>
                <SimpleValue label="Tractor Beam Power" value={craftWeapons.tractorBeamPower}/>
            </tbody>
            <ListValue label="Required Research" values={craftWeapons.requires}>{ linkFn }</ListValue>
            <ListValue label="Required Services" values={craftWeapons.requiresBaseBuyFunc}>{ linkFn }</ListValue>
        </Table>
    )
}