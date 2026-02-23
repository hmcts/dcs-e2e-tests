import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ quiet: true });

// -------------------- Environment --------------------

const ENV = process.env.TEST_ENV || "preprod"; // default to preprod

const urls = {
  preprod:
    (process.env.BASE_URL_PREPROD as string) ||
    "https://ccdcp.preprod.caselines.co.uk/",
  uat: "https://ccdcsuat.caselines.co.uk/",
};

// -------------------- Types --------------------
export interface UserCredentials {
  group: string;
  username: string;
  password: string;
  sessionFile?: string;
  cookieName?: string;
}

export interface Config {
  env: "preprod" | "uat";
  users: {
    hmctsAdmin: UserCredentials;
    accessCoordinator: UserCredentials;
    admin: UserCredentials;
    cpsAdmin: UserCredentials;
    cpsProsecutor: UserCredentials;
    defenceAdvocateA: UserCredentials;
    defenceAdvocateB: UserCredentials;
    defenceAdvocateC: UserCredentials;
    fullTimeJudge: UserCredentials;
    probationStaff: UserCredentials;
  };
  urls: {
    preprod: string;
    uat: string;
    base: string;
    ptphUpload: string;
    ptphStatus: string;
  };
}

// -------------------- Helpers --------------------

function sessionPath(username: string): string {
  return path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    `../.sessions/${username}.json`,
  );
}

// -------------------- Config Object --------------------
export const config: Config = {
  env: ENV as "preprod" | "uat",
  urls: {
    preprod: urls.preprod,
    uat: urls.uat,
    base: ENV === "uat" ? urls.uat : urls.preprod,
    ptphUpload:
      ENV === "uat"
        ? (process.env.UAT_UPLOAD_PTPH_FORM_URL ?? "")
        : (process.env.PREPROD_UPLOAD_PTPH_FORM_URL ?? ""),

    ptphStatus:
      ENV === "uat"
        ? (process.env.UAT_CONFIRM_PTPH_UPLOAD_STATUS_URL ?? "")
        : (process.env.PREPROD_CONFIRM_PTPH_UPLOAD_STATUS_URL ?? ""),
  },
  users: {
    hmctsAdmin: {
      group: "HMCTSAdmin",
      username: "Trainer01",
      password: process.env.HMCTS_ADMIN_PASSWORD as string,
      sessionFile: sessionPath("trainer01"),
      cookieName: ".ASPXAUTH",
    },
    accessCoordinator: {
      group: "AccessCoordinator",
      username: "TestACHMCTS",
      password: process.env.TESTAC_PASSWORD as string,
      sessionFile: sessionPath("TestACHMCTS"),
      cookieName: ".ASPXAUTH",
    },
    admin: {
      group: "Admin",
      username: "TestAdmin",
      password: process.env.ADMIN_PASSWORD as string,
      sessionFile: sessionPath("Admin"),
      cookieName: ".ASPXAUTH",
    },
    cpsAdmin: {
      group: "CPSAdmin",
      username: "Trainer11",
      password: process.env.CPS_ADMIN_PASSWORD as string,
      sessionFile: sessionPath("trainer11"),
    },
    cpsProsecutor: {
      group: "CPSProsecutor",
      username: "Trainer16",
      password: process.env.CPS_PROSECUTOR_PASSWORD as string,
      sessionFile: sessionPath("trainer16"),
    },
    defenceAdvocateA: {
      group: "DefenceAdvocateA",
      username: "Trainer21",
      password: process.env.DEFENCE_ADVOCATE_A_PASSWORD as string,
      sessionFile: sessionPath("trainer21"),
    },
    defenceAdvocateB: {
      group: "DefenceAdvocateB",
      username: "Trainer22",
      password: process.env.DEFENCE_ADVOCATE_B_PASSWORD as string,
      sessionFile: sessionPath("trainer22"),
    },
    defenceAdvocateC: {
      group: "DefenceAdvocateC",
      username: "Trainer23",
      password: process.env.DEFENCE_ADVOCATE_C_PASSWORD as string,
      sessionFile: sessionPath("trainer23"),
    },
    fullTimeJudge: {
      group: "FullTimeJudge",
      username: "Trainer27",
      password: process.env.FT_JUDGE_PASSWORD as string,
      sessionFile: sessionPath("trainer27"),
    },
    probationStaff: {
      group: "ProbationStaff",
      username: "Trainer38",
      password: process.env.PROBATION_STAFF_PASSWORD as string,
      sessionFile: sessionPath("trainer38"),
    },
  },
};

export const invalidUsers: {
  scenario: string;
  username: string;
  password: string;
}[] = [
  {
    scenario: "wrong username",
    username: "wrongUser",
    password: process.env.HMCTS_ADMIN_PASSWORD as string,
  },
  {
    scenario: "non-existent user and password",
    username: "wrongUser",
    password: "wrongPassword",
  },
];

export const sections = {
  unrestricted: [
    "A",
    "B",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "O",
    "P",
    "S",
    "W",
    "X",
    "Y",
  ],
  restricted: ["C", "D", "M", "N", "Q", "T", "U", "V"],
};
