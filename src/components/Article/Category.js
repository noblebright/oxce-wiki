import React, { useMemo } from "react";
import {Table} from "react-bootstrap";
import useLink from "../../hooks/useLink.js";
import useLocale from "../../hooks/useLocale.js";
import { SectionHeader } from "../ComponentUtils.js";

export default function Category({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const category = ruleset.entries[id].category;
    const entries = category?.entries;
    const sortedEntries = useMemo(() => {
        if(!entries) return null;
        return [...entries].sort((a, b) => lc(a) > lc(b) ? 1 : -1);
    }, [lc, entries]);

    if(!category) return null;
    
    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Category"/>
            <tbody>
                <tr>
                    <td>
                        <ul className="Category">
                            {sortedEntries.map(c => <li key={c}>{linkFn(c)}</li>)}
                        </ul>
                    </td>
                </tr>
            </tbody>
        </Table>
    )
}