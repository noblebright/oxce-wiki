import React from "react";
import {Table} from "react-bootstrap";

import useBonusString from "../../../hooks/useBonusString.js";
import { ListHeader, SimpleValue, Actions, ActionValue, ActionHeader, Accuracy, getUnitFaction } from "../../ComponentUtils.jsx";
import DamageAlter from "./DamageAlter.jsx";
import Damage from "./Damage.jsx";
import Cost, { hasCost } from "./Cost.jsx";

export default function Melee({ ruleset, items, lc, linkFn, spriteFn }) {
    const bonusFn = useBonusString(lc);
    return (
        <React.Fragment>
            <tbody>
                <SimpleValue label={spriteFn(items.bigSprite)} value={items}>
                    { x => (
                        <Damage items={x} lc={lc}>
                            { x.damageAlter ? <Table>
                                <ListHeader label="Damage Properties"/>
                                <tbody>
                                    <DamageAlter type={x.damageType} alter={x.damageAlter} lc={lc} blastRadius={x.blastRadius} ruleset={ruleset} melee/>
                                </tbody>
                            </Table> : null}
                        </Damage>
                    )}
                </SimpleValue>
            </tbody>
            <Actions>
                <ActionHeader label="Actions"/>
                <tbody>
                    <ActionValue label={lc("STR_HIT_MELEE")} 
                                show={hasCost(items, "Melee")}
                                cost={<Cost value={items} suffix="Melee" lc={lc} />}
                                accuracy={<Accuracy items={items} suffix="Melee" bonusFn={bonusFn} defaultAcc={100}/>}
                    />
                    <ActionValue label={lc("STR_THROW")}
                                show={!items.fixedWeapon}
                                cost={<Cost value={items} suffix="Throw" lc={lc} defaultTu={25}/>}
                                accuracy={<Accuracy items={items} suffix="Throw" bonusFn={bonusFn} defaultAcc={100}/>}
                    />
                </tbody>
            </Actions>
            <ListHeader label="Melee Properties"/>
            <tbody>
                <SimpleValue label="Spawned Unit" value={items.spawnUnit}>{ linkFn }</SimpleValue>
                <SimpleValue label="Spawned Unit Controller" value={items.spawnUnitFaction} showZero>{ getUnitFaction }</SimpleValue>
            </tbody>
        </React.Fragment>
    );
}