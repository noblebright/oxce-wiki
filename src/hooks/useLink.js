import React from "react";
import {Link} from "react-router-dom";

const useLink = (version, lc) => id => <Link to={`/${version}/article/${id}`}>{lc(id)}</Link>;

export default useLink;