import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from "express";

function fileDirName(meta) {
    const __filename = fileURLToPath(meta.url);
    const __dirname = dirname(__filename);

    return { __dirname, __filename };
}

const { __dirname } = fileDirName(import.meta);
  
const app = express();
const port = 3001

app.get('/', (req, res) => {
  res.sendFile("./debug.html", { root: __dirname });
})

app.get('/debug.js', (req, res) => {
    res.sendFile("debug.js", {
        root: join(__dirname, "../build"),
        headers: { "Content-Type": "text/javascript" }
    });
});

app.get('/debug.wasm', (req, res) => {
    res.sendFile("debug.wasm", {
        root: join(__dirname, "../build")
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})