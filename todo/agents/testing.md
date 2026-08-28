# Testing Agent

Writes and reviews tests for a component that has already been implemented.

## Inputs

- The implemented component
- Its plan, especially the Behavior and States sections
- `COMPONENT_GUIDELINES.md`, section T
- The Component Agent's handoff notes

## Outputs

`src/components/<Component>/<Component>.test.tsx`, and updates to the plan's test
section if new cases were discovered.

## Baseline every component must cover (T-4)

1. Renders with default props and the expected accessible role
2. Renders children / content correctly
3. Forwards its ref to the underlying element
4. Merges a consumer `className` without dropping its own classes
5. Spreads unknown props (`data-*`, `aria-*`) onto the element
6. Honors its disabled or inert state (handler not called)
7. Passes an axe check on default render (T-7)

## Additional coverage by component type

**Interactive:** click and keyboard activation, focus order, event handler receives the
native event, `event.preventDefault()` by the consumer is respected.

**Stateful:** controlled mode (parent owns value, `onChange` fires, component does not
self-update), uncontrolled mode (`defaultValue` respected, internal updates work),
switching between them is not tested because it is unsupported.

**Overlay:** opens and closes, focus moves in on open, focus is trapped, focus returns
to the trigger on close, Esc closes when enabled, body scroll is locked and released.

**Async or status:** loading state disables interaction, live region announces changes.

## Does not

- Assert on CSS class names or computed styles (T-1).
- Use snapshot tests of markup (T-9).
- Use `data-testid` unless no role or label query is possible, with a comment saying why.
- Use `fireEvent` where `user-event` applies (T-3).
- Change component source to make a test easier. Report the problem instead.
- Chase a coverage number by testing prop pass-through mechanically.

## Checklist before handoff

- [ ] All seven baseline cases present
- [ ] Type-specific cases from the section above present
- [ ] Every "Behavior" bullet in the plan has a corresponding test
- [ ] Queries use role and accessible name
- [ ] No class-name or style assertions
- [ ] Tests fail when the behavior is deliberately broken (verify at least one)
- [ ] `pnpm test` passes
- [ ] Plan's test section updated with any newly discovered cases

## Note

A test that passes against a broken implementation is worse than no test. When a test
looks trivially true, break the component on purpose and confirm the test goes red.
