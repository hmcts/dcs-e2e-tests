/**
 * Notes test model
 * ----------------
 * This model represents a document note (via Review Evidence).
 *
 * It is used in E2E tests to validate:
 *  - who created the note
 *  - how it is shared (Private / Tightly Shared / Widely Shared)
 *  - which user roles should be able to view it
 *
 * Each entry in the `notes` array represents a single note for the
 * existing case 'Auto Case1 - DO NOT AMEND'.This case allows us to
 * test note visiblity and access on a large complex case covering
 *  - all supported roles
 *  - all supported share types
 *  - cross-role visibility scenarios
 */

export interface NotesModel {
  /** The unique identifier for the note, which is optional as it may not be required in all contexts. */
  noteKey?: string;
  /** The text content of the note, which is a required field. */
  noteText: string;
  /** The user who created the note, a required field. */
  noteUser: string;
  /** The sharing status of the note (e.g., 'Private', 'Tightly Shared', 'Widely Shared'), which is a required field. */
  noteShare: string;
  /** An optional array of user roles that have permission to view the note. */
  roles?: string[];
}

export const notes: NotesModel[] = [
  {
    noteKey: "",
    noteText: "This is Widely shared HMCTS comment",
    noteUser: "Mr Andrew Trainer01",
    noteShare: "Widely Shared Note (HMCTS Admin)",
    roles: [
      "CPSAdmin",
      "DefenceAdvocateA",
      "DefenceAdvocateB",
      "DefenceAdvocateC",
      "HMCTSAdmin",
      "FullTimeJudge",
      "ProbationStaff",
      "CPSProsecutor",
    ],
  },
  {
    noteKey: "",
    noteText: "This is Reply tightly shared HMCTS comment",
    noteUser: "Mr Andrew Trainer01",
    noteShare: "Tightly Shared Note (HMCTS Admin)",
    roles: ["HMCTSAdmin"],
  },
  {
    noteKey: "",
    noteText: "This is Private HMCTS comment",
    noteUser: "Mr Andrew Trainer01",
    noteShare: "Private Note (HMCTS Admin)",
    roles: ["HMCTSAdmin"],
  },
  {
    noteKey: "",
    noteText: "This is Private CPS Admin comment",
    noteUser: "Miss Kim Trainer11",
    noteShare: "Private Note (CPS Admin)",
    roles: ["CPSAdmin"],
  },
  {
    noteKey: "",
    noteText: "This is tightly shared CPS Admin comment",
    noteUser: "Miss Kim Trainer11",
    noteShare: "Tightly Shared Note (CPS Admin)",
    roles: ["CPSAdmin"],
  },
  {
    noteKey: "",
    noteText: "This is widely shared CPS Admin comment",
    noteUser: "Miss Kim Trainer11",
    noteShare: "Widely Shared Note (CPS Admin)",
    roles: [
      "CPSAdmin",
      "DefenceAdvocateA",
      "DefenceAdvocateB",
      "DefenceAdvocateC",
      "HMCTSAdmin",
      "FullTimeJudge",
      "ProbationStaff",
      "CPSProsecutor",
    ],
  },
  {
    noteKey: "",
    noteText: "This is private NOMS comment",
    noteUser: "Mr Adam Trainer38",
    noteShare: "Private Note (NOMS)",
    roles: ["ProbationStaff"],
  },
  {
    noteKey: "",
    noteText: "This is tightly shared NOMS comment",
    noteUser: "Mr Adam Trainer38",
    noteShare: "Tightly Shared Note (NOMS)",
    roles: ["ProbationStaff"],
  },
  {
    noteKey: "",
    noteText: "This is widely shared NOMS comment",
    noteUser: "Mr Adam Trainer38",
    noteShare: "Widely Shared Note (NOMS)",
    roles: [
      "CPSAdmin",
      "DefenceAdvocateA",
      "DefenceAdvocateB",
      "DefenceAdvocateC",
      "HMCTSAdmin",
      "FullTimeJudge",
      "ProbationStaff",
      "CPSProsecutor",
    ],
  },
  {
    noteKey: "",
    noteText: "This is Private Judge comment",
    noteUser: "HHJ Alma Trainer27",
    noteShare: "Private Note (Judge)",
    roles: ["FullTimeJudge"],
  },
  {
    noteKey: "",
    noteText: "This is tightly shared Judge comment",
    noteUser: "HHJ Alma Trainer27",
    noteShare: "Tightly Shared Note (Judge)",
    roles: ["FullTimeJudge"],
  },
  {
    noteKey: "",
    noteText: "This is widely shared Judge comment",
    noteUser: "HHJ Alma Trainer27",
    noteShare: "Widely Shared Note (Judge)",
    roles: [
      "CPSAdmin",
      "DefenceAdvocateA",
      "DefenceAdvocateB",
      "DefenceAdvocateC",
      "HMCTSAdmin",
      "FullTimeJudge",
      "ProbationStaff",
      "CPSProsecutor",
    ],
  },
  {
    noteKey: "",
    noteText: "Private comment for Defence A - Jack",
    noteUser: "Miss Una Trainer21",
    noteShare: "Private Note (Defence)",
    roles: ["DefenceAdvocateA"],
  },
  {
    noteKey: "",
    noteText: "Tightly shared comment for Defence A - Jack",
    noteUser: "Miss Una Trainer21",
    noteShare: "Tightly Shared Note (Defence ATKINS, Jack , 19/2/43)",
    roles: ["DefenceAdvocateA", "DefenceAdvocateC"],
  },
  {
    noteKey: "",
    noteText: "Widely shared comment for Defence A - Jack",
    noteUser: "Miss Una Trainer21",
    noteShare: "Widely Shared Note (Defence)",
    roles: [
      "CPSAdmin",
      "DefenceAdvocateA",
      "DefenceAdvocateB",
      "DefenceAdvocateC",
      "HMCTSAdmin",
      "FullTimeJudge",
      "ProbationStaff",
      "CPSProsecutor",
    ],
  },

  {
    noteKey: "",
    noteText: "This is a private comment for Defence B - Bill",
    noteUser: "Mr Vincent Trainer22",
    noteShare: "Private Note (Defence)",
    roles: ["DefenceAdvocateB"],
  },
  {
    noteKey: "",
    noteText: "This is a tightly shared comment for Defence B - Bill",
    noteUser: "Mr Vincent Trainer22",
    noteShare: "Tightly Shared Note (Defence BATES, Bill , 18/2/73)",
    roles: ["DefenceAdvocateB", "DefenceAdvocateC"],
  },
  {
    noteKey: "",
    noteText: "Widely shared comment for Defence B - Bill",
    noteUser: "Mr Vincent Trainer22",
    noteShare: "Widely Shared Note (Defence)",
    roles: [
      "CPSAdmin",
      "DefenceAdvocateA",
      "DefenceAdvocateB",
      "DefenceAdvocateC",
      "HMCTSAdmin",
      "FullTimeJudge",
      "ProbationStaff",
      "CPSProsecutor",
    ],
  },
  {
    noteKey: "",
    noteText: "This is private CPS Prosecutor comment",
    noteUser: "Mr Peter Trainer16",
    noteShare: "Private Note (Prosecution)",
    roles: ["CPSProsecutor"],
  },
  {
    noteKey: "",
    noteText: "This is tightly shared CPS Prosecutor comment",
    noteUser: "Mr Peter Trainer16",
    noteShare: "Tightly Shared Note (Prosecution)",
    roles: ["CPSProsecutor"],
  },
  {
    noteKey: "",
    noteText: "This is widely shared CPS Prosecutor comment",
    noteUser: "Mr Peter Trainer16",
    noteShare: "Widely Shared Note (Prosecution)",
    roles: [
      "CPSAdmin",
      "HMCTSAdmin",
      "FullTimeJudge",
      "ProbationStaff",
      "CPSProsecutor",
    ],
  },
];
