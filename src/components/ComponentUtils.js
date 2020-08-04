import React from "react";

export const SectionHeader = ({label}) => (label ? <thead><tr><th className="SectionHeader" colSpan="2">{label}</th></tr></thead> : null);

export const ListHeader = ({label}) => (<thead>{label && <tr><th colSpan="2" className="ListHeader">{label}</th></tr>}</thead>);

export const SimpleValue = ({label, value, children}) => (value ? <tr><td>{label}</td><td>{children ? children(value) : value}</td></tr> : null);
export const BooleanValue = ({label, value}) => (value ? <SimpleValue label={label} value="TRUE"/> : null);
export const ListValue = ({label, values, children}) => (values && values.length > 0 ?
    <React.Fragment>
        <ListHeader label={label}/>        
        <tbody>
            <tr>
                <td colSpan="2" className="ListValues">
                        { values.map((val, idx) => (
                            <div className="ListValue" key={idx}>{children(val)}</div>
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
export const Image = x => ``