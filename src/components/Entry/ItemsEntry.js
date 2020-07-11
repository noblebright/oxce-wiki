import React from "react";

import { getLabel } from "../../model/RuleLoader";
import { SimpleValue, ListValue, useLink, Cost, Damage, getAccuracyMultiplierString } from "./utils";
import Firearms from "../../model/Firearms";

/*
    0 - None (Geoscape-only item)
    1 - Firearm
    2 - Ammo
    3 - Melee
    4 - Grenade
    5 - Proximity Grenade
    6 - Medi-Kit
    7 - Motion Scanner
    8 - Mind Probe
    9 - Psi-Amp
    10 - Electro-flare
    11 - Corpse
*/
//TODO: Localize these strings somehow
const battleTypeMapping = ["None", "Firearm", "Ammo", "Melee", "Grenade", "Medi-kit", "Motion Scanner", "Mind Probe", "Psi-Amp", "Electro-flare", "Corpse"];

const DummySection = () => null;

function Ammo({rules, ammo, locale}) {
    const linkFn = useLink(locale);
    const compat = ammo.compatibleAmmo.map(x => rules[x].items);
    return (
        <React.Fragment>
            {ammo.compatibleAmmo.map((key, idx) => (
                <tr key={idx}>
                    <td>{ linkFn(key) }</td>
                    <td>{ compat[idx].clipSize } shots</td>
                    <td><Damage item={compat[idx]} locale={locale}/></td>
                </tr>
            ))}
        </React.Fragment>
        
    )
}

function Shot({ state, ammo, rules, locale }) {
    return (
        <React.Fragment>
            <tr>
                <td>{ getLabel(state.config.name, locale) } {state.config.shots ? `(x${state.config.shots})` : null}</td>
                <td>{ state.accuracy }%</td>
                <td><Cost cost={state.cost} flat={state.flat} locale={locale}/></td>
            </tr>
            {
                ammo && Object.keys(ammo).length > 1 && <Ammo rules={rules} ammo={ammo[state.config.ammoSlot]} locale={locale}/>
            }
        </React.Fragment>
    );
}

function FirearmSection({entry, rules, locale}) {
    // const linkFn = useLink(locale);
    // const item = entry.items;
    const model = new Firearms(rules, entry.name);
    const {item, ammo, aimed, snap, auto, melee} = model.toState();
    return (
        <React.Fragment>
            {item.twoHanded && <SimpleValue label="Two-Handed?" value={item.blockBothHands ? "REQUIRED" : "TRUE"}/>}
            {item.oneHandedPenalty && <SimpleValue label="One-handed Penalty" value={item.blockBothHands ? "BLOCKED" : `${100 - item.oneHandedPenalty}%`}/>}
            {item.noLOSAccuracyPenalty && <SimpleValue label="No LOS Penalty" value={`${item.noLOSAccuracyPenalty}%`}/>}
            {item.accuracyMultiplier && <SimpleValue label="Base Accuracy" value={getAccuracyMultiplierString(item.accuracyMultiplier, locale)}/>}
            <tr><th colSpan="2">Action Profiles</th></tr>
            <tr>
                <td colSpan="2">
                <table>
                    <tbody>
                        {melee && <Shot state={melee} rules={rules} ammo={ammo} locale={locale}/>}
                        {aimed && <Shot state={aimed} rules={rules} ammo={ammo} locale={locale}/>}
                        {snap && <Shot state={snap} rules={rules} ammo={ammo} locale={locale}/>}
                        {auto && <Shot state={auto} rules={rules} ammo={ammo} locale={locale}/>}                        
                    </tbody>
                </table>
                </td>
            </tr>
            {!ammo && <tr><td colSpan="2"><Damage item={item} locale={locale}/></td></tr>}
            {ammo && Object.keys(ammo).length === 1 && <tr>
                <td>
                    <table>
                        <tbody>
                            <tr><th colSpan="32">Compatible Ammunition</th></tr>
                            <Ammo rules={rules} ammo={ammo["0"]} locale={locale}/>
                        </tbody>
                </table>
                </td>
            </tr>}
        </React.Fragment>
    );
}
export default function ItemsEntry({ rules, entry, locale }) {
    const linkFn = useLink(locale);
    const items = entry.items;
    return (
        <div className="ManufactureEntry">
            <table>
                <thead>
                    <tr><th colSpan="2">Item</th></tr>
                </thead>
                <tbody>
                    <SimpleValue label="Type" value={battleTypeMapping[items.battleType]}/>
                    <SimpleValue label="Cost" value={items.costBuy}/>
                    <SimpleValue label="Sell Price" value={items.costSell ?? "N/A"}/>
                    <SimpleValue label="Weight" value={items.weight}/>
                    <SimpleValue label="Storage Space" value={items.size}/>
                    {items.invWidth && items.invHeight && <SimpleValue label="Inventory Shape" value={`${items.invWidth}x${items.invHeight}`}/>}
                    {items.categories && <ListValue label="Categories" values={items.categories}>{ x => getLabel(x, locale) }</ListValue>}
                    {items.requiresBuy && <ListValue label="Required to Purchase" values={items.requiresBuy}>{ linkFn }</ListValue>}
                    {items.compatibleWeapon && <ListValue label="Ammo for" values={items.compatibleWeapon}>{ linkFn }</ListValue>}
                    {items.battleType === 1 && <FirearmSection entry={entry} rules={rules} locale={locale}/>}
                    {items.battleType === 2 && <DummySection entry={entry} locale={locale}/>}
                    {items.battleType === 3 && <DummySection entry={entry} locale={locale}/>}
                    {items.battleType === 4 && <DummySection entry={entry} locale={locale}/>}
                    {items.battleType === 6 && <DummySection entry={entry} locale={locale}/>}
                    {items.battleType === 7 && <DummySection entry={entry} locale={locale}/>}
                    {items.battleType === 8 && <DummySection entry={entry} locale={locale}/>}
                    {items.battleType === 9 && <DummySection entry={entry} locale={locale}/>}
                    {items.battleType === 10 && <DummySection entry={entry} locale={locale}/>}
                    {items.battleType === 11 && <DummySection entry={entry} locale={locale}/>}
                </tbody>
            </table>
        </div>
    );
}