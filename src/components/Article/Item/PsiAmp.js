import React from "react";
import Table from "react-bootstrap/Table";

import useBonusString from "../../../hooks/useBonusString";
import DamageAlter from "./DamageAlter";
import { ListHeader, SimpleValue, getDamageKey, Actions, ActionValue, ActionHeader, Accuracy } from "../../ComponentUtils";
import Cost, { hasCost } from "./Cost";

const psiTargetMatrix = [
    "STR_XCOM",
    "STR_ALIENS",
    "MALE_CIVILIAN"
];

function PsiDamage({ items, lc }) {
    const bonusFn = useBonusString(lc);
    const damageLabel = lc(getDamageKey(items.damageAlter?.resistType || items.damageType));
    return (
        <React.Fragment>
            <div>{damageLabel}</div>
            <div>{items.power}{bonusFn(items.damageBonus)}</div>
            <Table>
                <ListHeader label="Damage Properties"/>
                <tbody>
                    <DamageAlter alter={items.damageAlter} lc={lc}/>
                </tbody>
            </Table>
        </React.Fragment>
    )
}

export default function PsiAmp({ ruleset, items, lc, linkFn, spriteFn }) {
    const bonusFn = useBonusString(lc);
    return (
        <React.Fragment>
            <tbody>
                <SimpleValue label={spriteFn(items.bigSprite)} value={<PsiDamage items={items} lc={lc} />}/>
            </tbody>
            <Actions>
                <ActionHeader label="Actions"/>
                <tbody>
                    <ActionValue label={lc("STR_PANIC_UNIT")} 
                                show={hasCost(items, "Panic")}
                                cost={<Cost value={items} suffix="Panic" lc={lc} />}
                    />
                    <ActionValue label={lc("STR_MIND_CONTROL")} 
                                show={hasCost(items, "MindControl")}
                                cost={<Cost value={items} suffix="MindControl" lc={lc} />}
                    />
                    <ActionValue label={lc(items.psiAttackName)} 
                                show={hasCost(items, "Use") && items.damageType}
                                cost={<Cost value={items} suffix="Use" lc={lc} />}
                                accuracy={<Accuracy items={items} suffix="Use" bonusFn={bonusFn}/>}
                    />
                    <ActionValue label={lc("STR_THROW")}
                                show={true}
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
            </tbody>
        </React.Fragment>
    );
}