import fs from "fs";
import path from "path";
import { Cookie } from "playwright-core";
import { config } from "./config.utils.ts";

export class CookieUtils {
  public async addUserAnalyticsCookie(sessionPath: string): Promise<void> {
    try {
      const dir = path.dirname(sessionPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const rawBase = config.urls.base as string;
      const domain = rawBase.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

      const state = fs.existsSync(sessionPath)
        ? JSON.parse(fs.readFileSync(sessionPath, "utf-8"))
        : { cookies: [] };

      state.cookies = state.cookies.filter(
        (cookie: Cookie) => cookie.name !== "cb-enabled"
      );
      state.cookies.push({
        name: "cb-enabled",
        value: "accepted",
        domain,
        path: "/",
        expires: -1,
        httpOnly: false,
        secure: true,
        sameSite: "Lax",
      });
      fs.writeFileSync(sessionPath, JSON.stringify(state, null, 2));
    } catch (error) {
      throw new Error(`Failed to read or write session data: ${error}`);
    }
  }
}
