import React from "react";

export const SectionHeader = ({label}) => (label ? <thead><tr><th className="SectionHeader" colSpan="2">{label}</th></tr></thead> : null);

export const ListHeader = ({label}) => (<thead>{label && <tr><th colSpan="2" className="ListHeader">{label}</th></tr>}</thead>);

export const SimpleValue = ({label, value, children, showZero}) => ((showZero ? (value || value === 0) : value) ? <tr><td>{label}</td><td>{children ? children(value) : value}</td></tr> : null);
export const BooleanValue = ({label, value}) => (value ? <SimpleValue label={label} value="TRUE"/> : null);
export const ListValue = ({label, values, children}) => (values && values.length > 0 ?
    <React.Fragment>
        <ListHeader label={label}/>        
        <tbody>
            <tr>
                <td colSpan="2" className="ListValues">
                        { values.map((val, idx) => (
                            <div className="ListValue" key={idx}>{children ? children(val) : val}</div>
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

function statValue({min, max, stats}, field) {
    if(stats) return stats[field];
    return `${min[field]} - ${max[field]}`;
}

export const UnitStats = ({label = "Stats", lc, ...stats}) => (
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
);