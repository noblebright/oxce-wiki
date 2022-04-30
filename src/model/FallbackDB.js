const makeGet = table => key => {
    const tableStr = sessionStorage.getItem(table);
    return Promise.resolve(tableStr ? JSON.parse(tableStr)?.[key] : undefined);
};

const makePut = (table, pkey) => entry => {
    const tableStr = sessionStorage.getItem(table);
    const tableData = tableStr ? JSON.parse(tableStr) : {};
    tableData[entry[pkey]] = entry;
    sessionStorage.setItem(table, JSON.stringify(tableData));
    return Promise.resolve();
}


const FallbackDB = {
    config: {
        toArray() {
            const config = sessionStorage.getItem("config");
            return Promise.resolve(config ? JSON.parse(config) : []);
        },
        put: makePut("config", "repo"),
        get: makeGet("config"),
        clear() {
            sessionStorage.removeItem("config");
            return Promise.resolve();
        },
        bulkPut(items) {
            sessionStorage.setItem("config", JSON.stringify(items));
            return Promise.resolve();
        }
    },
    versions: {
        get: makeGet("versions"),
        put: makePut("versions", "repo")

    },
    files: {
        get() { return Promise.resolve() },
        put() { return Promise.resolve() },
        bulkGet(x) { return x.map(x => undefined)},
        bulkPut() { return Promise.resolve() }
    },
    fileList: {
        get() { return Promise.resolve() },
        put() { return Promise.resolve() }
    }
};

export default FallbackDB;