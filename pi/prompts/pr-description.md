---
description: Generate a concise PR description with Summary and Test sections
argument-hint: "<base-branch> [head-branch] [PR-title-or-context]"
---
Create a concise, ready-to-paste pull request description using this exact format:

# Summary #
Brief description of the changes that were made.

# Test #
  - What is the test plan?
  - Which things were tested?

Arguments: $@

Instructions:
- If a base branch is provided as `$1`, compare it with the head branch from `$2`; if `$2` is missing, compare `$1` with the current branch.
- If no branch arguments are clear, inspect the current git status, recent commits, and available branch context before summarizing.
- Use `git diff --stat`, `git diff --name-only`, and inspect the changed files needed to understand the implementation.
- Keep the description short and practical, not too much text.
- Explain briefly why the change matters and, when it is algorithm-related, include a small explanation of how the algorithm step will be used.
- In the Test section, summarize the test plan in 1-3 bullets.
- Do not invent tests that are not present. If tests are not present, say what should be tested.
- Output only the PR description, with no extra commentary.
