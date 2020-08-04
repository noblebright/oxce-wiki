import React from "react";

const useImage = (ruleset) => id => {
    const sprite = ruleset.sprites[id];
    if(!sprite) {
        return "Sprite not found";
    }
    const url = sprite.fileSingle || sprite.files[0];
    return <img src={url} alt="" className="singleImage"/>;
}

export default useImage;