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
    cpsAdmin: UserCredentials;
    // cpsProsecutor: UserCredentials;
    // defenceAdvocateA: UserCredentials;
    // defenceAdvocateB: UserCredentials;
    // defenceAdvocateC: UserCredentials;
    // fullTimeJudge: UserCredentials;
    // probationStaff: UserCredentials;
    // outsideProsecutingAdvocate: UserCredentials;
    // feePaidJudge: UserCredentials;
    // associateProsecutor: UserCredentials;
  };
  urls: {
    preprod: string;
    uat: string;
    base: string;
  };
}

// -------------------- Helpers --------------------
// function getEnvVar(name: string): string {
//   const value = process.env[name];
//   if (!value) {
//     throw new Error(`Missing environment variable: ${name}`);
//   }
//   return value;
// }

function sessionPath(username: string): string {
  return path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    `../.sessions/${username}.json`
  );
}

// -------------------- Config Object --------------------
export const config: Config = {
  env: ENV as "preprod" | "uat",
  urls: {
    preprod: urls.preprod,
    uat: urls.uat,
    base: ENV === "uat" ? urls.uat : urls.preprod,
  },
  users: {
    hmctsAdmin: {
      group: "HMCTSAdmin",
      username: "trainer02",
      password: process.env.HMCTS_ADMIN_PASSWORD as string,
      sessionFile: sessionPath("trainer02"),
      cookieName: ".ASPXAUTH",
    },
    cpsAdmin: {
      group: "CPSAdmin",
      username: "trainer12",
      password: process.env.CPS_ADMIN_PASSWORD as string,
      sessionFile: sessionPath("trainer12"),
    },
    // cpsProsecutor: {
    //   group: "CPSProsecutor",
    //   username: "trainer17",
    //   password: process.env.CPS_PROSECUTOR_PASSWORD as string,
    //   sessionFile: sessionPath("trainer17"),
    // },
    // defenceAdvocateA: {
    //   group: "DefenceAdvocateA",
    //   group: "DefenceAdvocateA",
    //   username: "trainer21",
    //   password: process.env.DEFENCE_ADVOCATE_A_PASSWORD as string,
    //   sessionFile: sessionPath("trainer21"),
    // },
    // defenceAdvocateB: {
    //   group: "DefenceAdvocateB",
    //   group: "DefenceAdvocateB",
    //   username: "trainer22",
    //   password: process.env.DEFENCE_ADVOCATE_B_PASSWORD as string,
    //   sessionFile: sessionPath("trainer22"),
    // },
    // defenceAdvocateC: {
    //   group: "DefenceAdvocateC",
    //   group: "DefenceAdvocateC",
    //   username: "trainer23",
    //   password: process.env.DEFENCE_ADVOCATE_C_PASSWORD as string,
    //   sessionFile: sessionPath("trainer23"),
    // },
    // fullTimeJudge: {
    //   group: "FullTimeJudge",
    //   username: "trainer28",
    //   password: process.env.FULL_TIME_JUDGE_PASSWORD as string,
    //   sessionFile: sessionPath("trainer28"),
    // },
    // probationStaff: {
    //   group: "ProbationStaff",
    //   username: "trainer39",
    //   password: process.env.PROBATION_STAFF_PASSWORD as string,
    //   sessionFile: sessionPath("trainer39"),
    // },
    // outsideProsecutingAdvocate: {
    //   group: "OutsideProsecutingAdvocate",
    //   username: "trainer41",
    //   password: getEnvVar("OUTSIDE_PROSECUTING_ADVOCATE_PASSWORD"),
    //   sessionFile: sessionPath("trainer41"),
    // },
    // feePaidJudge: {
    //   group: "FeePaidJudge",
    //   username: "trainer47",
    //   password: getEnvVar("FEE_PAID_JUDGE_PASSWORD"),
    //   sessionFile: sessionPath("trainer47"),
    // },
    // associateProsecutor: {
    //   group: "Associate Prosecutor",
    //   username: "trainer19",
    //   password: getEnvVar("ASSOCIATE_PROSECUTOR_PASSWORD"),
    //   sessionFile: sessionPath("trainer19"),
    // },
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
  //   {
  //     scenario: "wrong password",
  //     username: "trainer07",
  //     password: "wrongPassword",
  //   },
  {
    scenario: "wrong username and password",
    username: "wrongUser",
    password: "wrongPassword",
  },
];
