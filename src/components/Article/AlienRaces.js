import React from "react";
import Table from "react-bootstrap/Table";
import useLink from "../../hooks/useLink";
import useLocale from "../../hooks/useLocale";
import { SectionHeader, ListValue } from "../ComponentUtils.js";

export default function AlienRaces({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const entry = ruleset.entries[id];
    const alienRaces = entry.alienRaces;

    if(!alienRaces) return null;

    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Alien Race"/>
            { (alienRaces.members && !alienRaces.membersRandom) ? 
              <ListValue label="Members" values={alienRaces.members}>
                  {(x, idx) => <div><div>Rank {idx}</div>{linkFn(x)}</div>}
              </ListValue> : null}
            { alienRaces.membersRandom ? 
              <ListValue label="Members" values={alienRaces.membersRandom}>{ 
                (x, idx) => (
                <div key={idx}><div>Rank {idx}</div>{x.map((m, idx) => <div key={idx}>{linkFn(m)}</div>)}</div>
                ) }
              </ListValue> : null}
        </Table>
    );
}