# Divider

**Status:** `[x]` implemented (Phase 2 canary). Tests, a11y sign-off and
stories still pending - Phases 3, 4 and 5.
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
4. `children` combined with `orientation="vertical"` renders the bare rule and ignores
   the label. **Decided:** ignore rather than warn. Orientation is often driven by a
   responsive value, so a label that is valid at one breakpoint would otherwise produce
   console noise at another for correct code.
5. When `decorative` is true and there is no label, the element is hidden from
   assistive technology.
6. When `decorative` is false and there is no label, it exposes a separator role with
   the correct orientation.
7. When there is a label, no ARIA is applied and `decorative` is ignored, so the label
   is always readable. See Accessibility.

## Implementation notes

- No `<hr>`, because `<hr>` cannot contain a label and cannot be vertical without
  fighting default styles. A `div` with explicit semantics is more predictable.
- The labelled variant is a three-part flex row: line, label, line.
- Ref targets the outer element.

## Accessibility

- Pattern: [Separator](https://www.w3.org/WAI/ARIA/apg/patterns/) role.
- `decorative: true` applies `aria-hidden`, correct for the overwhelmingly common case
  of purely visual separation.
- `decorative: false` applies `role="separator"` plus `aria-orientation`. The orientation
  is set on both axes, not only the non-default one, so the exposed semantics never
  depend on a user agent's idea of the default.
- **A labelled divider carries no ARIA at all, and `decorative` has no effect on it.**
  A label is content, and content is never hidden. Both alternatives fail: `aria-hidden`
  would drop the label from the accessibility tree, and `role="separator"` has
  presentational children in ARIA 1.2, so it would suppress the label too. This was
  found during Phase 2 - the first implementation hid the label of
  `<Divider>or</Divider>`, the exact login-form case the component exists for.
- The two line spans are empty, so they contribute no text and are given no
  `aria-hidden` of their own (A11Y-11: do not invent ARIA).

## Tokens used

`--pui-color-border`, `--pui-border-width`, `--pui-space-{2,4,6}`,
`--pui-color-muted-foreground`, `--pui-font-size-sm`, `--pui-line-height-normal`.

**No new token was needed.** `--pui-border-width` covers the thickness, which was the
open question here.

## Tests

- Renders horizontally by default
- Vertical orientation applies the correct semantics
- Decorative divider is not exposed to the accessibility tree
- Non-decorative divider exposes the separator role and orientation
- Label renders between the two rule halves
- **A labelled divider exposes its label to the accessibility tree, with `decorative`
  left at its default and set explicitly to `true`** - this is a regression test for the
  defect found in Phase 2 (T-8)
- A label passed with `orientation="vertical"` is ignored and the bare rule renders
- Forwards its ref, merges a consumer `className`, spreads unknown props

## Documentation

Standard stories, plus one showing the vertical caveat (parent needs a height) since
that is the most likely support question.

## Open questions

Both resolved during Phase 2.

- ~~Should `children` with vertical orientation warn, or silently ignore the label?~~
  Ignore. See Behaviour 4.
- ~~Is a dashed or dotted style worth supporting?~~ Scope creep. Not in 0.1.0. A
  consumer who wants it targets their own `className`, which the cascade layers already
  make work (D-23).

## Definition of done

Standard checklist from `_TEMPLATE.md`, plus: the built tarball installs into a
throwaway Vite app and renders this component correctly.
