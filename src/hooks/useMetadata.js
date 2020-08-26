import {useEffect, useState, useCallback} from 'react';
import { getMetadata, updateLanguage, clearDB } from "../model/RulesetDB";

export default function useMetadata() {
    const [versions, setVersions] = useState();
    const [config, setConfig] = useState();
    useEffect(() => {
        getMetadata().then(({modVersions: versions, config}) => {
            if(!config.currentLanguage) {
                setConfig({...config, currentLanguage: "en-US"});
            } else {
                setConfig(config);
            }
            setVersions(versions);
        });
    }, []);
    
    const setLanguage = useCallback((lang) => {
        updateLanguage(lang);
        setConfig({...config, currentLanguage: lang});
    }, [config]);

    return {versions, config, setLanguage, clearDB};
}