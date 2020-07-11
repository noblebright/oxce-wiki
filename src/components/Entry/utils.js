import React from "react";
import { Link } from "react-router-dom";
import { getLabel } from "../../model/RuleLoader";

export const SimpleValue = ({ label, value, children }) => (<tr><td>{label}</td><td>{children ? children(value) : value}</td></tr>);
export const ListValue = ({label, values, children}) => (
    <React.Fragment>
        {label && <tr><th colSpan="2">{label}</th></tr>}
        { 
            values.reduce((acc, item) => {
                if(acc[acc.length - 1].length === 2) {
                    acc.push([]);
                }
                acc[acc.length - 1].push(item);
                return acc;
            }, [[]]).map((tuple, idx) => (<tr key={idx}><td>{children(tuple[0])}</td><td>{tuple[1] && children(tuple[1])}</td></tr>))
        }
    </React.Fragment>
);

export const getInventoryEntry = locale => ([id, quantity]) => (<React.Fragment><Link to={`/${id}`}>{getLabel(id, locale)}</Link>: <span>{quantity}</span></React.Fragment>);

export const useLink = locale => id => <Link to={`/${id}`}>{getLabel(id, locale)}</Link>;

const costKeys = [["time", "STR_TIME_UNITS"], ["energy", "STR_ENERGY"], ["morale", "STR_MORALE"], ["health", "STR_HEALTH",], ["mana", "mana"], ["stun", "STR_DAMAGE_STUN"]];
export const Cost = ({ cost, flat = {}, locale }) => {
    const ary = costKeys.map(([key, label]) => (cost[key] ? `${getLabel(label, locale)}: ${cost[key]}${!flat[key] ? "%" : ""}`: null)).filter(x => x);
    return (<span>{ary.join(", ")}</span>);
}

const damageKeys = [
    "STR_DAMAGE_UC", "STR_DAMAGE_ARMOR_PIERCING", "STR_DAMAGE_INCENDIARY", "STR_DAMAGE_HIGH_EXPLOSIVE", "STR_DAMAGE_LASER_BEAM",
    "STR_DAMAGE_PLASMA_BEAM", "STR_DAMAGE_STUN", "STR_DAMAGE_MELEE", "STR_DAMAGE_ACID", "STR_DAMAGE_SMOKE",
    "STR_DAMAGE_10", "STR_DAMAGE_11", "STR_DAMAGE_12", "STR_DAMAGE_13", "STR_DAMAGE_14",
    "STR_DAMAGE_15", "STR_DAMAGE_16", "STR_DAMAGE_17", "STR_DAMAGE_18", "STR_DAMAGE_19"
];

function getDamageLabel(type, locale) {
    return getLabel(damageKeys[type], locale);
}

const multiplierKeys = [
    ["tu", "STR_FIRING_ACCURACY"], 
    ["stamina", "STR_STAMINA"],
    ["health", "STR_HEALTH"],
    ["bravery", "STR_BRAVERY"],
    ["reactions", "STR_REACTIONS"],
    ["firing", "STR_FIRING_ACCURACY"],
    ["throwing", "STR_THROWING_ACCURACY"],
    ["strength", "STR_STRENGTH"],
    ["psiStrength", "STR_PSIONIC_STRENGTH"],
    ["psiSkill", "STR_PSIONIC_SKILL"],
    ["melee", "STR_MELEE_ACCURACY"],
    ["mana", "mana"]
];

const bonusExponent = ["", "^2", "^3"];
function getBonus(multiplierValue, labelKey, locale) {
    const bonus = [];
    const label = getLabel(labelKey, locale);
    if(Array.isArray(multiplierValue)) {
        for(let i = 0; i < 3; i++) {
            if(multiplierValue[i]) {
                bonus.push(`${multiplierValue[i] === 1 ? "" : multiplierValue[i]} * ${label}${bonusExponent[i]}`);
            }
        }
        return bonus.join(" + ");
    } else {
        return `${multiplierValue === 1 ? "" : multiplierValue} ${label}`;
    }
}

export function getAccuracyMultiplierString(multiplier, locale) {
    return multiplierKeys.map(([key, label]) => (multiplier[key] ? `${getBonus(multiplier[key], label, locale)}` : null)).filter(x=>x).join(" + ");
}

export function Damage({item, secondaryMelee = false, locale}) {
    const dKey = secondaryMelee ? "melee" : "damage";
    const alterKey = `${dKey}Alter`;
    const profile = {};
    profile.damageType = secondaryMelee ? item.meleeType : item.damageType;
    profile.blastRadius = item.blastRadius;
    profile.power = (secondaryMelee ? item.meleePower : item.power) || 0;
    profile.shotgunPellets = item.shotgunPellets;
    if(item.strengthApplied) {
        profile.damageBonus = { strength: 1.0 };
    }
    // TODO: Figure out alterDamage
    // if(item[alterKey]) {

    // }
    return <span>{profile.power}{profile.shotgunPellets ? `x${profile.shotgunPellets}` : null} {getDamageLabel(profile.damageType, locale)}</span>;
}