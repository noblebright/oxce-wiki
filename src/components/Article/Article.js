import React, {useState} from "react";
import { Redirect, useParams } from "react-router-dom";
import {Modal} from "react-bootstrap";
import ReactJson from "react-json-view";

import useLocale from "../../hooks/useLocale.js";
import Research from "./Research.js";
import Manufacture from "./Manufacture.js";
import TechTree from "./TechTree.js";
import Item from "./Item/index.js";
import Facilities from "./Facilities.js";
import Crafts from "./Crafts.js";
import CraftWeapons from "./CraftWeapons.js";
import Ufos from "./Ufos.js";
import Units from "./Units.js";
import Soldiers from "./Soldiers.js";
import Armors from "./Armors.js";
import AlienDeployments from "./AlienDeployments/index.js";
import AlienRaces from "./AlienRaces.js";
import SoldierTransformation from "./SoldierTransformation.js";
import Commendation from "./Commendation.js";
import Events from "./Events.js";
import Category from "./Category.js";
import BaseService from "./BaseService.js";

import "./Article.css";

const Code = () =>(
    <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-file-earmark-code" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 1h5v1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6h1v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2z"/>
    <path d="M9 4.5V1l5 5h-3.5A1.5 1.5 0 0 1 9 4.5z"/>
    <path fillRule="evenodd" d="M8.646 6.646a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L10.293 9 8.646 7.354a.5.5 0 0 1 0-.708zm-1.292 0a.5.5 0 0 0-.708 0l-2 2a.5.5 0 0 0 0 .708l2 2a.5.5 0 0 0 .708-.708L5.707 9l1.647-1.646a.5.5 0 0 0 0-.708z"/>
    </svg>
);

export default function Article({ ruleset, lang }) {
    const { id, version } = useParams();
    const lc = useLocale(lang, ruleset);
    const [showDebug, setShowDebug] = useState(false);
    const article = ruleset.entries[id];

    if(!article) { //article doesn't exist
        return <Redirect to={`/${version}`}/>
    }

    const handleShow = () => setShowDebug(true);
    const handleHide = () => setShowDebug(false);

    const articleProps = {ruleset, lang, id, version};
    return (
        <main className="articleContainer">
            <article className="rulesetArticle">
                <header>
                    <span>{lc(id)}</span>
                    <button className="iconButton" onClick={handleShow}><Code/></button>
                </header>
                <p dangerouslySetInnerHTML={{__html: article.ufopaedia?.text && lc(article.ufopaedia.text)}} />
                <Units {...articleProps}/>
                <Armors {...articleProps}/>
                <Research {...articleProps}/>
                <TechTree {...articleProps}/>
                <Manufacture {...articleProps}/>
                <Item {...articleProps}/>
                <Facilities {...articleProps}/>
                <Crafts {...articleProps}/>
                <CraftWeapons {...articleProps}/>
                <Ufos {...articleProps}/>
                <Soldiers {...articleProps}/>
                <AlienDeployments {...articleProps}/>
                <AlienRaces {...articleProps}/>
                <SoldierTransformation {...articleProps}/>
                <Commendation {...articleProps}/>
                <Events {...articleProps}/>
                <Category {...articleProps}/>
                <BaseService {...articleProps}/>
                <Modal show={showDebug} onHide={handleHide} dialogClassName="modal-80w" centered animation={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Debug</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="debugPane"><ReactJson src={article}/></Modal.Body>
                </Modal>
            </article>
        </main>
    )
}