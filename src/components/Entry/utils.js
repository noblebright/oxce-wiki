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