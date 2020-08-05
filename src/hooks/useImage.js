import React from "react";

const useImage = (ruleset, zoom = 4) => id => {
    const sprite = ruleset.sprites[id];
    if(!sprite) {
        return "Sprite not found";
    }
    console.log(sprite);
    const url = sprite.fileSingle || sprite.files[0];
    return <img src={url} alt="" style={{ zoom }} className="singleImage"/>;
}

export default useImage;