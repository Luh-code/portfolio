// Structure and content rules from the ADR. Runs with JavaScript off: the page must be complete without it.
import { test, expect } from "./fixtures.mjs";

const OWNER_EMAIL = "luyandomulonda@gmail.com";
const TYPES = ["work", "project", "education", "award", "certification"];

test.use({ javaScriptEnabled: false });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("document basics: language, title, description", async ({ page }) => {
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle(/Luyando Mulonda/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{50,}/);
});

test("one h1, and heading levels never skip", async ({ page }) => {
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Luyando Mulonda");
  const levels = await page.locator("h1, h2, h3, h4, h5, h6").evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
  for (let i = 1; i < levels.length; i++) {
    expect(levels[i] - levels[i - 1], `heading ${i} jumps from h${levels[i - 1]} to h${levels[i]}`).toBeLessThanOrEqual(1);
  }
});

test("without JavaScript every entry shows and the filter bar stays hidden", async ({ page }) => {
  const total = await page.locator(".entry").count();
  expect(total).toBeGreaterThan(0);
  await expect(page.locator(".entry:visible")).toHaveCount(total);
  await expect(page.locator("#filters")).toBeHidden();
});

test("every entry follows the entry model", async ({ page }) => {
  const entries = await page.locator(".entry").evaluateAll((els) =>
    els.map((e) => ({
      id: e.id,
      type: e.dataset.type,
      tags: (e.dataset.tags || "").split(/\s+/).filter(Boolean),
      titleHref: e.querySelector("h3 a")?.getAttribute("href"),
      hasMeta: !!e.querySelector(".meta .type"),
      hasTime: !!e.querySelector(".meta time[datetime]"),
      tagLinks: [...e.querySelectorAll(".tags a")].map((a) => ({
        href: a.getAttribute("href"),
        text: a.textContent.replace("Filter by tag:", "").trim(),
      })),
    }))
  );
  const ids = entries.map((e) => e.id);
  expect(new Set(ids).size, "entry ids must be unique").toBe(ids.length);

  for (const e of entries) {
    expect(e.id, "entry needs an id").toMatch(/^[a-z0-9-]+$/);
    expect(TYPES, `${e.id}: unknown data-type`).toContain(e.type);
    expect(e.titleHref, `${e.id}: title should link to its own anchor`).toBe(`#${e.id}`);
    expect(e.hasMeta, `${e.id}: missing type label`).toBe(true);
    expect(e.hasTime, `${e.id}: missing <time datetime>`).toBe(true);
    expect(e.tagLinks.map((t) => t.text), `${e.id}: tag links don't match data-tags`).toEqual(e.tags);
    for (const t of e.tagLinks) expect(t.href).toBe(`?tag=${t.text}`);
  }
});

test("tag set stays small (ADR: under about 15)", async ({ page }) => {
  const tags = await page.locator(".entry").evaluateAll((els) => [
    ...new Set(els.flatMap((e) => (e.dataset.tags || "").split(/\s+/).filter(Boolean))),
  ]);
  expect(tags.length).toBeLessThanOrEqual(15);
});

test("year links point at year sections that exist", async ({ page }) => {
  const hrefs = await page.locator(".years a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const h of hrefs) await expect(page.locator(`section.year${h}`)).toHaveCount(1);
});

test("every link has an accessible name and a safe target", async ({ page }) => {
  const links = await page.locator("a").evaluateAll((as) =>
    as.map((a) => ({ href: a.getAttribute("href"), name: (a.getAttribute("aria-label") || a.textContent).trim(), target: a.target }))
  );
  for (const l of links) {
    expect(l.name, `link to ${l.href} has no text`).not.toBe("");
    expect(l.href).toMatch(/^(#|\?|https:\/\/|mailto:)/);
    expect(l.target, "links should not force a new tab").toBe("");
  }
});

test("images (if any are added) have alt text", async ({ page }) => {
  await expect(page.locator("img:not([alt])")).toHaveCount(0);
});

test("privacy: no phone numbers and no email address except the owner's", async ({ page }) => {
  const source = await page.content();
  const emails = [...new Set(source.match(/[\w.+-]+@[\w-]+(?:\.[a-z]{2,})+/gi) || [])];
  expect(emails).toEqual([OWNER_EMAIL]);
  const text = await page.locator("body").innerText();
  expect(text, "looks like a phone number").not.toMatch(/\+?260[\s\d]{7,}|\b0\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/);
  expect(text).not.toMatch(/\breferees?\b|\breferences\b/i);
});

// Launch checklist: skipped by default, run with LAUNCH=1 before going live.
test("launch: no DRAFT placeholders left", async ({ page }) => {
  test.skip(!process.env.LAUNCH, "set LAUNCH=1 to run the launch checklist");
  expect(await page.content()).not.toMatch(/DRAFT/);
});
