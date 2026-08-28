# Component Guidelines

Binding rules for every component in PontiUI. Rules are numbered so they can be cited
in reviews and by agents ("this violates ST-4").

If a rule blocks something that clearly needs doing, the rule is wrong. Do not work
around it silently: open the discussion, change the rule, note it in `DECISIONS.md`.

---

## TypeScript (TS)

- **TS-1** No `any`. Use `unknown` plus narrowing when a type is genuinely unknown.
- **TS-2** No `@ts-ignore`. `@ts-expect-error` is allowed only with a comment
  explaining why and a link to the upstream issue.
- **TS-3** Props interfaces are named `<Component>Props` and are exported.
- **TS-4** Props extend the underlying element's native props when the component
  renders a single DOM element: `extends React.ButtonHTMLAttributes<HTMLButtonElement>`.
- **TS-5** Use `import type` for type-only imports (`verbatimModuleSyntax` requires it).
- **TS-6** Prefer union literals over enums: `size?: "sm" | "md" | "lg"`.
- **TS-7** Variant prop types are union literals declared once and exported
  (`type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"`). Every member
  must have a matching `[data-pui-variant="..."]` rule in the component's CSS - an
  unstyled member is a bug the type system cannot catch, so it is a review item.
- **TS-8** Do not widen a prop type to accommodate one caller. Narrow types are the
  product.
- **TS-9** Never reference Node, Vitest or Storybook globals in `src/` files that ship.

---

## React (R)

- **R-1** Function components only. No class components.
- **R-2** Every component that renders a DOM element forwards its ref to that element.
- **R-3** Every component sets `displayName`.
- **R-4** Spread the rest of the props onto the underlying element, after the props you
  control, so consumers can pass `data-*`, `aria-*` and extra handlers.
- **R-5** `className` is always merged last through `cn()`, never overwritten or dropped.
- **R-6** A component with internal state that a consumer might want to drive must
  support both controlled and uncontrolled usage via `value`/`defaultValue` and
  `onChange` (use the shared `useControllableState` hook once it exists).
- **R-7** Do not call a consumer's handler and your own logic in an order that prevents
  the consumer from cancelling. Call theirs first, honor `event.defaultPrevented`.
- **R-8** No side effects at module scope. Nothing runs on import.
- **R-9** Any component using state, effects, refs, context or browser APIs starts with
  `"use client"` on line one. Purely presentational components must not have it.
- **R-10** Never read `window`, `document` or `localStorage` during render. Guard in
  effects or with an SSR-safe hook.
- **R-11** No `useEffect` where a derived value or an event handler would do.

---

## Architecture (A)

- **A-1** One component per folder under `src/components/<Component>/`.
- **A-2** Required files: `<Component>.tsx`, `<Component>.css`, `index.ts`. Add
  `<Component>.types.ts` when types exceed roughly 30 lines.
- **A-3** Tests and stories live beside the component, not in a separate top-level tree.
- **A-4** Logic reused by two or more components moves to `src/hooks/` or `src/utils/`.
  Two occurrences is the threshold. **Do not abstract on the first occurrence.**
- **A-5** No barrel imports between components. Import the sibling directly
  (`../Spinner`), never through `src/index.ts`, to avoid circular dependencies.
- **A-6** No global mutable state except where a component genuinely requires it
  (the toast queue). Such state must be documented in the component plan.
- **A-7** No component reaches into another component's internals. If two components
  need to share behavior, extract a hook.
- **A-8** Do not introduce a new top-level folder under `src/` without recording the
  decision in `DECISIONS.md`.

---

## Naming (N)

- **N-1** Components: `PascalCase`. Files match the component name exactly.
- **N-2** Hooks: `useCamelCase`, one hook per file, file named after the hook.
- **N-3** Utilities: `camelCase`.
- **N-4** Boolean props read as a state, not a command: `disabled`, `loading`,
  `fullWidth`. Never `isDisabled` or `setLoading`.
- **N-5** Event props are `on<Event>`: `onClose`, `onOpenChange`.
- **N-6** Size scale is always `sm | md | lg`, defaulting to `md`. Extend only outward
  (`xs`, `xl`), never rename.
- **N-7** Visual variants use the same vocabulary library-wide: `primary`, `secondary`,
  `ghost`, `danger`. A component may support a subset, never a synonym.
- **N-8** Styling data attributes are `data-pui-<name>`, covering variant, size and
  state alike: `data-pui-variant`, `data-pui-size`, `data-pui-loading`. The prefix is
  load-bearing, not decoration - rest props are spread onto the same element (R-4), so an
  unprefixed `data-size` passed by a consumer for their own purposes would silently
  restyle the component.
- **N-9** CSS custom properties are `--pui-<category>-<name>`.

---

## Exports (E)

- **E-1** `src/index.ts` is the only public surface. Nothing else is importable.
- **E-2** Export the component and its props type, always both.
- **E-3** Named exports only. No default exports anywhere in `src/`.
- **E-4** Do not export internal helpers, variant objects or hooks unless they are a
  deliberate part of the public API and documented as such.
- **E-5** Adding an export is a `minor`. Removing or renaming one is a `major`.
- **E-6** Compound components attach subcomponents as static properties
  (`Modal.Header`) and both the parent and each part are exported types.

---

## Composition (C)

- **C-1** Prefer composition over configuration. A `<Modal.Footer>` beats a
  `footerContent` prop.
- **C-2** Do not add a prop that only reorders or restyles children. Let the consumer
  compose.
- **C-3** A component should do one thing. If a plan lists two unrelated
  responsibilities, split it.
- **C-4** Do not accept a `render<Something>` prop where `children` would work.
- **C-5** Wrapper components that exist only to pass props through are not allowed.

---

## Styling (ST)

Governed by D-19 (hand-authored CSS), D-20 (data attributes), D-21 (Lightning CSS),
D-22 (scaling axes) and D-23 (cascade layers). Read those before arguing with a rule here.

- **ST-1** All styling is hand-authored CSS in `<Component>.css`, beside the component.
  No utility framework, no CSS Modules, no styled-components, no inline `style` except
  for genuinely dynamic values (a computed transform, a user-supplied token override).
- **ST-2** A component emits exactly **one** class: `pui-<component>`, in kebab-case.
  Subelements that need styling get their own single class (`pui-modal-header`). Never
  two classes on one element to express one thing.
- **ST-3** Variants, sizes and states are **data attributes**, selected in CSS:
  `.pui-button[data-pui-variant="primary"]` (N-8). Never build class strings in
  TypeScript, with template literals or otherwise.
- **ST-4** **No hardcoded design values.** Never `color: #7c3aed`, `padding: 13px`,
  `border-radius: 6px`. Every color, space, radius, shadow, font size and duration is a
  `var(--pui-*)`. If the token does not exist, add it to `tokens.css` first. Enforced by
  Stylelint - if you find yourself wanting to disable that rule, the answer is a new
  token, not an exception.
- **ST-5** No literal value as a shortcut around a missing token. This is ST-4 restated
  because it is the rule most likely to be broken at seven in the evening.
- **ST-6** Every selector starts with the component's own class. No element selectors
  (`button { }`), no global selectors, no styling of a child the component did not
  render. A component styles itself and its own subtree, nothing else.
- **ST-7** No `!important` in library code. Cascade layers (ST-12) make it unnecessary;
  reaching for it means a selector is wrong.
- **ST-8** Do not ship a global reset. Each component declares the resets it needs in
  `@layer pui.reset`, scoped to its own class (`.pui-button { appearance: none; }`).
- **ST-9** Respect `prefers-reduced-motion` on anything that animates.
- **ST-10** Focus styling uses the shared focus-ring declaration, identical across all
  components. Never remove focus visibility without an equivalent replacement.
- **ST-11** Dark theme is expressed only through token values under
  `[data-pui-theme="dark"]`. Components must not contain dark-mode conditionals, and a
  component stylesheet must never mention a color that is not a token.
- **ST-12** All library CSS lives inside `@layer pui.tokens`, `@layer pui.reset`,
  `@layer pui.base` or `@layer pui.components`. Nothing is emitted outside a layer,
  because unlayered CSS beats layered CSS and would take the override guarantee in D-23
  away from consumers. The build asserts the emitted order and fails if it changes.
- **ST-13** Specificity ceiling: one class plus attributes. If a rule needs more, the
  markup needs a class, not the selector more weight.

---

## Accessibility (A11Y)

- **A11Y-1** Use the native element first. Only reach for ARIA when no native element
  expresses the semantics.
- **A11Y-2** Every interactive element is reachable and operable by keyboard.
- **A11Y-3** Visible focus indicator on every focusable element.
- **A11Y-4** Never set `tabindex` greater than zero.
- **A11Y-5** Icon-only controls require an accessible name via `aria-label`. Make the
  prop required in TypeScript when the control can be icon-only.
- **A11Y-6** Disabled state uses the native `disabled` attribute for form controls;
  `aria-disabled` only where the element must remain focusable.
- **A11Y-7** Overlays manage focus: move focus in on open, trap it, restore it to the
  trigger on close.
- **A11Y-8** Asynchronous status changes are announced through a live region.
- **A11Y-9** Color is never the only carrier of meaning.
- **A11Y-10** Target semantic color pairs at WCAG AA contrast (4.5:1 for text,
  3:1 for large text and UI boundaries).
- **A11Y-11** Do not invent ARIA. Follow the matching WAI-ARIA Authoring Practices
  pattern and link it in the component plan.

---

## Testing (T)

- **T-1** Test behavior, not implementation. Never assert on CSS classes.
- **T-2** Query by role and accessible name first. `data-testid` is a last resort and
  requires a comment justifying it.
- **T-3** Simulate interaction with `user-event`, not `fireEvent`.
- **T-4** Every component covers: renders with defaults, forwards its ref, merges
  `className`, spreads unknown props, and honors its disabled state.
- **T-5** Every interactive component has a keyboard test.
- **T-6** Every stateful component is tested in both controlled and uncontrolled modes.
- **T-7** Every component has an axe assertion on its default render.
- **T-8** Every fixed bug gets a regression test in the same change.
- **T-9** No snapshot tests of rendered markup. They break on refactors and prove
  nothing.
- **T-10** Coverage is a signal, not a target. Untested branches in interaction logic
  matter; untested prop pass-through does not.

---

## Documentation (D)

- **D-1** Every exported prop has a TSDoc comment. It appears in the consumer's editor
  and in the Storybook prop table.
- **D-2** Every component has a story file with, at minimum: `Default`, one story per
  variant, one per size, and one per state.
- **D-3** Every component plan's "when not to use this" section makes it into the docs.
- **D-4** Code examples in docs must be copy-pasteable and actually compile.
- **D-5** Update the component status table in the root `README.md` when a component
  ships.
- **D-6** Document the accessibility contract: what the component handles for you and
  what the consumer is still responsible for.

---

## Dependencies (DEP)

- **DEP-1** Adding any runtime dependency requires an entry in `DECISIONS.md` with
  bundle size, maintenance status and the alternative that was rejected.
- **DEP-2** Anything that must be a singleton in the consumer's app is a
  `peerDependency`, not a `dependency`.
- **DEP-3** Tooling is a `devDependency` and must never appear in `dist/`.
- **DEP-4** No dependency for something under roughly 40 lines of straightforward code.
- **DEP-5** No icon library dependency. Icons are passed in by the consumer as
  `ReactNode`.
- **DEP-6** No polyfills. Target modern browsers and document the baseline.

---

## Cross-component consistency (X)

- **X-1** The same concept uses the same prop name everywhere. Check two existing
  components before naming a new prop.
- **X-2** Identical states look identical across components: disabled, loading, invalid
  and focused must be visually consistent.
- **X-3** Shared behavior uses the shared hook. Do not write a second focus trap.
- **X-4** A new component must not require changes to an existing component's public
  API. If it does, that is a separate change with its own review.
- **X-5** Before implementing, read the two most similar existing components and follow
  their structure.

---

## Changing an existing component (M)

- **M-1** Additive changes only, unless a breaking change is explicitly approved.
- **M-2** New props are optional and default to current behavior.
- **M-3** Changing a default value is a breaking change.
- **M-4** Renaming or removing a token is a breaking change.
- **M-5** Deprecate before removing: mark with TSDoc `@deprecated`, keep it working for
  at least one minor release, then remove in a major.
- **M-6** Any change to a component requires updating its plan, tests, stories and a
  changeset in the same pull request.
- **M-7** Refactors that change no behavior must not change any test. If tests need
  changes, it was not a refactor.

---

## Hard stops

Do not do any of the following without an explicit, recorded decision:

1. Add a runtime dependency.
2. Introduce a second styling mechanism.
3. Change the build, `exports` map or `tsconfig`.
4. Change the token naming scheme, the `pui` class prefix or the data-attribute convention.
5. Add a required provider or context that components need in order to render.
6. Break an existing public API.
7. Add a new top-level folder under `src/`.
8. Disable a lint rule, a type check or a failing test instead of fixing the cause.
