import React from "react";
import { MissingSprite } from "../ComponentUtils.js";

export default function FacilitySprite({ ruleset, file, id, size = 1}) {
    if(size === 1) {
        if(ruleset.sprites[file]?.files[id]) {
            return <img src={ruleset.sprites[file].files[`${id}`]} className="facilitySprite" alt=""/>;
        } else {
            return <MissingSprite size="128px"/>;
        }
    } else if(size === 2) {
        if(!ruleset.sprites[file].files[`${id}`]) {
            return <MissingSprite size="256px"/>
        } else {
            return (
                <div className="facilitySprite">
                    <img src={ruleset.sprites[file].files[`${id}`]} alt=""/>
                    <img src={ruleset.sprites[file].files[`${id + 1}`]} alt=""/>
                    <img src={ruleset.sprites[file].files[`${id + 2}`]} alt=""/>
                    <img src={ruleset.sprites[file].files[`${id + 3}`]} alt=""/>
                </div>
            );
        }
    }
}