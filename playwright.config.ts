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
  timeout: 360_000,

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
        //Use below line when running docker
        // channel: undefined,
        storageState: "./playwright-e2e/.sessions/trainer01.json",
      },
      dependencies: ["setup"],
    },
    // {
    //   name: "chromium",
    //   use: {
    //     ...ProjectsConfig.chromium.use,
    //     //Use below line when running docker
    //     // channel: undefined,
    //     storageState: "./playwright-e2e/.sessions/trainer01.json",
    //   },
    //   dependencies: ["setup"],
    // },
    // {
    //   name: "edge",
    //   use: {
    //     ...ProjectsConfig.edge.use,
    //     //Use below line when running docker
    //     // channel: undefined,
    //     storageState: "./playwright-e2e/.sessions/trainer01.json",
    //   },
    //   dependencies: ["setup"],
    // },
    // {
    //   name: "firefox",
    //   use: {
    //     ...ProjectsConfig.firefox.use,
    //     //Use below line when running docker
    //     // channel: undefined,
    //     storageState: "./playwright-e2e/.sessions/trainer01.json",
    //   },
    //   dependencies: ["setup"],
    // },
    // {
    //   name: "webkit",
    //   use: {
    //     ...ProjectsConfig.webkit.use,
    //     //Use below line when running docker
    //     // channel: undefined,git add
    //     storageState: "./playwright-e2e/.sessions/trainer01.json",
    //   },
    //   dependencies: ["setup"],
    // },
    // {
    //   name: "tabletChrome",
    //   use: {
    //     ...ProjectsConfig.tabletChrome.use,
    //     storageState: "./playwright-e2e/.sessions/trainer01.json",
    //   },
    //   dependencies: ["setup"],
    // },
    // {
    //   name: "tabletWebKit",
    //   use: {
    //     ...ProjectsConfig.tabletWebkit.use,
    //     storageState: "./playwright-e2e/.sessions/trainer01.json",
    //   },
    //   dependencies: ["setup"],
    // },
  ],
});
