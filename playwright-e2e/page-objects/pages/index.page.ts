import { Locator} from '@playwright/test'; 
import { Base } from "../base";
import { DocumentModel } from "../../data/documentModel";
import UploadDocumentPage from "./uploadDocument.page";
import { expect } from "../../fixtures";

class IndexPage extends Base {
    uploadDocumentPage: UploadDocumentPage;
    indexTable: Locator
    baseTableRows: Locator; 
    sectionLinks: Locator;
    pd1SectionLocator: Locator;
    pd2SectionLocator: Locator;
 

constructor(page) {
    super(page);
    this.uploadDocumentPage = new UploadDocumentPage(page);
    this.indexTable = page.locator('table.fullContents:visible')
    this.baseTableRows = page.locator('xpath=//*[@id="aspnetForm"]/table[2]/tbody/tr');
    this.sectionLinks = page.locator('a.contentsAnchor');
    this.pd1SectionLocator = page.getByText('PD1:', { exact: true })
    this.pd2SectionLocator = page.getByText('PD2:', { exact: true })
}
  
async rowCount(): Promise<number> {
    return await this.baseTableRows.count();
}

async sectionsCount(): Promise<number> {
    return await this.sectionLinks.count();
}

async colCount(row: number): Promise<number> {
    const rowLocator = this.baseTableRows.nth(row - 1);
    return await rowLocator.locator('td').count();
}

async indexSectionKey(row: number){
    const rowLocator = this.baseTableRows.nth(row - 1);
    const sectionLinkLocator = rowLocator.locator('xpath=./td/table/tbody/tr/td[2]//a');
    const sectionHref = await sectionLinkLocator.getAttribute('href', { timeout: 5000 });
        
    if (!sectionHref || sectionHref.length < 32) {
        throw new Error(`Section key retrieval failed for row ${row}`);
    }
    return sectionHref.slice(-32);
}

async indexSectionTitle(row: number): Promise<string> { 
    const rowLocator = this.baseTableRows.nth(row - 1);
    const sectionTitleLocator = rowLocator.locator('xpath=./td/table/tbody/tr/td[2]/a/div');
    
    try {
        const sectionTitle = await sectionTitleLocator.textContent({ timeout: 5000 });

        if (!sectionTitle || sectionTitle.trim() === '') {
            throw new Error(`Element found for row ${row}, but contained no visible section title.`);
        }

        const trimmedTitle = sectionTitle.trim();
        const doubleSpaceIndex = trimmedTitle.indexOf("  "); 

        if (doubleSpaceIndex > 0) {
            return trimmedTitle.substring(0, doubleSpaceIndex); 
        }
        
        return trimmedTitle;

    } catch (_error) {
        throw new Error(`Failed to retrieve section title for row ${row}`);
    }
}

async indexDocName(row: number): Promise<string> {
    // Target the 3rd column (td[3]) within the specific row
    const docNameLocator = this.baseTableRows.nth(row - 1).locator('td').nth(2); 
        
    if (await docNameLocator.isVisible()) { 
        let docName = await docNameLocator.textContent();

        if (docName) {
        docName = docName.slice(0, -14);             // To remove Audit Trail from docName 
        return docName ? docName.trim() : "No Name";
        }
    }
    return "No Name";
}

async indexDocNum(row: number): Promise<string> {
    // Target the 2nd column (td[2]) within the specific row
    const docNumLocator = this.baseTableRows.nth(row - 1).locator('td').nth(1);
        
    if (await docNumLocator.isVisible()) {
        let docNum = await docNumLocator.textContent();
            
        if (docNum) {
            docNum = docNum.trim();
            docNum = docNum.slice(0, -12);        // To remove Audit Trail from docNum 
                
        // This removes leading zeros unless the whole string is "0".
        return docNum.replace(/^0+(?!$)/, "");
        }
    }
    return "No Num";
}

async indexPagination(){
try {
   // Locator for the last section name on the page (assuming this is the last element to stabilize)
const lastSectionNameLocator = this.page.locator('table.sectionHeadTable .contentsName').last();
await expect
    .poll(
        async () => {
            return await lastSectionNameLocator.isVisible();
        },
        { timeout: 15000 }
    )
    .toBe(true);
}catch (_error) {
    throw new Error(`Failed to retrieve the Index table contents`);
}}

async getIndexDocuments(): Promise<DocumentModel[]>{ 
    let sectionTitle: string | null = null;
    let sectionKey: string | null = null;
    const docNoName: string = "No Name";
    const docNoNum: string = "No Num";
    let colCountNext: number = 0;
    const indexArrayList: DocumentModel[] = []; 
    
    await this.indexPagination();
    const indexRowCount = await this.rowCount(); 

    for (let row = 1; row <= indexRowCount; row++) {
        const colCount = await this.colCount(row);
        
        if (row + 1 < indexRowCount) { 
            colCountNext = await this.colCount(row + 1);
        }

        // Section Header 
        if (colCount < 4) {
            sectionTitle = await this.indexSectionTitle(row);
            sectionKey = await this.indexSectionKey(row);

            if (colCountNext < 4) {
                const newDocs = await this.getIndexDocumentArray(
                    sectionTitle!, 
                    sectionKey!, 
                    docNoName, 
                    docNoNum,
                );
                indexArrayList.push(...newDocs);
            }
        } 
        // Document details 
        else if (colCount > 4) {
            const currentTitle = sectionTitle ?? "UNKNOWN SECTION TITLE";
            const currentKey = sectionKey ?? "UNKNOWN_KEY";

            const docName = await this.indexDocName(row);
            const docNum = await this.indexDocNum(row);

            const newDocs = await this.getIndexDocumentArray(
                currentTitle, 
                currentKey, 
                docName, 
                docNum,
            );
            indexArrayList.push(...newDocs);
        }
        colCountNext = 0;
    }
    return indexArrayList;
}

async getIndexDocumentArray(
    title: string,
    guid: string,
    docNum: string,
    docName: string,
): Promise<DocumentModel[]> {
    
    const documentModel: DocumentModel = {
        sectionTitle: title,
        sectionId: guid,
        documentName: docNum, 
        documentNumber: docName,
    };
    return [documentModel];
}

async goToUploadDocumentsFromIndex() {
    const uploadButton = this.page.getByRole("link", { name: "Upload Document(s)" });
    await uploadButton.click();
}
  
async uploadDocumentFromIndex(
    filename: string,
){
    await this.goToUploadDocumentsFromIndex();
    await this.uploadDocumentPage.uploadUnrestrictedDocument(filename);
}


async goToIndexSectionLink(sectionKey: string, section: string): Promise<void> {
    let matchFound = false;
    await this.page.waitForTimeout(90_000);
    const sectionCount = await this.sectionsCount(); 

    for (let row = 1; row <= sectionCount; row++) {
        const targetSection = this.sectionLinks.nth(row - 1); 
        const isSectionButtonAttached = await targetSection.isVisible({ timeout: 1000 }); 

        if (!isSectionButtonAttached) {
            break; 
        }
        const sectionHref = await targetSection.getAttribute('href');
        if (sectionHref && sectionHref.includes(sectionKey)) {
            console.log(`✅ SUCCESS: Found and clicking Section: ${section}`);
            await targetSection.click();
            matchFound = true;
            break; 
        }
    }
    // Fail the test if the target section was never found after iterating
    if (!matchFound) {
        throw new Error(`Target section link not found for Key: ${sectionKey} and Section: ${section} within the index table.`);
    }
}


async validateSections(sections: string[]): Promise<string[]> {
    const foundSections: string[] = []; 
    await this.indexPagination();

    for (const section of sections) {
        const cellLocator = this.page.getByRole("cell", { name: `${section}:`, exact: true });
        const isVisible = await cellLocator.isVisible({ timeout: 5000 }); 
        
        if (isVisible) {
            foundSections.push(section);
        }
    }
    return foundSections; 
}
}
export default IndexPage;