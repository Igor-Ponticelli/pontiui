# Message (Toast)

**Status:** `[?]` blocked
**Phase:** 9
**Depends on:** portal utility, Modal's SSR-safe mounting lessons
**Blocked by:** **D-14** - API shape, provider requirement, and public name
**Client component:** yes

## Goal

Transient, non-blocking feedback about the result of an action. Architecturally the
odd one out: it is triggered imperatively from anywhere in an application, which means
some form of shared state outside the React tree.

## When not to use it

- For errors the user must act on. Those belong inline, next to the cause.
- For critical confirmations. Use a Modal.
- For content the user might need to re-read. Toasts disappear.
- For validation errors on a form field. Those belong on the field.

## Public API (shape depends on D-14)

Assuming the imperative option:

```text
toast.success(message, options?)
toast.error(message, options?)
toast.info(message, options?)
toast.warning(message, options?)
toast.dismiss(id?)
```

Options: `title`, `description`, `duration`, `dismissible`, `action`, `id`.

Plus a render surface component:

| Prop       | Type         | Default          | Description                    |
| ---------- | ------------ | ---------------- | ------------------------------ |
| `position` | corner union | `"bottom-right"` | Where the stack appears        |
| `max`      | `number`     | `3`              | Visible toasts before queueing |
| `duration` | `number`     | `5000`           | Default auto-dismiss in ms     |
| `gap`      | token step   | `"sm"`           | Spacing between toasts         |

## Variants

`success`, `error`, `warning`, `info`. Each has a color and an icon slot. Since D-10
forbids bundling icons, decide whether the library ships tiny inline SVGs for these four
semantic cases or requires the consumer to supply them.

## Sizes

None. Width is constrained by a max-width token and shrinks on small viewports.

## States

entering, visible, paused (hover or focus), exiting, queued.

## Behavior

1. Calling a toast function displays a message without any React context in scope at
   the call site.
2. Auto-dismisses after `duration`. `duration: Infinity` persists until dismissed.
3. The timer pauses on hover and on keyboard focus, and resumes on leave.
4. Beyond `max`, toasts queue and appear as earlier ones dismiss.
5. Dismissible toasts have a close control with an accessible name.
6. An optional action button is focusable and dismisses on activation.
7. Toasts are keyboard reachable. Decide how: a dedicated hotkey (as Sonner does with
   F6), or normal tab order. Normal tab order in a corner region is often missed.
8. Errors announce assertively; everything else announces politely.
9. Stacking, entering and exiting animation respects reduced motion.
10. Safe to call during SSR without crashing, even though nothing renders.

## Implementation notes

- Module-level mutable state (a subscribable store) is required for the imperative API.
  This is the documented exception to guideline A-6 and must be justified in
  `DECISIONS.md` when D-14 is resolved.
- The store is framework-agnostic and subscribed to with `useSyncExternalStore`.
- The live region must exist in the DOM **before** a toast is added, otherwise nothing
  is announced. This is the single most common toast accessibility bug.
- Whether the render surface auto-mounts or must be placed by the consumer is part of
  D-14. Auto-mounting is friendlier but surprising and harder to position correctly.

## Accessibility

- Pattern: [Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) for errors, status
  role for the rest.
- Live region present on mount, not created on demand.
- `role="alert"` and `aria-live="assertive"` for errors; `role="status"` and
  `aria-live="polite"` otherwise.
- The auto-dismiss timer must pause on focus, otherwise a keyboard user can lose the
  toast mid-interaction. Toasts containing an action arguably should not auto-dismiss at
  all; decide this.
- Close controls need accessible names.
- Never the only channel for important information.

## Tokens used

Semantic status colors and their foregrounds, surface, shadow, radius, spacing,
`--pui-z-toast`, motion duration.

## Tests

Baseline, plus:

- Each toast type renders with the correct role and live-region politeness
- Auto-dismiss fires after the duration
- Timer pauses on hover and on focus
- Queue respects `max`
- Manual dismissal works, and by id
- Action button fires and dismisses
- Live region exists before the first toast is added
- Calling a toast function outside a React component works
- Reduced motion disables animation

## Documentation

All four types, with an action, persistent, and a realistic form-submission flow.
Document clearly when a toast is the wrong choice, since overuse is the norm.

## Open questions

- **D-14** covers the API shape, provider requirement and public name.
- Icons for the four semantic types: ship inline SVGs or require consumer-supplied?
- Keyboard access pattern: hotkey or tab order?
- Should toasts with an action ever auto-dismiss?

## Definition of done

Standard checklist, plus:

- [ ] Screen reader verification of announcements for all four types
- [ ] Module-level state justified and recorded in `DECISIONS.md`
- [ ] Works when called from outside React
