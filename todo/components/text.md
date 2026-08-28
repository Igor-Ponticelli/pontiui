# Text

**Status:** `[ ]` not started
**Phase:** 5
**Depends on:** typography tokens
**Blocked by:** open question below on the `as` prop
**Client component:** no

## Goal

The single entry point for rendering text with the library's type scale, so that font
size, weight, line height and color come from tokens instead of being re-specified in
every consumer. It also means a consumer never has to know the token names to get
consistent typography.

## When not to use it

- For headings that carry document structure, unless the `as` prop is used to render a
  real heading element. A visually large `span` is not a heading.
- To style a large block of rich content. Wrap and style once, do not wrap every node.
- When the consumer needs full typographic control. Plain elements plus tokens are fine.

## Public API

| Prop        | Type                                                         | Default     | Description          |
| ----------- | ------------------------------------------------------------ | ----------- | -------------------- |
| `as`        | element type                                                 | `"p"`       | Rendered element     |
| `size`      | `"xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl"`              | `"md"`      | Type scale step      |
| `weight`    | `"regular" \| "medium" \| "semibold" \| "bold"`              | `"regular"` | Font weight          |
| `tone`      | `"default" \| "muted" \| "primary" \| "danger" \| "success"` | `"default"` | Semantic color       |
| `align`     | `"start" \| "center" \| "end"`                               | -           | Text alignment       |
| `truncate`  | `boolean`                                                    | `false`     | Single-line ellipsis |
| `lineClamp` | `number`                                                     | -           | Clamp to N lines     |
| `children`  | `ReactNode`                                                  | -           | Content              |

## Variants

`tone` is the variant axis. Each tone maps to one semantic color token.

## Sizes

Six steps. Each step sets font size, line height and letter spacing together, defined
once in `tokens.css` so the ratios stay consistent.

## States

None.

## Behavior

1. Renders a `<p>` by default with the `md` size and `regular` weight.
2. `as` changes the element without changing the visual style. Visual and semantic
   levels are independent by design.
3. `truncate` clamps to one line with an ellipsis and requires a constrained width.
4. `lineClamp` clamps to N lines. `truncate` and `lineClamp` together is invalid;
   decide which wins.
5. `tone` maps to semantic color tokens only, never to a raw color.

## Implementation notes

- The `as` prop is the only genuinely tricky part. Fully generic polymorphic typing is
  verbose and produces poor error messages. See open questions.
- No margin by default. Spacing is the parent's responsibility, so the component
  composes predictably.

## Accessibility

- Heading semantics come from `as`, never from `size`. Document this prominently: it is
  the most likely misuse.
- Every tone must meet AA contrast against `--pui-color-surface` in both themes.
- Do not use `truncate` on content that carries essential meaning without providing the
  full text elsewhere.

## Tokens used

`--pui-font-sans`, the full `--pui-text-*` scale, `--pui-color-foreground`,
`--pui-color-muted`, `--pui-color-primary`, `--pui-color-danger`,
`--pui-color-success`.

## Tests

- Default renders a paragraph
- `as` changes the element and preserves visual styling
- Each tone applies the correct semantic color
- `truncate` and `lineClamp` behave as specified
- Ref forwards to the rendered element

## Documentation

A type-scale story showing all sizes and weights together as a specimen sheet. A story
demonstrating that `size` and `as` are independent.

## Open questions

- **`as` typing:** full polymorphic generics, a restricted union of allowed elements, or
  no `as` at all with separate `Heading` and `Text` components? A restricted union is
  the pragmatic middle ground. Needs a call before implementation.
- Should `truncate` and `lineClamp` be one prop instead of two?
- Is a separate `Heading` component clearer for consumers than `<Text as="h2">`?

## Definition of done

Standard checklist from `_TEMPLATE.md`.
