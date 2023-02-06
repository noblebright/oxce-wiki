import React from "react";
import { MissingSprite } from "../components/ComponentUtils.js";

const useSprite = (ruleset, file, width, height, zoom = 4) => (spriteRef, {key, ...extraProps} = {}) => {
    const sprite = ruleset.sprites[file];
    const id = (typeof spriteRef === "object") ? spriteRef.index : spriteRef;
    if(!sprite || !sprite.files[id]) {
        return <MissingSprite size={`${Math.min(width, height) * zoom}px`}/>;
    }
    const url = sprite.files[id];
    return <img key={key} src={url} alt="" style={{ zoom, width: `${width}px`, height: `${height}px` }} data-spriteid={id} className="singleImage" {...extraProps}/>;
}

export default useSprite;