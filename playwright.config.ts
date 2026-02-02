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

  reporter: process.env.CI
    ? [
        ["html"],
        ["list"],
        ["allure-playwright", { outputFolder: "allure-results" }],
      ]
    : [["list"]],

  timeout: 480_000,

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
      testIgnore: /.*notes-lifecycle\.spec\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...ProjectsConfig.chromium.use,
        //Use below line when running docker
        //  channel: undefined,
        storageState: "./playwright-e2e/.sessions/trainer01.json",
      },
      dependencies: ["setup"],
      testIgnore: /.*notes-lifecycle\.spec\.ts/,
    },
    {
      name: "edge",
      use: {
        ...ProjectsConfig.edge.use,
        //Use below line when running docker
        //  channel: undefined,
        storageState: "./playwright-e2e/.sessions/trainer01.json",
      },
      dependencies: ["setup"],
      testIgnore: /.*notes-lifecycle\.spec\.ts/,
    },
    {
      name: "firefox",
      use: {
        ...ProjectsConfig.firefox.use,
        //Use below line when running docker
        // channel: undefined,
        storageState: "./playwright-e2e/.sessions/trainer01.json",
      },
      dependencies: ["setup"],
      testIgnore: /.*notes-lifecycle\.spec\.ts/,
    },
    {
      name: "webkit",
      use: {
        ...ProjectsConfig.webkit.use,
        //Use below line when running docker
        //  channel: undefined,
        storageState: "./playwright-e2e/.sessions/trainer01.json",
      },
      dependencies: ["setup"],
      testIgnore: /.*notes-lifecycle\.spec\.ts/,
    },
    {
      name: "notes-chrome",
      testMatch: /.*notes-lifecycle\.spec\.ts/,
      workers: 1,
      use: {
        ...ProjectsConfig.chrome.use,
        storageState: "./playwright-e2e/.sessions/trainer01.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "notes-firefox",
      testMatch: /.*notes-lifecycle\.spec\.ts/,
      workers: 1,
      use: {
        ...ProjectsConfig.firefox.use,
        storageState: "./playwright-e2e/.sessions/trainer01.json",
      },
      dependencies: ["setup"],
    },
  ],
});
