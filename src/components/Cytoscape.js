import React, {useEffect, useRef} from "react";
import {useHistory} from "react-router-dom";
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre';

cytoscape.use( dagre );

const layout = {
    name: 'dagre',
    rankDir: "LR",
    fit: false, // whether to fit the viewport to the graph
    animate: false,
    nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout algorithm
};
  
const style = [
    { 
        selector: "node[label]",
        style: { label: "data(label)" }
    },
    { 
        selector: "edge",
        style: { 
            "curve-style": "straight",
            "target-arrow-shape": "triangle",
            "arrow-scale": "2"
        }
    }
]

export default function Cytoscape({elements}) {
    const cy = useRef(null);
    const history = useHistory();

    const fnRef = e => {
        if(!cy.current) {
            cy.current = cytoscape({ container: e, layout, style });
            cy.current.resize();
            cy.current.on("tap", evt => {
                if(!evt.target.isNode) {
                    return; //we clicked on nothing, got core.
                } 
                if(evt.target.isNode() && !evt.target.data("synthetic")) {
                    history.push(`/${evt.target.id()}`);
                }
            });
        }
    };

    useEffect(() => {
        if(!elements || !cy.current) { return; }
        cy.current.remove("*");
        cy.current.add(elements);
        cy.current.autounselectify(true);
        cy.current.layout(layout).run()
        cy.current.fit();
    }, [elements]);

    return (
        <div className="container" ref={fnRef}></div>
    );
}