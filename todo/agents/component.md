# Component Agent

Implements a component from its plan.

## Inputs

- `todo/components/<name>.md`
- `COMPONENT_GUIDELINES.md`
- `DECISIONS.md` (all open items relevant to this component must be `Decided`)
- The two most similar existing components, read before writing anything

## Outputs

```text
src/components/<Component>/
├── <Component>.tsx
├── <Component>.css             styles, in @layer pui.components
├── <Component>.types.ts        only when types exceed ~30 lines
└── index.ts
```

Plus an export added to `src/index.ts` (component and props type), and new tokens added
to `src/styles/tokens.css` if the design needs a value that does not exist yet.

## Does

- Implements exactly the API described in the plan.
- Writes hand-authored CSS, maps variants to data attributes, uses semantic tokens for
  every visual value (D-19, D-20).
- Forwards refs, sets `displayName`, spreads rest props, merges `className` last.
- Adds `"use client"` only if the component uses client-only React features.
- Writes TSDoc on every public prop while writing the prop, not afterwards.
- Extracts a hook only when the same logic already exists in another component (A-4).

## Does not

- Write tests. That is stage 2.
- Write stories or documentation. That is stage 4.
- Add props not in the plan. Propose them by updating the plan first.
- Add a runtime dependency.
- Modify another component.
- Touch the build, `package.json`, `tsconfig`, the token prefix or the layer order.
- Create an abstraction for a single use case.

## Checklist before handoff

- [ ] Every prop in the plan is implemented; nothing extra was added
- [ ] Ref forwarded to the correct element, `displayName` set
- [ ] Rest props spread; `className` merged through `cn()` last
- [ ] No hardcoded colors, spacing, radii, durations (ST-4)
- [ ] Exactly one `pui-` class on the element; variants and sizes are data attributes
- [ ] Every rule is inside a `pui.*` layer and starts with the component's own class
- [ ] Focus ring uses the shared focus-ring declaration
- [ ] `pnpm lint:css` passes (ST-4 is enforced there, not in review)
- [ ] `"use client"` present if and only if required
- [ ] Controlled and uncontrolled both work, if the component is stateful
- [ ] TSDoc on every exported prop
- [ ] `pnpm typecheck` passes
- [ ] Exported from `src/index.ts` with its props type
- [ ] Plan updated if the implementation diverged

## Common failure modes to avoid

- Adding a "flexible" prop nobody asked for.
- Reimplementing a hook that already exists in `src/hooks/`.
- Writing a literal value because the token was missing, instead of adding the token.
- Adding a second class to express a variant that belongs in a data attribute.
- Swallowing the consumer's event handler instead of calling it first.
- Marking a purely presentational component as a client component out of habit.
