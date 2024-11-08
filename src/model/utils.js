export const possibleLanguages = {
    "en-US": "English (US)",
    "en-GB": "English (UK)",
    "bg": "Български",
    "cs": "Česky",
    "cy": "Cymraeg",
    "da": "Dansk",
    "de": "Deutsch",
    "el": "Ελληνικά",
    "et": "Eesti",
    "es-ES": "Español (ES)",
    "es-419": "Español (AL)",
    "fr": "Français (FR)",
    "fr-CA": "Français (CA)",
    "fi": "Suomi",
    "hr": "Hrvatski",
    "hu": "Magyar",
    "it": "Italiano",
    "ja": "日本語",
    "ko": "한국어",
    "lb": "Lëtzebuergesch",
    "lv": "Latviešu",
    "nl": "Nederlands",
    "no": "Norsk",
    "pl": "Polski",
    "pt-BR": "Português (BR)",
    "pt-PT": "Português (PT)",
    "ro": "Română",
    "ru": "Русский",
    "sk": "Slovenčina",
    "sl": "Slovenščina",
    "sv": "Svenska",
    "th": "ไทย",
    "tr": "Türkçe",
    "uk": "Українська",
    "zh-CN": "中文",
    "zh-TW": "文言"
};

window.auth = key => sessionStorage.setItem("auth", key);

const load = (url, authed) => fetch(url, authed && sessionStorage.getItem("auth") ? { headers: { Authorization: `Basic ${sessionStorage.getItem("auth")}` } } : undefined);
export const loadJSON = (url, authed) => load(url, authed).then(res => res.json());
export const loadText = (url, authed) => load(url, authed).then(res => res.text());

export const mappify = (array, key, value) => {
    const keyFn = typeof key === "string" ? x => x[key] : key;
    const valueFn = value ? (typeof value === "string" ? x => x[value] : value) : x => x;
    return array.reduce((acc, item) => {
        acc[keyFn(item)] = valueFn(item);
        return acc;
    }, {});
}

export function getModuleSupportedLanguages(rulesets) {
    return Object.keys(possibleLanguages).filter(x => rulesets.every(ruleset => ruleset[x]));
}

export const damageKeys = [
    "STR_DAMAGE_UC", "STR_DAMAGE_ARMOR_PIERCING", "STR_DAMAGE_INCENDIARY", "STR_DAMAGE_HIGH_EXPLOSIVE", "STR_DAMAGE_LASER_BEAM",
    "STR_DAMAGE_PLASMA_BEAM", "STR_DAMAGE_STUN", "STR_DAMAGE_MELEE", "STR_DAMAGE_ACID", "STR_DAMAGE_SMOKE",
    "STR_DAMAGE_10", "STR_DAMAGE_11", "STR_DAMAGE_12", "STR_DAMAGE_13", "STR_DAMAGE_14",
    "STR_DAMAGE_15", "STR_DAMAGE_16", "STR_DAMAGE_17", "STR_DAMAGE_18", "STR_DAMAGE_19"
];

export const getDamageKey = x => damageKeys[x];

export const makeObjectPath = (obj, keyPath) => {
    if (!keyPath || !keyPath.length) { return obj }
    const [head, ...rest] = keyPath;
    if (!obj[head]) {
        obj[head] = {};
    }
    return makeObjectPath(obj[head], rest);
}

export const truncateEpsilon = i => {
    if (Math.abs(i) < 1.0e-10)
        return 0;
    return i.toPrecision(10) * 1;
}

export function getBlastRadiusObj(alter, blastRadius) {
    let blastRadiusObj = {};
    if (!alter?.FixRadius) {
        if (blastRadius !== undefined) {
            blastRadiusObj.FixRadius = blastRadius;
        }
        if (blastRadius === 0) {
            blastRadiusObj.RadiusEffectiveness = 0;
            blastRadiusObj.IgnoreDirection = null;
        }
    }
    return blastRadiusObj;
}