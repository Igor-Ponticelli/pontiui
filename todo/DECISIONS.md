# Decisions

Two sections: decisions already made (with the reasoning, so they can be revisited
honestly) and decisions still open (which block specific work).

Never resolve an open decision inside a component plan or in code. Resolve it here
first, change the status to `Decided`, then reference the ID.

---

## Decided

### D-01 - Distribution model: precompiled CSS `[decided]`

PontiUI ships `dist/styles.css`, compiled by Tailwind at build time. Consumers import
it once and do not need Tailwind themselves.

_Rejected:_ shipping source and letting the consumer's Tailwind scan `node_modules`.
It forces the consumer onto the same Tailwind major version and onto Tailwind at all.

_Cost accepted:_ the stylesheet contains every utility used by the whole library, not
only by the components a given consumer imports. There is no clean fix for this today.
Estimated at well under 20 kB minified for eleven components.

### D-02 - Class prefix: `pui` `[decided]`

`@import "tailwindcss" prefix(pui)`. Every emitted class is `pui:flex`, every theme
variable is `--pui-*`. This is the primary defense against collisions with the
consumer's own Tailwind, whose scale values may differ from ours.

_Cost accepted:_ slightly noisier class strings in source.

### D-03 - Two-tier design tokens `[decided]`

Primitive tokens (`--color-brand-500`) feed semantic tokens (`--color-primary`).
Components reference **only** semantic tokens. Rebranding is then a matter of
redefining a handful of semantic variables.

### D-04 - No Preflight `[decided]`

The library imports only the `theme` and `utilities` layers. Tailwind's global reset is
not shipped, because it would alter elements the library does not own.

_Cost accepted:_ each component applies its own resets as utilities.

### D-05 - React + TypeScript `[decided]`

Types are a core part of the product. React 18+ as a peer dependency.

### D-06 - Build tool: tsdown `[decided]`

`tsup` is no longer maintained and points users to `tsdown`, which is Rolldown-based
and keeps a compatible configuration surface.

### D-07 - Output format: ESM and CJS `[decided]`

Dual output for the first release. ESM-only is cleaner but still breaks some Jest and
older tooling setups. Revisit at `1.0.0`.

### D-08 - Per-module output rather than a single bundle `[decided]`

Required to preserve per-file `"use client"` directives, and it lets the consumer's
bundler drop unused components. A single-bundle build with a global `"use client"`
banner would force every component onto the client, including ones that could render on
the server (`Text`, `Divider`, `Skeleton`).

### D-09 - Optional ThemeProvider `[decided]`

Theming works through plain CSS custom properties. A `ThemeProvider` exists only for
dark-mode switching and runtime token injection, and is never required for a component
to render. Requiring a provider to render a button is unnecessary friction.

### D-10 - No icon dependency `[decided]`

Icons are `ReactNode` props supplied by the consumer. Bundling an icon set would add
weight and impose a choice on every user.

---

## Open

### D-11 - npm package name `[open]` - blocks Phase 13

Is `pontiui` available on npm, or do we publish as `@ponticelli/pontiui`?

Run `npm view pontiui`. A `404` means it is free. The answer changes the `name` field,
whether `publishConfig.access: "public"` is required, and every install snippet in the
docs.

**Decide before:** the first publish. Ideally now, to avoid rewriting documentation.

### D-12 - Does a form control own its label and error text? `[open]` - blocks Phase 7

Two shapes:

- **A. Bare control.** `Input` renders only `<input>`. Label, hint and error are the
  consumer's job, or a later `Field` component's.
- **B. Batteries included.** `Input` accepts `label`, `hint`, `error` and wires up
  `id`, `aria-describedby` and `aria-invalid` itself.

A is more composable and matches Radix. B is far friendlier and matches Ant Design and
Mantine. Mixing them later is painful, so decide once.

Recommended direction: B for the props, implemented internally as a bare control plus a
wrapper, so a `Field` can be extracted later without a breaking change. Needs a call.

**Decide before:** starting Input.

### D-13 - Modal: native `<dialog>` or a custom portal? `[open]` - blocks Phase 8

Native `<dialog showModal()>` gives focus trapping, top-layer stacking, backdrop and
Esc handling for free, with good modern browser support. The custom approach gives full
control over animation, nested overlays and styling, at the cost of writing and
maintaining a focus trap.

This also determines whether `useFocusTrap` needs to exist at all.

**Decide before:** starting Modal. Worth a spike of an hour on each.

### D-14 - Toast API shape `[open]` - blocks Phase 9

Open questions:

1. Is the public API imperative (`toast.success("Saved")`) or hook-based
   (`const { toast } = useToast()`)?
2. Must the consumer mount a `<Toaster />`, or does the first call auto-mount a portal?
3. Public name: `Message` (as in the original brief) or `Toast` (industry standard)?
   The plan file is `message.md`; the exported name is undecided.

An imperative API implies module-level mutable state, which is the one exception to
guideline A-6 and must be justified here.

**Decide before:** starting Message.

### D-15 - Carousel engine `[open]` - blocks Phase 11

Hand-rolled with CSS scroll-snap, or `embla-carousel-react` as a runtime dependency?

Scroll-snap gives native momentum, accessibility and reduced code, but makes precise
looping and programmatic control harder. Embla is roughly 5 kB, well maintained, and
solves the hard parts, but violates the spirit of DEP-1 for a single component.

**Decide before:** starting Carousel. Lean scroll-snap and drop looping from 0.1.0.

### D-16 - Navbar scope `[open]` - blocks Phase 10

"Navbar" is not a well-defined component the way a Button is. Needs narrowing to a
concrete contract before any code: which subcomponents, whether it owns responsive
behavior, whether it handles the mobile drawer, whether it does anything about routing
and the active link. See `components/navbar.md`.

**Decide before:** starting Navbar.

### D-17 - ESLint configuration `[open]` - blocks Phase 3

Flat config with `typescript-eslint` directly, or a preset such as `@antfu/eslint-config`?
Presets are fast to adopt and opinionated in ways that may fight Prettier.

**Decide before:** installing ESLint.

### D-18 - Browser support baseline `[open]` - blocks Phase 12 docs

Tailwind v4 requires modern browsers (it relies on cascade layers, `@property` and
`color-mix()`). The exact supported matrix needs to be stated in the README so
consumers are not surprised. Also determines whether `oklch()` colors are acceptable in
tokens without a fallback.

**Decide before:** publishing.
