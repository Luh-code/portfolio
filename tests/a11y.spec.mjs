// Automated accessibility scan (axe-core, WCAG 2.1 AA) in light and dark mode, plus keyboard checks.
// Automated tools catch roughly a third of issues; still try the page with a screen reader.
import { test, expect } from "./fixtures.mjs";
import AxeBuilder from "@axe-core/playwright";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function scan(page) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  const summary = violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`);
  expect(summary).toEqual([]);
}

for (const scheme of ["light", "dark"]) {
  test(`no WCAG AA violations, ${scheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    await scan(page);
  });

  test(`no WCAG AA violations with a filter active, ${scheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/?type=project");
    await page.locator("#mukuba-helpdesk h3 a").focus(); // scan with a focus ring showing too
    await scan(page);
  });
}

test("skip link is the first stop and moves to the timeline", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to timeline" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#timeline$/);
});

test("toolbox is reachable by heading navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 2, name: "Toolbox" })).toHaveCount(1);
});

test("separators are hidden from screen readers", async ({ page }) => {
  await page.goto("/");
  const exposed = await page.locator("body").evaluate((body) => {
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    let n = 0;
    while (walker.nextNode()) {
      const t = walker.currentNode;
      if (t.textContent.includes("·") && !t.parentElement.closest('[aria-hidden="true"], script, style')) n++;
    }
    return n;
  });
  expect(exposed).toBe(0);
});
