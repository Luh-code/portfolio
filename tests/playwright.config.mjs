import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.mjs",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  // Serves the site with the same headers Netlify sends (including the CSP).
  webServer: {
    command: "node server.mjs",
    url: `http://localhost:${PORT}`,
    env: { PORT: String(PORT) },
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    // channel "chrome" uses the Chrome already installed on this computer.
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "phone", use: { ...devices["Pixel 7"], channel: "chrome" }, testMatch: "layout.spec.mjs" },
  ],
});
