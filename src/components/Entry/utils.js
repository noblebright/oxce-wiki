import React from "react";
import {getLabel} from "../../model/RuleLoader";

export const SimpleValue = ({ label, value, children }) => (<tr><td>{label}</td><td>{children ? children(value) : value}</td></tr>);
export const ListValue = ({label, values, children}) => (
    <React.Fragment>
        <tr><th colSpan="2">{label}</th></tr>
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
export const Link = ({ id, locale, onClick: handleClick }) => id ? <a href={`#${id}`} onClick={e => { e.preventDefault(); handleClick(id); }}>{getLabel(id, locale)}</a> : null;