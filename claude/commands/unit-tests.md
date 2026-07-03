---
description: Generate unit tests for a code file in typescript
argument-hint: "[file|path|instructions]"
---
You are tasked with generating unit tests for the following code file or instructions: $@

Strictly follow these principles and guidelines to ensure the tests are robust, readable, and maintainable:

### Core Principles (FIRST)
- Independent/Isolated: Each test must be self-contained and not depend on the state left by other tests.
- Repeatable: Tests must always produce the same result.
- Self-Validating: The test should determine success or failure automatically.
- Timely: Tests should be written alongside the production code.

### Structure and Style
- Use the Arrange, Act, Assert (AAA) structure for every test.
- Avoid repetition (DRY):
  - Use `beforeEach` for shared setup in `describe` blocks.
  - Create helper functions for repetitive tasks (e.g., entity creation, mock setup).
- Write clear test names (`it` blocks) in third person, present tense.
  Example: `it("returns an empty array when no items are provided")`.

### Variable Scope
- Use `let` in the main `describe` block only for shared variables.
  - Always re-initialize them inside `beforeEach` for a clean state.
- Use `const` inside each test for local variables used only in that test.

### Data and Entity Management
- Use the `Examples.ts` file to use or create instances of complex entities (Route, Vehicle, Job, etc.) for consistency.
- Define local `const` values inside tests for specific input scenarios (edge cases, empty data, complete data).

### Mocks and Dependencies
- Keep mocks minimal and precise. Only mock external dependencies (databases, APIs).
- Always mock the database gateway:
  ```ts
  jest.mock("../../../src/gateway/postgres");
  const mockedGateway = jest.mocked(postgresGateway);
  mockedGateway.onTransaction.mockImplementation(async (callback) => callback(sessionMock));
  mockedGateway.onSession.mockImplementation(async (callback) => callback(sessionMock));
  ```
- Ensure global transactional/session-based functions resolve correctly.

### Typing (TypeScript)
- Do NOT use `any`.
- Apply strict typing across all tests.
- Always import and use existing types and interfaces from the application.
