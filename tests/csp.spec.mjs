// The live site only runs the inline <style> and <script> whose hashes are in netlify.toml.
// If these fail, run:  python scripts/update-csp.py
import { test, expect } from "./fixtures.mjs";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const read = (f) => readFileSync(new URL(`../${f}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");
const html = read("index.html");
const toml = read("netlify.toml");
const sha = (s) => `'sha256-${createHash("sha256").update(s, "utf8").digest("base64")}'`;

test("netlify.toml has the current hash of every inline <style>", () => {
  const blocks = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  expect(blocks.length).toBeGreaterThan(0);
  for (const b of blocks) expect(toml, "style hash is stale").toContain(sha(b));
});

test("netlify.toml has the current hash of every inline <script>", () => {
  const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  expect(blocks.length).toBeGreaterThan(0);
  for (const b of blocks) expect(toml, "script hash is stale").toContain(sha(b));
});

test("no inline code the CSP would block", () => {
  expect(html, "style= attributes are blocked").not.toMatch(/\sstyle\s*=/i);
  expect(html, "onclick= style handlers are blocked").not.toMatch(/\son[a-z]+\s*=\s*["']/i);
  expect(html, "javascript: URLs are blocked").not.toMatch(/href\s*=\s*["']javascript:/i);
});

test("page loads with no CSP violations in the browser", async ({ page }) => {
  const violations = [];
  page.on("console", (msg) => {
    if (/Content Security Policy/i.test(msg.text())) violations.push(msg.text());
  });
  await page.goto("/");
  await expect(page.locator("#filters")).toBeVisible(); // proves the script ran
  expect(violations).toEqual([]);
});
