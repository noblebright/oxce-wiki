import React from "react";
import Table from "react-bootstrap/Table";

import { Percent, BooleanValue, SectionHeader, SimpleValue, ListValue } from "../ComponentUtils.js";
import useLocale from "../../hooks/useLocale";
import useImage from "../../hooks/useImage";
import useLink from "../../hooks/useLink";

const huntMode = [
    "Prefer Interceptors",
    "Prefer Transports",
    "Random"
];

const huntBehavior = [
    "Flee",
    "Never Flee",
    "Random"
];

export default function Ufos({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const imageFn = useImage(ruleset);
    const ufos = ruleset.entries[id].ufos;

    if(!ufos) return null;
    
    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="UFO"/>
            <tbody>
                <SimpleValue label="Sprite" value={ufos.sprite || ufos.modSprite}>{ imageFn }</SimpleValue>
                <SimpleValue label="Size" value={ufos.size}>{ lc }</SimpleValue>
                <SimpleValue label="Power" value={ufos.power}/>
                <SimpleValue label="Range" value={ufos.range}/>
                <SimpleValue label="Score" value={ufos.score}/>
                <SimpleValue label="Reload Time" value={ufos.reload}/>
                <SimpleValue label="Breakoff Time" value={ufos.breakOffTime}/>
                <SimpleValue label="Mission Score" value={ufos.missionScore}/>
                <SimpleValue label="Hunter-Killer Percentage" value={ufos.hunterKillerPercentage}>{ Percent }</SimpleValue>
                <SimpleValue label="Hunter-Killer Mode" value={ufos.huntMode}>
                    { x => huntMode[x] }
                </SimpleValue>
                <SimpleValue label="Hunter-Killer Behavior" value={ufos.huntBehavior}>
                    { x => huntBehavior[x] }
                </SimpleValue>
                <SimpleValue label="Hunt Speed" value={ufos.huntSpeed}/>
                <SimpleValue label="Bombardment Power" value={ufos.missilePower}>
                    { x => x === -1 ? "Destroy Everything" : `Destroy ${x} Tiles` }
                </SimpleValue>
                <BooleanValue label="Unmanned?" value={ufos.unmanned}/>
                <SimpleValue label="Max Health" value={ufos.damageMax}/>
                <SimpleValue label="Max Speed" value={ufos.speedMax}/>
                <SimpleValue label="Max Shields" value={ufos.shieldCapacity}/>
                <SimpleValue label="Shield Recharge (Dogfight)" value={ufos.shieldRecharge}/>
                <SimpleValue label="Shield Recharge (Flight)" value={ufos.shieldRechargedInGeoscape}/>
                <SimpleValue label="Shield Bleedthrough" value={ufos.shieldBleedThrough}>{ Percent }</SimpleValue>
                <SimpleValue label="Radar Range" value={ufos.radarRange}/>
                <SimpleValue label="Radar Detection Chance" value={ufos.radarChance}>{ Percent }</SimpleValue>
                <SimpleValue label="Sight Range" value={ufos.sightRange}/>
                <SimpleValue label="Accuracy Bonus" value={ufos.hitBonus}>{ Percent }</SimpleValue>
                <SimpleValue label="Power Bonus" value={ufos.powerBonus}>{ Percent }</SimpleValue>
                <SimpleValue label="Dodge Bonus" value={ufos.avoidBonus}>{ Percent }</SimpleValue>
                <SimpleValue label="Armor" value={ufos.armor}/>
            </tbody>
            <ListValue label="Variants" values={ufos.$hasVariants}>{([race, ship]) => (
                <div style={{ display: "flex"}}>
                    <span style={{flexGrow: "1", paddingRight: "5px"}}>{linkFn(race)}</span>
                    {linkFn(ship)}
                </div>
            )}</ListValue>
            <ListValue label="Contains Items" values={ufos.$ufoItems}>{ linkFn }</ListValue>
            <ListValue label="Contains Items (Random)" values={ufos.$ufoRandomItems}>{ linkFn }</ListValue>
        </Table>
    )
}