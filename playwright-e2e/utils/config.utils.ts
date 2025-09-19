import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// This needs to be placed somewhere before attempting to access any environment variables
dotenv.config({ quiet: true });

export interface UserCredentials {
  username: string;
  password: string;
  sessionFile: string;
  cookieName?: string;
}

interface Urls {
  exuiDefaultUrl: string;
  manageCaseBaseUrl: string;
  citizenUrl: string;
  idamWebUrl: string;
  idamTestingSupportUrl: string;
  serviceAuthUrl: string;
}

export interface Config {
  users: {
    caseManager: UserCredentials;
    judge: UserCredentials;
  };
  urls: Urls;
}

export const config: Config = {
  users: {
    caseManager: {
      username: getEnvVar("CASEMANAGER_USERNAME"),
      password: getEnvVar("CASEMANAGER_PASSWORD"),
      sessionFile:
        path.join(fileURLToPath(import.meta.url), "../../.sessions/") +
        `${getEnvVar("CASEMANAGER_USERNAME")}.json`,
      cookieName: "xui-webapp",
    },
  },
  urls: {
    baseUrl: "https://manage-case.aat.platform.hmcts.net",
};

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Error: ${name} environment variable is not set`);
  }
  return value;
}
