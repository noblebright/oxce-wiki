import React, {useState, useEffect} from "react";
import { Route, Redirect, Link, Switch, useParams, useRouteMatch } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import ProgressBar from "react-bootstrap/ProgressBar";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import NavItem from "react-bootstrap/NavItem";
import NavLink from "react-bootstrap/NavLink";
import Dropdown from "react-bootstrap/Dropdown";

import useRuleset from "../../hooks/useRuleset";
import useMobileLayout from "../../hooks/useMobileLayout";
import SideBar from "./Sidebar";
import Article from "../Article";
import GunSim from "../GunSim";
import { possibleLanguages } from "../../model/utils";
import { clearDB } from "../../model/RulesetDB";

import "./Layout.css";
import ErrorBoundary from "../Article/ArticleError";

function Welcome() {
    const [content, setContent] = useState();
    
    useEffect(() => {
      fetch("/main.html").then(x => x.text()).then(text => setContent(text));
    }, []);

    return (
      <div className="welcome">
          <div className="welcomePage" dangerouslySetInnerHTML={{__html: content}} />
      </div>
    )
  }

function LoadingDialog({status}) {     
    return (
      <Modal 
        show={true} 
        backdrop="static"
        keyboard={false}
        animation={false}
        centered >
        <Modal.Body>
          <ProgressBar min={0} max={status.max} now={status.now} animated/>
          <div>{status.status}</div>
        </Modal.Body>
      </Modal>
    );
}
 
const Gear = () => (
    <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-gear" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M8.837 1.626c-.246-.835-1.428-.835-1.674 0l-.094.319A1.873 1.873 0 0 1 4.377 3.06l-.292-.16c-.764-.415-1.6.42-1.184 1.185l.159.292a1.873 1.873 0 0 1-1.115 2.692l-.319.094c-.835.246-.835 1.428 0 1.674l.319.094a1.873 1.873 0 0 1 1.115 2.693l-.16.291c-.415.764.42 1.6 1.185 1.184l.292-.159a1.873 1.873 0 0 1 2.692 1.116l.094.318c.246.835 1.428.835 1.674 0l.094-.319a1.873 1.873 0 0 1 2.693-1.115l.291.16c.764.415 1.6-.42 1.184-1.185l-.159-.291a1.873 1.873 0 0 1 1.116-2.693l.318-.094c.835-.246.835-1.428 0-1.674l-.319-.094a1.873 1.873 0 0 1-1.115-2.692l.16-.292c.415-.764-.42-1.6-1.185-1.184l-.291.159A1.873 1.873 0 0 1 8.93 1.945l-.094-.319zm-2.633-.283c.527-1.79 3.065-1.79 3.592 0l.094.319a.873.873 0 0 0 1.255.52l.292-.16c1.64-.892 3.434.901 2.54 2.541l-.159.292a.873.873 0 0 0 .52 1.255l.319.094c1.79.527 1.79 3.065 0 3.592l-.319.094a.873.873 0 0 0-.52 1.255l.16.292c.893 1.64-.902 3.434-2.541 2.54l-.292-.159a.873.873 0 0 0-1.255.52l-.094.319c-.527 1.79-3.065 1.79-3.592 0l-.094-.319a.873.873 0 0 0-1.255-.52l-.292.16c-1.64.893-3.433-.902-2.54-2.541l.159-.292a.873.873 0 0 0-.52-1.255l-.319-.094c-1.79-.527-1.79-3.065 0-3.592l.319-.094a.873.873 0 0 0 .52-1.255l-.16-.292c-.892-1.64.902-3.433 2.541-2.54l.292.159a.873.873 0 0 0 1.255-.52l.094-.319z"/>
    <path fillRule="evenodd" d="M8 5.754a2.246 2.246 0 1 0 0 4.492 2.246 2.246 0 0 0 0-4.492zM4.754 8a3.246 3.246 0 1 1 6.492 0 3.246 3.246 0 0 1-6.492 0z"/>
    </svg>
);

const Hamburger = (props) => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-list" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
  <path fillRule="evenodd" d="M2.5 11.5A.5.5 0 0 1 3 11h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 3h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
  </svg>
);

//Clone of NavDropdown that supports alignRight.
const OptionsDropdown = ({title, children}) => (
    <Dropdown as={NavItem}>
      <Dropdown.Toggle
        as={NavLink}
      >
        {title}
      </Dropdown.Toggle>

      <Dropdown.Menu
        rootCloseEvent="click"
        alignRight={true}
      >
        {children}
      </Dropdown.Menu>
    </Dropdown>
);

export default function Ruleset({ lang, setLanguage, versions }) {
    const { version } = useParams();
    const { result, status, statusKey } = useRuleset(version, versions);
    const { path } = useRouteMatch();
    const isMobile = useMobileLayout();
    const [showSidebar, setShowSidebar] = useState(false);

    if(!versions[version]) { //invalid version
        return <Redirect to="/"/>;
    }

    if(statusKey !== "COMPLETE") {
        return <LoadingDialog status={status}/>
    }

    const { config, supportedLanguages, ruleset } = result;

    return (
        <>
            <Row noGutters>
                <Col>
                    <Navbar bg="dark" variant="dark">
                        <Navbar.Brand className="mr-auto">{isMobile && <Hamburger onClick={() => setShowSidebar(!showSidebar)}/>}<Link to={`/${version}`}>{config.title} - {version}</Link></Navbar.Brand>
                        {!isMobile && <NavDropdown title={possibleLanguages[lang]} rootCloseEvent="click">
                            { supportedLanguages.map(key => <NavDropdown.Item key={key} onClick={() => setLanguage(key)}>{possibleLanguages[key]}</NavDropdown.Item>) }
                        </NavDropdown>}
                        <OptionsDropdown title={<Gear/>}>
                            <NavDropdown.Item onClick={clearDB}>Clear Local DB</NavDropdown.Item>
                        </OptionsDropdown>
                    </Navbar>
                </Col>
            </Row>
            <Row noGutters className="content">
                {!isMobile && <Col xs={12} sm={4} md={3} lg={2} className="sidebarContainer"><SideBar lang={lang} currentVersion={version} versions={versions} ruleset={ruleset}/></Col>}
                {isMobile && <div className={`mobileSidebarContainer ${showSidebar ? "" : "hide"}`}><SideBar lang={lang} currentVersion={version} versions={versions} ruleset={ruleset} onClick={() => setShowSidebar(false)}/></div>}
                <Col xs={12} sm={8} md={9} lg={10} className="mainContainer">
                    <Switch>
                        <Route path={path} exact>
                            <Welcome/>
                        </Route>
                        <Route path={`${path}/article/:id`}>
                            <ErrorBoundary config={config}>
                              <Article ruleset={ruleset} lang={lang} />
                            </ErrorBoundary>
                        </Route>
                        <Route path={`${path}/gunSim`}>
                            <GunSim ruleset={ruleset} lang={lang} />
                        </Route>
                        <Redirect to={`/${version}`}/>
                    </Switch>
                </Col>
            </Row>
        </>
    );
}