# Textarea

**Status:** `[?]` blocked
**Phase:** 7
**Depends on:** Input (must share the same API shape and internals where possible)
**Blocked by:** **D-12**, same as Input
**Client component:** yes

## Goal

A multi-line text control that mirrors Input's API exactly, so a consumer who knows one
knows the other. Divergence between these two is a smell.

## When not to use it

- For single-line input. Use Input.
- For rich text. Out of scope entirely.
- For code editing. Out of scope.

## Public API

Identical to Input where the concept applies (`label`, `hint`, `error`, `size`,
`fullWidth`, `required`, `disabled`, `readOnly`), plus:

| Prop         | Type                             | Default      | Description                             |
| ------------ | -------------------------------- | ------------ | --------------------------------------- |
| `rows`       | `number`                         | `3`          | Initial visible rows                    |
| `resize`     | `"none" \| "vertical" \| "both"` | `"vertical"` | User resize affordance                  |
| `autoResize` | `boolean`                        | `false`      | Grows with content                      |
| `maxRows`    | `number`                         | -            | Upper bound when auto-resizing          |
| `showCount`  | `boolean`                        | `false`      | Character counter, requires `maxLength` |

Extends `React.TextareaHTMLAttributes<HTMLTextAreaElement>`. No `size` collision here,
unlike Input.

## Variants

None. Same validation states as Input.

## Sizes

Same three steps, affecting padding and type size. Height comes from `rows`.

## States

Same as Input.

## Behavior

1. Same controlled and uncontrolled contract as Input.
2. Same label, hint, error and `aria-describedby` wiring as Input. Reuse the internal
   pieces rather than reimplementing (X-3).
3. `autoResize` recalculates height on input, capped by `maxRows`.
4. `autoResize` combined with a user `resize` affordance is contradictory. Decide
   whether `autoResize` forces `resize: "none"`.
5. `showCount` renders a live count. When `maxLength` is exceeded or approached, the
   counter changes appearance without relying on color alone.
6. Auto-resize must not cause layout thrash or scroll jumps while typing.

## Implementation notes

- Auto-resize is the only non-trivial part: reset height to auto, read `scrollHeight`,
  apply. It must run in a layout effect to avoid a visible flicker, and must handle the
  initial render, controlled updates, and window resize.
- If Input and Textarea both need label and error markup, extract it once into a shared
  internal piece. This is the intended second occurrence that triggers A-4.

## Accessibility

- Same contract as Input.
- The character counter must be announced politely, not on every keystroke. A live
  region that fires per character is worse than none. Consider announcing only near the
  limit, or not at all, and record the decision.
- Auto-resize must not move focus or the caret.

## Tokens used

Same as Input.

## Tests

Baseline, plus everything from Input's list, plus:

- `rows` sets the initial height
- `autoResize` grows with content and stops at `maxRows`
- `showCount` reflects the current length
- `resize` applies the requested affordance

## Documentation

Stories mirroring Input's, plus auto-resize in action. Document the interaction between
`autoResize` and `resize`.

## Open questions

- Depends on **D-12**.
- Should `autoResize` force `resize: "none"`?
- How should the counter be announced, if at all?

## Definition of done

Standard checklist, plus: Input and Textarea share their label and error implementation
rather than duplicating it.
