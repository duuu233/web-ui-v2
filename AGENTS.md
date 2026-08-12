# Project AI Instructions

## Project Context

This project is maintained across multiple development environments:

- Office computer
- Home computer
- Remote SSH servers

Git repository is the single source of truth.

Do not assume local machine state is shared between environments.

The project may be modified from different computers at different times.

Always consider synchronization and compatibility with other development environments.

---

# AI Working Principles

The AI assistant should act as a long-term project collaborator.

Before making changes:

1. Understand the existing implementation.
2. Check dependencies and impact.
3. Avoid unnecessary changes.
4. Preserve existing design decisions.

Prefer understanding before modifying.

---

# CodeGraph Usage

This project uses CodeGraph as the primary code intelligence system.

Use CodeGraph first when analyzing:

- project architecture
- module relationships
- dependencies
- function call chains
- class relationships
- impact of changes
- refactoring scope
- unfamiliar code

Do not rely only on text search when structural understanding is required.

Examples:

Use CodeGraph for questions like:

- "Who calls this function?"
- "What modules depend on this?"
- "What will be affected if this changes?"
- "Explain this subsystem architecture."

---

# CodeGraph Management

CodeGraph represents the current state of the codebase.

CodeGraph contains:

- project structure
- files
- symbols
- functions/classes
- dependencies
- callers/callees
- impact relationships

## Local Index Rules

The `.codegraph/` directory is a local generated index.

Rules:

- Never commit `.codegraph/` to Git.
- Each computer maintains its own CodeGraph index.
- The index can always be regenerated.
- Do not depend on another machine's `.codegraph/` data.

The project Git repository contains source and knowledge, not CodeGraph cache.

---

# CodeGraph Synchronization

After pulling code changes from Git:

Run:

```bash
codegraph sync
```

---

# Knowledge and Change Records

## Required Reading Order

Before changing the project, read in this order:

1. `AGENTS.md`
2. `AI_CONTEXT.md`
3. `docs/README.md`
4. The Active document related to the task
5. Relevant source and call paths through CodeGraph
6. Historical records only when the reason for an earlier decision is needed

`AI_CONTEXT.md` is a concise snapshot of current project facts. It must not become a chronological work log. `docs/README.md` is the canonical documentation index and must be updated when a document is added, moved, superseded, or changes responsibility.

## CodeGraph and Markdown Responsibilities

- Source code plus CodeGraph are authoritative for current code locations, symbols, dependencies, callers, and impact.
- Active Markdown documents are authoritative for current product contracts, manual procedures, architectural decisions, and operational expectations.
- Historical records explain what happened at a point in time; they are not current requirements.
- When these sources conflict, verify the current implementation first and then repair the stale Active document.

After pulling changes, run `codegraph sync .`. After meaningful source changes, run `codegraph sync .` followed by `codegraph status .`. Run a full `codegraph index .` only when the index is missing or damaged, the extractor changed, or the tool recommends it.

## Local Operation and Update Records

Record each substantial task in:

```text
docs/history/YYYY-MM/YYYY-MM-DD-topic.md
```

Use `docs/history/README.md` as the template. A record should contain the scope, environment, branch and starting revision, affected files or modules, external operations, important decisions, actual verification results, remaining work, and rollback notes when applicable.

Create a record for architecture, API contract, permission, menu, security, deployment, data migration, or cross-project changes. A trivial typo or formatting-only edit does not need a record. Once complete, freeze the record and feed durable conclusions back into the relevant Active document.

Never record secrets, tokens, signatures, passwords, cookies, private user data, full environment files, or local CodeGraph cache contents.

## Cross-Environment Handoff

Git remains the only shared source of truth across computers. A handoff must identify the branch, base revision, validation actually performed, unfinished work, and any intentional local-only state. Do not depend on uncommitted files, editor state, dependency directories, build output, or another machine's `.codegraph/` directory.
