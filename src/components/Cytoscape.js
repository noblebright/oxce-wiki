import React, {useEffect, useRef} from "react";
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

export default function Cytoscape({elements, onClick, className}) {
    const cy = useRef(null);
    const clickRef = useRef();
    clickRef.current = onClick;

    const fnRef = e => {
        if(!cy.current) {
            cy.current = cytoscape({ container: e, layout, style });
            cy.current.resize();
            cy.current.on("tap", evt => {
                if(!evt.target.isNode) {
                    return; //we clicked on nothing, got core.
                } 
                if(evt.target.isNode() && !evt.target.data("synthetic")) {
                    clickRef.current && clickRef.current(evt);
                }
            });
        }
    };

    useEffect(() => {
        cy.current.resize();
        cy.current.fit(undefined, 10);
    }, [className]);

    useEffect(() => {
        if(!elements || !cy.current) { return; }
        cy.current.remove("*");
        cy.current.add(elements);
        cy.current.autounselectify(true);
        cy.current.layout(layout).run()
        cy.current.resize();
        cy.current.fit(undefined, 10);
    }, [elements]);

    return (
        <div className={className} ref={fnRef}></div>
    );
}