// Layout checks. Runs on both the desktop and phone projects.
import { test, expect } from "./fixtures.mjs";

test("page never scrolls sideways", async ({ page }) => {
  await page.goto("/");
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

test("contact links are visible without scrolling", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".contact a").first()).toBeInViewport();
});

test("sticky bar stays on screen while scrolling", async ({ page }) => {
  await page.goto("/");
  await page.locator("#earlier").scrollIntoViewIfNeeded();
  await expect(page.locator("nav.bar")).toBeInViewport();
});

test("print shows every entry and hides the nav, even when filtered", async ({ page }) => {
  await page.goto("/?type=award");
  await page.emulateMedia({ media: "print" });
  const total = await page.locator(".entry").count();
  await expect(page.locator(".entry:visible")).toHaveCount(total);
  await expect(page.locator("nav.bar")).toBeHidden();
});
