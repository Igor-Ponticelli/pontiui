# Spinner

**Status:** `[ ]` not started
**Phase:** 5
**Depends on:** motion tokens
**Blocked by:** nothing
**Client component:** no

## Goal

An indeterminate loading indicator, used standalone and embedded inside other
components (Button's loading state, most obviously). Small, purely visual, no state.

## When not to use it

- For loading content whose shape is known. Use Skeleton, which avoids layout shift and
  communicates more.
- For determinate progress. That is a different component, out of scope for 0.1.0.
- For waits under roughly 300 ms. A flash of spinner is worse than nothing.

## Public API

| Prop        | Type                                | Default     | Description                       |
| ----------- | ----------------------------------- | ----------- | --------------------------------- |
| `size`      | `"sm" \| "md" \| "lg"`              | `"md"`      | Diameter                          |
| `tone`      | `"current" \| "primary" \| "muted"` | `"current"` | Color source                      |
| `label`     | `string`                            | `"Loading"` | Accessible name                   |
| `hideLabel` | `boolean`                           | `false`     | Hide from assistive tech entirely |

## Variants

`tone: "current"` inherits `currentColor`, which is what makes it work inside a Button
of any variant without extra configuration. This is the default for that reason.

## Sizes

Three steps, sized in `em` or from the type scale so a spinner sits correctly next to
text of the same size.

## States

None. It is always animating.

## Behavior

1. Renders a continuously rotating indicator.
2. Under `prefers-reduced-motion: reduce`, the spin is replaced with a subtle opacity
   pulse or stopped entirely. Decide which, then apply the same choice to Skeleton.
3. By default announces itself as a status with its label.
4. `hideLabel` removes it from the accessibility tree, for use inside a parent that
   already announces the loading state (Button sets `aria-busy`, so the spinner inside
   must not announce a second time).

## Implementation notes

- SVG with a stroked circle and a dash offset, or a bordered element with one
  transparent side. SVG scales more predictably and antialiases better.
- Animation is a CSS keyframe, not JavaScript.
- No layout impact: it must not change the height of a line of text it sits in.

## Accessibility

- Standalone: `role="status"` with an accessible name.
- Embedded in a parent that already communicates busy state: `aria-hidden="true"`.
  Getting this wrong causes double announcements, which is the main a11y risk here.
- Must respect reduced motion (A11Y and ST-9).

## Tokens used

`--pui-color-primary`, `--pui-color-muted`, motion duration token. New token likely
needed: `--pui-duration-spin`.

## Tests

- Renders with a status role and default label by default
- Custom label is used as the accessible name
- `hideLabel` removes it from the accessibility tree
- Each size renders at the expected relative scale

## Documentation

A story showing a Spinner inside a Button, and a story showing correct versus incorrect
labelling. Document the `hideLabel` rule clearly, since consumers embedding it in their
own components will hit the double-announcement problem.

## Open questions

- Reduced motion: stop entirely or pulse?
- Does `tone: "current"` cover enough cases to drop `primary` and `muted`?

## Definition of done

Standard checklist from `_TEMPLATE.md`.
