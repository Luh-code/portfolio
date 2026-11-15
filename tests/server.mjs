// Tiny static server for the tests. It sends the headers from netlify.toml,
// so the browser enforces the same Content-Security-Policy as the live site.
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 4173);

const toml = await readFile(path.join(root, "netlify.toml"), "utf8");
const block = toml.split("[headers.values]")[1] ?? "";
const headers = Object.fromEntries(
  [...block.matchAll(/^\s*([A-Za-z-]+)\s*=\s*"([^"]*)"/gm)].map((m) => [m[1], m[2]])
);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

http
  .createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(root, p);
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    try {
      const body = await readFile(file);
      res.writeHead(200, { ...headers, "Content-Type": types[path.extname(file)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404, headers).end("Not found");
    }
  })
  .listen(port, () => console.log(`Serving ${root} at http://localhost:${port}`));
