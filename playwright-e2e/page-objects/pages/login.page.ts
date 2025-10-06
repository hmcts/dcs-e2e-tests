import { Locator } from "@playwright/test";
import { Base } from "../base";
import { UserCredentials, config } from "../../utils";

class LoginPage extends Base {
  username: Locator;
  password: Locator;
  loginButton: Locator;
  cookieConsent: Locator;
  errorMessage: Locator;

  constructor(page) {
    super(page);
    this.username = page.locator("#UserName");
    this.password = page.locator("#Password");
    this.loginButton = page.locator(".button-level-two");
    this.cookieConsent = page.locator(".cb-enable");
    this.errorMessage = page.locator("#validationSummary");
  }

  async acceptCookies() {
    if (await this.cookieConsent.isVisible()) {
      await this.cookieConsent.click();
    }
  }

  async login(user: UserCredentials) {
    await this.username.fill(user.username);
    await this.password.fill(user.password);
    await this.loginButton.click();
  }

  async invalidLogin(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async loginAsAccessCoordinator() {
    const user = config.users.accessCoordinator;
    await this.login(user);
    await this.page.context().storageState({ path: user.sessionFile });
  }

  async loginAsNewUserRegistered(username: string) {
    await this.username.fill(username);
    await this.password.fill('UserReg2025');
    await this.loginButton.click();
  }
}

export default LoginPage;
