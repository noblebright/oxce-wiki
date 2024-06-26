import React, { useState, useEffect } from "react";
import {
  Route,
  Navigate,
  Link,
  Routes,
  useParams,
} from "react-router-dom";
import {
  Modal,
  ProgressBar,
  Row,
  Col,
  Container,
  Navbar,
  Nav,
  NavDropdown,
} from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import { LinkContainer } from "react-router-bootstrap";
import useRuleset from "../../hooks/useRuleset.js";
import useMobileLayout from "../../hooks/useMobileLayout.js";
import useLocale from "../../hooks/useLocale.js";
import SideBar from "./Sidebar.jsx";
import Article from "../Article/index.js";
import GunSim from "../GunSim/index.js";
import { possibleLanguages } from "../../model/utils.js";
import { clearDB } from "../../model/L1L2Loader.js";
import ErrorBoundary from "../Article/ArticleError.jsx";

import "./Layout.css";

function Welcome() {
  const [content, setContent] = useState();

  useEffect(() => {
    fetch("/main.html")
      .then((x) => x.text())
      .then((text) => setContent(text));
  }, []);

  return (
    <div className="welcome">
      <div
        className="welcomePage"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

function Dialog({ children }) {
  return (
    <Modal
      show={true}
      backdrop="static"
      keyboard={false}
      animation={false}
      centered
    >
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
}

function LoadingDialog({ status }) {
  return (
    <Dialog>
      <ProgressBar min={0} max={status.max} now={status.now} animated />
      <div>{status.status}</div>
    </Dialog>
  );
}

function ErrorDialog({ status }) {
  return (
    <Dialog>
      <h1>Failed to Parse Ruleset</h1>
      <pre>{status.error?.url}</pre>
      <pre>{status.error?.toString()}</pre>
    </Dialog>
  );
}

const Gear = () => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    className="bi bi-gear"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M8.837 1.626c-.246-.835-1.428-.835-1.674 0l-.094.319A1.873 1.873 0 0 1 4.377 3.06l-.292-.16c-.764-.415-1.6.42-1.184 1.185l.159.292a1.873 1.873 0 0 1-1.115 2.692l-.319.094c-.835.246-.835 1.428 0 1.674l.319.094a1.873 1.873 0 0 1 1.115 2.693l-.16.291c-.415.764.42 1.6 1.185 1.184l.292-.159a1.873 1.873 0 0 1 2.692 1.116l.094.318c.246.835 1.428.835 1.674 0l.094-.319a1.873 1.873 0 0 1 2.693-1.115l.291.16c.764.415 1.6-.42 1.184-1.185l-.159-.291a1.873 1.873 0 0 1 1.116-2.693l.318-.094c.835-.246.835-1.428 0-1.674l-.319-.094a1.873 1.873 0 0 1-1.115-2.692l.16-.292c.415-.764-.42-1.6-1.185-1.184l-.291.159A1.873 1.873 0 0 1 8.93 1.945l-.094-.319zm-2.633-.283c.527-1.79 3.065-1.79 3.592 0l.094.319a.873.873 0 0 0 1.255.52l.292-.16c1.64-.892 3.434.901 2.54 2.541l-.159.292a.873.873 0 0 0 .52 1.255l.319.094c1.79.527 1.79 3.065 0 3.592l-.319.094a.873.873 0 0 0-.52 1.255l.16.292c.893 1.64-.902 3.434-2.541 2.54l-.292-.159a.873.873 0 0 0-1.255.52l-.094.319c-.527 1.79-3.065 1.79-3.592 0l-.094-.319a.873.873 0 0 0-1.255-.52l-.292.16c-1.64.893-3.433-.902-2.54-2.541l.159-.292a.873.873 0 0 0-.52-1.255l-.319-.094c-1.79-.527-1.79-3.065 0-3.592l.319-.094a.873.873 0 0 0 .52-1.255l-.16-.292c-.892-1.64.902-3.433 2.541-2.54l.292.159a.873.873 0 0 0 1.255-.52l.094-.319z"
    />
    <path
      fillRule="evenodd"
      d="M8 5.754a2.246 2.246 0 1 0 0 4.492 2.246 2.246 0 0 0 0-4.492zM4.754 8a3.246 3.246 0 1 1 6.492 0 3.246 3.246 0 0 1-6.492 0z"
    />
  </svg>
);

const Hamburger = (props) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    className="bi bi-list"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M2.5 11.5A.5.5 0 0 1 3 11h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 3h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
    />
  </svg>
);

const CategoryDropdown = ({ lang, version, ruleset }) => {
  const lc = useLocale(lang, ruleset);
  const displayStr = (key) =>
    ruleset.entries[key].category.damageType
      ? `${lc("damageType")}: ${lc(key)}`
      : lc(key);
  const alphaSort = (a, b) => (displayStr(a) > displayStr(b) ? 1 : -1);

  if (!ruleset) return null;
  const categories = ruleset.lookups.categories;
  return (
    <NavDropdown
      className="CategoryDropdown"
      title={lc("categories")}
      id="CategoryDropdown"
      rootCloseEvent="click"
      menuVariant="dark"
    >
      {categories.sort(alphaSort).map((key) => (
        <NavDropdown.Item key={key} as={Link} to={`/${version}/article/${key}`}>
          {displayStr(key)}
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  );
};

export default function Ruleset({ lang, setLanguage, versions }) {
  const { version } = useParams();
  const { result, status, statusKey } = useRuleset(version, versions);

  const isMobile = useMobileLayout();
  const [showSidebar, setShowSidebar] = useState(false);

  if (!versions[version]) {
    //invalid version
    return <Navigate to="/" />;
  }

  if (statusKey !== "COMPLETE" && statusKey !== "ERROR") {
    return <LoadingDialog status={status} />;
  }

  if (statusKey === "ERROR") {
    return <ErrorDialog status={status} />;
  }

  const { config, supportedLanguages, ruleset } = result;

  return (
    <>
      <Helmet>
        <title>{`${config.title} Mod Data Viewer`}</title>
        <meta name="description" content={`${config.title} Mod Data Viewer`} />
      </Helmet>
      <Row className="g-0">
        <Navbar bg="dark" variant="dark">
          <Container fluid>
            <Navbar.Brand>
              {isMobile && (
                <Hamburger onClick={() => setShowSidebar(!showSidebar)} />
              )}
              <LinkContainer to={`/${version}`}>
                <Nav.Link>
                  {config.title} - {version}
                </Nav.Link>
              </LinkContainer>
            </Navbar.Brand>
            <Nav className="me-auto">
              {!isMobile && ruleset?.lookups.categories && (
                <CategoryDropdown
                  ruleset={ruleset}
                  lang={lang}
                  version={version}
                />
              )}
              <LinkContainer to={`/${version}/gunSim`}>
                <Nav.Link>Gun Profiler</Nav.Link>
              </LinkContainer>
            </Nav>
            <Nav>
              {!isMobile && (
                <NavDropdown
                  title={possibleLanguages[lang]}
                  id="languageDropdown"
                  rootCloseEvent="click"
                  menuVariant="dark"
                >
                  {supportedLanguages.map((key) => (
                    <NavDropdown.Item
                      key={key}
                      onClick={() => setLanguage(key)}
                    >
                      {possibleLanguages[key]}
                    </NavDropdown.Item>
                  ))}
                </NavDropdown>
              )}
              <NavDropdown
                title={<Gear />}
                id="OptionsDropdown"
                align="end"
                rootCloseEvent="click"
                menuVariant="dark"
              >
                <NavDropdown.Item onClick={clearDB}>
                  Clear Local DB
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Container>
        </Navbar>
      </Row>
      <Row className="content g-0">
        {!isMobile && (
          <Col xs={12} sm={4} md={3} lg={2} className="sidebarContainer">
            <SideBar
              lang={lang}
              currentVersion={version}
              versions={versions}
              ruleset={ruleset}
            />
          </Col>
        )}
        {isMobile && (
          <div
            className={`mobileSidebarContainer ${showSidebar ? "" : "hide"}`}
          >
            <SideBar
              lang={lang}
              currentVersion={version}
              versions={versions}
              ruleset={ruleset}
              onClick={() => setShowSidebar(false)}
            />
          </div>
        )}
        <Col xs={12} sm={8} md={9} lg={10} className="mainContainer">
          <Routes>
            <Route index element={<Welcome />} />
            <Route path={`article/:id`} element={<ErrorBoundary config={config}>
                <Article ruleset={ruleset} lang={lang} />
              </ErrorBoundary>} />
              
            <Route path={`gunSim`} element={<GunSim ruleset={ruleset} lang={lang} />} />
            <Route path="*" element={<Navigate to={`/`} />} />
          </Routes>
        </Col>
      </Row>
    </>
  );
}
