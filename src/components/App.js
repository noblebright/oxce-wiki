import React, {useEffect, useState} from 'react';
import RuleLoader from "../model/RuleLoader";
import Sidebar from "./Sidebar";
import Entry from "./Entry";
import './App.css';

function Welcome() {
  return (
    <div>Welcome to the xcom viewer, pick something from the sidebar.</div>
  )
}
function App() {
  const [db, setDb] = useState({ rules: {}, strings: {} });
  const [selected, setSelected] = useState();
  useEffect(() => {
    const rl = new RuleLoader(["https://raw.githubusercontent.com/SolariusScorch/XComFiles/master/Ruleset/research_XCOMFILES.rul"], 
                              ["https://raw.githubusercontent.com/SolariusScorch/XComFiles/master/Language/en-US.yml"]);
    rl.load().then(setDb);
}, []);
  return (
    <div className="App">
      <header>
        <h1>X-Com Files Tech Tree</h1>
      </header>
      <Sidebar db={db} onClick={setSelected}/>
      <main>{ selected ? <Entry db={db} id={selected} onSelect={setSelected}/> : <Welcome/> }</main>
    </div>
  );
}

export default App;
