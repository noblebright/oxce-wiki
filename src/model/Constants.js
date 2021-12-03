export const defaultDTProps = [
    { RandomType: 5 }, //none
    { ResistType: 1, RandomType: 8, IgnoreOverKill: true }, //ap
    { //fire
        ResistType: 2,
        RandomType: 4, 
        FireBlastCalc: true,
        IgnoreOverKill: true,
        IgnoreSelfDestruct: true,
        IgnoreDirection: true,
        FixRadius: -1,
        RadiusEffectiveness: 0.03,
        ArmorEffectiveness: 0,
        FireThreshold: 0,
        ToHealth: 1,
        ToArmor: 0,
        ToWound: 0,
        ToItem: 0,
        ToTile: 0,
        ToStun: 2,
        TileDamageMethod: 2
    },
    { //he
        ResistType: 3, 
        RandomType: 9, 
        IgnoreOverKill: true,
        IgnoreSelfDestruct: true,
        FixRadius: -1,
        RadiusEffectiveness: 0.05,
        ToItem: 1,
        TileDamageMethod: 2
    },
    { ResistType: 4, RandomType: 8, IgnoreOverKill: true }, //laser
    { ResistType: 5, RandomType: 8, IgnoreOverKill: true }, //plasma
    { //stun
        ResistType: 6, 
        RandomType: 8, 
        IgnoreOverKill: true,
        IgnoreSelfDestruct: true,
        IgnorePainImmunity: true,
        FixRadius: -1,
        RadiusEffectiveness: 0.05,
        ToHealth: 0,
        ToArmor: 0,
        ToWound: 0,
        ToItem: 0,
        ToTile: 0,
        ToStun: 1,
        RandomStun: false,
        TileDamageMethod: 2
    }, 
    { ResistType: 7, RandomType: 8, IgnoreOverKill: true, IgnoreSelfDestruct: true }, //melee
    { ResistType: 8, RandomType: 8, IgnoreOverKill: true }, //acid
    { //smoke
        ResistType: 9, 
        RandomType: 5, 
        IgnoreOverKill: true,
        IgnoreDirection: true,
        FixRadius: -1,
        RadiusEffectiveness: 0.05,
        ArmorEffectiveness: 0,
        SmokeThreshold: 0,
        ToHealth: 0,
        ToArmor: 0,
        ToWound: 0,
        ToItem: 0,
        ToTile: 0,
        ToStun: 1,
        TileDamageMethod: 2
    },
    { ResistType: 10, RandomType: 8, IgnoreOverKill: true }, //10
    { ResistType: 11, RandomType: 8, IgnoreOverKill: true }, //11
    { ResistType: 12, RandomType: 8, IgnoreOverKill: true }, //12
    { ResistType: 13, RandomType: 8, IgnoreOverKill: true }, //13
    { ResistType: 14, RandomType: 8, IgnoreOverKill: true }, //14
    { ResistType: 15, RandomType: 8, IgnoreOverKill: true }, //15
    { ResistType: 16, RandomType: 8, IgnoreOverKill: true }, //16
    { ResistType: 17, RandomType: 8, IgnoreOverKill: true }, //17
    { ResistType: 18, RandomType: 8, IgnoreOverKill: true }, //18
    { ResistType: 19, RandomType: 8, IgnoreOverKill: true }, //19
];

export const ShotType = {
	Aimed: "Aimed",
	Snap: "Snap",
	Auto: "Auto"
};