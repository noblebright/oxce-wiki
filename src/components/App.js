import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";

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
  useEffect(() => {
    const rl = new RuleLoader(["https://raw.githubusercontent.com/OpenXcom/OpenXcom/master/bin/standard/xcom1/research.rul",
                               "https://raw.githubusercontent.com/OpenXcom/OpenXcom/master/bin/standard/xcom1/manufacture.rul",
                               "https://raw.githubusercontent.com/SolariusScorch/XComFiles/master/Ruleset/research_XCOMFILES.rul",
                               "https://raw.githubusercontent.com/SolariusScorch/XComFiles/master/Ruleset/manufacture_XCOMFILES.rul"
                              ], 
                              ["https://raw.githubusercontent.com/OpenXcom/OpenXcom/master/bin/standard/xcom1/Language/en-US.yml",
                               "https://raw.githubusercontent.com/SolariusScorch/XComFiles/master/Language/en-US.yml"]);
    rl.load().then(setDb);
}, []);
  return (
    <Router>
      <div className="App">
        <header>
          <h1>X-Com Files Tech Tree</h1>
        </header>
        <Sidebar db={db}/>
        <main>
          { !db.loaded ? "Loading..." : 
          <Switch>
          <Route path="/" exact>
              <Welcome/>
            </Route>
            <Route path="/:id">
              <Entry db={db}/>
            </Route>
          </Switch>}
        </main>
      </div>
    </Router>
  );
}

export default App;
