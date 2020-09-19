import React, {useEffect, useRef, useCallback} from "react";
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre';

cytoscape.use( dagre );

const GridIcon = () => (
    <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-fullscreen" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
    </svg>
);

const layout = {
    name: 'dagre',
    rankDir: "LR",
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

    const handleRecenter = useCallback(() => {
        if(!cy.current) return;
        cy.current.fit(undefined, 10);
    }, []);

    return (
        <div className={className}>
            <div style={{ width: "100%", height: "100%" }} ref={fnRef}></div>
            <button className="centerButton btn btn-outline-secondary btn-sm" onClick={handleRecenter}><GridIcon/></button>
        </div>
    );
}