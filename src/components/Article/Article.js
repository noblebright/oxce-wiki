import React from "react";
import { Redirect, useParams } from "react-router-dom";
import useLocale from "../../hooks/useLocale";

import "./Article.css";

export default function Article({ ruleset, lang, parent }) {
    const { id } = useParams();
    const lc = useLocale(lang, ruleset);
    const article = ruleset.entries[id];

    if(!article) { //article doesn't exist
        return <Redirect to={parent}/>
    }

    return (
        <article className="rulesetArticle">
            {JSON.stringify(article, null, 4)}
        </article>
    )
}