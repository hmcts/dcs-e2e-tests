import { Locator } from "@playwright/test";
import { Base } from "../base";

class RegisterUserPage extends Base {

  registerTitle: Locator;
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
    this.registerTitle = page.locator('.heading-medium')
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

async generateUserName (){
    // Generate a random username part (e.g., 'user1000' to 'user9999')
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    const userName = `user${randomNumber}`;
    console.log(userName);
    return userName;
}

async enterUserRegDetails() {
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
    userEmail = await this.fillSelfInviteEmail(this.email, userName);  
    await this.role.waitFor({ state: "visible", timeout: 10000 });
    const labelsToExclude = ['Please select ...', 'Legal Aid Agency', 'Fee Paid Judge'];
    userRole = await this.selectRandomOptionExcludingMultiple(this.role, labelsToExclude); // random role select option
    }
    else
    {
    userEmail = await this.fillInviteOnlyEmail(this.email, userName);  
    await this.role.waitFor({ state: "visible", timeout: 10000 });
    const labelsToExclude = ['Please select ...'];
    userRole = await this.selectRandomOptionExcludingMultiple(this.role, labelsToExclude); // random role select option
    }

    const permittedLocations = ['Southwark','Nottingham','Cambridge','Oxford'];
    const userLocation = await this.selectRandomOptionFromSpecificList(this.location, permittedLocations);
    if(await this.otherEmail1.isVisible()){
    await this.otherEmail1.fill('inviteonly@cjsm.com')
    }
    await this.password.fill('UserReg2025')
    await this.confirmPassword.fill('UserReg2025')
    await this.agreeTermsCheckBox.check();
    await this.saveRegisterForm.click();
    return {userName, userEmail, userRole, userLocation, isSelfInviteRole};
}

async selectRandomOptionExcludingMultiple(
    dropdownLocator: Locator, labelsToExclude: string[]): Promise<string> {
    const labels = await dropdownLocator.locator('option').allTextContents();
    const validOptions = labels.filter(label => {
        const trimmedLabel = label.trim();
        return trimmedLabel !== '' && !labelsToExclude.includes(trimmedLabel);
    });
    if (validOptions.length === 0) {
        throw new Error(`No selectable roles found in the dropdown after exclusions".`);
    }
    const randomIndex = Math.floor(Math.random() * validOptions.length);
    const randomLabel = validOptions[randomIndex];
    await dropdownLocator.selectOption({ label: randomLabel });
    console.log(`Selected Role: ${randomLabel} (Excluded ${labelsToExclude.length} labels)`);
    return randomLabel;
}

async fillSelfInviteEmail(email: Locator, userName : string): Promise<string> {
    
    // Define the possible domains
    const domains = [
        '@justice.gov.uk',
        '@cps.gov.uk',
        '@judiciary.gsi.gov.uk',
        // '@pspb.cjsm.co.uk'
    ];

    const randomIndex = Math.floor(Math.random() * domains.length);
    const randomDomain = domains[randomIndex];
    const randomEmail = userName + randomDomain;
    await email.fill(randomEmail); 
    console.log(`Email: ${randomEmail}`);
    return randomEmail;
}

async fillInviteOnlyEmail(email: Locator, userName : string): Promise<string> {
    
    // Define the possible domains
    const domains = [
         '@pspb.cjsm.co.uk'
    ];

    const randomIndex = Math.floor(Math.random() * domains.length);
    const randomDomain = domains[randomIndex];
    const randomEmail = userName + randomDomain;
    await email.fill(randomEmail); 
    console.log(`Email: ${randomEmail}`);
    return randomEmail;
}

async selectRandomOptionFromSpecificList(
    dropdownLocator: Locator, allowedLabels: string[]): Promise<string> {
    
    const allLabels = await dropdownLocator.locator('option').allTextContents();
    const selectableOptions = allLabels.filter(label => {
        const trimmedLabel = label.trim();
        return trimmedLabel !== '' && allowedLabels.includes(trimmedLabel);
    });
    if (selectableOptions.length === 0) {
        throw new Error(`No selectable locations found that match the allowed list: ${allowedLabels.join(', ')}.`);
    }
    const randomIndex = Math.floor(Math.random() * selectableOptions.length);
    const randomLabel = selectableOptions[randomIndex];
    await dropdownLocator.selectOption({ label: randomLabel });
    console.log(`Selected Location: ${randomLabel} from allowed list.`);

    return randomLabel;
}
}

export default RegisterUserPage;