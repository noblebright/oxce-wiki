import React from "react";
import { ListHeader, ListValue, SimpleValue, getUnitFaction } from "../../ComponentUtils";
import Damage from "./Damage";
import DamageAlter from "./DamageAlter";


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
                        <DamageAlter type={items.damageType} alter={items.damageAlter} ruleset={ruleset} blastRadius={items.blastRadius} lc={lc}/>
                    </tbody>
                </React.Fragment>
            ) : null}
            <ListValue label="Ammunition For" values={items.ammoFor}>{ linkFn }</ListValue>
        </React.Fragment>
    );
}