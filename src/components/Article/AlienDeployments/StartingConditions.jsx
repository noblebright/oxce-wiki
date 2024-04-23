import React from "react";
import { SectionHeader, SimpleValue, ListValue } from "../../ComponentUtils.jsx";

export default function StartingConditions({ value, lc, linkFn, inventoryFn }) {
    if(!value) return null;
    return (
        <React.Fragment>
            <tbody>
                <SimpleValue label="Destroy Required Items?" value={value.destroyRequiredItems}/>
            </tbody>
            <ListValue label="Required Items" values={value.requiredItems}>{ linkFn } </ListValue>
            { value.defaultArmor && <SectionHeader label="Default Armors"/> }
            { Object.entries(value.defaultArmor || {}).map(([soldier, armorTypes]) => (
                <ListValue key={soldier} label={lc(soldier)} values={Object.entries(armorTypes)}>{inventoryFn}</ListValue>
            ))}
            <SectionHeader label="Allowed/Forbidden"/>
            <ListValue label="Allowed Armors" values={value.allowedArmors}>{ linkFn }</ListValue>
            <ListValue label="Forbidden Armors" values={value.forbiddenArmors}>{ linkFn }</ListValue>
            <ListValue label="Allowed Soldier Types" values={value.allowedSoldierTypes}>{ linkFn }</ListValue>
            <ListValue label="Forbidden Soldier Types" values={value.forbiddenSoldierTypes}>{ linkFn }</ListValue>
            <ListValue label="Allowed Vehicle Unit Types" values={value.allowedVehicles }>{ linkFn}</ListValue>
            <ListValue label="Forbidden Vehicle Unit Types" values={value.forbiddenVehicles}>{ linkFn }</ListValue>
            <ListValue label="Allowed Items" values={value.allowedItems}>{ linkFn }</ListValue>
            <ListValue label="Forbidden Items" values={value.forbiddenItems}>{ linkFn }</ListValue>
            <ListValue label="Allowed Item Categories" values={value.allowedItemCategories}>{ linkFn }</ListValue>
            <ListValue label="Forbidden Item Categories" values={value.forbiddenItemCategories}>{ linkFn }</ListValue>
            <ListValue label="Allowed Craft" values={value.allowedCraft}>{ linkFn }</ListValue>
            <ListValue label="Forbidden Craft" values={value.forbiddenCraft}>{ linkFn }</ListValue>
        </React.Fragment>
    )
}

