import React, {useState, useMemo} from "react";
import useLocale from "../../hooks/useLocale";
import {Link} from "react-router-dom";

export default function Sidebar({lang, currentVersion, versions, ruleset}) {
    const lc = useLocale(lang, ruleset);
    return (
        <div className="sidebar">
            Sidebar
        </div>
    );
}