import React from "react";
import {Table} from "react-bootstrap";

import useBonusString from "../../../hooks/useBonusString.js";
import { ListHeader, BooleanValue, SimpleValue, Actions, ActionValue, ActionHeader, Accuracy, Percent, getUnitFaction } from "../../ComponentUtils.js";
import DamageAlter from "./DamageAlter.js";
import Damage from "./Damage.js";
import Cost, { hasCost } from "./Cost.js";
import { ShotType } from "../../../model/Constants.js";

const actionTypes = Object.values(ShotType);
const actionLabel = {
    "Aimed": "STR_AIMED_SHOT", 
    "Snap": "STR_SNAP_SHOT", 
    "Auto": "STR_AUTO_SHOT",
    "Melee": "STR_HIT_MELEE"
};

function getActionKey(item, suffix) {
    const customName = item[`conf${suffix}`]?.name;
    return customName || actionLabel[suffix];
}

function getShots(item, suffix) {
    const confShots = item[`conf${suffix}`]?.shots;
    const autoShots = suffix === "Auto" ? (item.autoShots || 3) : undefined;
    return confShots || autoShots || undefined;
}

function getArcing(item, suffix) {
    if(suffix === "Melee") return false; // no such thing as an arcing melee weapon
    const confArcing = item[`conf${suffix}`]?.arcing;
    return confArcing || item.arcingShot || undefined;
}

const GunAction = ({suffix, item, lc, bonusFn}) => (
    <ActionValue label={`${lc(getActionKey(item, suffix))} ${getArcing(item, suffix) ? "\u21B7" : ""}`} 
        show={hasCost(item, suffix)}
        cost={<Cost value={item} suffix={suffix} lc={lc} />}
        accuracy={<Accuracy items={item} suffix={suffix} bonusFn={bonusFn}/>}
        shots={getShots(item, suffix)}
    />
);

const GunAmmo = ({lc, linkFn, item, integral, melee, ruleset}) => (
    <tr>
        <td>{integral ? "-" : linkFn(item.type)}</td>
        <td>
            {item.clipSize && item.clipSize !== -1 ? <div>{lc("clipSize")}: {item.clipSize}</div> : null}
            <div>
                <Table striped>
                    <tbody>
                        <DamageAlter type={melee ? item.meleeType : item.damageType} 
                                     alter={melee ? item.meleeAlter : item.damageAlter} 
                                     ruleset={ruleset}
                                     blastRadius={item.blastRadius} lc={lc}/>
                    </tbody>
                </Table>
            </div>
        </td>
        <td>
            <Damage items={item} lc={lc} melee={melee}/>
        </td>
    </tr>
);

const hasAmmo = item => item.compatibleAmmo || item.ammo;

function buildActions(item, lc, linkFn, bonusFn, ruleset) {
    let result;

    const getAction = list => list.map(x => <GunAction key={x} suffix={x} item={item} lc={lc} bonusFn={bonusFn}/>);
    const getAmmo = (ammoList, key = "getAmmo") => (
        <tr key={key}>
            <td></td>
            <td colSpan="2">
                <Table className="table-secondary" striped>
                    <tbody>
                        {ammoList.map(x => <GunAmmo key={x} lc={lc} linkFn={linkFn} item={ruleset.entries[x].items} ruleset={ruleset}/>)}
                    </tbody>      
                </Table>
            </td>
        </tr>
    );

    const melee = hasCost(item, "Melee") ? [
        <GunAction key="Melee" suffix="Melee" item={item} lc={lc} bonusFn={bonusFn}/>,
        <tr key="MeleeAmmo">
            <td></td>
            <td colSpan="2">
                <Table className="table-secondary" striped>
                    <tbody>
                        <GunAmmo lc={lc} linkFn={linkFn} item={item} integral ruleset={ruleset} melee/>
                    </tbody>
                </Table>
            </td>
        </tr>
    ] : [];

    if(!hasAmmo(item)) {
        //this item does not use external ammo (no ammo or integral ammo like throwing knives)
        result = getAction(actionTypes);
        result = result.concat(melee);
        return result;
    }
    if(!item.ammo) { //compatibleAmmo only, so only one segment.
        result = getAction(actionTypes);
        result = result.concat(getAmmo(item.compatibleAmmo));
        return result.concat(melee);
    }
    //heterogenous ammo case.
    result = [];
    //FIXME: Handle cases where ammo slot has no compatibleAmmo.
    Object.keys(item.ammo).forEach(key => {
        const actions = getAction(actionTypes.filter(x => hasCost(item, x) && !item[`conf${x}`] ? 
            key === "0" : // if there's a shot type but no conf object, assume slot 0
            `${item[`conf${x}`]?.ammoSlot}` === key)); //cast to string
        result = result.concat(actions);
        result = result.concat(getAmmo(item.ammo[key].compatibleAmmo, `ammo${key}`));
    });
    result = result.concat(melee);
    return result;
}

function ReloadTimes({ items, lc }) {
    let customReloading = false;
    if(items.ammo) {
        customReloading = Object.values(items.ammo).reduce((acc, ammo) => { 
            return acc || !!ammo.tuLoad || !!ammo.tuUnload
        }, false);
    }
    if(!hasAmmo(items)) {
        return null;
    }
    const ammoReloadValues = [];
    if(customReloading) {
        actionTypes.filter(x => items[`conf${x}`]?.ammoSlot !== undefined).forEach(type => {
            const slot = items[`conf${type}`]?.ammoSlot;
            ammoReloadValues.push(<SimpleValue key={`${type}reload`} label={`${lc("tuLoad")}: ${lc(getActionKey(items, type))}`} value={items.ammo[slot].tuLoad}/>);
            ammoReloadValues.push(<SimpleValue key={`${type}unload`}  label={`${lc("tuUnload")}: ${lc(getActionKey(items, type))}`} value={items.ammo[slot].tuUnload}/>)
        });
    } else {
        ammoReloadValues.push(<SimpleValue key={`reload`} label={lc("tuLoad")} value={items.tuLoad}/>);
        ammoReloadValues.push(<SimpleValue key={`unload`} label={lc("tuUnload")} value={items.tuUnload}/>)
    }
    return (
        <React.Fragment>
            { ammoReloadValues }
        </React.Fragment>
    );
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
                                    <DamageAlter type={x.damageType} alter={x.damageAlter} lc={lc} blastRadius={x.blastRadius} ruleset={ruleset}/>
                                </tbody>
                            </Table> : null}
                        </Damage>
                    ) : "As Ammo" }
                </SimpleValue>
            </tbody>
            <Actions>
                <ActionHeader label="Actions"/>
                <tbody>
                    { buildActions(items, lc, linkFn, bonusFn, ruleset) }
                    <ActionValue label={lc("STR_THROW")}
                                show={!items.fixedWeapon}
                                cost={<Cost value={items} suffix="Throw" lc={lc} defaultTu={25}/>}
                                accuracy={<Accuracy items={items} suffix="Throw" bonusFn={bonusFn} defaultAcc={100}/>}
                    />
                </tbody>
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
                <SimpleValue label="CQC Accuracy" value={items.accuracyCloseQuarters}>{ Percent }</SimpleValue>
                <SimpleValue label="Min Range" value={items.minRange}/>
                <ReloadTimes items={items} lc={lc} />
                <SimpleValue label="Dropoff" value={items.dropoff}/>
                <BooleanValue label="Arcing?" value={items.arcingShot}/>
                <SimpleValue label="Effective Range" value={items.powerRangeThreshold}/>
                <SimpleValue label="Damage Dropoff" value={items.powerRangeReduction}/>
                <SimpleValue label="Spawned Unit" value={items.spawnUnit}>{ linkFn }</SimpleValue>
                <SimpleValue label="Spawned Unit Controller" value={items.spawnUnitFaction} showZero>{ getUnitFaction }</SimpleValue>
            </tbody>
        </React.Fragment>
    );
}