import React, {useMemo, useCallback} from "react";
import {useHistory} from "react-router-dom";

import useLocale from "../../hooks/useLocale.js";
import { buildCytoTree } from "../../model/treeBuilder.js";
import Cytoscape from "../Cytoscape.js";

function getStyling(nodeCount) {
    if(nodeCount > 20) {
        return "TechTree lg";
    } else if(nodeCount < 5) {
        return "TechTree sm";
    } else {
        return "TechTree";
    }
}

export default function TechTree({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const {elements, nodeCount} = useMemo(() => buildCytoTree(ruleset.entries, lc, id), [ruleset, lc, id]);
    const history = useHistory();
    
    const handleClick = useCallback(evt => {
        history.push(`/${version}/article/${evt.target.id()}`)
    }, [version, history]);

    if(!nodeCount) return null;

    const containerStyle = getStyling(nodeCount);
    return <Cytoscape elements={elements} className={containerStyle} onClick={handleClick}/>
}