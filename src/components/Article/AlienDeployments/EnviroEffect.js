import React from "react";
import { SectionHeader, SimpleValue, ListValue } from "../../ComponentUtils.js";

const factions = ["STR_FRIENDLY", "STR_NEUTRAL", "STR_HOSTILE"];
const armorFacing = ["STR_RANDOMIZE", "STR_FRONT_ARMOR", "STR_LEFT_ARMOR", "STR_RIGHT_ARMOR", "STR_REAR_ARMOR", "STR_UNDER_ARMOR"];
const bodyPart = ["STR_RANDOMIZE", "STR_HEAD", "STR_TORSO", "STR_RIGHT_ARM", "STR_LEFT_ARM", "STR_RIGHT_LEG", "STR_LEFT_LEG"];

function EnviroCondition({ faction, value, lc, linkFn }) {
    if(!value) return null;
    // bodyPart and side + 1, since STR_RANDOMIZE value is -1
    return(
        <React.Fragment>
            <SectionHeader label={`${lc(faction)} Condition`}/>
            <tbody>
                <SimpleValue label="% Chance This Combat" value={value.globalChance}/>
                <SimpleValue label="% Chance Per Turn" value={value.chancePerTurn}/>
                <SimpleValue label="First Turn" value={value.firstTurn}/>
                <SimpleValue label="Last Turn" value={value.lastTurn}/>
                <SimpleValue label="Message" value={value.message}>{ lc }</SimpleValue>
                <SimpleValue label="Effect" value={value.weaponOrAmmo}>{ linkFn }</SimpleValue>
                <SimpleValue label="Facing" value={armorFacing[value.side + 1]}>{ lc }</SimpleValue>
                <SimpleValue label="Body Part" value={bodyPart[value.bodyPart + 1]}>{ lc }</SimpleValue>
            </tbody>
        </React.Fragment>
    );
}

export default function EnviroEffect({ value, lc, linkFn }) {
    if(!value) return null;
    return (
        <React.Fragment>
            {factions.map(x => (<EnviroCondition key={x} faction={x} value={value.environmentalConditions?.[x]} lc={lc} linkFn={linkFn} />))}
            <ListValue label="Armor Transforms" values={Object.entries(value.armorTransformations ?? {})}>
                { ([key, value]) => (
                    <React.Fragment>
                        {linkFn(key)} ➔ {linkFn(value)}
                    </React.Fragment>
                )}
            </ListValue>
        </React.Fragment>
    )
}