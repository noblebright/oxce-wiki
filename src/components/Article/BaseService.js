import React, { useMemo } from "react";
import Table from "react-bootstrap/Table";
import useLink from "../../hooks/useLink";
import useLocale from "../../hooks/useLocale";
import { BooleanValue, SectionHeader } from "../ComponentUtils.js";


function ServiceCategory({ service, category, lc, linkFn }) {
    const entries = service[category];
    const sortedEntries = useMemo(() => {
        if(!entries) return null;
        return entries.sort((a, b) => lc(a) > lc(b) ? 1 : -1);
    }, [lc, entries]);

    if(!entries) return null;

    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label={category}/>
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
    );
}

function GlobalService({ service }) {
    if(!service.globals) return null;
    return (
        <Table bordered striped size="sm" className="auto-width">
            <SectionHeader label="Global Requirements"/>
            <tbody>
                <tr>
                    <td>
                        <ul className="Category">
                            { Object.keys(service.globals).map(globalKey => (
                                <BooleanValue key={globalKey} label={globalKey} value={service.globals[globalKey]}/>
                            ))}
                        </ul>
                    </td>
                </tr>
            </tbody>
        </Table>
    );
}
export default function BaseService({ruleset, lang, id, version}) {
    const lc = useLocale(lang, ruleset);
    const linkFn = useLink(version, lc);
    const service = ruleset.entries[id].services;

    if(!service) return null;
    
    return (
    <>
        <ServiceCategory service={service} category="providedBy" lc={lc} linkFn={linkFn}/>
        <ServiceCategory service={service} category="preventsBuild" lc={lc} linkFn={linkFn}/>
        <ServiceCategory service={service} category="requiredToBuy" lc={lc} linkFn={linkFn}/>
        <ServiceCategory service={service} category="requiredToBuild" lc={lc} linkFn={linkFn}/>
        <ServiceCategory service={service} category="requiredToTransform" lc={lc} linkFn={linkFn}/>
        <ServiceCategory service={service} category="requiredToResearch" lc={lc} linkFn={linkFn}/>
        <ServiceCategory service={service} category="requiredToManufacture" lc={lc} linkFn={linkFn}/>
        <GlobalService service={service}/>
    </>
    )
}