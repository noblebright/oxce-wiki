import React, {useMemo, useCallback} from "react";
import {useHistory} from "react-router-dom";

import useLocale from "../../hooks/useLocale";
import { buildCytoTree } from "../../model/treeBuilder";
import Cytoscape from "../Cytoscape";

export default function TechTree({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const {elements, nodeCount} = useMemo(() => buildCytoTree(ruleset.entries, lc, id), [ruleset, lc, id]);
    const history = useHistory();
    
    const handleClick = useCallback(evt => {
        history.push(`/${version}/article/${evt.target.id()}`)
    }, [version, history]);

    const containerStyle = nodeCount < 5 ? "TechTree sm" : "TechTree";
    return <Cytoscape elements={elements} className={containerStyle} onClick={handleClick}/>
}