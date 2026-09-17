import React, { useEffect, useState } from 'react';
import {Routes, Route, Navigate} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import useMetadata from "../hooks/useMetadata.js";
import Ruleset from "./Layout/Ruleset.jsx";

import './App.css';

function getDefaultVersion(versions) {
  return Object.keys(versions)[0];
}

function ClearDB({clear}) {
  useEffect(() => {
    clear();
  }, [clear]);
  return <Navigate to="/"/>;
}

function App() {
  const { versions, config, setLanguage, clearDB } = useMetadata();
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem("oxce-wiki-theme");
    return savedTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    window.localStorage.setItem("oxce-wiki-theme", theme);
  }, [theme]);

  return (
    <HelmetProvider>
      {versions && config && 
      <Routes>
        <Route index element={<Navigate to={`/${getDefaultVersion(versions)}`}/>} />
        <Route path="/admin/_clearDB" exact element={<ClearDB clear={clearDB}/>} />
        <Route path="/:version/*" element={<Ruleset lang={config.currentLanguage} setLanguage={setLanguage} versions={versions} theme={theme} setTheme={setTheme}/>} />
      </Routes>
      }
    </HelmetProvider>
  )
}
export default App;
