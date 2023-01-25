function intMax(a:i32, b:i32): i32 {
    if(a > b) return a;
    return b;
}

function intMin(a:i32, b:i32): i32 {
    if(a < b) return a;
    return b;
}

class Target {
    hp: i32;
    armor: i32;
    constructor(hp: i32, armor: i32) {
        this.hp = hp;
        this.armor = armor;
    }
}

class HitChance {
    chance: f64;
    dmg: i32;

    constructor(chance: f64, dmg: i32) {
        this.chance = chance;
        this.dmg = dmg;
    }
}

class Calc1Result {
    depth: i32;
    hitChances: HitChance[];
    target: Target;

    constructor(depth: i32, hitChances: HitChance[], target: Target) {
        this.depth = depth;
        this.hitChances = hitChances;
        this.target = target;
    }
}

class Calc2Result {
    chances: f64[];
    accuracy: f64;
    constructor(chances: f64[], accuracy: f64) {
        this.chances = chances;
        this.accuracy = accuracy;
    }
}

function addToMap(dmg: i32, chance: f64, dmgToOccurrence: Map<i32, f64>) : void {
    if(!dmgToOccurrence.has(dmg)) {
        dmgToOccurrence.set(dmg, chance)
    } else {
        dmgToOccurrence.set(dmg, dmgToOccurrence.get(dmg) + chance);
    }
}

function guessDepth(chances: i32) : i32 {
    return <i32>Math.ceil(Math.log(1_000_000_000_000) / Math.log(chances));
}

function calcRolls(low: i32, high: i32, armor: i32, dmg: i32, chancePerRoll: f64, branchChance: f64, rolls: i32, i: i32, dmgToOccurrence: Map<i32, f64>) : void {
    for(let i1:i32 = low; i1 <= high; i1++) {
        const healthDmg: i32 = i1 + dmg;
        if(i === rolls) {
            addToMap(intMax(0, healthDmg - armor), chancePerRoll + branchChance, dmgToOccurrence);
        } else {
            calcRolls(low, high, armor, healthDmg, chancePerRoll, chancePerRoll + branchChance, rolls, i + 1, dmgToOccurrence);
        }
    }
}

type HitList = Array<HitChance | null>;

function calc1(t: Target, rolls: i32, lowLimit: i32, highLimit: i32, dmg: i32, hitChance: f64) : Calc1Result {
    const dmgToOccurrence = new Map<i32, f64>();

    if(hitChance < 1) {
        addToMap(0, 1 - hitChance, dmgToOccurrence);
    }

    const lowDmg = dmg * lowLimit / 100;
    const highDmg = dmg * highLimit / 100;
    const dmgRolls = Math.floor((highDmg - lowDmg + 1) ** rolls);
    const chancePerRoll = hitChance / dmgRolls;

    calcRolls(lowDmg, highDmg, t.armor, 0, chancePerRoll, 0, rolls, 1, dmgToOccurrence);

    const chances: HitChance[] = [];

    const keys = dmgToOccurrence.keys();
    for(let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = dmgToOccurrence.get(key);
        chances.push(new HitChance(value, key));
    }

    chances.sort((a, b) => b.dmg - a.dmg);

    const depthLimit = intMin(guessDepth(chances.length), 999);
    return new Calc1Result(depthLimit, chances, t);
}

function adjust(max: i32, hitChances: HitChance[]) : HitList {
    const map = new Map<i32, f64>();
    for(let i = 0; i < hitChances.length; i++) {
        const c = hitChances[i];
        let dmg = intMin(c.dmg, max);
        addToMap(dmg, c.chance, map);
    }

    const entries: Array<HitChance> = [];
    const mapKeys = map.keys();
    for(let i = 0; i < mapKeys.length; i++) {
        const key = mapKeys[i];
        entries.push(new HitChance(map.get(key), key));
    }
    entries.sort((a, b) => b.dmg - a.dmg);
    return changetype<HitList>(entries);
}


function calcHitsFaster(r: Calc1Result) : Calc2Result{
    const shots = adjust(r.target.hp + r.target.armor, r.hitChances);
    let prev = adjust(r.target.hp + r.target.armor, r.hitChances);
    let next: HitList = new Array(r.target.hp);
    let killChance:f64 = 0;
    const results: f64[] = new Array(r.depth + 1);

    for(let i = 0; i < prev.length; i++) {
        const c = <HitChance> prev[i]; //assert this isn't null
        if(c.dmg >= r.target.hp) {
            killChance += c.chance;
        }
    }

    results[1] = killChance;
    let remaining: f64 = 1 - killChance;
    killChance = 0;

    for(let i = 1; i < r.depth; i++) {
        for(let j = 0; j < shots.length; j++) {
            const h = shots[j];
            if(!h) continue;
            for(let k = 0; k < prev.length; k++) {
                let p = prev[k];
                if(!p) p = new HitChance(1, 0);
                let dmg = h.dmg + p.dmg;
                let chance = h.chance * p.chance;
                if(dmg >= r.target.hp) {
                    killChance += chance;
                } else {
                    let n = next[dmg];
                    if(!n) {
                        n = new HitChance(chance, dmg);
                        next[dmg] = n;
                    } else {
                        n.chance += chance;
                    }
                }
            }
        }
        killChance *= remaining;
        remaining -= killChance;
        results[i + 1] = killChance;
        killChance = 0;
        prev = next;
        next = new Array(r.target.hp);
    }

    let noKill : f64 = 0;
    for(let i:i32 = 1; i < results.length; i++) {
        noKill += results[i];
    }
    noKill = 1 - noKill;
    results[0] = noKill;
    return new Calc2Result(results, 1);
}

function getTTK(health: i32, armor: i32, rolls: i32, lowLimit: i32, highLimit: i32, dmg: i32, hitChance: f64) : f64[] {
    const t = new Target(health, armor);
    const r = calc1(t, rolls, lowLimit, highLimit, dmg, hitChance);
    const result = calcHitsFaster(r);
    return result.chances;
}

export default getTTK;