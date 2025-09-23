import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ quiet: true });

// -------------------- Types --------------------
export interface UserCredentials {
  group: string;
  username: string;
  password: string;
  sessionFile?: string;
}

export interface Config {
  users: {
    hmctsAdmin: UserCredentials;
    // cpsAdmin: UserCredentials;
    // cpsProsecutor: UserCredentials;
    // associateProsecutor: UserCredentials;
    // defenceAdvocateA: UserCredentials;
    // defenceAdvocateB: UserCredentials;
    // defenceAdvocateC: UserCredentials;
    // fullTimeJudge: UserCredentials;
    // probationStaff: UserCredentials;
    // outsideProsecutingAdvocate: UserCredentials;
    // feePaidJudge: UserCredentials;
  };
  urls: {
    preProdBaseUrl: string;
    uatBaseUrl: string;
  };
}

// -------------------- Helpers --------------------
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function sessionPath(username: string): string {
  return path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    `../.sessions/${username}.json`
  );
}

// -------------------- Config Object --------------------
export const userConfig: Config = {
  users: {
    hmctsAdmin: {
      group: "HMCTS Admin",
      username: "trainer02",
      password: getEnvVar("HMCTS_ADMIN_PASSWORD"),
      sessionFile: sessionPath("trainer02"),
    },
    // cpsAdmin: {
    //   group: "CPS Admin",
    //   username: "trainer11",
    //   password: getEnvVar("CPS_ADMIN_PASSWORD"),
    //   sessionFile: sessionPath("trainer11"),
    // },
    // cpsProsecutor: {
    //   group: "CPS Prosecutor",
    //   username: "trainer16",
    //   password: getEnvVar("CPS_PROSECUTOR_PASSWORD"),
    //   sessionFile: sessionPath("trainer16"),
    // },
    // associateProsecutor: {
    //   group: "Associate Prosecutor",
    //   username: "trainer19",
    //   password: getEnvVar("ASSOCIATE_PROSECUTOR_PASSWORD"),
    //   sessionFile: sessionPath("trainer19"),
    // },
    // defenceAdvocateA: {
    //   group: "Defence Advocate A",
    //   username: "trainer21",
    //   password: getEnvVar("DEFENCE_ADVOCATE_A_PASSWORD"),
    //   sessionFile: sessionPath("trainer21"),
    // },
    // defenceAdvocateB: {
    //   group: "Defence Advocate B",
    //   username: "trainer22",
    //   password: getEnvVar("DEFENCE_ADVOCATE_B_PASSWORD"),
    //   sessionFile: sessionPath("trainer22"),
    // },
    // defenceAdvocateC: {
    //   group: "Defence Advocate C",
    //   username: "trainer23",
    //   password: getEnvVar("DEFENCE_ADVOCATE_C_PASSWORD"),
    //   sessionFile: sessionPath("trainer23"),
    // },
    // fullTimeJudge: {
    //   group: "Full Time Judge",
    //   username: "trainer27",
    //   password: getEnvVar("FULL_TIME_JUDGE_PASSWORD"),
    //   sessionFile: sessionPath("trainer27"),
    // },
    // probationStaff: {
    //   group: "Probation Staff",
    //   username: "trainer38",
    //   password: getEnvVar("PROBATION_STAFF_PASSWORD"),
    //   sessionFile: sessionPath("trainer38"),
    // },
    // outsideProsecutingAdvocate: {
    //   group: "Outside Prosecuting Advocate",
    //   username: "trainer41",
    //   password: getEnvVar("OUTSIDE_PROSECUTING_ADVOCATE_PASSWORD"),
    //   sessionFile: sessionPath("trainer41"),
    // },
    // feePaidJudge: {
    //   group: "Fee Paid Judge",
    //   username: "trainer47",
    //   password: getEnvVar("FEE_PAID_JUDGE_PASSWORD"),
    //   sessionFile: sessionPath("trainer47"),
    // },
  },
  urls: {
    preProdBaseUrl: getEnvVar("BASE_URL_PREPROD"),
    uatBaseUrl: getEnvVar("BASE_URL_UAT"),
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
    password: getEnvVar("HMCTS_ADMIN_PASSWORD"),
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
