import { Base } from "../../../base";
import { Locator } from "playwright-core";
import { NotesModel } from "../../../../data/notesModel";
import { expect } from "../../../../fixtures";
import { notes } from "../../../../data/notesModel";

/**
 * This NotesComponent Page Object represents the Notes panel on the Review Evidence page,
 * encapsulating all functionalities for creating, managing, and validating user-generated
 * notes within the application's 'Review Evidence' section.
 *
 * It provides a structured interface for interacting with UI elements like the notes panel,
 * drawing tools, note editor dialogs, sharing options, and sticky notes. This component is
 * crucial for tests verifying annotation features, user collaboration, and role-based access
 * control for sensitive note content.
 */

class NotesComponent extends Base {
  topMenu: Locator;
  notesMenuLink: Locator;
  addPageNote: Locator;
  drawBoxBtn: Locator;
  privateButton: Locator;
  tightlyShared: Locator;
  tightlyDefence: Locator;
  widelyShared: Locator;
  noteTextArea: Locator;
  saveNote: Locator;
  stickyNotes: Locator;
  activeEditor: Locator;

  constructor(page) {
    super(page);
    this.topMenu = page.locator("#topLevelMenu");
    this.notesMenuLink = this.topMenu.locator("#rmiAnnotations");
    this.addPageNote = page.locator("#ribbonAddPageNote");
    this.drawBoxBtn = page.locator("#ribbonAddRectangle");
    this.activeEditor = page.locator("#editCommentDiv:visible");
    this.noteTextArea = this.activeEditor.locator("#commentTextArea");
    this.saveNote = this.activeEditor.locator("#saveComment");
    this.privateButton = page.locator(
      '#editCommentPrivate input[type="radio"]',
    );
    this.tightlyDefence = page.locator('#editCommentTeam input[type="radio"]');
    this.tightlyShared = page.locator('#editCommentTight input[type="radio"]');
    this.widelyShared = page.locator('#editCommentWide input[type="radio"]');
    this.stickyNotes = page.locator("#StickyNotes .stickyNote");
  }

  /**
   * the openNotes method activates the notes panel and
   * drawing tool. It navigates UI clicks (Annotations link, Add Page Note button)
   * and uses retry logic to ensure the drawing tool highlights
   * or activates correctly (observed flakiness), allowing reliable subsequent
   * annotation actions.
   */
  async openNotes() {
    await expect(this.notesMenuLink).toBeVisible();
    await this.notesMenuLink.click();
    await this.addPageNote.click();
    try {
      await expect
        .poll(
          async () => {
            const classes = await this.drawBoxBtn.getAttribute("class");
            return classes?.includes("highlightRibbonIcon");
          },
          {
            timeout: 3000,
          },
        )
        .toBe(true);
    } catch {
      await this.drawBoxBtn.click();
    }
  }

  // ---------------------------
  // Add note
  // ---------------------------

  /**
   * Locates the document canvas and calculates its on-screen
   * position and dimensions.
   * @returns a bounding box object ({ x, y, width, height })
   */
  async getCanvasBoundingBox() {
    const canvas = this.page.locator("canvas.documentPageCanvas").first();
    const exists = await canvas.count();
    const chosenCanvas =
      exists > 0 ? canvas : this.page.locator("canvas").first();
    const box = await chosenCanvas.boundingBox();
    if (!box) {
      throw new Error("Document canvas bounding box not found");
    }
    return box;
  }

  /**
   * Simulates a user dragging a rectangle on the document canvas
   * to define the area for a new note.
   * @param canvasOffsetX: Horizontal drag start, relative to canvas.
   * @param canvasOffsetY: Vertical drag start, relative to canvas.
   * @param dragWidth (optional, default: 100): Note rectangle width.
   * @param dragHeight (optional, default: 40): Note rectangle height.
   */
  async dragCreateNote(
    canvasOffsetX: number,
    canvasOffsetY: number,
    dragWidth = 100,
    dragHeight = 40,
  ) {
    const box = await this.getCanvasBoundingBox();
    // convert offsets inside canvas to absolute page coordinates
    const startX = box.x + canvasOffsetX;
    const startY = box.y + canvasOffsetY;
    const endX = startX + dragWidth;
    const endY = startY + dragHeight;

    // Move -> mouseDown -> move -> mouseUp
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, endY, { steps: 10 }); // smooth drag
    await this.page.mouse.up();
  }

  /**
   * Attempts to click the "Save" button within the note editor until the editor
   * dialog is no longer visible, accounting for known potential UI processing
   * delays.
   */
  async clickSaveUntilEditorCloses(timeoutMs = 30000) {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      // Success condition
      if (!(await this.activeEditor.isVisible().catch(() => false))) {
        return;
      }

      // Retry click if possible
      if (await this.saveNote.isVisible().catch(() => false)) {
        try {
          await this.saveNote.click({ timeout: 1000 });
        } catch {}
      }
      // Small wait before re-trying
      await this.page.waitForTimeout(500);
    }

    throw new Error("Save did not close editor within timeout");
  }

  /**
   * Orchestrates the full process of creating and saving a single note on a document,
   * from drawing its area to specifying its content and sharing permissions.
   * @param type The desired sharing category for the note
   * @param userGroup The group of the user creating the note
   * @param username The specific username of the note creator
   * @param canvasX The X-coordinate on the canvas to start drawing
   * @param canvasY The Y-coordinate on the canvas to start drawing
   */
  async addnote(
    type: string,
    userGroup: string,
    username: string,
    canvasX: number,
    canvasY: number,
  ) {
    const dragWidth = 160;
    const dragHeight = 80;

    await this.dragCreateNote(canvasX, canvasY, dragWidth, dragHeight);

    await expect(this.activeEditor).toBeVisible({ timeout: 30000 });

    await this.noteTextArea.fill(`${type} note for ${userGroup} ${username}`);

    // Note share types
    let shareButton: Locator | null = null;
    switch (type) {
      case "Private":
        shareButton = this.privateButton;
        break;
      case "Tightly Shared":
        shareButton = this.tightlyShared;
        break;
      case "Tightly Defence":
      case "Tightly Defence for Prosecution":
        shareButton = this.tightlyDefence;
        break;
      case "Widely Shared":
        shareButton = this.widelyShared;
        break;
      default:
        throw new Error(`Unsupported note type: ${type}`);
    }

    // Select share option
    await expect(shareButton).toBeVisible();
    await shareButton.check();

    // Tightly Defence Prosecution further selection
    if (type === "Tightly Defence for Prosecution") {
      await this.page
        .locator("#editCommentTeam")
        .locator("text=Prosecution")
        .click();
    }

    // Save note
    await this.clickSaveUntilEditorCloses();
  }

  /**
   * Adds a series of pre-defined notes to a document, simulating different sharing types across user groups
   * @param startY Starting vertical coordinate for the first note.
   * @param yStep Vertical increment between notes.
   * @param canvasX Fixed horizontal coordinate for notes.
   * @returns {Promise<string[]>} An array of strings representing the sharing types of added notes.
   */
  async addNotesForUserGroup(
    userGroup: string,
    username: string,
    startY = 150,
    yStep = 100,
    canvasX = 200,
  ) {
    const shareTypesDefault = ["Private", "Tightly Shared", "Widely Shared"];
    let shareTypes = shareTypesDefault;
    const types: string[] = [];

    if (userGroup.includes("Defence")) {
      shareTypes = ["Private", "Tightly Defence", "Widely Shared"];
      if (userGroup === "DefenceAdvocateA") {
        shareTypes = [
          "Private",
          "Tightly Defence",
          "Tightly Defence for Prosecution",
          "Widely Shared",
        ];
      }
    }

    let currentY = startY;

    for (const type of shareTypes) {
      await types.push(type);
      const existingCount = await this.getNotesCount();
      await this.addnote(type, userGroup, username, canvasX, currentY);
      await expect(this.activeEditor).toBeHidden({ timeout: 10000 });
      await expect(this.stickyNotes).toHaveCount(existingCount + 1, {
        timeout: 40000,
      });
      // Prepare Y offset for the next note
      currentY += yStep;

      await expect
        .poll(
          async () => {
            const classes = await this.drawBoxBtn.getAttribute("class");
            const drawBoxUnselected = !classes?.includes("highlightRibbonIcon");
            if (drawBoxUnselected) {
              await this.drawBoxBtn.click();
            }
            return drawBoxUnselected;
          },
          {
            // Allow 2s delay before retrying
            intervals: [2000],
            // Allow up to 10 seconds for draw box button to be selected
            timeout: 10000,
          },
        )
        .toBeFalsy();
    }
    return types;
  }

  /**
   * Compares a list of actual notes extracted from the UI against a set of expected
   * note details, identifying and reporting any discrepancies in content or sharing settings.
   * @param currentUserIssues - An array to collect validation issues.
   * @param user - The user object containing group and username for comparison.
   * @param types - An array of expected note sharing types.
   * @param notes - An array of UI `NotesModel` objects to validate.
   */
  async validateNotes(currentUserIssues, user, types, notes) {
    for (let i = 0; i < notes.length; i++) {
      const expectedText = `${types[i]} note for ${user.group} ${user.username}`;
      const expectedShare = types[i].startsWith("Tightly")
        ? "Tightly Shared Note"
        : `${types[i]} Note`;
      const expectedUser = user.username;

      try {
        if (notes[i].noteText !== expectedText) {
          currentUserIssues.push(
            `Add Note Validation Failed (Text): Expected "${expectedText}", got "${notes[i].noteText}"`,
          );
        }
        if (!notes[i].noteShare.includes(expectedShare)) {
          currentUserIssues.push(
            `Add Note Validation Failed (Share Type): Expected "${expectedShare}", got "${notes[i].noteShare}"`,
          );
        }
        if (!notes[i].noteUser.includes(expectedUser)) {
          currentUserIssues.push(
            `Add Note Validation Failed (User): Expected "${expectedUser}", got "${notes[i].noteUser}"`,
          );
        }
      } catch (err) {
        currentUserIssues.push(
          `Unexpected error validating note index ${i}: ${err}`,
        );
      }
    }
  }

  // ---------------------------
  // Updating Notes
  // ---------------------------

  /**
   * Simulates a user deleting the first available sticky note on the document viewer,
   * confirming the action through a dialog and verifying the updated note count.
   */
  async deleteNote() {
    const count = await this.stickyNotes.count();
    expect(count).toBeGreaterThan(0);

    const firstNote = this.stickyNotes.first();
    const deleteButton = firstNote.locator(".removeCommentDiv");

    // Wait until the delete button is stable & fully interactable
    await deleteButton.waitFor({ state: "visible" });
    await deleteButton.click({ trial: true }); // checks if Playwright can click it

    const dialogPromise = this.page.waitForEvent("dialog");

    await deleteButton.click();

    const dialog = await dialogPromise;
    await dialog.accept();

    // Validate count decreased
    await expect
      .poll(() => this.getNotesCount(), { timeout: 30_000 })
      .toBe(count - 1);
  }

  /**
   * Simulates editing the last visible sticky note by changing its content and
   * updating its sharing type, including validations for note count changes based
   * on user group.
   */
  async editNote(userGroup) {
    const count = await this.getNotesCount();
    if (userGroup === "DefenceAdvocateA") {
      await expect
        .poll(async () => await count, {
          timeout: 30000,
        })
        .toBe(3);
    } else {
      await expect
        .poll(async () => await count, {
          timeout: 30000,
        })
        .toBe(2);
    }

    const widelySharedNote = this.stickyNotes.last();
    const editButton = widelySharedNote.locator(".editCommentDiv");

    await expect(editButton).toBeVisible();

    await expect
      .poll(
        async () => {
          const isVisible = await this.noteTextArea.isVisible();
          if (!isVisible) {
            await editButton.click();
          }
          return isVisible;
        },
        { timeout: 10000, intervals: [500] },
      )
      .toBeTruthy();

    await this.noteTextArea.clear();
    await this.noteTextArea.fill(`Edited note for ${userGroup}`);
    const shareButton = this.privateButton;
    await expect(shareButton).toBeVisible();
    await shareButton.check();
    await expect(
      shareButton,
      "Unable to select widely shared radio button",
    ).toBeChecked();

    // Save note
    await expect
      .poll(
        async () => {
          const buttonStillVisible = await this.saveNote.isVisible();
          if (buttonStillVisible) await this.saveNote.click();
          return buttonStillVisible;
        },
        {
          // Allow 2s delay before retrying
          intervals: [2000],
          // Allow up to 10 seconds for the Save button to disappear
          timeout: 10000,
        },
      )
      .toBeFalsy();
  }

  // ---------------------------
  // Wait for page/document load
  // ---------------------------

  /**
   * Retrieves the unique identifier (key) of a specific document within a given section
   * of the document viewer, enabling targeted interaction with that document.
   */
  async getDocumentIDBySectionIndex(
    documentIndex: number,
    sectionTextIndex: string,
  ): Promise<string> {
    const sectionTableLocator = this.page.locator(
      `table.sectionTextTable >> td.sectionTextIndex`,
      {
        hasText: new RegExp(`^${sectionTextIndex}:$`),
      },
    );

    await expect(sectionTableLocator).toBeVisible();

    const sectionTableHandle = await sectionTableLocator
      .first()
      .evaluateHandle((td) => td.closest("table"));

    const sectionId = await sectionTableHandle.evaluate(
      (table: HTMLTableElement) => table.id.replace("sectionName-", ""),
    );
    const documentLocator = this.page
      .locator(`.sectionDocumentUl-${sectionId} .documentLi`)
      .nth(documentIndex);

    await expect(documentLocator).toBeVisible();

    const documentId = await documentLocator.getAttribute("id");
    if (!documentId)
      throw new Error(
        `Document at index ${documentIndex} in section with index: ${sectionTextIndex} not found`,
      );

    return documentId;
  }

  /**
   * Ensures that a document's high-resolution image has completely loaded in the viewer before
   * proceeding, which is critical for annotation.
   */
  async waitForHighResImageLoad(sectionKey, timeoutMs = 45000) {
    const documentId = await this.getDocumentIDBySectionIndex(0, sectionKey);
    const result = await this.page.evaluate(
      ({ documentId, sectionId, timeout }) => {
        const img = document.querySelector<HTMLImageElement>(
          `img.documentPageImage[data-documentrowkey="${documentId}"]`,
        );
        if (!img)
          return {
            success: false,
            message: `❌ Image not found for Document in Section: ${sectionId}`,
          };

        return new Promise<{ success: boolean; message: string }>((resolve) => {
          const handler = () => {
            if (img.src.includes("r=i")) {
              img.removeEventListener("load", handler);
              resolve({
                success: true,
                message: `✅ High-res image loaded for Document in Section: ${sectionId}`,
              });
            }
          };
          img.addEventListener("load", handler);

          setTimeout(() => {
            img.removeEventListener("load", handler);
            resolve({
              success: false,
              message: `⚠️ Timeout (${timeout}ms) waiting for high-res image for Document in Section: ${sectionId}`,
            });
          }, timeout);
        });
      },
      {
        sectionId: sectionKey,
        timeout: timeoutMs,
        documentId,
      },
    );

    // Node-side console log
    console.log(result.message);

    if (!result.success) {
      throw new Error(result.message);
    }
  }

  // ---------------------------
  // Notes Table Methods
  // ---------------------------

  async getNotesCount(): Promise<number> {
    return await this.stickyNotes.count();
  }

  async getNoteKey(row: number): Promise<string> {
    return (await this.stickyNotes.nth(row).getAttribute("id")) ?? "";
  }

  async getNoteText(row: number): Promise<string> {
    return await this.stickyNotes.nth(row).locator(".commentText").innerText();
  }

  async getNoteUser(row: number): Promise<string> {
    return await this.stickyNotes.nth(row).locator(".commentUser").innerText();
  }

  async getNoteShare(row: number): Promise<string> {
    return await this.stickyNotes
      .nth(row)
      .locator(".commentSharing")
      .innerText();
  }

  /**
   * Extracts all relevant information (key, text, user, and sharing type) for a
   * specific sticky note, handling cases where a single sticky note element might
   * contain multiple comments.
   * @returns {Promise<NotesModel[]>} A promise that resolves to an array of NotesModel
   * objects, each representing a comment associated with the specified sticky note.
   */
  async getNoteDetails(row: number): Promise<NotesModel[]> {
    const note = this.stickyNotes.nth(row);
    const comments = note.locator(".stickyComment");
    const count = await comments.count();
    const noteModels: NotesModel[] = [];

    for (let i = 0; i < count; i++) {
      const comment = comments.nth(i);
      const key = await comment.getAttribute("id");
      const text = await comment.locator(".commentText").innerText();
      const user = await comment.locator(".commentUser").innerText();
      const share = await comment.locator(".commentSharing").innerText();

      noteModels.push({
        noteKey: key ?? "",
        noteText: text.trim(),
        noteUser: user,
        noteShare: share,
      });
    }
    return noteModels;
  }

  /**
   * Consolidates all currently visible sticky notes on the document viewer into a single,
   * comprehensive list of their detailed properties.
   */
  async getAllNotes(): Promise<NotesModel[]> {
    const count = await this.getNotesCount();
    const notes: NotesModel[] = [];

    for (let row = 0; row < count; row++) {
      const notesModels = await this.getNoteDetails(row);
      notes.push(...notesModels);
    }
    return notes;
  }

  /**
   * Filters the global list of notes (`../../../data/notesModel.ts`)
   * to find those accessible by a specific user role.
   * @returns {NotesModel[]} An array of `NotesModel` objects accessible by the specified user.
   */
  async filterNotesByUser(user: string) {
    const filteredNotes = notes.filter((note) => note.roles?.includes(user));
    return filteredNotes;
  }

  /**
   * Compares a list of expected notes for a user against notes actually found in the UI.
   * Identifies and reports any missing expected notes or unexpected extra notes.
   * @param {NotesModel[]} userExpectedNotes - An array of `NotesModel` objects expected to be visible for the user.
   * @param {NotesModel[]} userAvailableNotes - An array of `NotesModel` objects actually found for the user in the UI.
   * @returns {{missingNotes: string[], unexpectedNotes: string[]}} An object containing arrays of descriptions for missing
   * and unexpected notes.
   */
  async compareExpectedVsAvailableNotes(
    userExpectedNotes: NotesModel[],
    userAvailableNotes: NotesModel[],
  ) {
    const missingNotes: string[] = [];
    const unexpectedNotes: string[] = [];

    // Check for missing expected Notes

    for (const expectedNote of userExpectedNotes) {
      const availableMatches = userAvailableNotes.filter(
        (availableNote) =>
          availableNote.noteText === expectedNote.noteText &&
          availableNote.noteUser === expectedNote.noteUser &&
          availableNote.noteShare === expectedNote.noteShare,
      );

      if (availableMatches.length === 0) {
        missingNotes.push(`Note: "${expectedNote.noteText}" - is missing`);
      }
    }

    // Check for unexpected access to Notes

    for (const availableNote of userAvailableNotes) {
      const expectedMatches = userExpectedNotes.filter(
        (expectedNote) =>
          expectedNote.noteText === availableNote.noteText &&
          expectedNote.noteUser === availableNote.noteUser &&
          expectedNote.noteShare === availableNote.noteShare,
      );
      if (expectedMatches.length === 0) {
        unexpectedNotes.push(
          `Note: "${availableNote.noteText}" - is unexpectedly showing`,
        );
      }
    }
    return { missingNotes, unexpectedNotes };
  }
}

export default NotesComponent;
