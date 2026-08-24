---
description: Generate a technical definition document from a feature/ticket description
argument-hint: "[ticket-id or feature description]"
---
Generate a complete technical definition document for the feature described in the arguments or, if none are provided, infer it from the current branch name, recent commits, and any product definition files in the repo.

Arguments: $@

Use this exact section structure (omit sections that don't apply, as noted in the template disclaimer):

---

**Feature Name**: [Name]

**Product Definition**: [Link or filename if available]

**Description**: [One paragraph: what the feature does and its purpose]

### 1 - Backend Logic

### 2 - APIs

### 3 - Database Schema

### 4 - Database Operations

### 5 - External Integrations

### 6 - Authentication & Authorization

### 7 - Error Handling

### 8 - Performance Considerations

### 9 - Security Measures

### 10 - Deployment & Monitoring

### 11 - Testing

### 12 - Additional Notes

### 13 - Tasks

---

Instructions:
- Read the current branch name, `git log --oneline -20`, and `git diff development...HEAD --stat` to understand what has already been implemented.
- If a product definition file exists (zip, markdown, or similar), read it before writing.
- For each section, be specific and reference actual file paths, function names, and existing patterns found in the codebase. Do not write generic placeholder text.
- In section 13, list concrete tasks with estimated scope; group them logically (config, use case, interactor wiring, tests).
- In section 7 (Error Handling), always include a "Surface" column in the table distinguishing errors that reach the API caller from those that are log-only.
- Keep descriptions tight. Prefer bullet points over long paragraphs.

Writing rules (apply to every word of the output):
- Never use the em dash "-". Use a plain hyphen "-" instead.
- No inline comments in code snippets.
- No trailing summaries or meta-commentary after the document ends.
