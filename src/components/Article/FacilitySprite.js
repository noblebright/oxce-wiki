import React from "react";
import { MissingSprite } from "../ComponentUtils.js";

export default function FacilitySprite({ ruleset, file, id, size = 1}) {
    if(size === 1) {
        if(ruleset.sprites[file]?.files[id]) {
            return <img src={ruleset.sprites[file].files[`${id}`]} className="facilitySprite" alt=""/>;
        } else {
            return <MissingSprite size="128px"/>;
        }
    } else {
        if(!ruleset.sprites[file].files[`${id}`]) {
            return <MissingSprite size="256px"/>
        } else {
            const chunks = [];
            for(let i = 0; i < size ** 2; i++) {
                chunks.push(<img key={i} src={ruleset.sprites[file].files[`${id + i}`]} alt=""/>)
            }
            return (
                <div className="facilitySprite" style={{ "--facility-size": size }}>
                    {chunks}
                </div>
            );
        }
    }
}