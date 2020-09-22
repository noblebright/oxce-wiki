import React, { useCallback } from "react";
import Table from "react-bootstrap/Table";

export const SectionHeader = ({label}) => (label ? <thead><tr><th className="SectionHeader" colSpan="2">{label}</th></tr></thead> : null);
export const ListHeader = ({label}) => (<thead>{label && <tr><th colSpan="2" className="ListHeader">{label}</th></tr>}</thead>);

export const ContainerValue = ({children}) => <tr><td colSpan="2">{children}</td></tr>;
export const SimpleValue = ({label, value, children, showZero}) => ((showZero ? (value || value === 0) : value) ? <tr><td>{label}</td><td>{children ? children(value) : value}</td></tr> : null);
export const BooleanValue = ({label, value}) => (value !== undefined && value !== null ? <SimpleValue label={label} value={`${value}`.toUpperCase()}/> : null);
export const ListValue = ({label, values, children}) => (values && values.length > 0 ?
    <React.Fragment>
        <ListHeader label={label}/>        
        <tbody>
            <tr>
                <td colSpan="2" className="ListValues">
                        { values.map((val, idx) => (
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
export const Percent = x => `${x}%`;
export const KeyValue = ([k, v]) => <span className="KeyValue"><span>{k}</span><span>{v}</span></span>;

function statValue({min, max, stats}, field) {
    if(stats) return stats[field];
    return `${min[field]} - ${max[field]}`;
}

export const UnitStats = ({label = "Stats", lc, ...stats}) => (stats.stats || (stats.min && stats.max) ?
        <React.Fragment>
            <ListHeader label={label}/>
            <tbody>
                <SimpleValue showZero label={lc("STR_TIME_UNITS")} value={statValue(stats, "tu")}/>
                <SimpleValue showZero label={lc("STR_STAMINA")} value={statValue(stats, "stamina")}/>
                <SimpleValue showZero label={lc("STR_HEALTH")} value={statValue(stats, "health")}/>
                <SimpleValue showZero label={lc("STR_BRAVERY")} value={statValue(stats, "bravery")}/>
                <SimpleValue showZero label={lc("STR_REACTIONS")} value={statValue(stats, "reactions")}/>
                <SimpleValue showZero label={lc("STR_FIRING_ACCURACY")} value={statValue(stats, "firing")}/>
                <SimpleValue showZero label={lc("STR_THROWING_ACCURACY")} value={statValue(stats, "throwing")}/>
                <SimpleValue showZero label={lc("STR_STRENGTH")} value={statValue(stats, "strength")}/>
                <SimpleValue showZero label={lc("STR_PSIONIC_STRENGTH")} value={statValue(stats, "psiStrength")}/>
                <SimpleValue showZero label={lc("STR_PSIONIC_SKILL")} value={statValue(stats, "psiSkill")}/>
                <SimpleValue showZero label={lc("STR_MELEE_ACCURACY")} value={statValue(stats, "melee")}/>
                <SimpleValue showZero label={lc("STR_MANA_POOL")} value={statValue(stats, "mana")}/>
            </tbody>
        </React.Fragment>
        : null
);

export const HeightStats = ({entity}) => (
    <React.Fragment>
        <SimpleValue label="Stand Height" value={entity.standHeight}/>
        <SimpleValue label="Kneel Height" value={entity.kneelHeight}/>
        <SimpleValue label="Float Height" value={entity.floatHeight}/>
    </React.Fragment>
);

export function SimpleSelect({ options, value, onChange }) {
    const handleChange = useCallback(evt => onChange(evt.target.value), [onChange]);
    return (
        <select value={value} onChange={handleChange}>
            { options.map(x => <option key={x} value={x}>{x}</option>) }
        </select>
    );
}

export const MissingSprite = ({size = "1em"}) => (
    <svg width={size} height={size} viewBox="0 0 16 16" className="bi bi-question-diamond" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M6.95.435c.58-.58 1.52-.58 2.1 0l6.515 6.516c.58.58.58 1.519 0 2.098L9.05 15.565c-.58.58-1.519.58-2.098 0L.435 9.05a1.482 1.482 0 0 1 0-2.098L6.95.435zm1.4.7a.495.495 0 0 0-.7 0L1.134 7.65a.495.495 0 0 0 0 .7l6.516 6.516a.495.495 0 0 0 .7 0l6.516-6.516a.495.495 0 0 0 0-.7L8.35 1.134z"/>
        <path d="M5.25 6.033h1.32c0-.781.458-1.384 1.36-1.384.685 0 1.313.343 1.313 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.007.463h1.307v-.355c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.326 0-2.786.647-2.754 2.533zm1.562 5.516c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
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

export const damageKeys = [
    "STR_DAMAGE_UC", "STR_DAMAGE_ARMOR_PIERCING", "STR_DAMAGE_INCENDIARY", "STR_DAMAGE_HIGH_EXPLOSIVE", "STR_DAMAGE_LASER_BEAM",
    "STR_DAMAGE_PLASMA_BEAM", "STR_DAMAGE_STUN", "STR_DAMAGE_MELEE", "STR_DAMAGE_ACID", "STR_DAMAGE_SMOKE",
    "STR_DAMAGE_10", "STR_DAMAGE_11", "STR_DAMAGE_12", "STR_DAMAGE_13", "STR_DAMAGE_14",
    "STR_DAMAGE_15", "STR_DAMAGE_16", "STR_DAMAGE_17", "STR_DAMAGE_18", "STR_DAMAGE_19"
];

export const getDamageKey = x => damageKeys[x];
export const Actions = ({children}) => (<tbody><tr><td colSpan="2"><Table>{children}</Table></td></tr></tbody>);
export const ActionHeader = ({label}) => (<thead>{label && <tr><th className="ListHeader">{label}</th><th className="ListHeader">Accuracy</th><th className="ListHeader">Cost</th></tr>}</thead>);
export const ActionValue = ({label, cost, show, accuracy, shots}) => (
    show ? 
    <tr>
        <td>{label}{shots ? ` (x${shots})` : ""}</td>
        <td>{accuracy}</td>
        <td>{cost}</td>
    </tr> : null
);

function getMultiplier(suffix) {
    switch(suffix) {
        case "Melee" : return "meleeMultiplier";
        case "Throw" : return "throwMultiplier";
        default: return "accuracyMultiplier";
    }
}

function getDefaultAccuracy(suffix) {
    switch(suffix) {
        case "Melee": return "melee";
        case "Throw": return "throwing";
        default: return "firing";
    }
}

function hasMultiplier(items, suffix) {
    const multiplier = items[getMultiplier(suffix)];
    if(!multiplier) return false;
    const keys = Object.keys(multiplier);
    return keys.length !== 1 || keys[0] !== getDefaultAccuracy(suffix) || multiplier[keys[0]] !== 1;
}

export function Accuracy({items, suffix, bonusFn, defaultAcc}) {
    const multiplier = items[getMultiplier(suffix)];

    return (
        <div>{items[`accuracy${suffix}`] || defaultAcc}{ hasMultiplier(items, suffix) ? ` * (${bonusFn(multiplier)})` : null}%</div>
    );
}