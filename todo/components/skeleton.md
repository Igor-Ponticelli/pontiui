# Skeleton

**Status:** `[ ]` not started
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
4. Reduced motion disables the animation regardless of the prop, matching Spinner.
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

`--pui-color-border` or a dedicated `--pui-color-skeleton`, radius scale, motion
duration.

## Tests

- Each variant renders with expected shape semantics
- `lines` renders the correct count
- Hidden from the accessibility tree
- `animation: "none"` disables the animation

## Documentation

A realistic composition story: a card skeleton assembled from circle plus text
skeletons, next to the real card, so the mapping is obvious. Document the `aria-busy`
responsibility prominently.

## Open questions

- Should a `Skeleton.Group` exist that sets `aria-busy` automatically, or is that
  scope creep for 0.1.0?
- Pulse or shimmer as the default animation?

## Definition of done

Standard checklist from `_TEMPLATE.md`.
