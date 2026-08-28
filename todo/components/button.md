# Button

**Status:** `[ ]` not started
**Phase:** 6
**Depends on:** Spinner (loading state), focus-ring token utility
**Blocked by:** nothing, though the `asChild` question below should be settled first
**Client component:** yes, it carries interaction handlers

## Goal

The reference implementation of the library. Every pattern established here (variant
structure, focus ring, disabled handling, ref forwarding, icon slots) is copied by every
component that follows, so it is worth over-investing in.

## When not to use it

- For navigation. A button that changes the URL should be a link. See the open question
  about rendering as an anchor.
- As a container for arbitrary layout. It is a control, not a card.
- For toggles with a persistent on/off state. That is a Switch, out of scope for 0.1.0.

## Public API

| Prop        | Type                                              | Default     | Description                            |
| ----------- | ------------------------------------------------- | ----------- | -------------------------------------- |
| `variant`   | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"primary"` | Visual emphasis                        |
| `size`      | `"sm" \| "md" \| "lg"`                            | `"md"`      | Control size                           |
| `loading`   | `boolean`                                         | `false`     | Shows a spinner and blocks interaction |
| `disabled`  | `boolean`                                         | `false`     | Native disabled                        |
| `fullWidth` | `boolean`                                         | `false`     | Stretches to the container width       |
| `leftIcon`  | `ReactNode`                                       | -           | Icon before the label                  |
| `rightIcon` | `ReactNode`                                       | -           | Icon after the label                   |
| `type`      | `"button" \| "submit" \| "reset"`                 | `"button"`  | Native type, defaulted deliberately    |
| `children`  | `ReactNode`                                       | -           | Label                                  |

Extends `React.ButtonHTMLAttributes<HTMLButtonElement>`.

## Variants

- `primary` - the single most important action in a view
- `secondary` - supporting actions, bordered, transparent background
- `ghost` - low emphasis, for dense toolbars
- `danger` - destructive actions

Each variant defines its own rest, hover, active and disabled appearance. All four share
one focus ring.

## Sizes

Three steps. Each sets height, horizontal padding, font size, gap and radius together.
Heights must match Input and Textarea exactly at the same size step, so controls line up
when placed side by side. This is a hard constraint on the token values.

## States

| State         | Behavior                                                        |
| ------------- | --------------------------------------------------------------- |
| default       | interactive                                                     |
| hover         | background shift per variant                                    |
| active        | pressed shift                                                   |
| focus-visible | shared focus ring, keyboard only                                |
| disabled      | reduced opacity, not focusable, no pointer events               |
| loading       | spinner replaces `leftIcon`, not focusable, label stays visible |

## Behavior

1. Defaults to `type="button"`. This is deliberate: the HTML default of `submit` causes
   accidental form submissions and is a classic source of bugs.
2. `loading` implies disabled for interaction purposes.
3. While loading, the label remains visible so the button does not change width.
4. `onClick` is not called when disabled or loading.
5. Icons are decorative and hidden from assistive tech; the label carries the name.
6. A button with only an icon and no children requires an `aria-label`.
7. Focus ring appears on keyboard focus only, never on mouse click.

## Implementation notes

- Variants live in `Button.variants.ts` using CVA with `defaultVariants`.
- Ref targets the `<button>` element.
- `disabled || loading` is computed once and applied to both the native attribute and
  the interaction guards.
- `aria-busy` is set while loading; the embedded Spinner must be hidden from assistive
  tech to avoid a double announcement.
- Icon slots wrap in a span with `aria-hidden` so consumers cannot accidentally leak
  icon text into the accessible name.

## Accessibility

- Pattern: native `<button>`. No ARIA button role, ever.
- Keyboard: Enter and Space activate, provided by the native element.
- Disabled uses the native attribute, which correctly removes it from tab order.
- Icon-only usage must be typed so the accessible name cannot be omitted. Consider a
  discriminated union: if `children` is absent, `aria-label` is required.
- Every variant must meet AA contrast in both themes, including hover and active
  backgrounds.

## Tokens used

`--pui-color-primary`, `--pui-color-primary-hover`, `--pui-color-primary-foreground`,
`--pui-color-danger` and its hover and foreground pairs, `--pui-color-border`,
`--pui-color-foreground`, radius scale, spacing scale, type scale, focus ring token.

## Tests

Baseline, plus:

- Each variant and size renders
- `onClick` fires normally, and does not fire when disabled or loading
- Loading shows a spinner and sets `aria-busy`
- Icons render in the correct slot and are hidden from the accessibility tree
- Icon-only button without a label fails type checking (type-level test)
- Renders inside a form without submitting it by default
- Keyboard activation with Enter and Space

## Documentation

- All four variants side by side, in both themes
- Loading and disabled states
- Icon usage: left, right, icon-only
- A composition story: Button next to Input at the same size, proving alignment
- Explicit guidance on when to use a link instead

## Open questions

- **Anchor rendering.** Should Button support rendering as `<a>` for navigation that
  looks like a button? Options: an `asChild` polymorphic pattern, an `as` prop, or a
  separate `LinkButton`. `asChild` is powerful but adds real complexity and would be the
  library's first Slot-style abstraction. Recommendation: defer for 0.1.0 and document
  that consumers should style a link themselves, then revisit.
- Should `loading` optionally replace the label with a spinner only, for narrow layouts?
- Is `ButtonGroup` needed for 0.1.0? Currently in the backlog.

## Definition of done

Standard checklist, plus:

- [ ] Imports and renders in a Next.js App Router **server** component page with no
      `"use client"` added by the consumer
- [ ] Patterns established here are recorded as the reference for later components
