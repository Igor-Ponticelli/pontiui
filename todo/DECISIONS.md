# Decisions

Two sections: decisions already made (with the reasoning, so they can be revisited
honestly) and decisions still open (which block specific work).

Never resolve an open decision inside a component plan or in code. Resolve it here
first, change the status to `Decided`, then reference the ID.

---

## Decided

### D-01 - Distribution model: precompiled CSS `[decided]`

PontiUI ships `dist/styles.css`, compiled at build time. Consumers import it once and
need no CSS tooling of their own.

_Rejected:_ shipping source for the consumer's build to compile. It forces the consumer
onto a specific toolchain, and onto having one at all.

_Cost accepted:_ the stylesheet carries every component, not only the ones a given
consumer imports. Estimated at well under 20 kB minified for eleven components. D-21
records why the per-component alternative was still rejected.

### D-02 - Namespace prefix: `pui` `[decided]`

Every class the library emits starts with `pui-` (`pui-button`), every custom property
with `--pui-` (`--pui-color-primary`), every styling attribute with `data-pui-`. This is
the primary defense against collisions with the consumer's own CSS.

### D-03 - Two-tier design tokens `[decided]`

Primitive tokens (`--color-brand-500`) feed semantic tokens (`--color-primary`).
Components reference **only** semantic tokens. Rebranding is then a matter of
redefining a handful of semantic variables.

### D-04 - No global reset `[decided]`

The library never ships a reset that touches elements it does not own. Importing
`styles.css` must produce zero visual change to any element PontiUI did not render.

Each component declares the resets it needs inside `@layer pui.reset`, scoped to its own
class.

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

### D-19 - Styling mechanism: hand-authored CSS `[decided]`

Components are styled with CSS written by hand, one `<Component>.css` per component,
compiled into a single stylesheet.

The markup a component produces is public surface. The consumer reads it in their
inspector and cannot hide it, so a component puts one class there and keeps the styling
in CSS.

_Rejected:_ a utility framework. It moves the whole style declaration into the consumer's
markup, where eighteen classes on a button bury the consumer's own code. D-01 already
compiles the stylesheet at build time, so the consumer would carry that cost without ever
seeing the benefit.

_Rejected:_ CSS Modules. Hashed names (`pui-button-x7f2a`) are as unreadable in the DOM as
a utility list, and defeat the same goal.

_Cost accepted:_ ST-4 stops being enforced by the absence of a syntax for it. A Stylelint
rule rejecting literal values outside `tokens.css` takes over, and it has to exist before
the first component - without it, ST-4 is only an intention.

_Cost accepted:_ one class shows less in devtools than a full utility list, and Modal and
Carousel are real CSS work.

### D-20 - Variants are data attributes `[decided]`

A component emits exactly one class, `pui-<component>`. Variant, size and state are
`data-pui-*` attributes on that same element, selected in CSS:

```html
<button class="pui-button" data-pui-variant="primary" data-pui-size="md"></button>
```

```css
.pui-button[data-pui-variant="primary"] { ... }
```

Props map to attributes directly, so a variant needs no runtime helper. `cn()` is a thin
`clsx` wrapper whose only job is merging the consumer's `className`.

The `pui-` prefix on the attributes is load-bearing, not decoration. R-4 spreads rest
props onto the same element, so an unprefixed `data-size` passed by a consumer for their
own tooling would silently restyle the component.

_Rejected:_ BEM (`pui-button pui-button--primary pui-button--md`). Three classes to say
what two attributes say, and `data-pui-variant="primary"` reads as intent where
`pui-button--primary` reads as a name.

_Cost accepted:_ the attributes are visible in the DOM. Two readable attributes is the
target, not a bare element.

### D-21 - CSS toolchain: Lightning CSS, single stylesheet `[decided]`

`lightningcss` compiles `src/styles/index.css` and every `<Component>.css` into one
minified `dist/styles.css`. It covers nesting, minification and browser targets in a
single dependency, and it is fast enough to sit in a watch loop.

_Rejected:_ PostCSS with a plugin chain (`postcss-nesting`, `autoprefixer`, `cssnano`).
Four dependencies and a config file to do what one dependency does.

_Rejected:_ per-component stylesheets, imported individually or tree-shaken by the
consumer's bundler. It would repair the cost accepted in D-01, but at the price of two
supported import paths, two things to document and two ways for a consumer to get it
wrong, saving single-digit kilobytes across eleven components. One import, and done.

_Note:_ Lightning CSS `targets` is where D-18 (browser support baseline) materializes as
configuration. **D-18 remains open** - this decision fixes where the answer lives, not
what it is.

### D-22 - Two scaling axes: type and density `[decided]`

Typography scales from the root font size. Spacing, radii and control heights scale from
a separate unit, so a consumer can enlarge text without inflating every control.

```css
--pui-font-size-base: 1rem; /* follows the root font size */
--pui-space-unit: 0.25rem; /* density, adjustable on its own */
```

Documented scaling always uses a relative root font size, never a fixed one:

```css
html {
  font-size: 112.5%;
} /* correct - 18px on a 16px default, and still relative */
html {
  font-size: 18px;
} /* wrong - overrides the reader's own browser setting */
```

The fixed form silently defeats a reader who raised their default font size for low
vision. Documenting the wrong one teaches every consumer to break accessibility at the
root of their application, so the correct form belongs in `docs/theming.md` rather than
being left for them to work out.

_Cost accepted:_ two knobs to explain instead of one.

### D-23 - Override contract: cascade layers `[decided]`

All library CSS is emitted inside cascade layers:

```css
@layer pui.reset, pui.base, pui.components;
```

Anything the consumer writes sits outside those layers and therefore wins, regardless of
specificity, with no `!important` needed on either side.

The supported ways to change PontiUI's appearance, in order:

1. Override a semantic token (`--pui-color-primary`). Covers the overwhelming majority.
2. Pass `className` and style that class in the consumer's own stylesheet.
3. Target `.pui-<component>` directly. Possible, unsupported, may break in a minor.

Point 3 is why this decision exists. A readable class name invites consumers to style it,
and once enough of them do, renaming an internal class becomes a breaking change by
accident. Token names are public API and are versioned as such (Phase 13); class names
are deliberately not, and that must be stated in the README rather than discovered.

_Cost accepted:_ some consumers will target the classes regardless. Cascade layers give
them a supported path that works at least as well, which is the strongest defense short
of hashing the names - and D-19 rejected hashing.

The cascade also arbitrates conflicts between the library's rules and the consumer's, so
no runtime class-merging logic is needed to do it.

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

The library relies on cascade layers, `@property` and `color-mix()`, all of which
require reasonably modern browsers. The exact supported matrix needs to be stated in the README so
consumers are not surprised. Also determines whether `oklch()` colors are acceptable in
tokens without a fallback.

**Decide before:** publishing.
