import React from "react";
import Table from "react-bootstrap/table";

import useBonusString from "../../../hooks/useBonusString";
import { ListHeader, SimpleValue, Actions, ActionValue, ActionHeader, Accuracy } from "../../ComponentUtils";
import DamageAlter from "./DamageAlter";
import Damage from "./Damage";
import Cost, { hasCost } from "./Cost";

const actionTypes = ["Aimed", "Snap", "Auto", "Melee"];
const actionLabel = {
    "Aimed": "STR_AIMED_SHOT", 
    "Snap": "STR_SNAP_SHOT", 
    "Auto": "STR_AUTO_SHOT", 
    "Melee": "STR_HIT_MELEE"
}

function getActionKey(item, suffix) {
    const customName = item[`conf${suffix}`]?.name;
    return customName || actionLabel[suffix];
}

function getShots(item, suffix) {
    const confShots = item[`conf${suffix}`]?.shots;
    const autoShots = suffix === "Auto" ? item.autoShots : undefined;
    return confShots || autoShots || undefined;
}

const GunAction = ({suffix, item, lc, bonusFn}) => (
    <ActionValue label={lc(getActionKey(item, suffix))} 
        show={hasCost(item, suffix)}
        cost={<Cost value={item} suffix={suffix} lc={lc} />}
        accuracy={<Accuracy items={item} suffix={suffix} bonusFn={bonusFn}/>}
        shots={getShots(item, suffix)}
    />
);

const GunAmmo = ({lc, linkFn, item, integral}) => (
    <tr>
        <td>{integral ? "-" : linkFn(item.type)}</td>
        <td>
            <div>{lc("clipSize")}: {item.clipSize}</div>
            <div>
                <Table>
                    <tbody>
                        <DamageAlter type={item.damageType} alter={item.damageAlter} blastRadius={item.blastRadius} lc={lc}/>
                    </tbody>
                </Table>
            </div>
        </td>
        <td>
            <Damage items={item} lc={lc}/>
        </td>
    </tr>
);

function buildActions(item, lc, linkFn, bonusFn, ruleset) {
    let result;

    const getAction = list => list.map(x => <GunAction key={x} suffix={x} item={item} lc={lc} bonusFn={bonusFn}/>);
    const getAmmo = ammoList => ammoList.map(x => <GunAmmo key={x} lc={lc} linkFn={linkFn} item={ruleset.entries[x].items}/>)

    if(!item.compatibleAmmo && !item.ammo) {
        //this item does not use external ammo (no ammo or integral ammo like throwing knives)
        result = getAction(actionTypes);
        return result;
    }
    if(!item.ammo) { //compatibleAmmo only, so only one segment.
        result = getAction(actionTypes);
        return result.concat(getAmmo(item.compatibleAmmo));
    }
    //heterogenous ammo case.
    result = [];
    Object.keys(item.ammo).forEach(key => {
        const actions = getAction(actionTypes.filter(x => `${item[`conf${x}`]?.ammoSlot}` === key)); //cast to string
        result = result.concat(actions);
        result = result.concat(getAmmo(item.ammo[key].compatibleAmmo));
    })
    return result;
}

export default function Firearm({ ruleset, items, lc, linkFn, spriteFn }) {
    const bonusFn = useBonusString(lc);
    const integralAmmo = !items.compatibleAmmo && !items.ammo;

    return (
        <React.Fragment>
            <tbody>
                <SimpleValue label={spriteFn(items.bigSprite)} value={items}>
                { x => integralAmmo ?  (
                        <Damage items={x} lc={lc}>
                            {x.clipSize !== -1 && <div>{lc("clipSize")}: {x.clipSize}</div>}
                            { x.damageAlter ? <Table>
                                <ListHeader label="Damage Properties"/>
                                <tbody>
                                    <DamageAlter type={x.damageType} alter={x.damageAlter} lc={lc} blastRadius={x.blastRadius}/>
                                </tbody>
                            </Table> : null}
                        </Damage>
                    ) : "As Ammo" }
                </SimpleValue>
            </tbody>
            <Actions>
                <ActionHeader label="Actions"/>
                <tbody>{ buildActions(items, lc, linkFn, bonusFn, ruleset) }</tbody>
            </Actions>
            <ListHeader label="Firearm Properties"/>
            <tbody>
                <SimpleValue label="Waypoints" value={items.waypoints}/>
                <SimpleValue label="Spray Waypoints" value={items.sprayWaypoints}/>
                <SimpleValue label="Shotgun Spread" value={items.shotgunSpread}/>
                <SimpleValue label="Shotgun Choke" value={items.shotgunChoke}/>
                <SimpleValue label="Max Range" value={items.maxRange || 200}/>
                {hasCost(items, "Aimed") && <SimpleValue label="Aim Range" value={items.aimRange || 200}/>}
                {hasCost(items, "Snap") && <SimpleValue label="Snap Range" value={items.snapRange || 15}/>}
                {hasCost(items, "Auto") && <SimpleValue label="Auto Range" value={items.autoRange || 7}/>}
                <SimpleValue label="Min Range" value={items.minRange}/>
                <SimpleValue label="Dropoff" value={items.dropoff}/>
                <SimpleValue label="Effective Range" value={items.powerRangeThreshold}/>
                <SimpleValue label="Damage Dropoff" value={items.powerRangeReduction}/>
            </tbody>
        </React.Fragment>
    );
}