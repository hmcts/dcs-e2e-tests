import { Locator } from "@playwright/test";
import { Base } from "../base";

class RegisterUserPage extends Base {
  registerLink: Locator;
  title: Locator;
  firstName: Locator;
  lastName: Locator;
  userName: Locator;
  email: Locator;
  role: Locator;
  location: Locator;
  password: Locator;
  confirmPassword: Locator;
  agreeTermsCheckBox: Locator
  saveRegisterForm: Locator;
  registerTitle: Locator;

    
constructor(page) {
    super(page);
    this.registerLink = page.locator('a[title="Click here to register."]')
    this.registerTitle = page.locator('.heading-medium')
    this.title = page.locator('#Title')
    this.firstName = page.locator('#FirstName')
    this.lastName = page.locator('#LastName')
    this.userName = page.locator('#UserName')
    this.email = page.locator('#Email')
    this.role = page.locator('#RoleRowKey')
    this.location = page.locator('#LocationRowKey')
    this.password = page.locator('#Password')
    this.confirmPassword = page.locator('#ConfirmPassword')
    this.agreeTermsCheckBox = page.locator('#agreeTermsCheckBox')
    this.saveRegisterForm = page.locator('#saveRegisterForm')

}

async generateUserName (userName: string){
    const randomNumber = Math.floor(Math.random() * 10000) + 100;
    const userRandom = userName+randomNumber;
    console.log(userRandom);
    return userRandom;
}

async enterUserRegDetails() {
    await this.title.fill("Mr");
    await this.firstName.fill("User");
    await this.lastName.fill("Reg");
    await this.userName.clear();
    const userRandom = await this.generateUserName("UserReg");
    await this.userName.fill(userRandom.toString());
    await this.email.fill(userRandom.toString()+"@cps.gov.uk");
    await this.role.selectOption({ label: 'CPS Administrator' });
    await this.location.selectOption({ label: 'Southwark' });
    await this.password.fill('UserReg2025')
    await this.confirmPassword.fill('UserReg2025')
    await this.agreeTermsCheckBox.check();
    await this.saveRegisterForm.click();
    return userRandom;
}}

export default RegisterUserPage;