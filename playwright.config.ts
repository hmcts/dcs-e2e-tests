import { CommonConfig, ProjectsConfig } from "@hmcts/playwright-common";
import { defineConfig } from "@playwright/test";
import path from "path";
/**
 * See https://playwright.dev/docs/test-configuration.
 */

export default defineConfig({
  testDir: "./playwright-e2e",
  snapshotDir: "./playwright-e2e/snapshots",
  snapshotPathTemplate:
    "{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}",

  ...CommonConfig.recommended,

  globalTeardown: path.resolve("./playwright-e2e/global.teardown.ts"),

  projects: [
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "chrome",
      use: {
        ...ProjectsConfig.chrome.use,
        storageState: "./playwright-e2e/.sessions/trainer02.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "chromium",
      use: {
        ...ProjectsConfig.chromium.use,
        storageState: "./playwright-e2e/.sessions/trainer02.json",
      },
      dependencies: ["setup"],
    },
    // {
    //   name: "edge",
    //   use: {
    //     ...ProjectsConfig.edge.use,
    //     storageState: "./playwright-e2e/.sessions/trainer02.json",
    //   },
    //   dependencies: ["setup"],
    // },
    // {
    //   name: "firefox",
    //   use: {
    //     ...ProjectsConfig.firefox.use,
    //     storageState: "./playwright-e2e/.sessions/trainer02.json",
    //   },
    //   dependencies: ["setup"],
    // },
    // {
    //   name: "webkit",
    //   use: {
    //     ...ProjectsConfig.webkit.use,
    //     storageState: "./playwright-e2e/.sessions/trainer02.json",
    //   },
    //   dependencies: ["setup"],
    // },
    // {
    //   name: "tabletChrome",
    //   use: {
    //     ...ProjectsConfig.tabletChrome.use,
    //     storageState: "./playwright-e2e/.sessions/trainer02.json",
    //   },
    //   dependencies: ["setup"],
    // },
    // {
    //   name: "tabletWebKit",
    //   use: {
    //     ...ProjectsConfig.tabletWebkit.use,
    //     storageState: "./playwright-e2e/.sessions/trainer02.json",
    //   },
    //   dependencies: ["setup"],
    // },
  ],
});
