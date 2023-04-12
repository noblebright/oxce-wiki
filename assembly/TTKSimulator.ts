// from https://github.com/t3chn0l0g1c/oxceRolls/blob/master/rollcalc/Calc.java
// Used with permission

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
    salvo: i32;

    constructor(depth: i32, hitChances: HitChance[], target: Target, salvo: i32) {
        this.depth = depth;
        this.hitChances = hitChances;
        this.target = target;
        this.salvo = salvo;
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

function calcRolls(low: i32, high: i32, armor: i32, dmg: i32, chancePerRoll: f64, branchChance: f64, rolls: i32, i: i32, dmgToOccurrence: Map<i32, f64>, penetratingDamageMultiplier: f64) : void {
    for(let i1:i32 = low; i1 <= high; i1++) {
        const healthDmg: i32 = i1 + <i32> Math.floor(dmg * penetratingDamageMultiplier);
        if(i === rolls) {
            addToMap(intMax(0, healthDmg - armor), chancePerRoll + branchChance, dmgToOccurrence);
        } else {
            calcRolls(low, high, armor, healthDmg, chancePerRoll, chancePerRoll + branchChance, rolls, i + 1, dmgToOccurrence, penetratingDamageMultiplier);
        }
    }
}

type HitList = Array<HitChance>;

function calc1(t: Target, rolls: i32, lowLimit: i32, highLimit: i32, dmg: i32, hitChance: f64, penetratingDamageMultiplier: f64, salvo: i32) : Calc1Result {
    const dmgToOccurrence = new Map<i32, f64>();

    if(hitChance < 1) {
        addToMap(0, 1 - hitChance, dmgToOccurrence);
    }

    const lowDmg = dmg * lowLimit / 100;
    const highDmg = dmg * highLimit / 100;
    const dmgRolls = Math.floor((highDmg - lowDmg + 1) ** rolls);
    const chancePerRoll = hitChance / dmgRolls;

    calcRolls(lowDmg, highDmg, t.armor, 0, chancePerRoll, 0, rolls, 1, dmgToOccurrence, penetratingDamageMultiplier);

    const chances: HitChance[] = [];
    const keys = dmgToOccurrence.keys();

    for(let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = dmgToOccurrence.get(key);
        chances.push(new HitChance(value, key));
    }

    chances.sort((a, b) => b.dmg - a.dmg);

    const depthLimit = intMin(guessDepth(chances.length), 999);
    return new Calc1Result(depthLimit, chances, t, salvo);
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
    return entries;
}


function calcHitsFaster(r: Calc1Result) : Calc2Result{
    const target:Target = r.target;
    const shots = adjust(target.hp + target.armor, r.hitChances);
    let accumulatedDamage: f64[] = new Array(target.hp + 1);
    accumulatedDamage[0] = 1;
    const results: f64[] = new Array(r.depth + 1);

    for(let depth = 1; depth <= r.depth; depth++) {
        for(let i = 0; i < r.salvo; i++) {
            const next: f64[] = new Array(target.hp + 1);
            for(let i = 0; i < shots.length; i++) {
                const shot = shots[i];
                for(let idx = 0; idx < accumulatedDamage.length; idx++) {
                    const dmg:i32 = intMin(idx + shot.dmg, target.hp);
                    next[dmg] += accumulatedDamage[idx] * shot.chance;
                }
            }
            accumulatedDamage = next;
        }
        results[depth] = accumulatedDamage[target.hp];
    }

    let remaining: f64 = 1;
    for(let i = results.length - 1; i > 0; i--) {
        results[i] -= results[i-1];
        remaining -= results[i];
    }
    results[0] = remaining;
    return new Calc2Result(results, 1);
}

function getTTK(salvo:i32, health: i32, armor: i32, rolls: i32, lowLimit: i32, highLimit: i32, penetratingDamageMultiplier:f64, dmg: i32, hitChance: f64) : f64[] {
    const t = new Target(health, armor);
    const r = calc1(t, rolls, lowLimit, highLimit, dmg, hitChance, penetratingDamageMultiplier, salvo);
    const result = calcHitsFaster(r);
    return result.chances;
}

export default getTTK;