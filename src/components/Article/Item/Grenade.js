import React from "react";
import Table from "react-bootstrap/Table";

import useBonusString from "../../../hooks/useBonusString";
import { BooleanValue, ListHeader, SimpleValue, Percent, Actions, ActionValue, ActionHeader, Accuracy } from "../../ComponentUtils";
import Damage from "./Damage";
import Cost, { hasCost } from "./Cost";

function FuseTrigger({triggers}) {
    return triggers ? (
        <Table>
            <tbody>
                <BooleanValue label="Default Behavior" value={triggers.defaultBehavior}/>
                <BooleanValue label="On Throw" value={triggers.throwTrigger}/>
                <BooleanValue label="Explode on Throw" value={triggers.throwExplode}/>
                <BooleanValue label="On Proximity" value={triggers.proximityTrigger}/>
                <BooleanValue label="Explode on Proximity" value={triggers.proximityExplode}/>
            </tbody>
        </Table>
    ) : null;
}

export default function Grenade({ ruleset, items, lc, linkFn, spriteFn }) {
    const bonusFn = useBonusString(lc);
    return (
        <React.Fragment>
            <tbody>
                <SimpleValue label={spriteFn(items.bigSprite)} value={<Damage items={items} lc={lc} />}/>
            </tbody>
            <Actions>
                <ActionHeader label="Actions"/>
                <tbody>
                    <ActionValue label={lc(items.primeActionName || "STR_PRIME_GRENADE")}
                                show={items.fuseType !== -3}
                                cost={<Cost value={items} suffix="Prime" lc={lc} defaultTu={50}/>}
                    />
                    <ActionValue label={lc(items.unprimeActionName)}
                                show={(items.fuseType !== -3) && hasCost(items, "Unprime")}
                                cost={<Cost value={items} suffix="Unprime" lc={lc} defaultTu={25}/>}
                    />
                    <ActionValue label={lc("STR_THROW")}
                                show={true}
                                cost={<Cost value={items} suffix="Throw" lc={lc} defaultTu={25}/>}
                                accuracy={<Accuracy items={items} suffix="Throw" bonusFn={bonusFn} defaultAcc={100}/>}
                    />
                </tbody>
            </Actions>
            <ListHeader label="Grenade Properties"/>
            <tbody>
                <SimpleValue label="Fuse Type" value={items.fuseType || -1}>
                    { x => {
                        switch(x) {
                            case -3: return "No Priming";
                            case -2: return "Instant Fuse";
                            case -1: return "Timed Fuse";
                            default: return `${x} round fuse`;
                        }
                    }}
                </SimpleValue>
                <SimpleValue label="TriggerEvents" value={items.fuseTriggerEvents}>
                    { x => <FuseTrigger triggers={x}/> }
                </SimpleValue>
                <SimpleValue label="Special Effect Chance" value={items.specialChance || 100}>{ Percent }</SimpleValue>
                <BooleanValue label="Explodes in Inventory" value={items.isExplodingInHands}/>
                <BooleanValue label="Hidden on Map" value={items.hiddenOnMinimap}/>
            </tbody>
        </React.Fragment>
    );
}