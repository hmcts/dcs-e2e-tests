import { Locator } from "@playwright/test";
import { Base } from "../base";

class RegisterUserPage extends Base {

  registerHeading: Locator;
  title: Locator;
  firstName: Locator;
  lastName: Locator;
  userName: Locator;
  email: Locator;
  role: Locator;
  location: Locator;
  otherEmail1 : Locator;
  password: Locator;
  confirmPassword: Locator;
  agreeTermsCheckBox: Locator
  saveRegisterForm: Locator;
    
constructor(page) {
    super(page);
    this.registerHeading = page.locator('.heading-medium')
    this.title = page.locator('#Title')
    this.firstName = page.locator('#FirstName')
    this.lastName = page.locator('#LastName')
    this.userName = page.locator('#UserName')
    this.email = page.locator('#Email')
    this.role = page.locator('#RoleRowKey')
    this.location = page.locator('#LocationRowKey')
    this.otherEmail1 = page.locator('#OtherEmail1')
    this.password = page.locator('#Password')
    this.confirmPassword = page.locator('#ConfirmPassword')
    this.agreeTermsCheckBox = page.locator('#agreeTermsCheckBox')
    this.saveRegisterForm = page.locator('#saveRegisterForm')
}

async submitUserRegDetails() {
    await this.title.fill("Mr");
    await this.firstName.fill("User");
    await this.lastName.fill("Reg");    
    await this.userName.clear();
    const userName = await this.generateUserName(); 
    await this.userName.fill(userName);

    // Random selection - Self Inviting or Invitation only user roles
    const isSelfInviteRole = Math.random() < 0.5;
    console.log('Self Invite user role:',isSelfInviteRole);
    let userEmail : string,userRole : string;
    if (isSelfInviteRole)                                   
    {
        userEmail = await this.selectSelfInviteEmail(userName);  
        await this.email.fill(userEmail)
        await this.role.waitFor({ state: "visible", timeout: 10000 });
        const labelsToExclude = ['Please select ...', 'Legal Aid Agency', 'Fee Paid Judge'];
        userRole = await this.selectRandomRoleExcludingMultiple(this.role, labelsToExclude); 
    }
    else
    {
        userEmail = await this.selectInviteOnlyEmail(userName);  
        await this.email.fill(userEmail) 
        await this.role.waitFor({ state: "visible", timeout: 10000 });
        const labelsToExclude = ['Please select ...'];
        userRole = await this.selectRandomRoleExcludingMultiple(this.role, labelsToExclude); 
    }
    console.log(`Email: ${userEmail}`);
    const permittedLocations = ['Southwark','Nottingham','Cambridge','Oxford'];
    const userLocation = await this.selectRandomLocationFromSpecificList(this.location, permittedLocations);
    if(await this.otherEmail1.isVisible()){
        await this.otherEmail1.fill('inviteonly@cjsm.com')
    }
    await this.password.fill(process.env.USER_REG_PASSWORD!)
    await this.confirmPassword.fill(process.env.USER_REG_PASSWORD!)
    await this.agreeTermsCheckBox.check();
    await this.saveRegisterForm.click();
    return {userName, userEmail, userRole, userLocation, isSelfInviteRole};
}

async generateUserName (){
    // Generate a random username part (e.g., 'user1000' to 'user9999')
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    const userName = `user${randomNumber}`;
    console.log(userName);
    return userName;
}

async selectSelfInviteEmail(userName : string) {
    const domains = [
        '@justice.gov.uk',
        '@cps.gov.uk',
        '@judiciary.gsi.gov.uk',
    ];
    const randomIndex = Math.floor(Math.random() * domains.length);
    const randomDomain = domains[randomIndex];
    const randomEmail = userName + randomDomain;
    return randomEmail;
}

async selectInviteOnlyEmail(userName : string) {
    const domains = [
         '@pspb.cjsm.co.uk'
    ];
    const randomIndex = Math.floor(Math.random() * domains.length);
    const randomDomain = domains[randomIndex];
    const randomEmail = userName + randomDomain;
    return randomEmail;
}

async selectRandomRoleExcludingMultiple(
    dropdownLocator: Locator, labelsToExclude: string[]): Promise<string> {
    const roles = await dropdownLocator.locator('option').allTextContents();
    const validRoles = roles.filter(label => {
        const trimmedLabel = label.trim();
        return trimmedLabel !== '' && !labelsToExclude.includes(trimmedLabel);
    });
    if (validRoles.length === 0) {
        throw new Error(`No selectable roles found in the dropdown after exclusions".`);
    }
    const randomIndex = Math.floor(Math.random() * validRoles.length);
    const randomRole = validRoles[randomIndex];
    await dropdownLocator.selectOption({ label: randomRole });
    console.log(`Selected Role: ${randomRole} (Excluded ${labelsToExclude.length} labels)`);
    return randomRole;
}

async selectRandomLocationFromSpecificList(
    dropdownLocator: Locator, allowedLabels: string[]): Promise<string> {
    const locations = await dropdownLocator.locator('option').allTextContents();
    const selectableOptions = locations.filter(label => {
        const trimmedLabel = label.trim();
        return trimmedLabel !== '' && allowedLabels.includes(trimmedLabel);
    });
    if (selectableOptions.length === 0) {
        throw new Error(`No selectable locations found that match the allowed list: ${allowedLabels.join(', ')}.`);
    }
    const randomIndex = Math.floor(Math.random() * selectableOptions.length);
    const randomLocation = selectableOptions[randomIndex];
    await dropdownLocator.selectOption({ label: randomLocation });
    console.log(`Selected Location: ${randomLocation} from allowed list.`);
    return randomLocation;
}}

export default RegisterUserPage;