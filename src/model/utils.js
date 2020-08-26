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

const load = (url, authed) => fetch(url, authed && sessionStorage.getItem("auth") ? { headers: { Authorization: `Basic ${sessionStorage.getItem("auth")}`}} : undefined);
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

export function getSupportedLanguages(base, mod) {
    return Object.keys(possibleLanguages).filter(x => base[x] || mod[x]);
}