import fs from "fs";
import path from "path";
import { logFinalSummary } from "./utils";

export default async function globalTeardown() {
  //tears down user session and deletes session files
  const sessionsDir = path.resolve("./playwright-e2e/.sessions");

  if (fs.existsSync(sessionsDir)) {
    fs.rmSync(sessionsDir, { recursive: true, force: true });
    console.log("Deleted all session files.");
  }

  logFinalSummary();

  console.log("Global teardown complete.");
}
