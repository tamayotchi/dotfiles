---
description: Write a short PR description (Summary + Test) and optionally open/update a draft PR
argument-hint: "<base-branch> [head-branch] [PR-title-or-context]"
---
Write a short, friendly, ready-to-paste pull request description using this exact format:

# Summary #
Brief description of what changed.

# Test #
  - The tests that prove the change works.

Arguments: $@

Style:
- Write in simple, friendly English (team is B2 level). Short sentences, common words, no jargon dumps.
- Keep it short. A few lines for Summary, 1-3 bullets for Test. No filler.

How to build it:
- If `$1` is given, compare it with the head branch `$2`; if `$2` is missing, compare `$1` with the current branch. If no branch is clear, inspect `git status`, recent commits, and branch context first.
- Use `git diff --stat`, `git diff --name-only`, and read the changed files to understand the change.
- In Summary, say what changed and briefly why it matters. If it is algorithm-related, add one line on how the step is used.

Test section rules (important):
- Only list tests that actually exercise the change and prove it works (e.g. a unit/integration test hitting the real code path).
- Do NOT list setup or smoke checks that don't touch the change (e.g. "server is healthy", "route returns 401 without a token"). The reader does not care.
- Be honest: if a test does not really cover the change, don't claim it as proof. Say plainly what still needs to be tested.
- Do not invent tests. If there are none, list what should be tested instead.

Creating the PR:
- If the user asks to open a PR, run tests first, then create it as a draft with the `gh` CLI:
  `gh pr create --draft --base <base> --head <head> --title "<title>" --body-file <file>`
- Write the body to a temp file and pass it with `--body-file` (avoids quoting issues).
- To update an existing PR, use `gh pr edit <number> --body-file <file>`.
- After creating/updating, share the PR URL.
- If the user only wants the text, output just the PR description with no extra commentary.
