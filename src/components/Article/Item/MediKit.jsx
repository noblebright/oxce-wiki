import React from "react";
import {Table} from "react-bootstrap";

import useBonusString from "../../../hooks/useBonusString.js";
import { ListHeader, SimpleValue, BooleanValue, Actions, ActionValue, ActionHeader, Accuracy } from "../../ComponentUtils.jsx";
import Cost, { hasCost } from "./Cost.jsx";

const mediKitTargetMatrix = [
    ["STR_TARGET_FRIEND", "STR_TARGET_ON_THE_GROUND"],
    ["STR_TARGET_FRIEND"],
    ["STR_TARGET_NEUTRAL", "STR_TARGET_ON_THE_GROUND"],
    ["STR_TARGET_NEUTRAL"],
    ["STR_TARGET_ENEMY", "STR_TARGET_ON_THE_GROUND"],
    ["STR_TARGET_ENEMY"]
];

function Doses({item}) {
    return (
        <Table>
            <tbody>
                <SimpleValue label="Heal" value={item.heal}/>
                <SimpleValue label="Stimulant" value={item.stimulant}/>
                <SimpleValue label="Painkiller" value={item.painKiller}/>
            </tbody>
        </Table>
    )
}

export default function MediKit({ ruleset, items, lc, linkFn, spriteFn }) {
    const bonusFn = useBonusString(lc);
    return (
        <React.Fragment>
            <tbody>
                <SimpleValue label={spriteFn(items.bigSprite)} value={<Doses item={items}/>}/>
            </tbody>
            <Actions>
                <ActionHeader label="Actions"/>
                <tbody>
                    <ActionValue label={lc(items.medikitActionName || "STR_USE_MEDI_KIT")} 
                                show={hasCost(items, "Use")}
                                cost={<Cost value={items} suffix="Use" lc={lc} />}
                    />
                    <ActionValue label={lc("STR_THROW")} 
                                cost={<Cost value={items} suffix="Throw" lc={lc} defaultTu={25}/>}
                                show={true}
                                accuracy={<Accuracy items={items} suffix="Throw" bonusFn={bonusFn} defaultAcc={100}/>}
                    />
                </tbody>
            </Actions>
            <ListHeader label="Medi-Kit Properties"/>
            <tbody>
                <SimpleValue label="Medi-Kit Target Mode" value={items.medikitTargetMatrix || 63}>
                    {x => mediKitTargetMatrix.filter((str, idx) => x & (1 << idx)).map(x => <div key={x.join("")}>{x.map(str => lc(str)).join(" ").substring(2)}</div>)}
                </SimpleValue>
                <BooleanValue label="Self Heal?" value={items.medikitTargetSelf}/>
                <BooleanValue label="Heal Inorganic?" value={items.medikitTargetImmune}/>
                <BooleanValue label="Consumable?" value={items.isConsumable}/>
                <SimpleValue label="Wounds Recovered" value={items.woundRecovery}/>
                <SimpleValue label="Health Recovered" value={items.healthRecovery}/>
                <SimpleValue label="Stun Recovered" value={items.stunRecovery}/>
                <SimpleValue label="Energy Recovered" value={items.energyRecovery}/>
                <SimpleValue label="Morale Recovered" value={items.moraleRecovery}/>
                <SimpleValue label="Painkiller Effectiveness" value={items.painKillerRecovery}/>
            </tbody>
        </React.Fragment>
    );
}