import React, { useCallback, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import useLocale from "../../hooks/useLocale";
import computeInputs from "../../model/GunSim";

import "./gunSim.css";

function useList(data, sortFn, renderFn) {
    const keyList = useMemo(() => data?.sort(sortFn) || [], [data, sortFn]);
    const optionList = useMemo(() => keyList.map(renderFn), [keyList, renderFn]);
    const [currentVal, setVal] = useState(keyList[0]);
    return [optionList, currentVal, setVal];
}

export default function GunSim({ ruleset, lang }) {
    const lc = useLocale(lang, ruleset);
    const alphabeticalSort = useCallback((a, b) => lc(a) > lc(b) ? 1 : -1, [lc]);
    const optionFn = useCallback(x => <option key={x} value={x}>{lc(x)}</option>, [lc]);
    
    const [stat, setStat] = useState("STAT_MAX");

    const soldierData = useMemo(() => Object.keys(ruleset.entries).filter(x => ruleset.entries[x].soldiers), [ruleset]);
    const [soldierList, soldier, setSoldier] = useList(soldierData, alphabeticalSort, optionFn);
    
    const armorData = useMemo(() => ruleset.entries[soldier].soldiers.usableArmors, [ruleset, soldier]);
    const [armorList, armor, setArmor] = useList(armorData, alphabeticalSort, optionFn);
    
    const weaponData = useMemo(() => Object.keys(ruleset.entries).filter(x => {
        const item = ruleset.entries[x].items;
        return item?.battleType === 1 && item?.recover !== false
    }), [ruleset]);
    const [weaponList, weapon, setWeapon] = useList(weaponData, alphabeticalSort, optionFn);

    const ammoData = useMemo(() => ruleset.entries[weapon].items.allCompatibleAmmo, [ruleset, weapon]);
    const [ammoList, ammo, setAmmo] = useList(ammoData, alphabeticalSort, optionFn);

    const targetData = useMemo(() => Object.keys(ruleset.entries).filter(x => ruleset.entries[x].units), [ruleset]);
    const [targetList, target, setTarget] = useList(targetData, alphabeticalSort, optionFn);

    return (
        <main className="gunSim">
            <Form>
                <Form.Group className="mb-3" controlId="soldier">
                    <Form.Label>Stat Basis</Form.Label>
                    <Form.Control as="select" size="sm" custom value={stat} onChange={e => setStat(e.target.value)}>
                        <option value="STAT_MAX">Stat Max</option>
                        <option value="TRAINING_MAX">Training Max</option>
                        <option value="STARTING_MAX">Starting Max</option>
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" controlId="soldier">
                    <Form.Label>Soldier Type</Form.Label>
                    <Form.Control as="select" size="sm" custom value={soldier} onChange={e => setSoldier(e.target.value)}>
                        { soldierList }
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" controlId="soldierArmor">
                    <Form.Label>Armor Type</Form.Label>
                    <Form.Control as="select" size="sm" custom value={armor} onChange={e => setArmor(e.target.value)}>
                        { armorList }
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" controlId="weapon">
                    <Form.Label>Weapon</Form.Label>
                    <Form.Control as="select" size="sm" custom value={weapon} onChange={e => setWeapon(e.target.value)}>
                        { weaponList }
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" controlId="ammo">
                    <Form.Label>Ammo</Form.Label>
                    <Form.Control as="select" size="sm" custom value={ammo} onChange={e => setAmmo(e.target.value)}>
                        { ammoList }
                    </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" controlId="target" value={target} onChange={e => setTarget(e.target.value)}>
                    <Form.Label>Target</Form.Label>
                    <Form.Control as="select" size="sm" custom>
                        { targetList }
                    </Form.Control>
                </Form.Group>
            </Form>
            { JSON.stringify({stat, soldier, armor, weapon, ammo, target}) }
        </main>
    );    
}