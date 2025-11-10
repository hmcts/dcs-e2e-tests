import { Locator, expect } from "@playwright/test";
import { Base } from "../base";
import { UserCredentials, config } from "../../utils";

class LoginPage extends Base {
  username: Locator;
  password: Locator;
  loginButton: Locator;
  cookieConsent: Locator;
  loginErrorMessage: Locator;
  usernameErrorMessage: Locator;
  passwordErrorMessage: Locator;

  constructor(page) {
    super(page);
    this.username = page.locator("#UserName");
    this.password = page.locator("#Password");
    this.loginButton = page.locator(".button-level-two");
    this.cookieConsent = page.locator(".cb-enable");
    this.loginErrorMessage = page.locator("#validationSummary");
    this.usernameErrorMessage = page.locator("#UserName_validationMessage");
    this.passwordErrorMessage = page.locator("#Password_validationMessage");
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
    await this.loginValidation(user);
    await this.acceptCookies();
  }

  async invalidLogin(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async loginAsAccessCoordinator() {    
    const user = config.users.accessCoordinator;
    await this.login(user);
  }

  async loginAsNewUserRegistered(username: string) {    
    await this.username.fill(username);
    const password: string = process.env.USER_REG_PASSWORD!;
    await this.password.fill(password);
    await this.loginButton.click();
    await this.loginValidationUserReg(username, password);
    await this.acceptCookies();
  }

  async loginValidation(user: UserCredentials) {
    const hasUserNameError = await this.usernameErrorMessage
      .isVisible()
      .catch(() => false);
    const hasPasswordError = await this.passwordErrorMessage
      .isVisible()
      .catch(() => false);
    const hasLoginError = await this.loginErrorMessage
      .isVisible()
      .catch(() => false);

    if (hasUserNameError || hasPasswordError) {
      console.log(
        "⚠️ Login username or password field not detected — retrying login..."
      );
      await this.username.fill(user.username);
      await this.password.fill(user.password);
      await this.loginButton.click();
    } else if (hasLoginError) {
      throw new Error(`❌ Login for ${user.group} has unexpectedly failed`);
    } else {
      console.log(
        `✅ User: ${user.group} logged in successfully, continuing...`
      );
    }
  }

  async loginValidationUserReg(username : string, password : string) {
    const hasUserNameError = await this.usernameErrorMessage
      .isVisible()
      .catch(() => false);
    const hasPasswordError = await this.passwordErrorMessage
      .isVisible()
      .catch(() => false);
    const hasLoginError = await this.loginErrorMessage
      .isVisible()
      .catch(() => false);

    if (hasUserNameError || hasPasswordError) {
      console.log(
        "⚠️ Login new user or password field not detected — retrying login..."
      );
      await expect(this.username).toBeEditable();
      await this.username.fill(username);
      await this.password.fill(password);
      await this.loginButton.click();
    } else if (hasLoginError) {
      throw new Error(`❌ Login for ${username} has unexpectedly failed`);
    } else {
      console.log("✅ User details registered successfully, continuing...");
    }
  }
}

export default LoginPage;
