# Draft Stash

A context-aware Pi extension for temporarily storing the text in the main prompt editor.

## Usage

1. Write a prompt and press `Ctrl+S` to stash it and clear the editor.
2. Send another prompt or run a command.
3. With the main editor empty, press `Ctrl+S` to restore the stashed prompt.

The same toggle is available as `/draft-stash`.

## Behavior

- The stash is an in-memory, single-draft slot scoped to the current Pi session.
- Empty drafts are not stashed.
- Restoring never overwrites non-empty editor text.
- A failed editor update leaves the draft in the safest recoverable state.
- The footer shows when a draft is waiting to be restored.
- The stash is discarded when the session shuts down or Pi reloads.

## Shortcut scope

`Ctrl+S` is intercepted only by the main prompt editor. Focused selectors and dialogs keep their native key handling, including:

- saving scoped-model selections with `Ctrl+S`
- changing session sort mode with `Ctrl+S`

The extension wraps an existing custom editor when one is already installed and restores it during shutdown.
