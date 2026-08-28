# Divider

**Status:** `[ ]` not started
**Phase:** 2 (pipeline canary), reviewed again in Phase 5
**Depends on:** nothing
**Blocked by:** nothing
**Client component:** no

## Goal

A thin rule that separates content, optionally with a centered label. Chosen as the
first component because it has no state, no dependencies and no interaction, which
makes it a clean test of the build and distribution pipeline rather than of component
logic.

## When not to use it

- As decoration inside a component that already has spacing. Use spacing tokens.
- To create layout structure. It is a separator, not a grid line.
- Around list items that already carry semantic grouping.

## Public API

| Prop          | Type                             | Default        | Description                              |
| ------------- | -------------------------------- | -------------- | ---------------------------------------- |
| `orientation` | `"horizontal" \| "vertical"`     | `"horizontal"` | Axis of the rule                         |
| `decorative`  | `boolean`                        | `true`         | When true, hidden from assistive tech    |
| `spacing`     | `"none" \| "sm" \| "md" \| "lg"` | `"md"`         | Margin along the main axis               |
| `children`    | `ReactNode`                      | -              | Optional centered label, horizontal only |
| `className`   | `string`                         | -              | Merged last                              |

Extends `React.HTMLAttributes<HTMLDivElement>`.

## Variants

None beyond orientation.

## Sizes

Thickness is fixed at one token value. `spacing` is the only scale.

## States

None.

## Behavior

1. Renders a horizontal rule spanning the full width of its container by default.
2. Vertical orientation stretches to the height of its container and requires the
   parent to have a defined height. Documented as a caveat.
3. With `children`, the rule is split and the label is centered between the two halves.
4. `children` combined with `orientation="vertical"` is not supported. Decide whether
   to ignore the label or warn in development.
5. When `decorative` is true, the element is hidden from assistive technology.
6. When `decorative` is false, it exposes a separator role with the correct orientation.

## Implementation notes

- No `<hr>`, because `<hr>` cannot contain a label and cannot be vertical without
  fighting default styles. A `div` with explicit semantics is more predictable.
- The labelled variant is a three-part flex row: line, label, line.
- Ref targets the outer element.

## Accessibility

- Pattern: [Separator](https://www.w3.org/WAI/ARIA/apg/patterns/) role.
- `decorative: true` implies `role="none"` or `aria-hidden`, which is correct for the
  overwhelmingly common case of purely visual separation.
- `decorative: false` implies `role="separator"` plus `aria-orientation`.
- A labelled divider has a text alternative through its own content.

## Tokens used

`--color-border`, spacing scale. New token needed: divider thickness, unless the
existing border width token is sufficient.

## Tests

- Renders horizontally by default
- Vertical orientation applies the correct semantics
- Decorative divider is not exposed to the accessibility tree
- Non-decorative divider exposes the separator role and orientation
- Label renders between the two rule halves

## Documentation

Standard stories, plus one showing the vertical caveat (parent needs a height) since
that is the most likely support question.

## Open questions

- Should `children` with vertical orientation warn, or silently ignore the label?
- Is a dashed or dotted style worth supporting, or is that scope creep?

## Definition of done

Standard checklist from `_TEMPLATE.md`, plus: the built tarball installs into a
throwaway Vite app and renders this component correctly.
