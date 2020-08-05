import React from "react";
import Table from "react-bootstrap/Table";
import useLink from "../../hooks/useLink";
import useLocale from "../../hooks/useLocale";
import useBonusString from "../../hooks/useBonusString";
import { BooleanValue, ListValue, Percent, SectionHeader, ListHeader, SimpleValue, HeightStats, UnitStats } from "../ComponentUtils.js";
import useImage from "../../hooks/useImage";

function Armor({armors, lc}) {
    if(!armors) return null;
    return (
        <Table bordered striped size="sm" className="auto-width">
            <ListHeader label="Armor Rating"/>
            <tbody>
                <SimpleValue showZero label={lc("STR_FRONT_ARMOR")} value={armors.frontArmor}/>
                <SimpleValue showZero label={lc("STR_LEFT_ARMOR")} value={armors.sideArmor + (armors.leftArmorDiff || 0) }/>
                <SimpleValue showZero label={lc("STR_RIGHT_ARMOR")} value={armors.sideArmor}/>
                <SimpleValue showZero label={lc("STR_REAR_ARMOR")} value={armors.rearArmor}/>
                <SimpleValue showZero label={lc("STR_UNDER_ARMOR")} value={armors.underArmor}/>
            </tbody>
        </Table>
    );
}

const damageKeys = [
    "STR_DAMAGE_UC", "STR_DAMAGE_ARMOR_PIERCING", "STR_DAMAGE_INCENDIARY", "STR_DAMAGE_HIGH_EXPLOSIVE", "STR_DAMAGE_LASER_BEAM",
    "STR_DAMAGE_PLASMA_BEAM", "STR_DAMAGE_STUN", "STR_DAMAGE_MELEE", "STR_DAMAGE_ACID", "STR_DAMAGE_SMOKE",
    "STR_DAMAGE_10", "STR_DAMAGE_11", "STR_DAMAGE_12", "STR_DAMAGE_13", "STR_DAMAGE_14",
    "STR_DAMAGE_15", "STR_DAMAGE_16", "STR_DAMAGE_17", "STR_DAMAGE_18", "STR_DAMAGE_19"
];

function DamageResists({resists, lc}) {
    if(!resists) return null;
    return (
        <Table bordered striped size="sm" className="auto-width">
            <ListHeader label="Damage Resistance"/>
            <tbody>
                { resists.map((value, idx) => <SimpleValue key={idx} label={lc(damageKeys[idx])} value={Math.floor(value * 100)}>{Percent}</SimpleValue>) }
            </tbody>
        </Table>
    );
}

const moveType = [
    "Walking",
    "Flying",
    "Sliding",
    "Floating",
    "Sinking"
];

const recoveryStrings = {
    time: "STR_TIME_UNITS",
    energy: "STR_ENERGY",
    morale: "STR_MORALE",
    health: "STR_HEALTH",
    stun: "STR_STUN",
    mana: "STR_MANA_CURRENT"
};

function StatRecovery({recovery, bonusFn, lc}) {
    if(!recovery) return null;
    return (
        <React.Fragment>
            <ListHeader label="Stat Recovery"/>
            <tbody>
                { Object.keys(recovery).map((key, idx) => <SimpleValue key={idx} label={lc(recoveryStrings[key])} value={recovery[key]}>{ bonusFn }</SimpleValue>) }
            </tbody>
        </React.Fragment>
    );
}

export default function Armors({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const bonusFn = useBonusString(lc);
    const imageFn = useImage(ruleset, 2);
    const entry = ruleset.entries[id];
    const armors = entry.armors;

    if(!armors) return null;

    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Armor"/>
            <tbody>
                <tr><td colSpan="2">{ imageFn(armors.spriteInv) }</td></tr>
                <tr>
                    <td><Armor armors={armors} lc={lc}/></td>
                    <td><DamageResists resists={armors.damageModifier} lc={lc}/></td>
                </tr>
            </tbody>
            <StatRecovery recovery={armors.recovery} lc={lc} bonusFn={bonusFn}/>
            <ListHeader label="Properties"/>
            <tbody>
                <SimpleValue label="Recovered Corpse" value={armors.corpseGeo}>{ linkFn }</SimpleValue>
                <SimpleValue label="Inventory Item" value={armors.storeItem}>{ linkFn }</SimpleValue>
                <SimpleValue label="Special Weapon" value={armors.specialWeapon}>{ linkFn }</SimpleValue>
                <SimpleValue label="Movement Type" value={armors.movementType}>{ x => moveType[x] }</SimpleValue>
                <SimpleValue label="Size" value={armors.size || 1}/>
                <SimpleValue label="Weight" value={armors.weight}/>
                <SimpleValue label="Day Vision" value={armors.visibilityAtDay}/>
                <SimpleValue label="Night Vision" value={armors.visibilityAtDark}/>
                <SimpleValue label="Personal Light" value={armors.personalLight}/>
                <SimpleValue label="Camouflage (Day)" value={armors.camouflageAtDay}/>
                <SimpleValue label="Camouflage (Night)" value={armors.camouflageAtDark}/>
                <SimpleValue label="Camouflage Detection (Day)" value={armors.antiCamouflageAtDay}/>
                <SimpleValue label="Camouflage Detection (Night)" value={armors.antiCamouflageAtDark}/>
                <SimpleValue label="Thermal Vision" value={armors.heatVision}>{ Percent }</SimpleValue>
                <SimpleValue label="Psi Sense" value={armors.psiVision}/>
                <SimpleValue label="Overkill Threshold" value={armors.overKill}>{Percent}</SimpleValue>
                <BooleanValue label="Can Run?" value={armors.allowsRunning}/>
                <BooleanValue label="Can Kneel?" value={armors.allowsKneeling}/>
                <BooleanValue label="Can Strafe?" value={armors.allowsStrafing}/>
                <BooleanValue label="Can Move?" value={armors.allowsMoving}/>
                <BooleanValue label="Instant Wound Recovery?" value={armors.instantWoundRecovery}/>
                <BooleanValue label="Fear Immune?" value={armors.fearImmune}/>
                <BooleanValue label="Bleed Immune?" value={armors.bleedImmune}/>
                <BooleanValue label="Pain Immune?" value={armors.painImmune}/>
                <BooleanValue label="Zombie Immune?" value={armors.zombiImmune}/>
                <BooleanValue label="CQC Immune?" value={armors.ignoresMeleeThread}/>
                <BooleanValue label="CQC Capable?" value={armors.createsMeleeThread}/>
                <SimpleValue label="Psi Defense" value={armors.psiDefense}>{ bonusFn }</SimpleValue>
                <SimpleValue label="Melee Dodge" value={armors.meleeDodge}>{ bonusFn }</SimpleValue>
                <SimpleValue label="Back Dodge Penalty" value={Math.floor(armors.meleeDodgeBackPenalty * 100)}>{ Percent }</SimpleValue>
                <SimpleValue label="Side Dodge Penalty" value={Math.floor(armors.meleeDodgeBackPenalty * 100) / 2}>{ Percent }</SimpleValue>
                <HeightStats entity={armors} />
                <UnitStats stats={armors.stats} lc={lc}/>
            </tbody>
            <ListValue label="Corpse Item" values={armors.corpseBattle}>{ linkFn }</ListValue>
            <ListValue label="Built-in Weapons" values={armors.builtInWeapons}>{ linkFn }</ListValue>
            <ListValue label="Categories" values={armors.categories}>{ lc }</ListValue>
            <ListValue label="Required to Purchase" values={armors.requiresBuy}>{ linkFn }</ListValue>
            <ListValue label="Required to Use" values={armors.requires}>{ linkFn }</ListValue>
        </Table>
    );
}