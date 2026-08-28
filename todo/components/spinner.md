# Spinner

**Status:** `[x]` implemented. Tests, a11y sign-off and stories still pending -
Phases 3, 4 and 5.
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

| Prop         | Type                                | Default     | Description                       |
| ------------ | ----------------------------------- | ----------- | --------------------------------- |
| `size`       | `"sm" \| "md" \| "lg"`              | `"md"`      | Diameter                          |
| `tone`       | `"current" \| "primary" \| "muted"` | `"current"` | Color source                      |
| `label`      | `string`                            | `"Loading"` | Accessible name                   |
| `decorative` | `boolean`                           | `false`     | Hide from assistive tech entirely |

**Renamed from `hideLabel` during implementation.** X-1 requires the same concept to use
the same prop name library-wide, and `Divider` already shipped `decorative` for exactly
this - whether the element reaches assistive technology. Two names for one concept in an
eleven-component library is a tax on every consumer who learns it. `hideLabel` also read
as a command rather than a state, which N-4 rules out. The defaults differ by component
(`Divider` hides by default, `Spinner` announces by default) because their common cases
differ; the prop means the same thing in both.

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
2. Under `prefers-reduced-motion: reduce`, the spin is replaced with an opacity pulse.
   **Decided: pulse, not stop.** Stopping leaves a static ring and removes the only
   signal the component exists to give, so a reduced-motion user would not know anything
   was still happening. An opacity fade carries the same information without the rotation
   that causes vestibular discomfort. Skeleton follows the same rule (X-2).
3. By default announces itself as a status with its label.
4. `decorative` removes it from the accessibility tree, for use inside a parent that
   already announces the loading state (Button sets `aria-busy`, so the spinner inside
   must not announce a second time).

## Implementation notes

- SVG with a stroked circle and a dash offset, or a bordered element with one
  transparent side. SVG scales more predictably and antialiases better.
- Animation is a CSS keyframe, not JavaScript.
- No layout impact: it must not change the height of a line of text it sits in.

## Accessibility

- Standalone: `role="status"` on the wrapper, named by a visually hidden label inside
  it. The SVG itself is always `aria-hidden`, since the ring carries no information the
  label does not.
- Embedded in a parent that already communicates busy state: `decorative` applies
  `aria-hidden="true"` to the whole component. Getting this wrong causes double
  announcements, which is the main a11y risk here.
- Must respect reduced motion (A11Y and ST-9). See Behaviour 2.
- **Known limitation:** `role="status"` is a live region, and live regions are
  unreliable at announcing content that is present when the region first mounts. A
  spinner that appears in response to an action generally announces; one present on
  first paint may not. This is inherent to the pattern rather than to this
  implementation, and is the reason the parent-announces path (`decorative`) exists.

## Tokens used

`--pui-color-primary`, `--pui-color-muted-foreground`, `--pui-duration-spin`,
`--pui-duration-slow`, `--pui-easing-linear`, `--pui-easing-standard`,
`--pui-line-height-none`.

**Three tokens were added**, each because the ST-4 lint rule rejected a literal rather
than because they were designed up front:

- `--pui-duration-spin` (700ms) - anticipated by this plan
- `--pui-easing-linear` - a spin needs linear timing; any easing reads as stuttering
- `--pui-line-height-none` - the wrapper collapses its line box so the spinner cannot
  grow the line it sits in

Sizes are `em`, not tokens: the point is that the spinner scales with surrounding text.

## Tests

- Renders with a status role and default label by default
- Custom label is used as the accessible name
- `decorative` removes it from the accessibility tree and drops the label element
- Each size renders at the expected relative scale
- Forwards its ref, merges a consumer `className`, spreads unknown props
- The SVG is `aria-hidden` in every configuration, so the label is never announced twice

## Documentation

A story showing a Spinner inside a Button, and a story showing correct versus incorrect
labelling. Document the `hideLabel` rule clearly, since consumers embedding it in their
own components will hit the double-announcement problem.

## Open questions

Both resolved during implementation.

- ~~Reduced motion: stop entirely or pulse?~~ Pulse. See Behaviour 2.
- ~~Does `tone: "current"` cover enough cases to drop `primary` and `muted`?~~ Kept all
  three. `current` handles every embedded case, but a standalone spinner on a page whose
  text colour is not the right colour for it would otherwise force the consumer to wrap
  it in an element just to set `color`. The cost is two CSS rules.

## Definition of done

Standard checklist from `_TEMPLATE.md`.
