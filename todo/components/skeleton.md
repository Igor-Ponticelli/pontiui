# Skeleton

**Status:** `[x]` implemented and tested. Stories and the formal a11y sign-off
still pending - Phases 4 and 5.
**Phase:** 5
**Depends on:** radius and color tokens
**Blocked by:** nothing
**Client component:** no

## Goal

Placeholder shapes that occupy the same space as the content still loading, preventing
layout shift and communicating structure before data arrives.

## When not to use it

- When the shape of the content is unknown. A spinner is more honest.
- For very fast loads. Skeletons that flash are worse than a brief blank.
- As a permanent empty state. Empty and loading are different things.

## Public API

| Prop        | Type                             | Default     | Description                                  |
| ----------- | -------------------------------- | ----------- | -------------------------------------------- |
| `variant`   | `"text" \| "circle" \| "rect"`   | `"text"`    | Placeholder shape                            |
| `width`     | `string \| number`               | -           | CSS width                                    |
| `height`    | `string \| number`               | -           | CSS height                                   |
| `lines`     | `number`                         | `1`         | Number of stacked lines, `text` variant only |
| `animation` | `"pulse" \| "none"`              | `"pulse"`   | Animation style                              |
| `radius`    | `"sm" \| "md" \| "lg" \| "full"` | per variant | Corner radius override                       |

## Variants

- `text` derives its height from the line height so it matches real text.
- `circle` forces a 1:1 aspect ratio and a full radius, for avatars.
- `rect` is a generic block for images and cards.

## Sizes

No size scale. Dimensions come from `width` and `height`, or from the parent.

## States

None.

## Behavior

1. Renders a shape of the given dimensions with a subtle animated background.
2. `lines` greater than one renders that many stacked lines with consistent spacing, and
   the last line is shortened to look like natural text.
3. `animation: "none"` renders a static placeholder.
4. Reduced motion disables the animation regardless of the prop. **This deliberately
   differs from Spinner, which keeps pulsing.** The governing rule, recorded while
   implementing this component: _motion is removed under reduced motion unless the
   motion is itself the information_. A spinner that stops has lost the only thing it
   communicates; a skeleton that stops has lost nothing, because the shape is the
   message and the shape is still there.
5. Contains no text and is never announced individually.

## Implementation notes

- `width` and `height` are the one legitimate use of inline `style` (ST-1 exception),
  since they are arbitrary consumer values and cannot come from tokens.
- The animation is a background-position or opacity keyframe, not a layout-affecting
  property, to avoid jank.

## Accessibility

- Individual skeletons are `aria-hidden="true"`. Announcing "loading" a dozen times is
  noise.
- The **container** communicates loading via `aria-busy="true"` and, when appropriate, a
  single live region. This is the consumer's responsibility, and must be documented
  explicitly as part of the accessibility contract.
- Contrast is deliberately low, which is acceptable because the element carries no
  information.

## Tokens used

`--pui-color-skeleton`, `--pui-radius-{sm,md,lg,full}`, `--pui-space-{2,10,16}`,
`--pui-duration-pulse`, `--pui-easing-standard`.

Two tokens were added. `--pui-color-skeleton` got its own role rather than reusing
`--pui-color-border`, so a consumer can tune loading surfaces without moving every
border. `--pui-duration-pulse` (1600ms) is shared with Spinner's reduced-motion
fallback, which previously ran at `--pui-duration-slow` - a ~1.5 Hz opacity cycle that
read as flashing, which is the opposite of what a reduced-motion fallback is for.

Height for the `text` variant is `1em`, not a token: the point is that it follows the
surrounding font size so the placeholder lines up with the text it replaces.

## Tests

- Each variant renders with expected shape semantics
- `lines` renders the correct count, and is ignored on non-text variants
- The last line of a stack is shorter than the others
- Hidden from the accessibility tree, and contributes no text content even inside an
  `aria-busy` container
- `animation: "none"` disables the animation
- Arbitrary `width` / `height` pass through, and a consumer `style` survives beside them
- Forwards its ref, merges a consumer `className`, spreads unknown props

## Documentation

A realistic composition story: a card skeleton assembled from circle plus text
skeletons, next to the real card, so the mapping is obvious. Document the `aria-busy`
responsibility prominently.

## Open questions

All resolved during implementation.

- ~~Should a `Skeleton.Group` exist that sets `aria-busy` automatically?~~ No, and not
  only for scope. Its entire job would be to set one attribute on an element the consumer
  already owns, which is the wrapper C-5 rules out. The `aria-busy` responsibility is
  documented on the component instead.
- ~~Pulse or shimmer as the default animation?~~ Pulse. Opacity animates on the
  compositor; a shimmer animates `background-position` and repaints. On a page showing
  twenty placeholders that difference is the entire cost. A shimmer would also need a
  gradient that no single token can express.
- ~~Reduced motion follows Spinner's pulse.~~ **Corrected.** That note was written while
  implementing Spinner, before this component had been analysed, and it was wrong.
  Skeleton stops instead. See Behaviour 4 for the rule that separates them.
- ~~The prop controlling assistive-technology exposure is named `decorative`.~~ Not
  applicable: a skeleton carries no information in any configuration, so it is
  unconditionally `aria-hidden` and needs no prop at all. The naming rule stands for
  components where the choice exists.

## Definition of done

Standard checklist from `_TEMPLATE.md`.
