# PontiUI Planning

This folder is the source of truth for how PontiUI gets built. It is committed to the
repository and reviewed like code. Any human or AI agent working on this project reads
here first.

## Files

| File                      | Purpose                                                           |
| ------------------------- | ----------------------------------------------------------------- |
| `TODO.md`                 | Phased roadmap for the whole library. What is done, what is next. |
| `COMPONENT_GUIDELINES.md` | Binding rules for writing any component. The contract.            |
| `DECISIONS.md`            | Decisions already made (with rationale) and decisions still open. |
| `components/*.md`         | One implementation plan per component.                            |
| `agents/*.md`             | Role definition and handoff rules for each specialized agent.     |
| `components/_TEMPLATE.md` | Skeleton for adding a new component plan.                         |

## Reading order for a new contributor

1. `DECISIONS.md` - understand the constraints and what is still undecided.
2. `COMPONENT_GUIDELINES.md` - understand the rules.
3. `TODO.md` - find the current phase.
4. `components/<name>.md` - the specific task.

## Status legend

Used across all files in this folder.

- `[ ]` not started
- `[~]` in progress
- `[x]` done
- `[?]` blocked by an open decision in `DECISIONS.md`
- `[-]` deliberately out of scope for now

## Development flow for one component

```text
components/<name>.md  (plan)
        v
Component Agent       -> implementation
        v
Testing Agent         -> tests
        v
Accessibility Agent   -> a11y audit and fixes
        v
Documentation Agent   -> stories, docs, README table
        v
Human review
        v
Changeset + merge     -> component marked [x] in TODO.md
```

See `agents/README.md` for what each stage may and may not change.

## Rules for this folder

1. A plan is written before implementation starts, never after.
2. If implementation reveals the plan was wrong, update the plan in the same pull
   request. A stale plan is worse than no plan.
3. Do not resolve an open decision inside a component plan. Resolve it in
   `DECISIONS.md` first, then reference it.
4. Do not put implementation code in this folder. API sketches and prop tables are
   fine; component bodies are not.
5. Keep this folder in English, like the rest of the project.

## What this folder is not

It is not user-facing documentation. Public docs live in `README.md` at the repository
root and in `docs/` once that exists. If a fact is useful to someone consuming the
library, it belongs there, not here.
