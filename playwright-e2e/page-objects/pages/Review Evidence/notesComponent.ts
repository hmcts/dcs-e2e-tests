import { Base } from "../../base";
import { Locator } from "playwright-core";
import { NotesModel } from "../../../data/notesModel";
import { expect } from "../../../fixtures";
import { notes } from "../../../data/notesModel";

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

  constructor(page) {
    super(page);
    this.topMenu = page.locator("#topLevelMenu");
    this.notesMenuLink = this.topMenu.locator("#rmiAnnotations");
    this.addPageNote = page.locator("#ribbonAddPageNote");
    this.drawBoxBtn = page.locator("#ribbonAddRectangle");
    this.noteTextArea = page.locator("#commentTextArea");
    this.saveNote = page.locator("#saveComment");
    this.privateButton = page.locator(
      '#editCommentPrivate input[type="radio"]'
    );
    this.tightlyDefence = page.locator('#editCommentTeam input[type="radio"]');
    this.tightlyShared = page.locator('#editCommentTight input[type="radio"]');
    this.widelyShared = page.locator('#editCommentWide input[type="radio"]');
    this.stickyNotes = page.locator("#StickyNotes .stickyNote");
  }

  // ---------------------------
  // Open notes
  // ---------------------------
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
          }
        )
        .toBe(true);
    } catch {
      await this.drawBoxBtn.click();
    }
  }

  // ---------------------------
  // Draw note
  // ---------------------------

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

  async dragCreateNote(
    canvasOffsetX: number,
    canvasOffsetY: number,
    dragWidth = 100,
    dragHeight = 40
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

  // ---------------------------
  // Add a single note
  // ---------------------------
  async addnote(
    type: string,
    userGroup: string,
    username: string,
    canvasX: number,
    canvasY: number
  ) {
    const dragWidth = 160;
    const dragHeight = 80;

    await this.dragCreateNote(canvasX, canvasY, dragWidth, dragHeight);

    await expect(this.noteTextArea).toBeVisible();

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
        }
      )
      .toBeFalsy();
  }

  // ---------------------------
  // Add notes for all user groups
  // ---------------------------
  async addNotesForUserGroup(
    userGroup: string,
    username: string,
    startY = 150,
    yStep = 100,
    canvasX = 200
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
      await expect(this.noteTextArea).toBeHidden({ timeout: 5000 });
      await expect(this.stickyNotes).toHaveCount(existingCount + 1, {
        timeout: 15000,
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
            // Allow up to 1o seconds for draw box button to be selected
            timeout: 10000,
          }
        )
        .toBeFalsy();
    }
    return types;
  }

  // Validate Notes Added
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
            `Add Note Validation Failed (Text): Expected "${expectedText}", got "${notes[i].noteText}"`
          );
        }
        if (!notes[i].noteShare.includes(expectedShare)) {
          currentUserIssues.push(
            `Add Note Validation Failed (Share Type): Expected "${expectedShare}", got "${notes[i].noteShare}"`
          );
        }
        if (!notes[i].noteUser.includes(expectedUser)) {
          currentUserIssues.push(
            `Add Note Validation Failed (User): Expected "${expectedUser}", got "${notes[i].noteUser}"`
          );
        }
      } catch (err) {
        currentUserIssues.push(
          `Unexpected error validating note index ${i}: ${err}`
        );
      }
    }
  }

  // ---------------------------
  // Delete note
  // ---------------------------

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

  // ---------------------------
  // Edit note
  // ---------------------------
  async editNote(userGroup) {
    const count = await this.getNotesCount();
    if (userGroup === "DefenceAdvocateA") {
      await expect
        .poll(async () => await count, {
          timeout: 10000,
        })
        .toBe(3);
    } else {
      await expect
        .poll(async () => await count, {
          timeout: 10000,
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
        { timeout: 10000, intervals: [500] }
      )
      .toBeTruthy();

    await this.noteTextArea.clear();
    await this.noteTextArea.fill(`Edited note for ${userGroup}`);
    const shareButton = this.privateButton;
    await expect(shareButton).toBeVisible();
    await shareButton.check();
    await expect(
      shareButton,
      "Unable to select widely shared radio button"
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
        }
      )
      .toBeFalsy();
  }

  // ---------------------------
  // Wait for page load
  // ---------------------------

  async getDocumentIDBySectionIndex(
    documentIndex: number,
    sectionTextIndex: string
  ): Promise<string> {
    const sectionTableLocator = this.page.locator(
      `table.sectionTextTable >> td.sectionTextIndex`,
      {
        hasText: new RegExp(`^${sectionTextIndex}:$`),
      }
    );

    await expect(sectionTableLocator).toBeVisible();

    const sectionTableHandle = await sectionTableLocator
      .first()
      .evaluateHandle((td) => td.closest("table"));

    const sectionId = await sectionTableHandle.evaluate(
      (table: HTMLTableElement) => table.id.replace("sectionName-", "")
    );
    const documentLocator = this.page
      .locator(`.sectionDocumentUl-${sectionId} .documentLi`)
      .nth(documentIndex);

    await expect(documentLocator).toBeVisible();

    const documentId = await documentLocator.getAttribute("id");
    if (!documentId)
      throw new Error(
        `Document at index ${documentIndex} in section with index: ${sectionTextIndex} not found`
      );

    return documentId;
  }

  async waitForHighResImageLoad(sectionKey, timeoutMs = 45000) {
    const documentId = await this.getDocumentIDBySectionIndex(0, sectionKey);
    const result = await this.page.evaluate(
      ({ documentId, sectionId, timeout }) => {
        const img = document.querySelector<HTMLImageElement>(
          `img.documentPageImage[data-documentrowkey="${documentId}"]`
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
      }
    );

    // Node-side console log
    console.log(result.message);

    if (!result.success) {
      throw new Error(result.message);
    }
  }

  // ---------------------------
  // Note Table Methods
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

  // === Extract details for one note ===
  async getNoteDetails(row: number): Promise<NotesModel> {
    const note = this.stickyNotes.nth(row);

    const key = await note.getAttribute("id");
    const text = await note.locator(".commentText").innerText();
    const user = await note.locator(".commentUser").innerText();
    const share = await note.locator(".commentSharing").innerText();

    return {
      noteKey: key ?? "",
      noteText: text,
      noteUser: user,
      noteShare: share,
    };
  }

  // === Get all notes ===
  async getAllNotes(): Promise<NotesModel[]> {
    const count = await this.getNotesCount();
    const notes: NotesModel[] = [];

    for (let row = 0; row < count; row++) {
      const model = await this.getNoteDetails(row);
      notes.push(model);
    }
    const availableNotes = notes.map((note) => ({
      ...note,
      noteText: note.noteText.trim(),
    }));
    return availableNotes;
  }

  async filterNotesByUser(user: string) {
    const filteredNotes = notes.filter((note) => note.roles?.includes(user));
    return filteredNotes;
  }

  async compareExpectedVsAvailableNotes(
    userExpectedNotes: NotesModel[],
    userAvailableNotes: NotesModel[]
  ) {
    const missingNotes: string[] = [];
    const unexpectedNotes: string[] = [];

    // Check for missing expected Notes

    for (const expectedNote of userExpectedNotes) {
      const availableMatches = userAvailableNotes.filter(
        (availableNote) =>
          availableNote.noteText === expectedNote.noteText &&
          availableNote.noteUser === expectedNote.noteUser &&
          availableNote.noteShare === expectedNote.noteShare
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
          expectedNote.noteShare === availableNote.noteShare
      );
      if (expectedMatches.length === 0) {
        unexpectedNotes.push(
          `Note: "${availableNote.noteText}" - is unexpectedly showing`
        );
      }
    }
    return { missingNotes, unexpectedNotes };
  }
}

export default NotesComponent;
