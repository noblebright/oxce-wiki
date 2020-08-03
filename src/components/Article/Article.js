import React, {useState} from "react";
import { Redirect, useParams } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import ReactJson from "react-json-view";

import useLocale from "../../hooks/useLocale";
import Research from "./Research";
import Manufacture from "./Manufacture";
import TechTree from "./TechTree";
import Item from "./Item";

import "./Article.css";

const Code = () =>(
    <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-braces" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.114 8.063V7.9c1.005-.102 1.497-.615 1.497-1.6V4.503c0-1.094.39-1.538 1.354-1.538h.273V2h-.376C3.25 2 2.49 2.759 2.49 4.352v1.524c0 1.094-.376 1.456-1.49 1.456v1.299c1.114 0 1.49.362 1.49 1.456v1.524c0 1.593.759 2.352 2.372 2.352h.376v-.964h-.273c-.964 0-1.354-.444-1.354-1.538V9.663c0-.984-.492-1.497-1.497-1.6zM13.886 7.9v.163c-1.005.103-1.497.616-1.497 1.6v1.798c0 1.094-.39 1.538-1.354 1.538h-.273v.964h.376c1.613 0 2.372-.759 2.372-2.352v-1.524c0-1.094.376-1.456 1.49-1.456V7.332c-1.114 0-1.49-.362-1.49-1.456V4.352C13.51 2.759 12.75 2 11.138 2h-.376v.964h.273c.964 0 1.354.444 1.354 1.538V6.3c0 .984.492 1.497 1.497 1.6z"/>
    </svg>
);

export default function Article({ ruleset, lang, parent }) {
    const { id, version } = useParams();
    const lc = useLocale(lang, ruleset);
    const [showDebug, setShowDebug] = useState(false);
    const article = ruleset.entries[id];

    if(!article) { //article doesn't exist
        return <Redirect to={parent}/>
    }

    const handleShow = () => setShowDebug(true);
    const handleHide = () => setShowDebug(false);

    return (
        <main className="articleContainer">
            <article className="rulesetArticle">
                <header>
                    <span>{lc(id)}</span>
                    <button className="iconButton" onClick={handleShow}><Code/></button>
                </header>
                <p dangerouslySetInnerHTML={{__html: article.ufopaedia?.text && lc(article.ufopaedia.text)}} />
                {article.research && <Research ruleset={ruleset} lang={lang} id={id} version={version}/>}
                {article.research && <TechTree ruleset={ruleset} lang={lang} id={id} version={version}/>}
                {article.manufacture && <Manufacture ruleset={ruleset} lang={lang} id={id} version={version}/>}
                {article.items && <Item ruleset={ruleset} lang={lang} id={id} version={version}/>}
                
                <Modal show={showDebug} onHide={handleHide} dialogClassName="modal-80w" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Debug</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="debugPane"><ReactJson src={article}/></Modal.Body>
                </Modal>
            </article>
        </main>
    )
}