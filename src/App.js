import React, {useEffect, useState, useMemo} from 'react';
import Cytoscape from "./Cytoscape";
import Sidebar from "./Sidebar";
import './App.css';

function getFilteredGraph(elements, selected) {
  return [];
}

function App() {
  const [elements, setElements] = useState([]);
  const [selected, setSelected] = useState();
  useEffect(() => {
    fetch("graph.json").then(res => res.json()).then(json => {
      json.sort((a, b) => b.group < a.group ? 1 : (b.group > a.group ? -1 : 0));
      setElements(json);
    });
  }, []);

  const filteredGraph = useMemo(() => getFilteredGraph(elements, selected), [elements, selected]);
  const nodes = useMemo(() => elements.filter(x => (x.group === "nodes") && !x.data.synthetic).sort((a, b) => a.data.label < b.data.label ? -1 : 1), [elements]);

  return (
    <div className="App">
      <header>
        <h1>X-Com Files Tech Tree</h1>
      </header>
      <Sidebar elements={nodes}/>
      <main><Cytoscape elements={filteredGraph}/></main>
    </div>
  );
}

export default App;
