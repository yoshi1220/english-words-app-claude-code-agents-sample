# Personal Global Rules

## Code Quality

- **Sequential comment numbering**: After any code modification, always verify that sequential comment numbers (e.g., // 1., // 2., // 3.) remain correct and consistent. Do not leave gaps or duplicates.
- **Design with context**: Before making design decisions, read and review the relevant existing code to understand the current architecture and patterns.
- **Consistency with reference files**: When reference files or examples are provided, always verify that changes are consistent with them in terms of naming, structure, and conventions.

## Project Settings

- When adding allowed permissions (e.g., `Bash`, `Read`, `Write` tool permissions), always add them to `settings.local.json` (personal/local config), **not** to `settings.json` (shared/project config). This keeps permission overrides as individual settings and avoids polluting the team's shared configuration.

## Naming & Style Conventions

- Unless explicitly instructed otherwise, follow existing conventions for:
  - File names
  - Variable / function / class names
  - Code structure and logic patterns
- Prefer matching the surrounding codebase style over introducing new patterns.

## Readability

- Conciseness matters, but **human readability takes higher priority**. When in doubt, favor clarity and explicitness over brevity.

## Handling Review Feedback

When review comments or corrections are received:

1. **Read carefully** — Understand the full context of the feedback before acting.
2. **Validate** — Assess whether the feedback is accurate and applicable.
3. **Plan** — If a fix is needed, draft a correction approach and verify it is consistent with the surrounding code and architecture.
4. **Skip if unwarranted** — If the feedback does not apply or is incorrect, it is acceptable to not make changes. Provide reasoning when declining.

## Sub-Agent Workflow

When agents are defined in `~/.claude/agents/` or the project's `/agents` directory, always follow this workflow using the Task tool's subagent types.

### Agent Role Mapping

| Role                     | Description                                                                          | Task subagent_type           |
| ------------------------ | ------------------------------------------------------------------------------------ | ---------------------------- |
| code-reader              | Codebase comprehension and structure analysis                                        | `codebase-reader`            |
| sdd-generator            | Generate spec/plan/tasks from requirements using SpecKit                             | `speckit-artifact-generator` |
| spec-consistency-checker | Verify consistency across spec/plan/tasks and existing code                          | `sdd-consistency-verifier`   |
| impl-coordinator         | Analyze tasks, design implementation approach, produce instructions for implementers | `implementation-coordinator` |
| backend-implementer      | Implement backend code based on coordinator instructions                             | `backend-implementer`        |
| ui-implementer           | Implement frontend UI code based on coordinator instructions                         | `frontend-ui-implementer`    |
| code-reviewer            | Post-implementation review with actionable feedback                                  | `post-impl-code-reviewer`    |
| review-verifier          | Verify review findings are accurate by delegating code reading to code-reader        | `review-verifier`            |

### Standard Workflow

#### Specification Phase

1. Requirements received → **sdd-generator**: generate spec/plan/tasks
2. After generation or modification → **spec-consistency-checker**: verify consistency (see below)
3. If issues found → **sdd-generator**: fix and re-check
4. If passed → proceed to Implementation Phase

#### Consistency Check Trigger & Procedure

**When to run**: Whenever spec.md, plan.md, or tasks.md is created or modified.

**Check scope** — only verify files that exist at that point:

| Existing files               | Check direction              |
| ---------------------------- | ---------------------------- |
| spec.md only                 | No cross-file check needed   |
| spec.md + plan.md            | spec.md → plan.md            |
| spec.md + plan.md + tasks.md | spec.md → plan.md → tasks.md |

**What to verify in each direction**:

- **spec.md → plan.md**: All spec requirements are covered by the plan. No plan item contradicts or exceeds spec scope.
- **plan.md → tasks.md**: All plan items are decomposed into tasks. Task dependencies are logically ordered. No orphaned tasks exist without a plan reference.

**Procedure**:

1. Launch **spec-consistency-checker** (`sdd-consistency-verifier`) with the spec directory path
2. Review the output report (coverage matrix, violations, warnings)
3. If ❌ violations exist → pass findings to **sdd-generator** for correction, then re-run check
4. If only ⚠️ warnings → evaluate whether correction is needed; proceed if acceptable
5. If all ✅ → proceed to next phase

#### Implementation Phase

1. For each task in tasks.md → **impl-coordinator** (`implementation-coordinator`): analyze the task, delegate to **code-reader** (`codebase-reader`) for existing code investigation, then produce implementation instructions including:
   - Task classification (backend / frontend / full-stack)
   - API Contract (for full-stack tasks)
   - Specific file paths and pattern references
   - Separate instruction sets for backend-implementer and/or ui-implementer
2. Backend work → pass coordinator's "Backend Implementation Instructions" to **backend-implementer** (`backend-implementer`)
3. Frontend work → pass coordinator's "UI Implementation Instructions" to **ui-implementer** (`frontend-ui-implementer`)
4. For full-stack tasks → **backend-implementer** first, then **ui-implementer** (backend API must exist before frontend integrates)
5. After implementation → **code-reviewer** (`post-impl-code-reviewer`): review the changes and generate review documents (total_review.md, spec_review.md, code_review.md, etc.)
6. After review → **review-verifier** (`review-verifier`): verify each review finding is accurate (delegates code reading to **code-reader** for evidence gathering)
7. If review-verifier produces "Approved Feedback" with required changes → pass approved instructions back through **impl-coordinator** to re-coordinate, then to the appropriate implementer for corrections, then re-run from step 5
8. If review-verifier drops findings as inaccurate or determines review quality is too low → re-run **code-reviewer**
9. If all findings are resolved and verdict is PASS → proceed to next task

### Agent Selection Rules

- Read-only analysis or comprehension → **code-reader** (`codebase-reader`)
- Spec/plan/task creation or modification → **sdd-generator** (`speckit-artifact-generator`) + **spec-consistency-checker** (`sdd-consistency-verifier`)
- Implementation planning and instructions → **impl-coordinator** (`implementation-coordinator`, uses **code-reader** internally)
- Backend code changes → **backend-implementer** (`backend-implementer`, receives instructions from impl-coordinator)
- Frontend/UI code changes → **ui-implementer** (`frontend-ui-implementer`, receives instructions from impl-coordinator)
- Quality verification after code changes → **code-reviewer** (`post-impl-code-reviewer`)
- Verification of review accuracy → **review-verifier** (`review-verifier`, uses **code-reader** internally)
- Do not send tasks directly to implementers without going through impl-coordinator first
- Do not use implementers for read-only tasks; do not use read-only agents for file modifications
