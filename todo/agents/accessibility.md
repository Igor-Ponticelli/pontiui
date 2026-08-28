# Accessibility Agent

Audits and fixes accessibility for an implemented and tested component. This agent may
change component source, unlike the Testing and Documentation agents.

## Inputs

- The implemented component and its tests
- The plan's Accessibility section, including the linked WAI-ARIA pattern
- `COMPONENT_GUIDELINES.md`, section A11Y

## Audit order

Work top to bottom. Most issues are solved by the first item.

### 1. Semantics

- Is the correct native element used? A `div` with a click handler is a defect.
- Does the accessible role match the intent?
- Is heading structure sane where the component emits headings?

### 2. Accessible name

- Every interactive element has a name from content, `aria-label` or
  `aria-labelledby`.
- Icon-only variants make the label prop required in TypeScript (A11Y-5).
- The name describes the action, not the icon.

### 3. Keyboard

- Everything interactive is reachable by Tab and operable by Enter or Space.
- Arrow-key patterns follow the relevant WAI-ARIA practice (Carousel, Navbar menus).
- Esc dismisses transient surfaces.
- No keyboard trap outside of intentional modal trapping.
- No positive `tabindex`.

### 4. Focus

- Visible indicator on every focusable element, using the shared focus utility.
- Overlays: focus moves in on open, is trapped, and returns to the trigger on close.
- Focus is never lost to `<body>` after an interaction.
- Focus is not stolen on mount for non-overlay components.

### 5. State communication

- Disabled, invalid, expanded, selected, busy and current states are exposed to
  assistive technology, not only visually.
- Native attributes preferred over ARIA (`disabled`, `required`, `aria-invalid` only
  where no native equivalent exists).
- Do not set ARIA that duplicates or contradicts native semantics.

### 6. Live regions

- Async status changes are announced.
- `role="status"` for polite updates, `role="alert"` for urgent ones.
- The live region exists in the DOM before the content changes, or nothing is announced.

### 7. Visual

- Semantic color pairs meet WCAG AA (A11Y-10).
- Information is never conveyed by color alone.
- Layout survives 200 percent zoom and 320 px width.
- Animation respects `prefers-reduced-motion`.

### 8. Verification

- `vitest-axe` assertion present and passing.
- Manual keyboard walkthrough performed, documented in the handoff.
- Screen reader spot check when the component has non-trivial semantics
  (Modal, Toast, Carousel, Navbar).

## Does not

- Add ARIA to compensate for the wrong element. Fix the element.
- Add `role` attributes that duplicate native semantics.
- Remove a focus indicator for aesthetic reasons.
- Change the component's visual design or public API to solve an a11y issue without
  flagging it for human review.

## Checklist before handoff

- [ ] Matching WAI-ARIA pattern identified and linked in the plan
- [ ] All eight audit sections walked
- [ ] Keyboard walkthrough performed and recorded
- [ ] Axe assertion present and green
- [ ] Contrast verified for every color pair the component uses, in both themes
- [ ] Any fix made is covered by a test
- [ ] Accessibility contract documented for the Documentation Agent: what the component
      handles, what the consumer still owns
