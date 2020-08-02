import { useCallback } from "react";

export default function useLocale(lang, ruleset) {
    return useCallback((str) => {
        const strings = ruleset.languages[lang];
        if(!strings || !strings[str]) {
            return str;
        }
        return strings[str].replace(/\{NEWLINE\}/g, "<br/>");
    }, [lang, ruleset]);
}