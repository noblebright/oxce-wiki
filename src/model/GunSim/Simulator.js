import { Weapon, VOXEL_PER_TILE } from "./AccuracySimulator";

export function computeInputs(entries, stat, soldier, armor, weapon, target, distance) {
    const result = [];
    const weaponEntry = entries[weapon].items;
    const source = { x: 160, y: 160, z: 160 };
    const targetObj = { x: 160, y: source.y + (distance * VOXEL_PER_TILE) , z: 160 };
    //const w = new Weapon(weaponEntry.);
}