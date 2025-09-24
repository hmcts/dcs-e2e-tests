import { SessionUtils } from "@hmcts/playwright-common";
import { Config, config } from "./config.utils";
import { CookieUtils } from "./cookie.utils";
import { AxeUtils } from "@hmcts/playwright-common";

export interface UtilsFixtures {
  config: Config;
  SessionUtils: typeof SessionUtils;
  cookieUtils: CookieUtils;
  axeUtils: AxeUtils;
}

export const utilsFixtures = {
  config: async ({}, use) => {
    await use(config);
  },
  cookieUtils: async ({}, use) => {
    await use(new CookieUtils());
  },
  SessionUtils: async ({}, use) => {
    await use(SessionUtils);
  },
  axeUtils: async ({ page }, use, testInfo) => {
    const axeUtils = new AxeUtils(page);
    await use(axeUtils);
    await axeUtils.generateReport(testInfo);
  },
};
