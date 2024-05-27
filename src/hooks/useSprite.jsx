import React from "react";
import { MissingSprite } from "../components/ComponentUtils.jsx";

const useSprite = (ruleset, file, width, height, zoom = 4) => (spriteRef, {key, ...extraProps} = {}) => {
    const sprite = ruleset.sprites[file];
    const id = (typeof spriteRef === "object") ? spriteRef.index : spriteRef;
    const imgTag = url => <img key={key} src={url} alt="" style={{ zoom, width: `${width}px`, height: `${height}px` }} data-spriteid={id} className="singleImage" {...extraProps}/>

    if(!sprite || !sprite.files[id]) {
        const vanillaFallback = getVanillaFallback(file, id, key, width, height, extraProps);
        return vanillaFallback ? imgTag(vanillaFallback) : <MissingSprite size={`${Math.min(width, height) * zoom}px`}/>;
    }
    const url = sprite.files[id];
    return imgTag(url);
}

const VANILLA_FALLBACK = [
    "https://www.ufopaedia.org/images/f/fc/BIGOBS00.GIF",
    "https://www.ufopaedia.org/images/2/22/BIGOBS01.GIF",
    "https://www.ufopaedia.org/images/2/24/BIGOBS02.GIF",
    "https://www.ufopaedia.org/images/8/87/BIGOBS03.GIF",
    "https://www.ufopaedia.org/images/f/f0/BIGOBS04.GIF",
    "https://www.ufopaedia.org/images/a/ab/BIGOBS05.GIF",
    "https://www.ufopaedia.org/images/d/d4/BIGOBS06.GIF",
    "https://www.ufopaedia.org/images/2/2b/BIGOBS07.GIF",
    "https://www.ufopaedia.org/images/7/72/BIGOBS08.GIF",
    "https://www.ufopaedia.org/images/3/3d/BIGOBS09.GIF",
    "https://www.ufopaedia.org/images/b/bb/BIGOBS10.GIF",
    "https://www.ufopaedia.org/images/6/69/BIGOBS11.GIF",
    "https://www.ufopaedia.org/images/6/6d/BIGOBS12.GIF",
    "https://www.ufopaedia.org/images/4/47/BIGOBS13.GIF",
    "https://www.ufopaedia.org/images/9/9e/BIGOBS14.GIF",
    "https://www.ufopaedia.org/images/3/32/BIGOBS15.GIF",
    "https://www.ufopaedia.org/images/8/8a/BIGOBS16.GIF",
    "https://www.ufopaedia.org/images/2/26/BIGOBS17.GIF",
    "https://www.ufopaedia.org/images/e/ec/BIGOBS18.GIF",
    "https://www.ufopaedia.org/images/8/81/BIGOBS19.GIF",
    "https://www.ufopaedia.org/images/c/c2/BIGOBS20.GIF",
    "https://www.ufopaedia.org/images/0/0d/BIGOBS21.GIF",
    "https://www.ufopaedia.org/images/0/08/BIGOBS22.GIF",
    "https://www.ufopaedia.org/images/0/0c/BIGOBS23.GIF",
    "https://www.ufopaedia.org/images/1/11/BIGOBS24.GIF",
    "https://www.ufopaedia.org/images/e/ef/BIGOBS25.GIF",
    "https://www.ufopaedia.org/images/0/0c/BIGOBS26.GIF",
    "https://www.ufopaedia.org/images/8/8b/BIGOBS27.GIF",
    "https://www.ufopaedia.org/images/3/36/BIGOBS28.GIF",
    "https://www.ufopaedia.org/images/a/ad/BIGOBS29.GIF",
    "https://www.ufopaedia.org/images/a/a2/BIGOBS30.GIF",
    "https://www.ufopaedia.org/images/8/85/BIGOBS31.GIF",
    "https://www.ufopaedia.org/images/f/f1/BIGOBS32.GIF",
    "https://www.ufopaedia.org/images/1/1c/BIGOBS33.GIF",
    "https://www.ufopaedia.org/images/c/c9/BIGOBS34.GIF",
    "https://www.ufopaedia.org/images/a/a0/BIGOBS35.GIF",
    "https://www.ufopaedia.org/images/6/6e/BIGOBS36.GIF",
    "https://www.ufopaedia.org/images/a/ae/BIGOBS37.GIF",
    "https://www.ufopaedia.org/images/a/ae/BIGOBS38.GIF",
    "https://www.ufopaedia.org/images/1/1c/BIGOBS39.GIF",
    "https://www.ufopaedia.org/images/5/57/BIGOBS40.GIF",
    "https://www.ufopaedia.org/images/6/60/BIGOBS41.GIF",
    "https://www.ufopaedia.org/images/f/ff/BIGOBS42.GIF",
    "https://www.ufopaedia.org/images/e/ed/BIGOBS43.GIF",
    "https://www.ufopaedia.org/images/b/bc/BIGOBS44.GIF",
    "https://www.ufopaedia.org/images/4/47/BIGOBS45.GIF",
    "https://www.ufopaedia.org/images/f/f4/BIGOBS46.GIF",
    "https://www.ufopaedia.org/images/9/98/BIGOBS47.GIF",
    "https://www.ufopaedia.org/images/1/17/BIGOBS48.GIF",
    "https://www.ufopaedia.org/images/2/27/BIGOBS49.GIF",
    "https://www.ufopaedia.org/images/d/d9/BIGOBS50.GIF",
    "https://www.ufopaedia.org/images/2/20/BIGOBS51.GIF",
    "https://www.ufopaedia.org/images/e/e9/BIGOBS52.GIF",
    "https://www.ufopaedia.org/images/d/db/BIGOBS53.GIF",
    "https://www.ufopaedia.org/images/f/f2/BIGOBS54.GIF",
    "https://www.ufopaedia.org/images/0/02/BIGOBS55.GIF",
    "https://www.ufopaedia.org/images/c/c7/BIGOBS56.GIF",
];

function getVanillaFallback(file, id) {
    if(file !== "BIGOBS.PCK" || typeof id !== "number")
        return null;
    return VANILLA_FALLBACK[id];
}

export default useSprite;