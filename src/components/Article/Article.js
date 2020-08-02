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
        <main className="articleContainer">
            <article className="rulesetArticle">
                <header>{lc(id)}</header>
                <div dangerouslySetInnerHTML={{__html: article.ufopaedia?.text && lc(article.ufopaedia.text)}}>
                    
                </div>
                <pre>{JSON.stringify(article, null, 4)}</pre>
            </article>
        </main>
    )
}