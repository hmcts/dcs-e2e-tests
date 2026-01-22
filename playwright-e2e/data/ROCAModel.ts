/**
 * ROCAModel
 * ----------
 * This model represents a single entry on the ROCA page
 * (Record of Case Activity tables).
 *
 * It is used by E2E tests to validate that:
 *  - the correct ROCA entries appear following platform actions
 *  - defendant-based representation visibility is enforced correctly
 */

export interface ROCAModel {
  /** The index of the section where the activity occurred. */
  sectionIndex: string;
  /** The number of the document related to the activity. */
  documentNumber: string;
  /** The name of the document related to the activity. */
  documentName: string;
  /** The action that was performed (e.g., 'Delete', 'Update', 'Create'). */
  action: string;
  /** The username of the user who performed the action. */
  username: string;
  /** The defendants associated with the activity, optional. */
  defendants?: string;
}
