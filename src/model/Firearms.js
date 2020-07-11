function createConfig(conf, name, arcing, shots = 1) {
    return Object.assign({ ammoSlot: "0", shots, name, arcing }, conf);
}

export default class Firearms {
    constructor(rules, id) {
        this.entry = rules[id];
        this.rules = rules;
        this.item = this.entry.items;
        this.defaultFlat = { time: !!this.item.flatRate, energy:true, morale: true, health: true, stun: true, sanity: true };
        this.buildAmmo();
        this.buildAimed();
        this.buildSnap();
        this.buildAuto();
        this.buildMelee();
    }

    buildAmmo() {
        const item = this.item;
        if(item.ammo) {
            this.ammo = item.ammo;
        } else {
            this.ammo = item.compatibleAmmo && { "0": { compatibleAmmo: item.compatibleAmmo } };
        }
    }

    buildAimed() {
        const item = this.item;
        if(!item.accuracyAimed) {
            return;
        }
        this.aimed = {
            accuracy: item.accuracyAimed,
            cost: item.costAimed || { time: item.tuAimed },
            flat: Object.assign({}, this.defaultFlat, item.flatAimed),
            range: item.aimRange,
            config: createConfig(item.confAimed, "STR_AIMED_SHOT", item.arcingShot)
        };
    }
    buildSnap() {
        const item = this.item;
        if(!item.accuracySnap) {
            return;
        }
        this.snap = {
            accuracy: item.accuracySnap,
            cost: item.costSnap || { time: item.tuSnap },
            flat: Object.assign({}, this.defaultFlat, item.flatSnap),
            range: item.snapRange,
            config: createConfig(item.confSnap, "STR_SNAP_SHOT", item.arcingShot)
        };
    }
    buildAuto() {
        const item = this.item;
        if(!item.accuracyAuto) {
            return;
        }
        this.auto = {
            accuracy: item.accuracyAuto,
            cost: item.costAuto || { time: item.tuAuto },
            flat: Object.assign({}, this.defaultFlat, item.flatAuto),
            range: item.autoRange,
            config: createConfig(item.confAuto, "STR_AUTO_SHOT", item.arcingShot, item.autoShots || 3)
        };
    }
    buildMelee() {
        const item = this.item;
        if(!item.accuracyMelee) {
            return null;
        }
        this.melee = {
            accuracy: item.accuracyMelee,
            cost: item.costMelee || { time: item.tuMelee },
            flat: Object.assign({}, this.defaultFlat, item.flatMelee),
            range: 0,
            config: createConfig(item.confMelee, "STR_HIT_MELEE", undefined, 0)
        };
    }
    toState() {
        return {item: this.item, shotgun: this.shotgun, ammo: this.ammo, aimed: this.aimed, snap: this.snap, auto: this.auto, melee: this.melee};
    }
}