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

export async function getRandomSectionKey(sectionsPage, sectionList: string[]) {
  const keys = await sectionsPage.getSectionKeys(sectionList);
  return Object.entries(keys)
    .sort(() => Math.random() - 0.5)
    .slice(0, 1); // returns [ [section, key], ... ]
}
