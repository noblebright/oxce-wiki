import React, {useState, useMemo} from "react";
import useLocale from "../../hooks/useLocale";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";

import {Link} from "react-router-dom";

const SearchIcon = () => (
    <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-search" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"/>
        <path fillRule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
    </svg>
);

function getFilteredList(ruleset, search, lc) {
    const list = Object.keys(ruleset.entries)
                    .map(x => ({ name: lc(x), value: x }))
                    .filter(x => x.name.toLowerCase().includes(search.toLowerCase()))
                    .sort((a, b) => a.name < b.name ? -1 : (a.name === b.name ? 0 : 1));
    return list;
}

export default function Sidebar({lang, currentVersion, versions, ruleset}) {
    const [search, setSearch] = useState("");
    const lc = useLocale(lang, ruleset);
    const list = useMemo(() => getFilteredList(ruleset, search, lc), [ruleset, search, lc]);

    return (
        <div className="sidebar">
            <InputGroup className="py-3 px-3 searchComponent">
                <InputGroup.Prepend>
                    <InputGroup.Text id="search-addon1"><SearchIcon/></InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                placeholder="Search"
                aria-label="Search"
                aria-describedby="search-addon1"
                value={search}
                onChange={e => setSearch(e.target.value)}
                />
            </InputGroup>
            <ul className="searchList">
                { list.map(({ name, value }) => <li className="searchItem px-3" key={value}><Link to={`/${currentVersion}/article/${value}`}>{name}</Link></li>) }
            </ul>
        </div>
    );
}