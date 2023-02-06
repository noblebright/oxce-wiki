import React, {useState, useMemo} from "react";
import {Table} from "react-bootstrap";
import useLink from "../../hooks/useLink.js";
import useLocale from "../../hooks/useLocale.js";
import useBonusString from "../../hooks/useBonusString.js";
import { BooleanValue, KeyValue, ListValue, Percent, SimpleSelect, SectionHeader, ListHeader, SimpleValue, HeightStats, StatRecovery, UnitStats } from "../ComponentUtils.js";
import { damageKeys } from "../../model/utils.js";
import useImage from "../../hooks/useImage.js";

function ArmorRating({armors, lc}) {
    if(!armors) return null;
    return (
        <Table bordered striped size="sm" className="auto-width">
            <ListHeader label="Armor Rating"/>
            <tbody>
                <SimpleValue showZero label={lc("STR_FRONT_ARMOR")} value={armors.frontArmor}/>
                <SimpleValue showZero label={lc("STR_LEFT_ARMOR")} value={armors.sideArmor + (armors.leftArmorDiff || 0) }/>
                <SimpleValue showZero label={lc("STR_RIGHT_ARMOR")} value={armors.sideArmor}/>
                <SimpleValue showZero label={lc("STR_REAR_ARMOR")} value={armors.rearArmor}/>
                <SimpleValue showZero label={lc("STR_UNDER_ARMOR")} value={armors.underArmor}/>
            </tbody>
        </Table>
    );
}

function DamageResists({resists, lc}) {
    if(!resists) return null;
    return (
        <Table bordered striped size="sm" className="auto-width">
            <ListHeader label="Damage Modifiers"/>
            <tbody>
                { resists.map((value, idx) => <SimpleValue key={idx} label={lc(damageKeys[idx])} value={Math.floor(value * 100)} showZero>{Percent}</SimpleValue>) }
            </tbody>
        </Table>
    );
}

const moveType = [
    "Walking",
    "Flying",
    "Sliding",
    "Floating",
    "Sinking"
];

function SingleImage({imageFn, id}) {
    return <div className="PaperDoll">{imageFn(id)}</div>;
}

function LayeredDoll({layersDefaultPrefix, layersDefinition, layersSpecificPrefix = {}, imageFn}) {
    const [selected, setSelected] = useState();
    if(!selected) { //set selected to default and try again.
        setSelected(Object.keys(layersDefinition)[0]);
        return null;
    }
    const definition = layersDefinition[selected];
    const layers = definition.reduce((acc, item, idx) => {
        if(!item) return acc;
        const prefix = layersSpecificPrefix[`${idx}`] || layersDefaultPrefix;
        const spriteKey = `${prefix}__${idx}__${item}`;
        acc.push(imageFn(spriteKey, { key: idx }));
        return acc;
    }, []);
    
    return (
        <div className="PaperDoll">
            <SimpleSelect options={Object.keys(layersDefinition).sort()} value={selected} onChange={setSelected}/>
            {layers}
        </div>
    );
}

function ClassicInventory({ruleset, id, imageFn}) {
    const [selected, setSelected] = useState();
    const versions = useMemo(() => {
        let v = {};
        for(let i = 0; i < 256; i++) { // idx = lookVariant*4 + look (lookVariant: 0-63, look: 0-3. so max is 64 * 4 = 256)
            const mKey = `${id}M${i}.SPK`;
            const fKey = `${id}F${i}.SPK`;
            if(ruleset.sprites[mKey]) { 
                //found a male version, put it in;
                v[`M${i}`] = mKey;
            }
            if(ruleset.sprites[fKey]) {
                //found a female version, put it in;
                v[`F${i}`] = fKey;
            }
        }
        return v;
    }, [ruleset, id]);

    if(!Object.keys(versions).length) {
        return "No sprites found";
    }

    if(!selected) { //set selected to default and try again.
        setSelected(Object.keys(versions)[0]);
        return null;
    }

    return (
        <div className="PaperDoll">
            <SimpleSelect options={Object.keys(versions).sort()} value={selected} onChange={setSelected}/>
            {imageFn(versions[selected])}
        </div>
    );
}

//FIXME: OXCE falls back LayeredDoll -> ClassicInventory -> SingleImage instead of SingleImage -> LayeredDoll -> ClassicInventory.
function PaperDoll({ruleset, armors, imageFn}) {
    const spriteId = armors.spriteInv; 
    const sprite = ruleset.sprites[spriteId] ?? ruleset.sprites[`${armors.spriteInv}.SPK`]; // Try defaulting to .SPK if the raw id doesn't work.
    
    if(sprite && (sprite.typeSingle || sprite.singleImage)) { //found a single image sprite
        return <SingleImage imageFn={imageFn} id={sprite.type}/>; //do this instead of spriteId, so we can catch both normal and appended cases
    }

    //no single image, look for paperdoll
    const { layersDefaultPrefix, layersSpecificPrefix, layersDefinition } = armors;
    
    // Build Layered PaperDoll if it exists.
    if(layersDefaultPrefix && layersDefinition) { 
        return <LayeredDoll layersDefaultPrefix={layersDefaultPrefix} layersSpecificPrefix={layersSpecificPrefix} layersDefinition={layersDefinition} imageFn={imageFn}/>
    }

    //attempt to build classic image variant
    return <ClassicInventory ruleset={ruleset} id={spriteId} imageFn={imageFn}/>;
}

export default function Armors({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const bonusFn = useBonusString(lc);
    const imageFn = useImage(ruleset, 2);
    const entry = ruleset.entries[id];
    const armors = entry.armors;

    if(!armors) return null;

    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Armor"/>
            <tbody>
                <tr><td colSpan="2"><PaperDoll ruleset={ruleset} armors={armors} imageFn={imageFn}/></td></tr>
                <tr>
                    <td><ArmorRating armors={armors} lc={lc}/></td>
                    <td><DamageResists resists={armors.damageModifier} lc={lc}/></td>
                </tr>
            </tbody>
            <StatRecovery recovery={armors.recovery} lc={lc} bonusFn={bonusFn}/>
            <ListHeader label="Properties"/>
            <tbody>
                <SimpleValue label="Required to Use" value={armors.requires}>{ linkFn }</SimpleValue>
                <SimpleValue label="Recovered Corpse" value={armors.corpseGeo}>{ linkFn }</SimpleValue>
                <SimpleValue label="Inventory Item" value={armors.storeItem}>{ linkFn }</SimpleValue>
                <SimpleValue label="Special Weapon" value={armors.specialWeapon}>{ linkFn }</SimpleValue>
                <SimpleValue label="Movement Type" value={armors.movementType}>{ x => moveType[x] }</SimpleValue>
                <SimpleValue label="Size" value={armors.size || 1}/>
                <SimpleValue label="Weight" value={armors.weight}/>
                <SimpleValue label="Day Vision" value={armors.visibilityAtDay}/>
                <SimpleValue label="Night Vision" value={armors.visibilityAtDark}/>
                <SimpleValue label="Personal Light" value={armors.personalLight}/>
                <SimpleValue label="Camouflage (Day)" value={armors.camouflageAtDay}/>
                <SimpleValue label="Camouflage (Night)" value={armors.camouflageAtDark}/>
                <SimpleValue label="Camouflage Detection (Day)" value={armors.antiCamouflageAtDay}/>
                <SimpleValue label="Camouflage Detection (Night)" value={armors.antiCamouflageAtDark}/>
                <SimpleValue label="Thermal Vision" value={armors.heatVision}>{ Percent }</SimpleValue>
                <SimpleValue label="Psi Sense" value={armors.psiVision}/>
                <SimpleValue label="Overkill Threshold" value={armors.overKill * 100 || 50}>{Percent}</SimpleValue>
                <BooleanValue label="Can Run?" value={armors.allowsRunning}/>
                <BooleanValue label="Can Kneel?" value={armors.allowsKneeling}/>
                <BooleanValue label="Can Strafe?" value={armors.allowsStrafing}/>
                <BooleanValue label="Can Move?" value={armors.allowsMoving}/>
                <BooleanValue label="Instant Wound Recovery?" value={armors.instantWoundRecovery}/>
                <BooleanValue label="Fear Immune?" value={armors.fearImmune}/>
                <BooleanValue label="Bleed Immune?" value={armors.bleedImmune}/>
                <BooleanValue label="Pain Immune?" value={armors.painImmune}/>
                <BooleanValue label="Zombie Immune?" value={armors.zombiImmune}/>
                <BooleanValue label="CQC Immune?" value={armors.ignoresMeleeThread}/>
                <BooleanValue label="CQC Capable?" value={armors.createsMeleeThread}/>
                <SimpleValue label="Psi Defense" value={armors.psiDefense}>{ bonusFn }</SimpleValue>
                <SimpleValue label="Melee Dodge" value={armors.meleeDodge}>{ bonusFn }</SimpleValue>
                <SimpleValue label="Back Dodge Penalty" value={Math.floor(armors.meleeDodgeBackPenalty * 100)} showZero>{ Percent }</SimpleValue>
                <SimpleValue label="Side Dodge Penalty" value={Math.floor(armors.meleeDodgeBackPenalty * 100) / 2} showZero>{ Percent }</SimpleValue>
                <HeightStats entity={armors} />
            </tbody>
            <UnitStats stats={armors.stats} lc={lc}/>
            <ListValue label="Equippable By" values={armors.units || armors.npcUnits}>{ linkFn }</ListValue>
            <ListValue label="Corpse Item" values={armors.corpseBattle}>{ linkFn }</ListValue>
            <ListValue label="Built-in Weapons" values={armors.builtInWeapons}>{ linkFn }</ListValue>
            <ListValue label="Categories" values={armors.categories}>{ lc }</ListValue>
            <ListValue label="Required to Purchase" values={armors.requiresBuy}>{ linkFn }</ListValue>
            <ListValue label="Tags" values={Object.entries(armors.tags || {})}>{ KeyValue }</ListValue>
        </Table>
    );
}