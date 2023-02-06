import React from "react";
import { ListHeader, SimpleValue } from "../../ComponentUtils.js";
import Cost from "./Cost.js";

export default function MindProbe({ ruleset, items, lc, linkFn, spriteFn}) {
    return (
        <React.Fragment>
            <tbody>
                <SimpleValue label={spriteFn(items.bigSprite)} value="" showZero/>
            </tbody>
            <ListHeader label="Actions"/>
            <tbody>
                <SimpleValue label={lc("STR_USE_MIND_PROBE")}  value={items}>
                    { x => <Cost value={x} suffix="Use" lc={lc} defaultTu={25}/> }
                </SimpleValue>
                <SimpleValue label={lc("STR_THROW")}  value={items}>
                    { x => <Cost value={x} suffix="Throw" lc={lc} defaultTu={25}/> }
                </SimpleValue>
            </tbody>
        </React.Fragment>
    );
}