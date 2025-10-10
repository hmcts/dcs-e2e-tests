import { Page, Locator } from "@playwright/test";

type NavLink = string;

class CaseNavigationBar {
  page: Page;
  links: Record<NavLink, Locator>;

  constructor(page: Page) {
    this.page = page;
    this.links = {
      CaseHome: page.getByRole("link", { name: "Case Home" }),
      Review: page.getByRole("link", { name: "Review" }),
      Index: page.getByRole("link", { name: "Index" }),
      Sections: page.locator('a.button[title*="View the list of sections"]'),
      People: page.locator(
        'a.button[title*="View the list of people associated with this case."]'
      ),
      Access: page.getByRole("link", { name: "Access", exact: true }),
      Bundle: page.getByRole("link", { name: "Bundle", exact: true }),
      Search: page.getByRole("link", { name: "Search" }),
      Memos: page.getByRole("link", { name: "Memos" }),
      Notes: page.getByRole("link", { name: "Notes" }),
      Hyperlinks: page.getByRole("link", { name: "Hyperlinks" }),
      Ingest: page.getByRole("link", { name: "Ingest" }),
      LinkedCases: page.getByRole("link", { name: "Linked Cases" }),
      ShownToJury: page.getByRole("link", { name: "Shown to Jury" }),
      ROCA: page.getByRole("link", { name: "ROCA" }),
      LAA: page.getByRole("link", { name: "LAA" }),
      PTPH: page.getByRole("link", { name: "PTPH" }),
      Indictment: page.getByRole("link", { name: "Indictment" }),
      Split: page.getByRole("link", { name: "Split" }),
      Merge: page.getByRole("link", { name: "Merge" }),
    };
  }

  async navigateTo(link: NavLink) {
    const locator = this.links[link];
    if (!locator) {
      throw new Error(
        `Link "${link}" does not exist in the Case navigation bar`
      );
    }
    await locator.click();
  }
}

export default CaseNavigationBar;
