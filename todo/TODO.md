# PontiUI Roadmap

Target for the first public release: `0.1.0` on npm, eleven components, themeable,
consumed successfully by a Vite app and a Next.js app.

Status legend is defined in `README.md`.

---

## Phase 0 - Repository foundation `[x]`

Completed before this plan was written.

- [x] Git repository initialized, `main` branch, GitHub remote
- [x] `.gitignore`, `.gitattributes` (LF enforced), `.editorconfig`, `.nvmrc`
- [x] MIT `LICENSE`
- [x] Root `README.md` with usage, theming and component status table
- [x] `package.json` base: name, `type: module`, `private: true`, `engines`, `packageManager`
- [x] pnpm as package manager
- [x] TypeScript installed and `tsconfig.json` in strict mode
- [x] Prettier installed and configured, `format` / `format:check` scripts
- [x] `src/` structure: `components/`, `hooks/`, `utils/`, `theme/`, `styles/`
- [x] `src/index.ts` as the single public API surface
- [x] `pnpm typecheck` script

**Exit criteria met:** `pnpm typecheck && pnpm format:check` passes on a clean checkout.

---

## Phase 1 - Styling foundation and design tokens `[x]`

Goal: a CSS pipeline producing one namespaced stylesheet, and a token system consumers
can override without a rebuild. Governed by D-19 through D-23.

- [x] Install `lightningcss` as a dev dependency (D-21)
- [x] Write `src/utils/cn.ts` by hand rather than depending on `clsx`. With variants as
      data attributes there is no conflict to resolve, so it is a filter-and-join and
      DEP-4 applies. **The library has zero runtime dependencies**
- [x] Create `src/styles/tokens.css` with the two-tier token system:
      primitives (`--pui-color-violet-600`) feeding semantics (`--pui-color-primary`)
- [x] Define the initial token set: colors, typography, spacing, radii, shadows,
      z-index, motion durations
- [x] Add the two scaling tokens from D-22: `--pui-font-size-base` and `--pui-space-unit`,
      with spacing, radii and control heights derived from the latter
- [x] Declare the layer order once in `src/styles/index.css`:
      `@layer pui.tokens, pui.reset, pui.base, pui.components;` (D-23, ST-12)
- [x] Define the shared focus-ring declaration in `pui.base` (ST-10)
- [x] Add the `build:css` script: Lightning CSS bundles the `@import` chain from
      `src/styles/index.css`, minified, emitted as `dist/styles.css`
- [x] Concatenation order is the `@import` order declared in `index.css`, not a glob, so
      the output is deterministic and a diff of `dist/styles.css` is readable
- [x] The build asserts the emitted cascade layer order and fails if it changes. The
      `@layer` statement is load-bearing: without it the order falls back to import
      order and the D-23 override contract quietly stops holding
- [x] Install and configure Stylelint with the rule that enforces ST-4: no literal value
      in a visual property outside `tokens.css`
- [x] Add a `lint:css` script (wiring it into CI is Phase 3, where CI is created)
- [x] Document every token in `docs/theming.md`, including the relative root font-size
      form from D-22 and the override contract from D-23

**Exit criteria met.** Verified against a scratch page loading only the built
`dist/styles.css`:

- every token resolves, in light and dark, switched by `data-pui-theme`
- redefining `--pui-color-primary` in a consumer stylesheet changes the output with no
  rebuild
- an unlayered consumer rule overrides a library rule from `@layer pui.base` at lower
  specificity and without `!important`
- `--pui-space-unit` and `--pui-font-size-base`, **set at `:root`**, scale density and
  type independently. Phase 3 corrected this line: it originally claimed subtree
  overrides had been verified on the scratch page, and they had not - they do not work
  for these two knobs (D-22)
- `pnpm lint:css` fails on `padding: 13px`, `color: #7c3aed`, `border-radius: 6px` and
  `font-size: 14px`, and passes on the token equivalents

Output: 6.13 kB unminified-source / minified, layers emitted in the declared order.

---

## Phase 2 - Build and distribution pipeline `[x]`

Goal: close the full publish-and-consume loop while the library is still trivial, so
packaging bugs surface now instead of at release time.

- [x] Install `tsdown`
- [x] Create `tsdown.config.ts`: ESM + CJS, `dts: true`, `unbundle` for per-module
      output, `external` covering `react`, `react-dom` and both jsx-runtime specifiers
- [x] Verify the per-module output preserves `"use client"` directives. Checked with a
      throwaway probe component: the directive survives in both ESM and CJS, and
      Divider correctly receives none, so it still renders on the server (D-08)
- [x] Add `react` and `react-dom` to `peerDependencies` (`>=18`). `react-dom` is not
      imported yet - Modal needs it in Phase 8, and adding a required peer later would
      be a breaking change for consumers, so it goes in before 0.1.0 rather than after
- [x] Configure `package.json` for publishing: `files`, `exports` (root + `./styles.css` + `./package.json`) with per-condition `types`, `main`, `module`, `types`,
      `sideEffects: ["**/*.css"]`
- [x] Add `build` script chaining `build:js` (tsdown) and `build:css` (Lightning CSS).
      The clean lives in tsdown, the step that runs first, so it cannot wipe the
      stylesheet
- [x] Implement **Divider** as the pipeline canary, including its `Divider.css`
- [x] Confirm the built stylesheet contains no unlayered rule (ST-12)
- [x] Run `npm pack --dry-run` and audit the file list
- [x] Install the tarball into a throwaway Vite app and render the canary
- [x] Add `publishConfig.access: "public"`, required by the scoped name (D-11)

**Exit criteria met.** A separate Vite app, installed **with npm rather than pnpm** so
the package is exercised outside the toolchain that built it:

- `npm install` from the tarball, then `import "@igor_ponti/pontiui/styles.css"` and
  `import { Divider, type DividerProps } from "@igor_ponti/pontiui"`
- the consumer's own `tsc --noEmit` passes, so the `exports` map resolves types for both
  the ESM and CJS conditions
- `vite build` succeeds; the library's CSS lands in the consumer's bundle at 7.7 kB,
  1.72 kB gzipped, layers intact
- `renderToStaticMarkup` renders every variant with no DOM, confirming Divider needs no
  `"use client"`
- a consumer `className` still wins over the library's layered rules

One defect was found and fixed by this exercise, which is exactly why the phase exists:
a labelled Divider was hiding its own label from assistive technology. See the component
plan.

---

## Phase 3 - Testing and lint tooling `[x]`

- [x] Install `vitest`, `@vitest/browser` + `@vitest/browser-playwright`, `playwright`,
      `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
- [x] Create `vitest.config.ts` and a test setup file. **Tests run in real Chromium, not
      jsdom**, so assertions can read computed styles: a test proves a token resolved
      rather than that a class name was written
- [x] Create `tsconfig.test.json` so test globals never leak into published types
- [x] Accessibility assertions via `axe-core` and a small typed helper in `test/axe.ts`.
      `vitest-axe` was dropped: it loads through `createRequire` and cannot run in browser
      mode, which is precisely where axe belongs, since colour contrast needs real
      rendering to evaluate
- [x] Add `test`, `test:watch`, `test:coverage` scripts
- [x] Install and configure ESLint (D-17: flat config, `typescript-eslint` directly)
- [x] Add `eslint-plugin-jsx-a11y` and `eslint-plugin-react-hooks`
- [x] Add `lint:css` (Stylelint, from Phase 1) to CI alongside ESLint
- [x] Install `husky` + `lint-staged` for a pre-commit format and lint pass
- [x] Create the GitHub Actions CI workflow: install, typecheck, lint, test, build
- [x] Write the first tests against Divider to validate the setup
- [x] Also covered Spinner and Text, so no implemented component is left untested

**Exit criteria, partly verified.** The full CI sequence passes locally - typecheck,
lint, lint:css, format:check, test, build - and both failure modes were confirmed
deliberately: a wrong computed-style assertion fails the suite, and a type error in a
test file fails `typecheck` and `lint`.

**CI has not yet run on GitHub.** Pushing is the session owner's job, so the workflow is
committed but unproven on the runner. The one step that cannot be rehearsed locally is
`playwright install --with-deps chromium`, which needs the runner's system libraries.

39 tests across three components. Two findings came out of writing them, both recorded:

- `role="status"` takes its name from the author, not from its contents, so a live
  region named only by `aria-label` and holding no text announces nothing. The Spinner's
  hidden label is the mechanism, not a decoration. The plan said "accessible name" where
  it meant "announced content"; corrected.
- The two D-22 scale knobs only take effect at `:root`. This contradicted a Phase 1 exit
  criterion that had claimed subtree overrides were verified. Corrected above, documented
  in `docs/theming.md`, and pinned by a test.

---

## Phase 4 - Storybook and documentation infrastructure `[ ]`

- [ ] Install Storybook with the Vite builder
- [ ] Configure `.storybook/preview.ts` to import the **built** `dist/styles.css`,
      not the source CSS
- [ ] Enable `autodocs` so prop tables come from TypeScript types
- [ ] Add `@storybook/addon-a11y`
- [ ] Add a global theme toggle (light / dark via `data-pui-theme`)
- [ ] Add a "Design Tokens" story rendering the full palette and type scale
- [ ] Add a "Theme Playground" story with overridden tokens to prove theming works
- [ ] Add `dev` and `build:storybook` scripts
- [ ] Deploy the static Storybook (GitHub Pages or Vercel)

**Exit criteria:** `pnpm dev` opens Storybook, the Divider story renders, and the theme
toggle visibly changes it.

---

## Phase 5 - Primitives `[ ]`

Zero-dependency components. Each one follows the full agent pipeline.

- [~] Divider (implemented in Phase 2 as the canary; needs tests, a11y sign-off and
  stories to be complete against its full plan)
- [~] Text (implemented; needs tests, a11y sign-off and stories)
- [~] Spinner (implemented; needs tests, a11y sign-off and stories)
- [~] Skeleton (implemented and tested; needs stories and a11y sign-off)

**Exit criteria:** all four have plan, implementation, tests, a11y sign-off and stories.

---

## Phase 6 - Button `[ ]`

The reference implementation. Every later component copies its patterns.

- [ ] Button (depends on Spinner for the loading state)
- [ ] Confirm `"use client"` survives the build and works in a Next.js server component
- [ ] Confirm the shared focus-ring declaration from Phase 1 covers Button unchanged

**Exit criteria:** Button is importable in a Next.js App Router page with no directive
added by the consumer.

---

## Phase 7 - Form controls `[ ]`

- [ ] Resolve D-12 (does a control own its label and error text?) before starting
- [ ] Input
- [ ] Textarea
- [ ] Verify both work with React Hook Form via forwarded refs

---

## Phase 8 - Overlay infrastructure and Modal `[ ]`

- [ ] Resolve D-13 (native `<dialog>` versus custom portal implementation)
- [ ] `useControllableState` hook
- [ ] `useLockBodyScroll` hook
- [ ] `useFocusTrap` hook (skip if D-13 resolves to native `<dialog>`)
- [ ] Portal utility with SSR-safe mounting
- [ ] Modal
- [ ] Verify no hydration mismatch in Next.js

---

## Phase 9 - Message (Toast) `[ ]`

- [ ] Resolve D-14 (imperative API shape and whether a provider is mandatory)
- [ ] Toast store and queue
- [ ] `Toaster` render surface
- [ ] Message component and public `toast` object

---

## Phase 10 - Navbar `[ ]`

- [ ] Resolve D-16 (Navbar scope) first: it is the least defined component (see its plan)
- [ ] Navbar with compound subcomponents
- [ ] Mobile disclosure behavior

---

## Phase 11 - Carousel `[ ]`

- [ ] Resolve D-15 (hand-rolled scroll-snap versus an external engine)
- [ ] Carousel

---

## Phase 12 - Theming API `[ ]`

- [ ] `ThemeProvider` (optional, never required to render a component)
- [ ] Exported TypeScript type for the token map
- [ ] Dark theme token values finalized
- [ ] Resolve D-18 (browser support baseline) and state it in the README
- [ ] `docs/theming.md` completed with the full token reference
- [ ] Contrast audit of every semantic color pair against WCAG AA

---

## Phase 13 - Versioning and release `[ ]`

- [ ] Install and initialize Changesets
- [ ] Document the semver policy (D-24), including that **token names are public API**
- [ ] Confirm changesets start applying from this publish onward (D-24, COMMITS rule 7)
- [ ] Remove `"private": true` from `package.json`
- [ ] Add the release GitHub Actions workflow using `changesets/action`
- [ ] Configure npm trusted publishing / `--provenance`
- [ ] Publish `0.1.0`

---

## Phase 14 - Consumer validation `[ ]`

Two separate throwaway projects, because they exercise different failure modes.

- [ ] Vite + React app with no CSS framework - proves the stylesheet is self-sufficient
- [ ] Next.js App Router app **with** Tailwind - proves `"use client"`, SSR/hydration,
      the absence of class collisions, and that the consumer's own utilities still win
      over the library's layers (D-23)
- [ ] Record both as a manual release checklist in `todo/`

---

## Backlog (explicitly out of scope for 0.1.0) `[-]`

- Visual regression testing (Chromatic or Playwright screenshots)
- Additional components: Select, Checkbox, Radio, Switch, Tooltip, Dropdown, Tabs, Table
- RTL and internationalization support
- Monorepo split (`packages/ui`, `apps/docs`, `apps/playground`)
- Icon set as a separate entry point
- CSS-only distribution for non-React consumers
- Animation primitives beyond simple transitions
