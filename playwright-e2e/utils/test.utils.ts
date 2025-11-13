export function assertNoIssues(
  results: { label: string; issues: string[] }[],
  title: string
) {
  const summaryLines: string[] = [];
  summaryLines.push(`===== ${title} =====`);

  results.forEach(({ label, issues }) => {
    if (issues.length > 0) {
      summaryLines.push(`❌ ${label}:`);
      issues.forEach((i) => summaryLines.push(`   - ${i}`));
    }
  });

  summaryLines.push("===================================");

  const anyIssues = results.some((r) => r.issues.length > 0);

  return { summaryLines, anyIssues };
}

export function todaysDate() {
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString("default", { month: "long" });
  const year = today.getFullYear();
  return `${day} ${month} ${year}`;
}
