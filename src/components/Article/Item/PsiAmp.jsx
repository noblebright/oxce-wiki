import React from "react";
import {Table} from "react-bootstrap";

import useBonusString from "../../../hooks/useBonusString.js";
import { ListHeader, SimpleValue, BooleanValue, Actions, ActionValue, ActionHeader, Accuracy, getUnitFaction } from "../../ComponentUtils.jsx";
import Damage from "./Damage.jsx";
import DamageAlter from "./DamageAlter.jsx";
import Cost, { hasCost } from "./Cost.jsx";

const psiTargetMatrix = [
    "STR_XCOM",
    "STR_ALIENS",
    "MALE_CIVILIAN"
];

export default function PsiAmp({ ruleset, items, lc, linkFn, spriteFn }) {
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
                                    <DamageAlter type={x.damageType} alter={x.damageAlter} lc={lc} ruleset={ruleset}/>
                                </tbody>
                            </Table> : null}
                        </Damage>
                    )}
                </SimpleValue>
            </tbody>
            <Actions>
                <ActionHeader label="Actions"/>
                <tbody>
                    <ActionValue label={lc("STR_PANIC_UNIT")} 
                                show={hasCost(items, "Panic") ?? hasCost(items, "Use")}
                                cost={hasCost(items, "Panic") ? <Cost value={items} suffix="Panic" lc={lc} /> : <Cost value={items} suffix="Use" lc={lc}/>}
                    />
                    <ActionValue label={lc("STR_MIND_CONTROL")} 
                                show={hasCost(items, "MindControl") ?? hasCost(items, "Use")}
                                cost={hasCost(items, "MindControl") ? <Cost value={items} suffix="MindControl" lc={lc} /> : <Cost value={items} suffix="Use" lc={lc}/>}
                    />
                    <ActionValue label={lc(items.psiAttackName)} 
                                show={hasCost(items, "Use") && items.damageType}
                                cost={<Cost value={items} suffix="Use" lc={lc} />}
                                accuracy={<Accuracy items={items} suffix="Use" bonusFn={bonusFn}/>}
                    />
                    <ActionValue label={lc("STR_THROW")}
                                show={!items.fixedWeapon}
                                cost={<Cost value={items} suffix="Throw" lc={lc} defaultTu={25}/>}
                                accuracy={<Accuracy items={items} suffix="Throw" bonusFn={bonusFn} defaultAcc={100}/>}
                    />
                </tbody>
            </Actions>
            <ListHeader label="Psi-Amp Properties"/>
            <tbody>
                <SimpleValue label="Psi Target Mode" value={items.battleType === 9 && (items.psiTargetMatrix || 6)}>
                    {x => psiTargetMatrix.filter((str, idx) => x & (1 << idx)).map(lc).join(", ")}
                </SimpleValue>
                <SimpleValue label="Dropoff" value={items.dropoff}/>
                <SimpleValue label="Max Range" value={items.maxRange}/>
                <BooleanValue label="LOS Required" value={items.LOSRequired}/>
                <SimpleValue label="Spawned Unit" value={items.spawnUnit}>{ linkFn }</SimpleValue>
                <SimpleValue label="Spawned Unit Controller" value={items.spawnUnitFaction} showZero>{ getUnitFaction }</SimpleValue>
            </tbody>
        </React.Fragment>
    );
}