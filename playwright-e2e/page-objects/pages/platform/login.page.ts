import { Locator, expect } from "@playwright/test";
import { Base } from "../../base";
import { UserCredentials, config } from "../../../utils";

/**
 * Represents the application's Login Page.
 * This Page Object provides locators and methods for user authentication,
 * including entering credentials, handling cookie consent, and validating
 * login attempts.
 */
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

  /**
   * Accepts the cookie consent if the cookie consent banner is visible.
   */
  async acceptCookies() {
    if (await this.cookieConsent.isVisible()) {
      await this.cookieConsent.click();
    }
  }

  /**
   * Logs in a user with the provided credentials.
   * Includes a validation step to handle potential UI flakiness.
   */
  async login(user: UserCredentials) {
    await this.username.fill(user.username);
    await this.password.fill(user.password);
    await this.loginButton.click();
    await this.loginValidation(user);
    await this.acceptCookies();
  }

  /**
   * Attempts an invalid login and performs validation for expected error messages.
   */
  async invalidLogin(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
    await this.loginValidationInvalidUser(username, password);
  }

  /**
   * Logs in as the Access Coordinator user, using credentials from the configuration.
   */
  async loginAsAccessCoordinator() {
    const user = config.users.accessCoordinator;
    await this.login(user);
  }

  /**
   * Logs in a newly registered user using a provided username and a default password.
   */
  async loginAsNewUserRegistered(username: string) {
    await this.username.fill(username);
    const password: string = process.env.USER_REG_PASSWORD!;
    await this.password.fill(password);
    await this.loginButton.click();
    await this.loginValidationUserReg(username, password);
    await this.acceptCookies();
  }

  /**
   * Performs validation after a login attempt, checking for errors and retrying
   * if input fields are unexpectedly cleared.
   * @throws {Error} If a general login error is displayed after retries.
   */
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
        "⚠️ Login username or password field not detected — retrying login...",
      );
      await this.username.fill(user.username);
      await this.password.fill(user.password);
      await this.loginButton.click();
    } else if (hasLoginError) {
      throw new Error(`❌ Login for ${user.group} has unexpectedly failed`);
    } else {
      console.log(
        `✅ User: ${user.group} logged in successfully, continuing...`,
      );
    }
  }

  /**
   * Performs validation after a new user registration login attempt.
   * Retries filling credentials if fields are empty and checks for general login errors.
   * @throws {Error} If a general login error is displayed after retries.
   */
  async loginValidationUserReg(username: string, password: string) {
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
        "⚠️ Login new user or password field not detected — retrying login...",
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

  /**
   * Performs validation after an invalid login attempt.
   * Retries filling credentials if fields are empty. Does not throw an error if login fails
   * as this is expected for invalid credentials.
   */
  async loginValidationInvalidUser(username: string, password: string) {
    const hasUserNameError = await this.usernameErrorMessage
      .isVisible()
      .catch(() => false);
    const hasPasswordError = await this.passwordErrorMessage
      .isVisible()
      .catch(() => false);
    if (hasUserNameError || hasPasswordError) {
      console.log(
        "⚠️ Login new user or password field not detected — retrying login...",
      );
      await expect(this.username).toBeEditable();
      await this.username.fill(username);
      await this.password.fill(password);
      await this.loginButton.click();
    }
  }
}

export default LoginPage;
