import React from "react";
import Table from "react-bootstrap/Table";

import useBonusString from "../../../hooks/useBonusString";
import { BooleanValue, ListHeader, SimpleValue, Percent, Actions, ActionValue, ActionHeader, Accuracy } from "../../ComponentUtils";
import Cost, { hasCost } from "./Cost";
import Damage from "./Damage";
import DamageAlter from "./DamageAlter";

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

function FlareMelee({ ruleset, lc, items, bonusFn }) {
    return (
        <React.Fragment>
            <ActionValue label={lc("STR_HIT_MELEE")} 
                        show={hasCost(items, "Melee")}
                        cost={<Cost value={items} suffix="Melee" lc={lc} />}
                        accuracy={<Accuracy items={items} suffix="Melee" bonusFn={bonusFn} defaultAcc={100}/>}
            />
            <tr key="MeleeDamage">
                <td></td>
                <td colSpan="2">
                    <Table>
                        <tbody>
                        <tr>
                            <td>
                                <DamageAlter type={items.meleeType} 
                                            alter={items.meleeAlter} 
                                            ruleset={ruleset}
                                            blastRadius={items.blastRadius} lc={lc}/>
                            </td>
                            <td>
                                <Damage items={items} lc={lc} melee={true}/>
                            </td>
                        </tr>
                        </tbody>
                    </Table>
                </td>
            </tr>
        </React.Fragment>
    );
}

export default function ElectroFlare({ ruleset, items, lc, linkFn, spriteFn }) {
    const bonusFn = useBonusString(lc);
    return (
        <React.Fragment>
            <tbody>
                <SimpleValue label={spriteFn(items.bigSprite)} value={items.power}/>
            </tbody>
            <Actions>
                <ActionHeader label="Actions"/>
                <tbody>
                    { hasCost(items, "Melee") && <FlareMelee ruleset={ruleset} lc={lc} items={items} bonusFn={bonusFn} /> }
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