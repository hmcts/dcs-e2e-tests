import { expect, Locator } from "@playwright/test";
import { Base } from "../base";

class CreateCasePage extends Base {
  createCaseLink: Locator;
  caseName: Locator;
  caseUrn: Locator;
  courtHouse: Locator;
  hearingDateDay: Locator;
  hearingDateMonth: Locator;
  hearingDateYear: Locator;  
  frontPgDesc: Locator;
  submitCreateBtn: Locator;
  ddCaseProsecutedBy: Locator;
  caseTitle: Locator;

constructor(page) {
    super(page);
    this.createCaseLink = page.getByRole("link", { name: "Create a Case" });
    this.caseName = page.locator('#Name');
    this.ddCaseProsecutedBy = page.locator('#ddCaseProsecutedBy')
    this.caseUrn =  page.locator('#txtUrn');
    this.courtHouse =  page.locator('#CourtHouse');
    this.hearingDateDay =  page.locator('#HearingDateDay');
    this.hearingDateMonth =  page.locator('#HearingDateMonth');
    this.hearingDateYear =  page.locator('#HearingDateYear');
    this.frontPgDesc =  page.locator('#Description_ifr');
    this.submitCreateBtn =  page.locator("//input[@value='Create']");
    this.caseTitle = page.locator('.heading-medium');
}

async createCaseRandom(caseName: string, caseUrn: string){
    const randomNumber = Math.floor(Math.random() * 10000) + 1;
    const caseRandom = caseName+randomNumber;
    const urnRandom = caseUrn+randomNumber;
    console.log(caseRandom);
    return {caseRandom, urnRandom};
}


async selectRandomOptionByLabel(): Promise<string> {
    const labels = await this.ddCaseProsecutedBy.locator('option').allTextContents();
    const valid = labels.filter(l => l.trim() !== '');
    const randomLabel = valid[Math.floor(Math.random() * valid.length)];
    await this.ddCaseProsecutedBy.selectOption({ label: randomLabel });
    console.log(randomLabel);
    return randomLabel;
}

async createNewCase(caseName: string, caseUrn: string) {
    const {caseRandom, urnRandom} = await this.createCaseRandom(caseName,caseUrn);
    await this.caseName.fill(caseRandom.toString());
    await this.caseUrn.fill(urnRandom.toString());
    const label = await this.selectRandomOptionByLabel();
    await this.ddCaseProsecutedBy.selectOption({ label });
    await this.courtHouse.selectOption({ label: 'Southwark' });
    const today = new Date();
    const date = today.getDate();
    const monthName = today.toLocaleString('default', {month : 'long' });
    const year = today.getFullYear();
    await this.hearingDateDay.selectOption({ label: date.toString() });
    await this.hearingDateMonth.selectOption({ label: monthName.toString() });
    await this.hearingDateYear.selectOption({ label: year.toString() });
    await this.submitCreateBtn.click();
}}

export default CreateCasePage;



