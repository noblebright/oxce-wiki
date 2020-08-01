import React from 'react';
import {BrowserRouter as Router, Switch, Route, Redirect} from "react-router-dom";

import useMetadata from "../hooks/useMetadata";
import Ruleset from "./Layout/Ruleset";

import './App.css';

function getDefaultVersion(versions) {
  return Object.keys(versions)[0];
}

function App() {
  const { versions, config, setLanguage } = useMetadata();

  return (
    <Router>
        {versions && config && <Switch>
          <Route path="/" exact>
            <Redirect to={`/${getDefaultVersion(versions)}`}/>
          </Route>
          <Route path="/:version">
            <Ruleset lang={config.currentLanguage} setLanguage={setLanguage} versions={versions}/>
          </Route>
        </Switch>
        }
    </Router>
  )
}
export default App;
