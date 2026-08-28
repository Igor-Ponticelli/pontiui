# Agents

Four specialized roles, run in sequence for each component. They exist to keep concerns
separated: the agent writing the component is the worst judge of whether its tests are
adequate or its accessibility is real.

These are role definitions, not implementations. They can be run as separate prompts,
separate sessions, or by one person wearing different hats. Nothing here depends on
specific tooling.

## Pipeline

```text
todo/components/<name>.md   plan, written and reviewed first
        v
[1] Component Agent         implementation
        v
[2] Testing Agent           tests, edge cases, regressions
        v
[3] Accessibility Agent     semantics, keyboard, focus, ARIA, contrast
        v
[4] Documentation Agent     TSDoc, stories, usage docs
        v
Human review                API, naming, consistency with the rest of the library
        v
Changeset + merge           component marked [x] in TODO.md
```

Stages run in order. A stage may send work back one stage, never skip forward.

## Shared rules for every agent

1. Read `COMPONENT_GUIDELINES.md` and the component's plan before acting. Cite rule IDs
   when justifying a choice.
2. Stay in scope. Do not fix unrelated things you notice; record them instead.
3. If something needed is undecided, stop and add it to `DECISIONS.md` as an open
   question. Do not invent an answer.
4. Do not change the build, `tsconfig`, `package.json`, tokens or the public export
   surface. Those are hard stops in the guidelines.
5. Do not add dependencies.
6. Never weaken a check to make something pass: no skipped tests, no disabled lint
   rules, no loosened types.
7. Leave the working tree in a state where `pnpm typecheck`, `pnpm test` and
   `pnpm build` all pass.
8. Update the component plan if reality diverged from it.

## Handoff artifact

Each stage ends with a short written handoff, not just code:

```text
Stage:        Testing Agent
Component:    Button
Done:         what was added or changed
Deviations:   where the plan was not followed, and why
Open issues:  anything the next stage must know
Blocked on:   decision IDs, if any
```

## Escalation

Stop and ask a human when:

- A guideline rule appears wrong for this case.
- The plan contradicts an existing component's behavior.
- Doing the task well requires changing another component's public API.
- An accessibility requirement conflicts with the requested design.
