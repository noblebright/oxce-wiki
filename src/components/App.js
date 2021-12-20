import React, { useEffect } from 'react';
import {BrowserRouter as Router, Switch, Route, Redirect} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import useMetadata from "../hooks/useMetadata";
import Ruleset from "./Layout/Ruleset";

import './App.css';

function getDefaultVersion(versions) {
  return Object.keys(versions)[0];
}

function ClearDB({clear}) {
  useEffect(() => {
    clear();
  }, [clear]);
  return <Redirect to="/"/>;
}

function App() {
  const { versions, config, setLanguage, clearDB } = useMetadata();

  return (
    <HelmetProvider>
      <Router>
          {versions && config && <Switch>
            <Route path="/" exact>
              <Redirect to={`/${getDefaultVersion(versions)}`}/>
            </Route>
            <Route path="/admin/_clearDB" exact>
              <ClearDB clear={clearDB}/>
            </Route>
            <Route path="/:version">
              <Ruleset lang={config.currentLanguage} setLanguage={setLanguage} versions={versions}/>
            </Route>
          </Switch>
          }
      </Router>
    </HelmetProvider>
  )
}
export default App;
