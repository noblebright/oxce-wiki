import React from "react";
import { ListHeader, SimpleValue } from "../../ComponentUtils.jsx";
import Cost from "./Cost.jsx";

export default function MotionScanner({ ruleset, items, lc, linkFn, spriteFn }) {
    return (
        <React.Fragment>
            <tbody>
                <SimpleValue label={spriteFn(items.bigSprite)} value="" showZero/>
            </tbody>
            <ListHeader label="Actions"/>
            <tbody>
                <SimpleValue label={lc("STR_USE_SCANNER")}  value={items}>
                    { x => <Cost value={x} suffix="Use" lc={lc} defaultTu={25}/> }
                </SimpleValue>
                <SimpleValue label={lc("STR_THROW")}  value={items}>
                    { x => <Cost value={x} suffix="Throw" lc={lc} defaultTu={25}/> }
                </SimpleValue>
            </tbody>
        </React.Fragment>
    );
}