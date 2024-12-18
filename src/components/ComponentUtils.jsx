import React, { useCallback } from "react";
import { Table } from "react-bootstrap";
import { truncateEpsilon } from "../model/utils.js";
import purify from "dompurify";

export const SectionHeader = ({ label }) => (label ? <thead><tr className="table-dark"><th className="SectionHeader" colSpan="2">{label}</th></tr></thead> : null);
export const ListHeader = ({ label }) => (<thead>{label && <tr className="table-secondary"><th colSpan="2" className="ListHeader">{label}</th></tr>}</thead>);

export const ContainerValue = ({ children }) => <tr><td colSpan="2">{children}</td></tr>;
export const SimpleValue = ({ label, value, children, showZero }) => ((showZero ? (value || value === 0) : value) ? <tr><td>{label}</td><td>{children ? children(value) : value}</td></tr> : null);
export const BooleanValue = ({ label, value }) => (value !== undefined && value !== null ? <SimpleValue label={label} value={`${value}`.toUpperCase()} /> : null);
export const ListValue = ({ label, values, children }) => (values && values.length > 0 ?
    <React.Fragment>
        <ListHeader label={label} />
        <tbody>
            <tr>
                <td colSpan="2" className="ListValues">
                    {values.map((val, idx) => (
                        <div className="ListValue" key={idx}>{children ? children(val, idx) : val}</div>
                    ))}
                </td>
            </tr>
        </tbody>
    </React.Fragment>
    : null
)

export const Money = x => `$${x}`;
export const Hours = x => `${x} Hours`;
export const Days = x => `${x} Days`;
export const PerDay = x => `${x}/Day`;
export const Percent = x => `${truncateEpsilon(x)}%`;
export const KeyValue = ([k, v]) => <span className="KeyValue"><span>{k}</span><span>{v}</span></span>;
function statValue({ min, max, stats }, bonusStats, field) {
    const bonusString = bonusStats[field] ? `[${bonusStats[field] > 0 ? "+" : ""}${bonusStats[field]}]` : "";
    if (stats?.[field]) return bonusString ? `${stats[field]} ${bonusString} (${stats[field] + bonusStats[field]})` : stats[field];
    return (min?.[field] && max?.[field]) ? `${min[field]} - ${max[field]} ${bonusString}` : null;
}

const statNames = [
    ["STR_TIME_UNITS", "tu"],
    ["STR_STAMINA", "stamina"],
    ["STR_HEALTH", "health"],
    ["STR_BRAVERY", "bravery"],
    ["STR_REACTIONS", "reactions"],
    ["STR_FIRING_ACCURACY", "firing"],
    ["STR_THROWING_ACCURACY", "throwing"],
    ["STR_STRENGTH", "strength"],
    ["STR_PSIONIC_STRENGTH", "psiStrength"],
    ["STR_PSIONIC_SKILL", "psiSkill"],
    ["STR_MELEE_ACCURACY", "melee"],
    ["STR_MANA_POOL", "mana"]
];

export const UnitStats = ({ label = "Stats", lc, showZero = true, bonusStats = {}, ...stats }) => (stats.stats || (stats.min && stats.max) ?
    <React.Fragment>
        <ListHeader label={label} />
        <tbody>
            {statNames.map(([label, key]) => <SimpleValue key={key} showZero={showZero} label={lc(label)} value={statValue(stats, bonusStats, key)} />)}
        </tbody>
    </React.Fragment>
    : null
);

const recoveryStrings = {
    time: "STR_TIME_UNITS",
    energy: "STR_ENERGY",
    morale: "STR_MORALE",
    health: "STR_HEALTH",
    stun: "STR_STUN",
    mana: "STR_MANA_CURRENT"
};

export function StatRecovery({ recovery, bonusFn, lc }) {
    if (!recovery) return null;
    return (
        <React.Fragment>
            <ListHeader label="Stat Recovery" />
            <tbody>
                {Object.keys(recovery).map((key, idx) => <SimpleValue key={idx} label={lc(recoveryStrings[key])} value={recovery[key]}>{bonusFn}</SimpleValue>)}
            </tbody>
        </React.Fragment>
    );
}

export const HeightStats = ({ entity }) => (
    <React.Fragment>
        <SimpleValue label="Stand Height" value={entity.standHeight} />
        <SimpleValue label="Kneel Height" value={entity.kneelHeight} />
        <SimpleValue label="Float Height" value={entity.floatHeight} />
    </React.Fragment>
);

export function SimpleSelect({ options, value, onChange, children }) {
    const handleChange = useCallback(evt => onChange(evt.target.value), [onChange]);
    return (
        <select value={value} onChange={handleChange}>
            {options.map(x => <option key={x} value={x}>{children ? children(x) : x}</option>)}
        </select>
    );
}

export const MissingSprite = ({ size = "1em" }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" className="bi bi-question-diamond" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M6.95.435c.58-.58 1.52-.58 2.1 0l6.515 6.516c.58.58.58 1.519 0 2.098L9.05 15.565c-.58.58-1.519.58-2.098 0L.435 9.05a1.482 1.482 0 0 1 0-2.098L6.95.435zm1.4.7a.495.495 0 0 0-.7 0L1.134 7.65a.495.495 0 0 0 0 .7l6.516 6.516a.495.495 0 0 0 .7 0l6.516-6.516a.495.495 0 0 0 0-.7L8.35 1.134z" />
        <path d="M5.25 6.033h1.32c0-.781.458-1.384 1.36-1.384.685 0 1.313.343 1.313 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.007.463h1.307v-.355c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.326 0-2.786.647-2.754 2.533zm1.562 5.516c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
    </svg>
)

export const battleType = [
    "None (0)",
    "Firearm (1)",
    "Ammo (2)",
    "Melee (3)",
    "Grenade (4)",
    "Proximity Grenade (5)",
    "Medi-Kit (6)",
    "Motion Scanner (7)",
    "Mind Probe (8)",
    "Psi-Amp (9)",
    "Electro-flare (10)",
    "Corpse (11)"
];

export const getBattleType = (val) => battleType[val];

export const Actions = ({ children }) => (<tbody><tr><td colSpan="2"><Table striped>{children}</Table></td></tr></tbody>);
export const ActionHeader = ({ label }) => (<thead>{label && <tr className="table-secondary"><th className="ListHeader">{label}</th><th className="ListHeader">Accuracy</th><th className="ListHeader">Cost</th></tr>}</thead>);
export const ActionValue = ({ label, cost, show, accuracy, shots }) => (
    show ?
        <tr>
            <td>{label}{shots ? ` (x${shots})` : ""}</td>
            <td>{accuracy}</td>
            <td>{cost}</td>
        </tr> : null
);

function getMultiplier(suffix) {
    switch (suffix) {
        case "Melee": return "meleeMultiplier";
        case "Throw": return "throwMultiplier";
        default: return "accuracyMultiplier";
    }
}

function getDefaultAccuracy(suffix) {
    switch (suffix) {
        case "Melee": return "melee";
        case "Throw": return "throwing";
        default: return "firing";
    }
}

function hasMultiplier(items, suffix) {
    const multiplier = items[getMultiplier(suffix)];
    if (!multiplier) return false;
    const keys = Object.keys(multiplier);
    return keys.length !== 1 || keys[0] !== getDefaultAccuracy(suffix) || multiplier[keys[0]] !== 1;
}

export function Accuracy({ items, suffix, bonusFn, defaultAcc }) {
    const multiplier = items[getMultiplier(suffix)];

    return (
        <div>{items[`accuracy${suffix}`] || defaultAcc}{hasMultiplier(items, suffix) ? ` * (${bonusFn(multiplier)})` : null}%</div>
    );
}

const unitFactions = {
    "-1": "User faction",
    "0": "Player faction",
    "1": "Enemy faction",
    "2": "Civilian faction"
};

export const getUnitFaction = x => unitFactions[`${x}`];

//HACK: used to distinguish linkFn entries that should not have links associated with them.  Should be rare.
//TODO: refacotr useLink to pass ruleset and not link things that aren't valid keys.
export class NoLink {
    constructor(text) {
        this.text = text;
    }

    toString() {
        return this.text;
    }
}

export function dangerousHTML(html) {
    return {
        dangerouslySetInnerHTML: {
            __html: purify.sanitize(html)
        }
    };
}