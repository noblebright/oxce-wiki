import React from "react";
import {Link} from "react-router-dom";
import { NoLink } from "../components/ComponentUtils";

const useLink = (version, lc) => id => (
    id instanceof NoLink ? 
        id.toString() : 
        <Link to={`/${version}/article/${id}`}>{lc(id)}</Link>
    );

export default useLink;