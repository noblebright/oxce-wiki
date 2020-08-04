import React from "react";
import {Link} from "react-router-dom";

const useImage = (ruleset) => id => {
    const url = ruleset.sprites[id].files[0];
    return <img src={url} className="singleImage"/>;
}

export default useImage;