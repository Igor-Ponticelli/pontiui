# Modal

**Status:** `[?]` blocked
**Phase:** 8
**Depends on:** `useControllableState`, `useLockBodyScroll`, portal utility, and
`useFocusTrap` only if D-13 resolves against native `<dialog>`
**Blocked by:** **D-13** - native `<dialog>` or custom portal
**Client component:** yes

## Goal

A focus-managed dialog that interrupts the user for a decision or a focused task. This
is the hardest component in the library and the one where a shortcut is most visible to
users of assistive technology.

## When not to use it

- For non-critical information. Use a Toast.
- For content the user needs alongside the page. Modals hide context.
- For long forms. A dedicated page is almost always better.
- Stacked on another modal. Nested modals are a design failure; the library will not
  optimize for them.

## Public API

| Prop                  | Type                             | Default         | Description                                            |
| --------------------- | -------------------------------- | --------------- | ------------------------------------------------------ |
| `open`                | `boolean`                        | -               | Controlled open state                                  |
| `defaultOpen`         | `boolean`                        | `false`         | Uncontrolled initial state                             |
| `onOpenChange`        | `(open: boolean) => void`        | -               | Fires on any open or close                             |
| `size`                | `"sm" \| "md" \| "lg" \| "full"` | `"md"`          | Panel width                                            |
| `title`               | `string`                         | -               | Accessible name; required unless `aria-label` is given |
| `description`         | `string`                         | -               | Accessible description                                 |
| `closeOnEsc`          | `boolean`                        | `true`          | Esc dismisses                                          |
| `closeOnOverlayClick` | `boolean`                        | `true`          | Clicking the backdrop dismisses                        |
| `initialFocus`        | `RefObject<HTMLElement>`         | -               | Element focused on open                                |
| `container`           | `HTMLElement`                    | `document.body` | Portal target                                          |
| `children`            | `ReactNode`                      | -               | Panel content                                          |

Subcomponents: `Modal.Header`, `Modal.Body`, `Modal.Footer`, `Modal.Close`.

Composition is preferred over content props (C-1). `title` exists as a convenience and
for the accessible name; a consumer using `Modal.Header` supplies their own markup.
Resolve how those two interact before implementing.

## Variants

None. `size` is the only axis.

## Sizes

Four steps. `full` occupies the viewport with a small inset, for mobile.

## States

closed, opening, open, closing. Transition states exist only if animation is supported;
decide whether 0.1.0 animates at all.

## Behavior

1. Controlled and uncontrolled both supported through `useControllableState`.
2. On open: focus moves into the panel, to `initialFocus` if supplied, otherwise the
   first focusable element, otherwise the panel itself.
3. Focus is trapped while open. Tab from the last element wraps to the first.
4. On close: focus returns to the element that was focused before opening.
5. Esc closes when `closeOnEsc`, and the event does not escape to the page.
6. A click that both starts and ends on the backdrop closes it. A drag that starts
   inside the panel and releases on the backdrop must **not** close it. This is a
   classic bug and needs an explicit test.
7. Body scroll is locked while open and restored on close, without layout shift from the
   disappearing scrollbar.
8. Content outside the modal is inert or hidden from assistive technology.
9. Nothing renders on the server. Mounting must be SSR-safe with no hydration mismatch.
10. Multiple modals open simultaneously is undefined behavior; document it.

## Implementation notes

- Everything hinges on D-13. Native `<dialog>` with `showModal()` provides focus
  trapping, top-layer stacking, backdrop and inertness for free, which removes the
  riskiest code from the library. The custom route gives finer control over animation
  and styling.
- Scroll lock must compensate for scrollbar width to avoid a horizontal jump.
- Portal must render only after mount to stay SSR-safe.
- The panel is the ref target.

## Accessibility

- Pattern: [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
  Follow it exactly.
- `role="dialog"` and `aria-modal="true"`, or the equivalents supplied by native
  `<dialog>`.
- Accessible name via `aria-labelledby` pointing at the title, or `aria-label`.
- `aria-describedby` for the description when present.
- Focus management as described in Behavior, items 2 through 4.
- Background content inert while open.
- Reduced motion respected by any transition.

## Tokens used

Surface, foreground, border, overlay backdrop color, shadow, radius, spacing, z-index.
New tokens needed: `--pui-z-modal`, `--pui-color-overlay`.

## Tests

Baseline, plus:

- Opens and closes in controlled and uncontrolled modes
- Focus moves into the panel on open
- `initialFocus` is honored
- Tab wraps within the panel in both directions
- Focus returns to the trigger on close
- Esc closes, and does not close when `closeOnEsc` is false
- Backdrop click closes
- **Drag from inside the panel releasing on the backdrop does not close**
- Body scroll is locked and released
- Correct accessible name from `title`
- Axe check while open
- No hydration warning when server rendered

## Documentation

Basic dialog, confirmation dialog with a destructive action, form inside a modal, and a
long-scrolling modal. Document the accessibility contract: what the modal handles versus
what the consumer owns (the trigger, and returning focus if the trigger unmounts).

## Open questions

- **D-13** must be resolved first.
- Does `title` coexist with `Modal.Header`, or does one replace the other?
- Animation in 0.1.0, or a hard cut?
- Is `Modal.Close` needed, given the consumer can call `onOpenChange`?

## Definition of done

Standard checklist, plus:

- [ ] Manual screen reader pass performed and recorded
- [ ] Verified in Next.js with no hydration mismatch
- [ ] Drag-release-on-backdrop case explicitly tested
