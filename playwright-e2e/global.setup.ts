import { test as setup } from "./fixtures";
import fs from "fs";
import { Cookie } from "@playwright/test";
import { CookieUtils } from "./utils/cookie.utils";
const cookieUtils = new CookieUtils();
import { clearResultsFile } from "./utils";

function isSessionValid(sessionFile: string, cookieName: string): boolean {
  // In the case the file doesn't exist, it should attempt to login
  if (!fs.existsSync(sessionFile)) return false;

  try {
    const data = JSON.parse(fs.readFileSync(sessionFile, "utf-8"));
    const cookie = data.cookies.find(
      (cookie: Cookie) => cookie.name === cookieName
    );
    if (!cookie) return false;
    if (cookie.expires === -1) return true; // treat session cookies as valid
    return false;
  } catch (error) {
    console.error(`Could not read session data: ${error}`);
    return false;
  }
}
setup.describe("Set up user session", () => {
  fs.mkdirSync("./playwright-e2e/.sessions", { recursive: true });
  clearResultsFile();
  console.log("Cleared previous test results.");
  /**
   * Signs in as a HMCTS Admin and stores session data.
   * Skips login if a valid session already exists.
   */
  setup("Set up HMCTS Admin user", async ({ config, loginPage, homePage }) => {
    const user = config.users.hmctsAdmin;
    if (isSessionValid(user.sessionFile!, user.cookieName!)) {
      console.log("Existing session valid, skipping login.");
      return;
    }
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
    await loginPage.login(user);
    await loginPage.page.context().storageState({ path: user.sessionFile });
    await cookieUtils.addUserAnalyticsCookie(user.sessionFile!);
  });
  setup("Admin user", async ({ config, loginPage, homePage }) => {
    const user = config.users.admin;
    if (isSessionValid(user.sessionFile!, user.cookieName!)) {
      console.log("Existing session valid, skipping login.");
      return;
    }
    await homePage.open();
    await homePage.navigation.navigateTo("LogOn");
    await loginPage.login(user);
    await loginPage.page.context().storageState({ path: user.sessionFile });
    await cookieUtils.addUserAnalyticsCookie(user.sessionFile!);
  });
});
