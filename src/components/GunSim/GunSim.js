import React, { useCallback, useRef, useState, useMemo } from "react";
import { Form, Modal, ProgressBar, Button } from "react-bootstrap";
import useLocale from "../../hooks/useLocale";
import useGunSim from "../../hooks/useGunSim";
import useRunningState from "../../hooks/useRunningState";
import getChartData from "../../model/GunSim/ChartService";
import ResultChart from "./ResultChart";

import "./gunSim.css";

function ProgressDialog({current, max, abort}) {     
    return (
      <Modal 
        show={true} 
        backdrop="static"
        keyboard={false}
        animation={false}
        centered >
        <Modal.Body>
          <ProgressBar min={0} max={max} now={current} animated/>
          <div><Button variant="primary" onClick={abort}>Abort</Button></div>
        </Modal.Body>
      </Modal>
    );
}

export default function GunSim({ ruleset, lang }) {
    const lc = useLocale(lang, ruleset);
    const optionFn = useCallback(x => <option key={x} value={x}>{lc(x)}</option>, [lc]);
    const [state, { setStat, setSoldier, setArmor, setWeapon, setAmmo, setTarget, setDirection, setKneeling, setOneHanded }] = useGunSim(ruleset.entries, lc);
    const { soldierList, armorList, weaponList, ammoList, targetList, stat, soldier, armor, weapon, ammo, target, direction, kneeling, oneHanded } = state;
    const soldierOptions = useMemo(() => soldierList.map(optionFn), [soldierList, optionFn]);
    const armorOptions = useMemo(() => armorList.map(optionFn), [armorList, optionFn]);
    const weaponOptions = useMemo(() => weaponList.map(optionFn), [weaponList, optionFn]);
    const ammoOptions = useMemo(() => ammoList.map(optionFn), [ammoList, optionFn]);
    const targetOptions = useMemo(() => targetList.map(optionFn), [targetList, optionFn]);

    const [{running, current, max}, {abort, complete, setSteps, increment}] = useRunningState();
    const [chartData, setChartData] = useState();
    const [mode, setMode] = useState("HitRatio");
    const abortFn = useRef();
    const startRun = useCallback(() => {
        setChartData(null);
        const { p, abort: abortComputation } = getChartData(ruleset, state, increment, setSteps);
        abortFn.current = () => { abortComputation() };
        p.then(result => {
            complete();
            setChartData(result);
        }, abort);
    }, [ruleset, state, setSteps, increment, abortFn, complete, abort]);

    return (
        <main className="gunSim">
            <Form className="GunSimSidebar">
                <Form.Group className="mb-3" controlId="soldier">
                    <Form.Label>Stat Basis</Form.Label>
                    <Form.Control as="select" size="sm" custom value={stat} onChange={e => setStat(e.target.value)}>
                        <option value="statCaps">Stat Max</option>
                        <option value="trainingStatCaps">Training Max</option>
                        <option value="maxStats">Starting Max</option>
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" controlId="soldier">
                    <Form.Label>Soldier Type</Form.Label>
                    <Form.Control as="select" size="sm" custom value={soldier} onChange={e => setSoldier(e.target.value, lc)}>
                        { soldierOptions }
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" controlId="soldierArmor">
                    <Form.Label>Circumstantial Modifiers</Form.Label>
                    <div>
                        <Form.Check type="checkbox" id="kneeling" checked={kneeling} onChange={e => setKneeling(e.target.checked)} label="Kneeling" inline/>
                        <Form.Check type="checkbox" id="oneHanded" checked={oneHanded} onChange={e => setOneHanded(e.target.checked)} label="One-handed" inline/>
                    </div>
                </Form.Group>
                <Form.Group className="mb-3" controlId="soldierArmor">
                    <Form.Label>Armor Type</Form.Label>
                    <Form.Control as="select" size="sm" custom value={armor} onChange={e => setArmor(e.target.value)}>
                        { armorOptions }
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" controlId="weapon">
                    <Form.Label>Weapon</Form.Label>
                    <Form.Control as="select" size="sm" custom value={weapon} onChange={e => setWeapon(e.target.value, lc)}>
                        { weaponOptions }
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" controlId="ammo">
                    <Form.Label>Ammo</Form.Label>
                    <Form.Control as="select" size="sm" custom value={ammo} onChange={e => setAmmo(e.target.value)}>
                        { ammoOptions }
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" controlId="target" value={target} onChange={e => setTarget(e.target.value)}>
                    <Form.Label>Target</Form.Label>
                    <Form.Control as="select" size="sm" custom>
                        { targetOptions }
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" controlId="target" value={direction} onChange={e => setDirection(e.target.value)}>
                    <Form.Label>Facing</Form.Label>
                    <Form.Control as="select" size="sm" custom>
                        <option value="front">Front</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="rear">Rear</option>
                    </Form.Control>
                </Form.Group>
                <Button variant="primary" onClick={startRun}>Submit</Button>
            </Form>
            <div className="GunSimContent">
                { running ? <ProgressDialog current={current} max={max} abort={abortFn.current}/> : null }
                <Form.Group className="mb-3" controlId="weapon">
                    <Form.Label>Mode</Form.Label>
                    <Form.Control as="select" size="sm" custom value={mode} onChange={e => setMode(e.target.value)}>
                        <option value="HitRatio">Hit Ratio</option>
                        <option value="Damage">Damage</option>
                    </Form.Control>
                </Form.Group>
                { chartData ? <ResultChart data={chartData} mode={mode}/> : null }
            </div>
        </main>
    );    
}