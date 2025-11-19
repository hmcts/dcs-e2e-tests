import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function resolveRelative(...segments: string[]) {
  return path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    ...segments
  );
}

// Worker-specific results file
const WORKER_INDEX = process.env.TEST_WORKER_INDEX || "0";
const RESULTS_FILE = resolveRelative(
  `../.testResults-worker${WORKER_INDEX}.json`
);

interface TestResult {
  user: string;
  heading?: string;
  category?: string;
  issues: string[];
}

export function pushTestResult(result: TestResult) {
  let results: TestResult[] = [];
  if (fs.existsSync(RESULTS_FILE)) {
    results = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
  }
  results.push(result);
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
}

export function readAllResults(): TestResult[] {
  const results: TestResult[] = [];
  const files = fs
    .readdirSync(resolveRelative("../"))
    .filter((f) => f.startsWith(".testResults-worker") && f.endsWith(".json"));

  for (const file of files) {
    const fileResults: TestResult[] = JSON.parse(
      fs.readFileSync(resolveRelative("../", file), "utf-8")
    );
    results.push(...fileResults);
  }

  return results;
}

export function clearResultsFile() {
  const files = fs
    .readdirSync(resolveRelative("../"))
    .filter((f) => f.startsWith(".testResults-worker") && f.endsWith(".json"));

  for (const file of files) {
    fs.unlinkSync(resolveRelative("../", file));
  }
}

export function logFinalSummary() {
  const results: TestResult[] = readAllResults();
  if (results.length === 0) return;

  const summaryLines: string[] = [];
  summaryLines.push("===== FINAL AGGREGATE TEST SUMMARY =====");

  // Group results by category
  const resultsByCategory: Record<string, TestResult[]> = {};
  for (const r of results) {
    const cat = r.category || "Uncategorized";
    if (!resultsByCategory[cat]) resultsByCategory[cat] = [];
    resultsByCategory[cat].push(r);
  }

  // Iterate over categories
  for (const [category, catResults] of Object.entries(resultsByCategory)) {
    summaryLines.push(`\n--- ${category.toUpperCase()} ---`);

    for (const r of catResults) {
      const label = r.heading ? `${r.heading} [${r.user}]` : r.user;

      if (r.issues.length > 0) {
        summaryLines.push(`❌ ${label}:`);
        r.issues.forEach((issue) => summaryLines.push(`   - ${issue}`));
      } else {
        summaryLines.push(`✅ ${label}: No issues`);
      }
    }
  }

  summaryLines.push("===================================");

  console.log(summaryLines.join("\n"));
}
