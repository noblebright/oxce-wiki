import React from "react";
import { ListHeader, ListValue, SimpleValue, getUnitFaction } from "../../ComponentUtils.jsx";
import Damage from "./Damage.jsx";
import DamageAlter from "./DamageAlter.jsx";


export default function Ammo({ ruleset, items, lc, linkFn, spriteFn }) {
    return (
        <React.Fragment>
            <tbody>
                <SimpleValue label={spriteFn(items.bigSprite)} value={items}>
                    { x => (
                        <Damage items={items} lc={lc}>
                            <div>{lc("clipSize")}: {x.clipSize}</div>
                        </Damage>
                    )}
                </SimpleValue>
                <SimpleValue label="Spawned Unit" value={items.spawnUnit}>{ linkFn }</SimpleValue>
                <SimpleValue label="Spawned Unit Controller" value={items.spawnUnitFaction} showZero>{ getUnitFaction }</SimpleValue>
            </tbody>
            {items.damageAlter ? (
                <React.Fragment>
                    <ListHeader label="Ammo Properties"/>
                    <tbody>
                        <SimpleValue label="Waypoints" value={items.waypoints}/>
                        <DamageAlter type={items.damageType} alter={items.damageAlter} ruleset={ruleset} blastRadius={items.blastRadius} lc={lc}/>
                    </tbody>
                </React.Fragment>
            ) : null}
            <ListValue label="Ammunition For" values={items.ammoFor}>{ linkFn }</ListValue>
        </React.Fragment>
    );
}