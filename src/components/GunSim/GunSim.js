import React, { useCallback, useState, useMemo, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import useLocale from "../../hooks/useLocale";
import useGunSim from "../../hooks/useGunSim";
import { getChartData, loadAccuracyData } from "../../model/GunSim/ChartService";
import ResultChart from "./ResultChart";

import "./gunSim.css";

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
    
    const [chartData, setChartData] = useState();
    const [mode, setMode] = useState("HitRatio");
    const [accuracyDataLoaded, setAccuracyDataLoaded] = useState(false);
    
    useEffect(() => {
        loadAccuracyData().then(() => setAccuracyDataLoaded(true));
    }, []);

    const startRun = useCallback(() => {
        setChartData(null);
        console.time("chartGen");
        getChartData(ruleset, state).then(result => {
            console.timeEnd("chartGen");
            setChartData(result);
        });
    }, [ruleset, state]);

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
                    <Form.Label>Armor Type</Form.Label>
                    <Form.Control as="select" size="sm" custom value={armor} onChange={e => setArmor(e.target.value)}>
                        { armorOptions }
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" controlId="soldierArmor">
                    <div>
                        <Form.Check type="checkbox" id="kneeling" checked={kneeling} onChange={e => setKneeling(e.target.checked)} label="Kneeling" inline/>
                        <Form.Check type="checkbox" id="oneHanded" checked={oneHanded} onChange={e => setOneHanded(e.target.checked)} label="One-handed" inline/>
                    </div>
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
                <Button variant="primary" onClick={startRun} disabled={!accuracyDataLoaded}>Submit</Button>
            </Form>
            <div className="GunSimContent">
                <Form.Control as="select" size="sm" custom value={mode} onChange={e => setMode(e.target.value)}>
                    <option value="HitRatio">Hit Ratio</option>
                    <option value="Damage">Damage</option>
                </Form.Control>
                { chartData ? <ResultChart data={chartData} mode={mode}/> : null }
            </div>
        </main>
    );    
}