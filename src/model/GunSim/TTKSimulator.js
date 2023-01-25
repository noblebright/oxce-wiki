// from https://github.com/t3chn0l0g1c/oxceRolls/blob/bf3654edeaf1df7bbda2abe661511acf09f29345/rollcalc/Calc.java
// Used with permission

class Target {
    constructor(hp, armor) {
        this.hp = hp;
        this.armor = armor;
    }
}

class HitChance {
    constructor(chance, dmg) {
        this.chance = chance;
        this.dmg = dmg;
    }

    toString() {

    }
}

function addToMap(dmg, chance, dmgToOccurrence) {
    if(!dmgToOccurrence.has(dmg)) {
        dmgToOccurrence.set(dmg, chance)
    } else {
        dmgToOccurrence.set(dmg, dmgToOccurrence.get(dmg) + chance);
    }
}

function guessDepth(chances) {
    return Math.floor(Math.ceil(Math.log(1_000_000_000_000) / Math.log(chances)))
}

function calcRolls(low, high, armor, dmg, chancePerRoll, branchChance, rolls, i, dmgToOccurrence) {
    for(let i1 = low; i1 <= high; i1++) {
        const healthDmg = i1 + dmg;
        if(i === rolls) {
            addToMap(Math.max(0, healthDmg - armor), chancePerRoll + branchChance, dmgToOccurrence);
        } else {
            calcRolls(low, high, armor, healthDmg, chancePerRoll, chancePerRoll + branchChance, rolls, i + 1, dmgToOccurrence);
        }
    }
}

function calc1(t, rolls, lowLimit, highLimit, dmg, hitChance) {
    const dmgToOccurrence = new Map();

    if(hitChance < 1) {
        addToMap(0, 1 - hitChance, dmgToOccurrence);
    }

    const lowDmg = dmg * lowLimit / 100;
    const highDmg = dmg * highLimit / 100;
    const dmgRolls = Math.floor((highDmg - lowDmg + 1) ** rolls);
    const chancePerRoll = hitChance / dmgRolls;

    calcRolls(lowDmg, highDmg, t.armor, 0, chancePerRoll, 0, rolls, 1, dmgToOccurrence);

    const chances = [];
    for (const [key, value] of dmgToOccurrence) {
        chances.push(new HitChance(value, key));
    }

    chances.sort((a, b) => b.dmg - a.dmg);

    const depthLimit = Math.min(guessDepth(chances.length), 999);
    const r = { depth: depthLimit, hitChances: chances, target: t};
    return r;
}

function adjust(max, hitChances) {
    const map = new Map();
    for(let c of hitChances) {
        let dmg = Math.min(c.dmg, max);
        addToMap(dmg, c.chance, map);
    }
    const entries = [...map.entries()];
    entries.sort((a, b) => b[0] - a[0]);
    const result = Array(entries.length);
    for(let i = 0; i < result.length; i++) {
        const [k, v] = entries[i];
        result[i] = new HitChance(v, k);
    }
    return result;
}

function calcHitsFaster(r) {
    console.log(r);
    const shots = adjust(r.target.hp + r.target.armor, r.hitChances);
    let prev = adjust(r.target.hp + r.target.armor, r.hitChances);
    let next = Array(r.target.hp);
    let killChance = 0;
    const results = Array(r.depth + 1);

    for(let c of prev) {
        if(c.dmg >= r.target.hp) {
            killChance += c.chance;
        }
    }

    results[1] = killChance;
    let remaining = 1 - killChance;
    killChance = 0;

    for(let i = 1; i < r.depth; i++) {
        for(let h of shots) {
            if(!h) continue;
            for(let p of prev) {
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
        next = Array(r.target.hp);
    }

    let noKill = 0;
    for(let i = 1; i < results.length; i++) {
        console.log(`Hits: ${i} chance ${results[i]}`);
        noKill += results[i];
    }
    noKill = 1 - noKill;
    results[0] = noKill;
    console.log(`Hits more than ${r.depth} chance ${results[0]}`);
    const result = { chances: results, accuracy: 1 };
    return result;
}

function getTTK(health, armor, rolls, lowLimit, highLimit, dmg, hitChance) {
    const t = new Target(health, armor);
    console.time("ttk");
    const r = calc1(t, rolls, lowLimit, highLimit, dmg, hitChance);
    const result = calcHitsFaster(r);
    console.timeEnd("ttk");
    return result;
}

console.log(JSON.stringify(getTTK(40, 10, 1, 0, 200, 20, 0.5)));