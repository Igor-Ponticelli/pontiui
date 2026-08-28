# <Component>

> Copy this file to `todo/components/<name>.md` when planning a new component.
> Delete sections that genuinely do not apply, do not leave them empty.

**Status:** `[ ]` not started
**Phase:** see `TODO.md`
**Depends on:** other components, hooks or open decisions
**Blocked by:** decision IDs from `DECISIONS.md`, if any
**Client component:** yes / no, and why

## Goal

One paragraph: what problem this solves for a consumer. If it is hard to write, the
component is not defined well enough to build.

## When not to use it

The cases where a consumer should reach for something else. Goes into the public docs.

## Public API

Prop table: name, type, default, description. Mark required props.

## Variants

## Sizes

## States

## Behavior

Numbered, testable statements. Each one becomes a test.

## Implementation notes

Structure, which element is the ref target, which hooks are involved, anything
non-obvious. No implementation code.

## Accessibility

Applicable WAI-ARIA pattern with a link. Semantics, keyboard map, focus behavior,
required accessible names, live regions.

## Tokens used

Which semantic tokens drive this component's appearance, and any new token it needs.

## Tests

Beyond the baseline in `agents/testing.md`.

## Documentation

Stories beyond the standard set, and anything that needs a `docs/` page.

## Open questions

Anything unresolved. Promote to `DECISIONS.md` if it blocks work.

## Definition of done

- [ ] Implemented per this plan
- [ ] Tests passing, baseline plus the cases above
- [ ] Accessibility audit signed off
- [ ] Stories and TSDoc complete
- [ ] Exported from `src/index.ts` with its props type
- [ ] Root README status table updated
- [ ] Changeset added
- [ ] This plan updated to match what shipped
