import React from "react";

const useImage = (ruleset, zoom = 4) => (id, {key, ...extraProps} = {}) => {
    const sprite = ruleset.sprites[id];
    if(!sprite) {
        return "Sprite not found";
    }
    const url = sprite.fileSingle || sprite.files[0];
    return <img key={key} src={url} alt="" style={{ zoom }} data-spriteid={id} className="singleImage" {...extraProps}/>;
}

export default useImage;