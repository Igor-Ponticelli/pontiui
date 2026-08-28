# Text

**Status:** `[x]` implemented. Tested (Phase 3). Stories and the formal a11y
sign-off still pending - Phases 4 and 5.
**Phase:** 5
**Depends on:** typography tokens
**Blocked by:** nothing - the `as` question is resolved in D-25
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
| `as`        | `"p" \| "span" \| "h1"…"h6"`                                 | `"p"`       | Rendered element     |
| `size`      | `"xs"…"7xl"` (11 steps)                                      | `"md"`      | Type scale step      |
| `weight`    | `"regular" \| "medium" \| "semibold" \| "bold"`              | `"regular"` | Font weight          |
| `tone`      | `"default" \| "muted" \| "primary" \| "danger" \| "success"` | `"default"` | Semantic color       |
| `align`     | `"start" \| "center" \| "end"`                               | -           | Text alignment       |
| `truncate`  | `boolean`                                                    | `false`     | Single-line ellipsis |
| `lineClamp` | `number`                                                     | -           | Clamp to N lines     |
| `children`  | `ReactNode`                                                  | -           | Content              |

## Variants

`tone` is the variant axis. Each tone maps to one semantic color token.

## Sizes

Eleven steps: `xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl`. The four display steps
were added with this component; the plan originally called for six.

Each step sets font size, line height and letter spacing together. From `2xl` upward the
leading tightens and from `3xl` upward the tracking goes slightly negative, because large
text set with body ratios reads loose. Sizes come from `tokens.css`; the pairing of the
three per step lives in `Text.css`, since it is a typographic decision about this
component rather than a token.

## States

None.

## Behavior

1. Renders a `<p>` by default with the `md` size and `regular` weight.
2. `as` changes the element without changing the visual style. Visual and semantic
   levels are independent by design.
3. `truncate` clamps to one line with an ellipsis and requires a constrained width.
4. `lineClamp` clamps to N lines. **`lineClamp` wins** when both are set: a line count
   is the more specific instruction, and `truncate` is the sugar for the common case. A
   `lineClamp` of `0` or less is ignored, so `truncate` still applies.
   The line count reaches CSS as an inline custom property - the one sanctioned use of
   inline `style` under ST-1, since a line count cannot be a token. The consumer's own
   `style` is spread after it and therefore wins.
5. `tone` maps to semantic color tokens only, never to a raw color.

## Implementation notes

- The `as` prop is a restricted union (D-25), so props stay a plain interface. The cost
  is one documented cast on the ref: TypeScript resolves the JSX ref of a union of
  intrinsic tags to one concrete element type rather than to their common supertype. It
  is sound, since every member is an HTMLElement, and it is paid once here instead of by
  every consumer in the form of generic error messages.
- No margin by default, and the reset layer clears the user-agent margin on `h1`-`h6`
  explicitly, since the library ships no global reset (D-04).
- Multi-line clamping uses the `-webkit-` trio. There is still no unprefixed
  implementation with real support.

## Accessibility

- Heading semantics come from `as`, never from `size`. Document this prominently: it is
  the most likely misuse.
- Every tone must meet AA contrast against `--pui-color-surface` in both themes.
- Do not use `truncate` on content that carries essential meaning without providing the
  full text elsewhere.

## Tokens used

`--pui-font-sans`, `--pui-font-size-{xs…7xl}`, `--pui-font-weight-*`,
`--pui-line-height-{normal,tight}`, `--pui-letter-spacing-{normal,tight}`,
`--pui-color-foreground`, `--pui-color-muted-foreground`, `--pui-color-primary`,
`--pui-color-danger`, `--pui-color-success`.

Four tokens were added: `--pui-font-size-{4xl,5xl,6xl,7xl}`, for display and hero text.
Like the rest of the scale they derive from `--pui-font-size-base`, so the D-22 type axis
still moves all eleven steps together.

## Tests

- Default renders a paragraph
- `as` changes the element and preserves visual styling
- Each tone applies the correct semantic color
- `truncate` and `lineClamp` behave as specified
- **`lineClamp` wins when both are set, and a non-positive `lineClamp` falls back to
  `truncate`**
- A consumer `style` survives alongside the injected line-count property
- Ref forwards to the rendered element, for both a heading and a `span`

## Documentation

A type-scale story showing all sizes and weights together as a specimen sheet. A story
demonstrating that `size` and `as` are independent.

## Open questions

All resolved.

- ~~**`as` typing**~~ Restricted union of `p | span | h1…h6`. Recorded as **D-25**.
- ~~Should `truncate` and `lineClamp` be one prop instead of two?~~ Two. `truncate`
  reads better than `lineClamp={1}` and covers the overwhelmingly common case; merging
  them into one prop taking `number | "single"` trades a clear API for a clever one.
- ~~Is a separate `Heading` component clearer?~~ No. It duplicates every prop across two
  components and leaves `<span>` homeless, so the question only moves. See D-25.

## Definition of done

Standard checklist from `_TEMPLATE.md`.
