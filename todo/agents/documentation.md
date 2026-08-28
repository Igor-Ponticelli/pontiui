# Documentation Agent

Produces everything a consumer reads. Runs last, because it documents what actually
exists rather than what was planned.

## Inputs

- The implemented, tested and audited component
- Its plan (Goal, API, When not to use)
- The Accessibility Agent's accessibility contract

## Outputs

1. `src/components/<Component>/<Component>.stories.tsx`
2. TSDoc gaps filled on any public prop that lacks it
3. Component status updated in the root `README.md`
4. Usage notes in `docs/` when the component has non-obvious integration requirements
   (Toast provider, Modal portal behavior)

## Required stories (D-2)

- `Default`
- One per variant
- One per size
- One per state: disabled, loading, invalid, empty, error, as applicable
- One realistic composition showing the component in context with others
- One edge case: very long text, no children, many items

Stories are documentation, so prefer realistic content over "Lorem ipsum" and
"Button text".

## Prop documentation

Every prop gets: what it does, its default, and when to use it. Type and signature come
from TypeScript automatically, so do not restate them.

Bad: "The variant of the button."
Good: "Visual emphasis. Use `primary` for the single main action in a view,
`secondary` for supporting actions, `ghost` inside dense toolbars."

## Must document

- **When not to use this component**, taken from the plan. This is the highest-value
  section and the most often skipped.
- The accessibility contract: what is handled, what the consumer must supply.
- Required composition, if any (a Modal needs a trigger the consumer owns).
- Known limitations and anything deferred.
- Which tokens affect this component's appearance.

## Does not

- Document props that do not exist, or behavior that was planned but not shipped.
- Write examples that do not compile.
- Duplicate the theming guide inside a component's docs. Link to it.
- Describe internal implementation. Consumers do not care and it becomes wrong.

## Checklist before handoff

- [ ] Every required story exists and renders
- [ ] Autodocs prop table is complete, no missing descriptions
- [ ] Every example compiles and was actually run
- [ ] "When not to use" section written
- [ ] Accessibility contract stated
- [ ] Relevant tokens listed
- [ ] Root `README.md` status table updated
- [ ] Stories render correctly in both light and dark themes
