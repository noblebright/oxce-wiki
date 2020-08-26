import React from "react";
import Table from "react-bootstrap/table";

import useBonusString from "../../../hooks/useBonusString";
import { BooleanValue, ListHeader, SimpleValue, Actions, ActionValue, ActionHeader, Accuracy } from "../../ComponentUtils";
import DamageAlter from "./DamageAlter";
import Damage from "./Damage";
import Cost, { hasCost } from "./Cost";

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
                                    <DamageAlter type={x.damageType} alter={x.damageAlter} lc={lc} melee/>
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
            {items.psiRequired && <ListHeader label="Melee Properties"/>}
            <tbody>
                <BooleanValue label="Psi Required" value={items.psiRequired}/>
            </tbody>
        </React.Fragment>
    );
}