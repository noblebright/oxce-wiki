import React from "react";
import { MissingSprite } from "../components/ComponentUtils";

const useSprite = (ruleset, file, width, height, zoom = 4) => (id, {key, ...extraProps} = {}) => {
    const sprite = ruleset.sprites[file];
    if(!sprite || !sprite.files[id]) {
        return <MissingSprite size={`${Math.min(width, height) * zoom}px`}/>;
    }
    const url = sprite.files[id];
    return <img key={key} src={url} alt="" style={{ zoom, width: `${width}px`, height: `${height}px` }} data-spriteid={id} className="singleImage" {...extraProps}/>;
}

export default useSprite;