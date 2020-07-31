import React from "react";
import { Route, Switch, useParams, useRouteMatch } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import ProgressBar from "react-bootstrap/ProgressBar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Navbar from "react-bootstrap/Navbar";

import useRuleset from "../../hooks/useRuleset";

import "./Layout.css";

function Welcome() {
    return (
      <div className="welcome">
          <iframe className="welcomePage" src="./main.html"/>
      </div>
    )
  }

function LoadingDialog({status}) {     
    return (
      <Modal 
        show={true} 
        backdrop="static"
        keyboard={false}
        centered >
        <Modal.Body>
          <div>Loading...</div>
          <ProgressBar min={0} max={status.max} now={status.now} animated/>
          <div>{status.status}</div>
        </Modal.Body>
      </Modal>
    );
}
  
export default function Ruleset() {
    const { version } = useParams();
    const { result, status, statusKey } = useRuleset(version);
    const { path, url } = useRouteMatch();

    if(statusKey !== "COMPLETE") {
        return <LoadingDialog status={status}/>
    }

    return (
        <>
            <Row>
                <Col>
                    <Navbar bg="dark" variant="dark">
                        <Navbar.Brand>The X-Com Files</Navbar.Brand>
                    </Navbar>
                </Col>
            </Row>
            <Row noGutters className="content">
                <Col xs={12} md={3} lg={2}>SideBar</Col>
                <Switch>
                    <Route path={path} exact>
                        <Welcome/>
                    </Route>
                    <Route path={`${path}/entry/:id`}>
                        Entry goes here.
                    </Route>
                </Switch>
            </Row>
        </>
    );
}