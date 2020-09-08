import React from "react";
import Table from "react-bootstrap/Table";
import useLink from "../../hooks/useLink";
import useLocale from "../../hooks/useLocale";
import { BooleanValue, ListValue, Percent, SectionHeader, SimpleValue } from "../ComponentUtils.js";
import CraftStats from "./CraftStats";

export default function CraftWeapons({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const craftWeapons = ruleset.entries[id].craftWeapons;
    
    if(!craftWeapons) return null;

    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Craft Weapon"/>
            <tbody>
                <SimpleValue label="Weapon Type" value={craftWeapons.weaponType}/>
                <SimpleValue label="Damage" value={craftWeapons.damage}/>
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
                <CraftStats stats={craftWeapons.stats}/>
            </tbody>
            <ListValue label="Required Research" values={craftWeapons.requires}>{ linkFn }</ListValue>
            <ListValue label="Required Services" values={craftWeapons.requiresBaseBuyFunc}>{ linkFn }</ListValue>
        </Table>
    )
}