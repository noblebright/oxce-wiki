import React from "react";

export default function Sidebar({ elements = [] }) {
    return (
        <ul className="sidebar">
            { elements.map(x => (<li key={x.data.id}>{x.data.label || "UNNAMED?"}</li>))}
        </ul>
    );
}