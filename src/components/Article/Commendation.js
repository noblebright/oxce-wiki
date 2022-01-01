import React, { useMemo } from "react";
import Table from "react-bootstrap/Table";

import useLocale from "../../hooks/useLocale";
import SoldierBonus from "./SoldierBonus";
import { SectionHeader } from "../ComponentUtils.js";

function getCriteria(data, idx) {
    return Object.keys(data).reduce((acc, key) => {
        const ary = data[key]; //criteria array
        acc[key] = acc[key] || 0;
        acc[key] += ary.length > idx ? ary[idx] : ary[ary.length - 1];
        return acc;
    }, {});
}

function getTierList(data) {
    const tiers = data.soldierBonusTypes?.length;
    const results = [];

    for(let i = 0; i < tiers; i++) {
        results.push([getCriteria(data.criteria, i), data.soldierBonusTypes[i]]);
    }
    return results;
}

const Criteria = ({ criteria, kcLabel }) => (
    Object.keys(criteria).map((key, idx) => {
        const label = key.startsWith("killsWithCriteria") ? kcLabel : key;
        return (
            <div key={idx} className="CommendationCriteria">
                <div>{label}</div>
                <aside>x{criteria[key]}</aside>
            </div>
        );
    })
);

const unitStatus = {
    "STR_KILLED": "kill",
    "STATUS_DEAD": "kill",
    "STR_STUNNED": "stunned",
    "STATUS_UNCONSCIOUS": "stunned",
    "STR_PANICKED": "panicked",
    "STATUS_PANICKING": "panicked",
    "STR_MINDCONTROLLED": "controlled",
    "STATUS_TURNING": "controlled"
};

const unitFaction = {
    "FACTION_PLAYER": "friendly ",
    "FACTION_HOSTILE": "enemy ",
    "FACTION_NEUTRAL": "neutral "
};

function getDetailString(count, details, lc) {
    const detailSet = new Set(details);
    const statusKey = details.find(x => unitStatus[x]);
    const factionKey = details.find(x => unitFaction[x]);
    detailSet.delete(statusKey);
    detailSet.delete(factionKey);
    const usingString = `using ${[...detailSet].map(lc).join(", ")}`;
    return `${count} ${unitFaction[factionKey] || ""}${unitStatus[statusKey] || "defeated"} ${detailSet.size ? usingString : ""}`;
}

function getKillString(killCriteria, lc) {
    const orClauses = [];
    if(!killCriteria) return null;

    killCriteria.forEach(or => {
        const andClauses = [];
        or.forEach(([count, details]) => {
            andClauses.push(getDetailString(count, details, lc));
        });
        orClauses.push(andClauses.join(" AND "));
    });
    return orClauses.join(" OR ");
}

export default function Commendation({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const commendations = ruleset.entries[id].commendations;
    const normalCriteria = commendations?.criteria;

    const killCriteria = commendations?.killCriteria;
    const killCriteriaString = useMemo(() => getKillString(killCriteria, lc), [killCriteria, lc]);

    if(!commendations) return null;
    
    const tierList = getTierList(commendations);
    
    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Commendation"/>
            <tbody>
            {
                tierList.map(([criteria, bonus], idx) => (
                    <tr key={idx}>
                        <td><Criteria criteria={criteria} kcLabel={killCriteriaString} /></td>
                        <td><Table>
                            <SoldierBonus bonus={ruleset.lookups.soldierBonuses[bonus]} showHeader={false} lc={lc}/>
                        </Table></td>
                    </tr>
                ))
            }
            {
                Object.entries(normalCriteria ?? {}).map(([key,values]) => (
                    <tr key={key}>
                        <td>{key}</td>
                        <td>
                            <Table>
                                <tbody>
                                    <tr>
                                        { values.map((x, idx) => (<td key={idx}>{x}</td>))}
                                    </tr>
                                </tbody>
                            </Table>
                        </td>
                    </tr>
                ))
            }
            </tbody>
        </Table>
    )
}