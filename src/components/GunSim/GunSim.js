import React, { useCallback, useMemo } from "react";
import { Form } from "react-bootstrap";
import useLocale from "../../hooks/useLocale";
import useGunSim from "../../hooks/useGunSim";
import { computeAccuracyInputs, simulateAcc, getAverageDamage } from "../../model/GunSim";

import "./gunSim.css";

export default function GunSim({ ruleset, lang }) {
    const lc = useLocale(lang, ruleset);
    const optionFn = useCallback(x => <option key={x} value={x}>{lc(x)}</option>, [lc]);
    const [{ soldierList, armorList, weaponList, ammoList, targetList, stat, soldier, armor, weapon, ammo, target, direction, kneeling, oneHanded }, 
        { setStat, setSoldier, setArmor, setWeapon, setAmmo, setTarget, setDirection, setKneeling, setOneHanded }] = useGunSim(ruleset.entries, lc);
    const soldierOptions = useMemo(() => soldierList.map(optionFn), [soldierList, optionFn]);
    const armorOptions = useMemo(() => armorList.map(optionFn), [armorList, optionFn]);
    const weaponOptions = useMemo(() => weaponList.map(optionFn), [weaponList, optionFn]);
    const ammoOptions = useMemo(() => ammoList.map(optionFn), [ammoList, optionFn]);
    const targetOptions = useMemo(() => targetList.map(optionFn), [targetList, optionFn]);
    const accuracyInputs = computeAccuracyInputs(ruleset, {stat, soldier, armor, weapon, ammo, target, distance: 20, kneeling, oneHanded});
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
            </Form>
            <div className="GunSimContent">
                <table>
                    <tbody>
                        <tr><td>Stat:</td><td>{stat}</td></tr>
                        <tr><td>Soldier:</td><td>{soldier}</td></tr>
                        <tr><td>Kneeling:</td><td>{`${kneeling}`}</td></tr>
                        <tr><td>OneHanded:</td><td>{`${oneHanded}`}</td></tr>
                        <tr><td>Armor:</td><td>{armor}</td></tr>
                        <tr><td>Weapon:</td><td>{weapon}</td></tr>
                        <tr><td>Ammo:</td><td>{ammo}</td></tr>
                        <tr><td>Target:</td><td>{target}</td></tr>
                        <tr><td>Facing:</td><td>{direction}</td></tr>
                        <tr><td colSpan="2"><b>Output</b></td></tr>
                        <tr><td>Source:</td><td>{JSON.stringify(accuracyInputs[0])}</td></tr>
                        <tr><td>Target:</td><td>{JSON.stringify(accuracyInputs[1])}</td></tr>
                        <tr><td>Weapon:</td><td>{JSON.stringify(accuracyInputs[2])}</td></tr>
                        <tr><td>Accuracy:</td><td>{JSON.stringify(accuracyInputs[3])}</td></tr>
                        <tr><td>Iterations:</td><td>{JSON.stringify(accuracyInputs[4])}</td></tr>
                        <tr><td>Shots:</td><td>{JSON.stringify(accuracyInputs[5])}</td></tr>
                        <tr><td>Type:</td><td>{JSON.stringify(accuracyInputs[6])}</td></tr>
                        <tr><td colSpan="2"><b>Result</b></td></tr>
                        <tr><td>Hits:</td><td>{simulateAcc(...accuracyInputs)}</td></tr>
                        <tr><td>Damage:</td><td>{getAverageDamage(ruleset, 10000, {stat, soldier, armor, weapon, ammo, target, direction})}</td></tr>
                    </tbody>
                </table>
            </div>
        </main>
    );    
}