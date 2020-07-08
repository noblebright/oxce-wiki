import React, { useState } from "react";

export default function DebugEntry({entry}) {
    const [collapsed, setCollapsed] = useState(true);
    return (
        <div>
            <header>Debug [<a href="#" onClick={e => {e.preventDefault(); setCollapsed(x => !x);}}>{collapsed ? "Expand" : "Collapse"}</a>]</header>
            <pre style={{ display: collapsed ? "none" : ""}}>{JSON.stringify(entry, null, 4)}</pre>
        </div>
    );
}