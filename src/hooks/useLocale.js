import { useCallback } from "react";

export default function useLocale(lang, ruleset) {
    return useCallback((str) => {
        const strings = ruleset.languages[lang];
        const invKey = ruleset.entries[str]?.items?.name; //special name key for inventory items
        if(invKey && strings[invKey]) {
            return strings[invKey];
        } 
        if(!strings || !strings[str]) {
            return str;
        }
        return strings[str].replace(/\{NEWLINE\}/g, "<br/>");
    }, [lang, ruleset]);
}