import React from "react";
import Table from "react-bootstrap/Table";
import useLink from "../../hooks/useLink";
import useLocale from "../../hooks/useLocale";
import useInventory from "../../hooks/useInventory";
import { BooleanValue, SectionHeader, ListHeader, ContainerValue, SimpleValue, ListValue } from "../ComponentUtils.js";

function getAliens(ruleset, race, rank) {
    const raceEntry = ruleset.entries[race]?.alienRaces;
    if(!raceEntry) {
        return null;
    }
    return raceEntry.membersRandom[rank] || [raceEntry.members[rank]];
}

function NumberAppearing({deployment}) {
    const low = deployment.lowQty;
    const delta = (deployment.dQty ?? 0) + (deployment.extraQty ?? 0);
    const high = deployment.highQty;
    const mid = Math.ceil((low + high) / 2);

    return (
        <React.Fragment>
            <ListHeader label="Number Appearing"/>
            <tbody>
                <ContainerValue>
                    <Table>
                        <thead>
                            <tr><th>Beginner/Experienced</th><th>Veteran/Genius</th><th>SuperHuman</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{low} - {low + delta}</td>
                                <td>{mid} - {mid + delta}</td>
                                <td>{high} - {high + delta}</td>
                            </tr>
                        </tbody>
                    </Table>
                </ContainerValue>
            </tbody>
        </React.Fragment>
    )
}

function Deployment({ ruleset, deployment, race, linkFn, idx }) {
    const alienList = getAliens(ruleset, race, deployment.alienRank);
        
    return (
        <React.Fragment>
            <SectionHeader label={`Alien Loadout ${idx}`}/>
            <tbody>
                <SimpleValue label="Rank" value={deployment.alienRank}/>
                <SimpleValue label="Percent Outside" value={deployment.percentageOutsideUfo}/>
            </tbody>
            <ListValue label="Alien Types" values={alienList}>{ linkFn }</ListValue>
            <NumberAppearing deployment={deployment}/>
            { deployment.itemSets.map((x, idx) => <ListValue key={idx} label={`Item Set ${idx}`} values={x}>{ linkFn }</ListValue>)}
        </React.Fragment>
    )
    
}

export default function AlienDeployments({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const inventoryFn = useInventory(linkFn);
    const entry = ruleset.entries[id];
    const alienDeployments = entry.alienDeployments;

    if(!alienDeployments) return null;

    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Deployment"/>
            <tbody>
                <SimpleValue label="Map Size" value={`${alienDeployments.width}x${alienDeployments.length}x${alienDeployments.height}`}/>
                <SimpleValue label="Civilian Count" value={alienDeployments.civilians}/>
                <SimpleValue label="Light Level" value={alienDeployments.shade}/>
                <SimpleValue label="Min Light" value={alienDeployments.minShade}/>
                <SimpleValue label="Max Light" value={alienDeployments.maxShade}/>
                <SimpleValue label="Next Stage" value={alienDeployments.nextStage}>{ linkFn }</SimpleValue>
                <SimpleValue label="Race Override" value={alienDeployments.race}>{ lc }</SimpleValue>
                <BooleanValue label="Final Mission" value={alienDeployments.finalDestination} />
                <SimpleValue label="Alert" value={alienDeployments.alert}>{ lc }</SimpleValue>
                <SimpleValue label="Duration" value={alienDeployments.duration}>{ x => `${x[0]} - ${x[1]}` }</SimpleValue>
                <SimpleValue label="Point Penalty" value={alienDeployments.points}/>
                <SimpleValue label="Grants Research" value={alienDeployments.unlockedResearch}>{ linkFn }</SimpleValue>
                <SimpleValue label="Grants Item" value={alienDeployments.missionBountyItem}>{ linkFn }</SimpleValue>
                <SimpleValue label="Despawn Penalty" value={alienDeployments.despawnPenalty}/>
                <SimpleValue label="Abort Penalty" value={alienDeployments.abortPenalty}/>
                <SimpleValue label="Turn Limit" value={alienDeployments.turnLimit}/>
            </tbody>
            <ListValue label="Civilians" values={Object.entries(alienDeployments.civiliansByType || {})}>{ inventoryFn }</ListValue>
            {alienDeployments.data.map((x, idx) => <Deployment key={idx} ruleset={ruleset} linkFn={linkFn} deployment={x} race={alienDeployments.race} idx={idx}/>)}
        </Table>
    );
}