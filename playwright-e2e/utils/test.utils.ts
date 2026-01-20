import { expect } from "../fixtures";

export function todaysDate() {
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString("default", { month: "long" });
  const year = today.getFullYear();
  return `${day} ${month} ${year}`;
}

export async function getRandomSectionKeys(
  sectionsPage,
  sectionList: string[]
) {
  const keys = await sectionsPage.getSectionKeys(sectionList);
  return Object.entries(keys)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3); // returns [ [section, key], ... ]
}

export async function getRandomSectionKey(
  sectionsPage,
  sectionList: string[]
): Promise<[string, string][]> {
  const keys = (await sectionsPage.getSectionKeys(sectionList)) as Record<
    string,
    string
  >;
  const randomKey = Object.entries(keys)
    .sort(() => Math.random() - 0.5)
    .slice(0, 1); // returns [ [section, key], ... ]
  return randomKey;
}

export async function waitUntilClickable(locator, timeout = 10000) {
  await expect
    .poll(
      async () => {
        try {
          await locator.click({ trial: true });
          return true;
        } catch {
          return false;
        }
      },
      { timeout, intervals: [500] }
    )
    .toBe(true);
}
