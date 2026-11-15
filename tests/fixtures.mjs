// Shared test setup: block Google Fonts so tests don't depend on the internet connection.
// The page falls back to Georgia/system fonts, and a CSP violation would still be reported,
// because the browser checks the policy before the request is made.
import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.abort());
    await use(page);
  },
});

export { expect };
