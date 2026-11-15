// Behaviour added by the inline script: filters, URL state, deep links, year nav.
import { test, expect } from "./fixtures.mjs";

const visible = (page) => page.locator(".entry:visible");
const count = (page) => page.locator("#count");

let total;
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  total = await page.locator(".entry").count();
});

test("filter bar renders one chip per type and tag in use", async ({ page }) => {
  await expect(page.locator("#filters")).toBeVisible();
  const types = await page.locator(".entry").evaluateAll((es) => new Set(es.map((e) => e.dataset.type)).size);
  const tags = await page.locator(".entry").evaluateAll(
    (es) => new Set(es.flatMap((e) => (e.dataset.tags || "").split(/\s+/).filter(Boolean))).size
  );
  await expect(page.locator('.chip[data-kind="type"]')).toHaveCount(types);
  await expect(page.locator('.chip[data-kind="tag"]')).toHaveCount(tags);
  await expect(count(page)).toHaveText(`${total} entries`);
  await expect(page.getByRole("button", { name: "Clear filters", exact: true })).toBeHidden();
});

test("type chip filters, updates the URL and toggles off", async ({ page }) => {
  const projects = await page.locator('.entry[data-type="project"]').count();
  const chip = page.getByRole("button", { name: "Projects", exact: true });

  await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/\?type=project$/);
  await expect(visible(page)).toHaveCount(projects);
  for (const e of await visible(page).all()) await expect(e).toHaveAttribute("data-type", "project");
  await expect(count(page)).toHaveText(`${projects} of ${total} entries`);
  await expect(page.getByRole("button", { name: "Clear filters", exact: true })).toBeVisible();

  await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", "false");
  await expect(page).toHaveURL(/\/$/);
  await expect(visible(page)).toHaveCount(total);
});

test("years with no matching entries are hidden, along with their nav links", async ({ page }) => {
  await page.getByRole("button", { name: "Projects", exact: true }).click();
  for (const section of await page.locator("section.year").all()) {
    const id = await section.getAttribute("id");
    const hasMatch = (await section.locator('.entry[data-type="project"]').count()) > 0;
    await expect(section).toBeVisible({ visible: hasMatch });
    await expect(page.locator(`.years a[href="#${id}"]`)).toBeVisible({ visible: hasMatch });
  }
});

test("type and tag combine", async ({ page }) => {
  await page.goto("/?type=project&tag=security");
  const expected = await page.locator('.entry[data-type="project"][data-tags~="security"]').count();
  await expect(visible(page)).toHaveCount(expected);
  await expect(count(page)).toHaveText(`${expected} of ${total} entries`);
});

test("clicking a tag on an entry filters by that tag", async ({ page }) => {
  await page.getByRole("button", { name: "Awards", exact: true }).click(); // the tag click should clear this
  await page.locator(".entry:visible .tags a").first().click();
  const tag = new URL(page.url()).searchParams.get("tag");
  expect(tag).toBeTruthy();
  expect(new URL(page.url()).searchParams.get("type")).toBeNull();
  const expected = await page.locator(`.entry[data-tags~="${tag}"]`).count();
  await expect(visible(page)).toHaveCount(expected);
  await expect(page.locator(`.chip[data-kind="tag"][data-value="${tag}"]`)).toHaveAttribute("aria-pressed", "true");
});

test("browser Back restores the previous filter", async ({ page }) => {
  await page.getByRole("button", { name: "Work", exact: true }).click();
  await page.getByRole("button", { name: "Education", exact: true }).click();
  await expect(page).toHaveURL(/type=education/);
  await page.goBack();
  await expect(page).toHaveURL(/type=work/);
  await expect(page.getByRole("button", { name: "Work", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.goBack();
  await expect(visible(page)).toHaveCount(total);
});

test("a filter with no matches shows the empty message, which can clear it", async ({ page }) => {
  await page.goto("/?type=education&tag=web");
  await expect(visible(page)).toHaveCount(0);
  await expect(page.locator("#empty")).toBeVisible();
  await page.getByRole("button", { name: "Show everything", exact: true }).click();
  await expect(visible(page)).toHaveCount(total);
  await expect(page.locator("#empty")).toBeHidden();
});

test("unknown filter values in the URL are ignored", async ({ page }) => {
  await page.goto("/?type=bogus&tag=nope");
  await expect(visible(page)).toHaveCount(total);
  await expect(page.locator('.chip[aria-pressed="true"]')).toHaveCount(0);
});

test("a deep link to an entry the filter would hide clears the filter", async ({ page }) => {
  await page.goto("/?type=award#zamren-intern");
  await expect(page.locator("#zamren-intern")).toBeVisible();
  await expect(visible(page)).toHaveCount(total);
  await expect(page.locator("#zamren-intern")).toBeInViewport();
});

test("year nav marks the year in view", async ({ page }) => {
  const link = page.locator('.years a[href="#y2025"]');
  await link.click();
  await expect(link).toHaveAttribute("aria-current", "location");
  await expect(page.locator('.years a[aria-current="location"]')).toHaveCount(1);
});

test("filter chips work from the keyboard", async ({ page }) => {
  const chip = page.getByRole("button", { name: "Work", exact: true });
  await chip.focus();
  await page.keyboard.press("Enter");
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Space");
  await expect(chip).toHaveAttribute("aria-pressed", "false");
});
