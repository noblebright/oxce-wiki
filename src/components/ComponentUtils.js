import React from "react";

export const SectionHeader = ({label}) => (label ? <thead><tr><th className="SectionHeader" colSpan="2">{label}</th></tr></thead> : null);

export const ListHeader = ({label}) => (<thead>{label && <tr><th colSpan="2" className="ListHeader">{label}</th></tr>}</thead>);

export const SimpleValue = ({label, value, children}) => (<tr><td>{label}</td><td>{children ? children(value) : value}</td></tr>);
export const ListValue = ({label, values, children}) => (
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
)