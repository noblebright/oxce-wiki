import React, {useState, useMemo} from "react";
import {Link} from "react-router-dom";

import {getLabel} from "../model/RuleLoader";

export default function Sidebar({ db: { rules, strings }, language = "en-US" }) {
    return (
        <div className="sidebar">
            Sidebar
        </div>
    );
}