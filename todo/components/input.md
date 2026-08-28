# Input

**Status:** `[?]` blocked
**Phase:** 7
**Depends on:** Button (size alignment), form token set
**Blocked by:** **D-12** - does a form control own its label and error text?
**Client component:** yes

## Goal

A single-line text control that is consistent with the rest of the library, works with
form libraries through a forwarded ref, and communicates validation state accessibly.

Nothing here can be implemented until D-12 is resolved, because the answer changes the
entire prop surface. The API below assumes option B (batteries included) and must be
revised if A is chosen.

## When not to use it

- For multi-line input. Use Textarea.
- For choosing from a fixed set of options. That is a Select, out of scope for 0.1.0.
- For search with suggestions. That is a Combobox, out of scope.

## Public API (assumes D-12 resolves to B)

| Prop         | Type                   | Default | Description                                  |
| ------------ | ---------------------- | ------- | -------------------------------------------- |
| `label`      | `string`               | -       | Visible label, associated automatically      |
| `hint`       | `string`               | -       | Helper text below the control                |
| `error`      | `string`               | -       | Error message; presence implies invalid      |
| `size`       | `"sm" \| "md" \| "lg"` | `"md"`  | Control size, matches Button                 |
| `leftAddon`  | `ReactNode`            | -       | Content inside the control, before the input |
| `rightAddon` | `ReactNode`            | -       | Content inside the control, after the input  |
| `fullWidth`  | `boolean`              | `true`  | Stretches to the container                   |
| `required`   | `boolean`              | `false` | Native required plus a visual marker         |
| `disabled`   | `boolean`              | `false` | Native disabled                              |
| `readOnly`   | `boolean`              | `false` | Native read-only                             |

Extends `React.InputHTMLAttributes<HTMLInputElement>` minus `size`, which collides with
the native numeric `size` attribute. That collision must be handled explicitly with
`Omit`, and documented.

## Variants

No visual variants. Validation state is the only axis that changes appearance.

## Sizes

Three steps whose heights match Button exactly at each step.

## States

default, hover, focus, filled, disabled, read-only, invalid. Invalid must be
distinguishable without relying on color alone (A11Y-9): an icon or the error text
itself carries the meaning.

## Behavior

1. Works controlled (`value` plus `onChange`) and uncontrolled (`defaultValue`).
2. Generates a stable id when none is supplied, and associates the label with it.
   Must be SSR-safe: use React's `useId`, never a random value.
3. `hint` and `error` are wired through `aria-describedby`. When both are present,
   both are referenced, error first.
4. `error` sets `aria-invalid="true"`.
5. Disabled removes the control from tab order; read-only keeps it focusable and
   copyable.
6. Addons are decorative and never focusable. An interactive element inside the control
   (a password reveal toggle) is a separate concern; decide whether to support it.
7. The whole control shows the focus ring when the inner input is focused, not just the
   input element.

## Implementation notes

- Ref targets the `<input>`, not the wrapper. Form libraries need the actual control.
- The wrapper carries the border and focus styling; `focus-within` drives it.
- The native `size` attribute collision is the single most likely implementation trap.

## Accessibility

- Every input has a programmatically associated label. A placeholder is not a label,
  and this must be stated in the docs.
- `aria-invalid` and `aria-describedby` wired as described.
- Error text must be announced when it appears. Decide whether the error region is a
  live region, or whether announcement is left to the consumer's form library. This
  choice must be recorded.
- Required fields are marked both visually and via the native attribute.

## Tokens used

Border, surface, foreground, muted, danger, focus ring, radius, spacing, type scale.

## Tests

Baseline, plus:

- Controlled and uncontrolled both work
- Label is associated with the control (query by label text)
- `error` sets `aria-invalid` and is referenced by `aria-describedby`
- `hint` and `error` together are both referenced
- Disabled and read-only behave differently and correctly
- Ref reaches the input element
- Works inside React Hook Form (integration test)

## Documentation

Every state in both themes. A form composition story with Button. Explicit note that a
placeholder is not a label.

## Open questions

- Depends entirely on **D-12**.
- Should interactive addons (a reveal-password button) be supported in 0.1.0?
- Should the error region be a live region by default?
- Character counter: here, or only on Textarea?

## Definition of done

Standard checklist, plus verified integration with React Hook Form.
