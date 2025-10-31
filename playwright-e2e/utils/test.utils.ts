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
