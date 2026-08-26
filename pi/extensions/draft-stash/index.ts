import {
  CustomEditor,
  type ExtensionAPI,
  type ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { matchesKey } from "@earendil-works/pi-tui";

const COMMAND_NAME = "draft-stash";
const SHORTCUT = "ctrl+s";
const SHORTCUT_LABEL = "Ctrl+S";
const STATUS_KEY = "draft-stash";
const DESCRIPTION = "Stash or restore the current editor draft";

type DraftStashState =
  | { kind: "empty" }
  | { kind: "stashed"; text: string };

type EditorFactory = NonNullable<
  ReturnType<ExtensionContext["ui"]["getEditorComponent"]>
>;

const EMPTY_STATE: DraftStashState = { kind: "empty" };

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default function draftStashExtension(pi: ExtensionAPI): void {
  let state: DraftStashState = EMPTY_STATE;
  let previousEditorFactory: EditorFactory | undefined;
  let installedEditorFactory: EditorFactory | undefined;

  function updateStatus(ctx: ExtensionContext): void {
    ctx.ui.setStatus(
      STATUS_KEY,
      state.kind === "stashed"
        ? `Draft stashed (${SHORTCUT_LABEL} to restore)`
        : undefined,
    );
  }

  function stashDraft(text: string, ctx: ExtensionContext): void {
    // Clear the editor before committing the state transition. If the UI call
    // fails, the original draft remains visible and nothing is stashed.
    ctx.ui.setEditorText("");
    state = { kind: "stashed", text };
    updateStatus(ctx);
    ctx.ui.notify(
      `Draft stashed. Press ${SHORTCUT_LABEL} again to restore it.`,
      "info",
    );
  }

  function restoreDraft(text: string, ctx: ExtensionContext): void {
    // Restore the editor before clearing the stash. If the UI call fails, the
    // draft remains safely stored and can be restored again.
    ctx.ui.setEditorText(text);
    state = EMPTY_STATE;
    updateStatus(ctx);
    ctx.ui.notify("Draft restored.", "info");
  }

  function toggleDraftStash(ctx: ExtensionContext): void {
    if (ctx.mode !== "tui") {
      ctx.ui.notify(
        "Draft stash is available only in the interactive TUI.",
        "warning",
      );
      return;
    }

    try {
      const editorText = ctx.ui.getEditorText();

      if (state.kind === "empty") {
        if (editorText.length === 0) {
          ctx.ui.notify("There is no draft to stash.", "info");
          return;
        }

        stashDraft(editorText, ctx);
        return;
      }

      if (editorText.length > 0) {
        ctx.ui.notify(
          "The editor is not empty. Submit or clear the current draft before restoring the stashed one.",
          "warning",
        );
        return;
      }

      restoreDraft(state.text, ctx);
    } catch (error) {
      ctx.ui.notify(`Draft stash failed: ${formatError(error)}`, "error");
    }
  }

  function installEditorShortcut(ctx: ExtensionContext): void {
    previousEditorFactory = ctx.ui.getEditorComponent();

    installedEditorFactory = (tui, theme, keybindings) => {
      const editor = previousEditorFactory
        ? previousEditorFactory(tui, theme, keybindings)
        : new CustomEditor(tui, theme, keybindings);
      const handleInput = editor.handleInput.bind(editor);

      editor.handleInput = (data: string): void => {
        if (matchesKey(data, SHORTCUT)) {
          toggleDraftStash(ctx);
          return;
        }
        handleInput(data);
      };

      return editor;
    };

    ctx.ui.setEditorComponent(installedEditorFactory);
  }

  function uninstallEditorShortcut(ctx: ExtensionContext): void {
    if (
      installedEditorFactory &&
      ctx.ui.getEditorComponent() === installedEditorFactory
    ) {
      ctx.ui.setEditorComponent(previousEditorFactory);
    }
    previousEditorFactory = undefined;
    installedEditorFactory = undefined;
  }

  pi.registerCommand(COMMAND_NAME, {
    description: DESCRIPTION,
    handler: (_args, ctx) => toggleDraftStash(ctx),
  });

  pi.on("session_start", (_event, ctx) => {
    state = EMPTY_STATE;
    if (ctx.mode === "tui") installEditorShortcut(ctx);
    updateStatus(ctx);
  });

  pi.on("session_shutdown", (_event, ctx) => {
    state = EMPTY_STATE;
    ctx.ui.setStatus(STATUS_KEY, undefined);
    if (ctx.mode === "tui") uninstallEditorShortcut(ctx);
  });
}
