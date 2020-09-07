import React from "react";
import Table from "react-bootstrap/Table";
import useLink from "../../../hooks/useLink";
import useLocale from "../../../hooks/useLocale";
import useSprite from "../../../hooks/useSprite";
import { Hours, ListValue, Money, BooleanValue, getBattleType, SectionHeader, SimpleValue, ListHeader, Percent } from "../../ComponentUtils.js";
import Firearm from "./Firearm";
import Ammo from "./Ammo";
import Melee from "./Melee";
import Grenade from "./Grenade";
import MediKit from "./MediKit";
import MotionScanner from "./MotionScanner";
import MindProbe from "./MindProbe";
import PsiAmp from "./PsiAmp";
import ElectroFlare from "./ElectroFlare";

function MiscItem({ ruleset, items, lc, linkFn }) {
    return (
        <React.Fragment>
            <ListHeader label="General Properties"/>
            <tbody>
                <SimpleValue label="Item Type" value={items.battleType}>{ getBattleType }</SimpleValue>
                <SimpleValue label="Cost" value={items.costBuy}>{ Money }</SimpleValue>
                <SimpleValue label="Sell Price" value={items.costSell}>{ Money }</SimpleValue>
                <SimpleValue label="Transfer Time" value={items.transfer}>{ Hours }</SimpleValue>
                <SimpleValue label="Weight" value={items.weight}/>
                <SimpleValue label="Storage Space" value={items.size}/>
                <SimpleValue label="Name in Inventory" value={items.name}>{lc}</SimpleValue>
                <SimpleValue label="Ammo Name Modifier" value={items.nameAsAmmo}>{lc}</SimpleValue>
                <SimpleValue label="Monthly Maintenance" value={items.monthlyMaintenance}>{Money}</SimpleValue>
                <SimpleValue label="Monthly Salary" value={items.monthlySalary}>{Money}</SimpleValue>
                <SimpleValue label={lc("manaExperience")} value={items.manaExperience}/>
                <SimpleValue label="Two-Handed" value={items}>
                    {x => x.twoHanded ? (x.blockBothHands ? "REQUIRED": "TRUE") : "FALSE"}
                </SimpleValue>
                <SimpleValue label="One Handed Accuracy" value={items.twoHanded ? items.oneHandedPenalty || ruleset.oneHandedPenaltyGlobal || 80 : undefined}>{Percent}</SimpleValue>
                <BooleanValue label="Recoverable?" value={items.recover}/>
                <BooleanValue label="Corpse Recoverable?" value={items.recoverCorpse}/>
                <BooleanValue label="Fixed Weapon?" value={items.fixedWeapon}/>
                <SimpleValue label="Score" value={items.recoveryPoints}/>
                <BooleanValue label="Live Alien?" value={items.liveAlien}/>
                <BooleanValue label="Unarmed Attack?" value={items.specialUseEmptyHand}/>
                {!!items.invWidth && !!items.invHeight && <SimpleValue label="Inventory Shape" value={`${items.invWidth}x${items.invHeight}`}/>}
                <BooleanValue label="Extinguish Fires?" value={items.isFireExtinguisher}/>
                <SimpleValue label="Durability" value={items.armor || 20}/>
                <BooleanValue label="LOS Required?" value={items.LOSRequired}/>
                <BooleanValue label="Psi Required?" value={items.psiRequired}/>

                <BooleanValue label={lc("manaRequired")} value={items.manaRequired}/>
                <BooleanValue label="Underwater Only?" value={items.underwaterOnly}/>
                <BooleanValue label="Land Only?" value={items.landOnly}/>
                <SimpleValue label="Zombie Unit" value={items.zombieUnit}>{linkFn}</SimpleValue>
            </tbody>
        </React.Fragment>
    );
}

const componentMap = [
    null,
    Firearm,
    Ammo,
    Melee,
    Grenade,
    Grenade,
    MediKit, 
    MotionScanner, 
    MindProbe, 
    PsiAmp, 
    ElectroFlare,
    null
];

const DefaultComponent = ({items, spriteFn}) => (
    <tbody>
                <SimpleValue label="Sprite" value={items.bigSprite}>{spriteFn}</SimpleValue>
                <SimpleValue label="Type" value={items.battleType}>{ getBattleType }</SimpleValue>
    </tbody>
)
export default function Item({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const spriteFn = useSprite(ruleset, "BIGOBS.PCK", 32, 48); //BIGOBS.PCK, 32px x 48px
    const entry = ruleset.entries[id];
    const items = entry.items;

    if(!items) return null;

    if(Object.keys(items).length <= 1) {
        return null; //empty object.
    }
    const BattleComponent = componentMap[items.battleType] || DefaultComponent;
    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Item"/>
            { BattleComponent && <BattleComponent ruleset={ruleset} items={items} lc={lc} linkFn={linkFn} spriteFn={spriteFn}/> }
            <MiscItem ruleset={ruleset} items={items} lc={lc} linkFn={linkFn}/>
            <ListValue label="Categories" values={items.categories}>{ lc }</ListValue>
            <ListValue label="Supported Inventory Sections" values={items.supportedInventorySections}>{ lc }</ListValue>
            <ListValue label="Prison Type" values={ruleset.prisons[items.prisonType]}>{ linkFn }</ListValue>
            <ListValue label="Research Required to Purchase" values={items.requiresBuy}>{ linkFn }</ListValue>
            <ListValue label="Services Required to Purchase" values={items.requiresBuyBaseFunc}>{ linkFn }</ListValue>
            <ListValue label="Required to Use" values={items.requires}>{ linkFn }</ListValue>
            <ListValue label="Component Of" values={items.componentOf}>{ linkFn }</ListValue>
            <ListValue label="Compatible Ammunition" values={items.allCompatibleAmmo}>{ linkFn }</ListValue>
            <ListValue label="Craft Weapon Entry" values={items.craftWeapons}>{ linkFn }</ListValue>
            <ListValue label="Craft Ammo For" values={items.craftAmmo}>{ linkFn }</ListValue>
            <ListValue label="Wearable Armor" values={items.wearableArmors}>{ linkFn }</ListValue>
            <ListValue label="Script Tags" values={Object.entries(items.tags || {})}/>
        </Table>
    )
}