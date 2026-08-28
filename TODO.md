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

## Phase 1 - Styling foundation and design tokens `[ ]`

Goal: a working Tailwind v4 pipeline producing a namespaced stylesheet, and a token
system that consumers can override without a rebuild.

- [ ] Install `tailwindcss` and `@tailwindcss/cli` as dev dependencies
- [ ] Install `clsx`, `tailwind-merge`, `class-variance-authority` as runtime dependencies
- [ ] Create `src/styles/index.css` importing only the `theme` and `utilities` layers
      (no Preflight - see `DECISIONS.md` D-04)
- [ ] Apply the `pui` prefix so every emitted class is `pui:*`
- [ ] Add `@source` so Tailwind scans `src/`
- [ ] Create `src/styles/tokens.css` with the two-tier token system:
      primitives (`--color-brand-500`) feeding semantics (`--color-primary`)
- [ ] Define the initial token set: colors, typography, spacing, radii, shadows,
      z-index, motion durations
- [ ] Create `src/utils/cn.ts` using `extendTailwindMerge({ prefix: "pui" })`
- [ ] Add `build:css` script and confirm `dist/styles.css` is generated
- [ ] Install and configure `prettier-plugin-tailwindcss` with
      `tailwindFunctions: ["cva", "cn"]`
- [ ] Document every token in `docs/theming.md` (referenced by the root README)

**Exit criteria:** a scratch HTML file using `pui:` classes renders correctly from the
built stylesheet, and overriding `--pui-color-primary` in a consumer stylesheet changes
the output with no rebuild.

---

## Phase 2 - Build and distribution pipeline `[ ]`

Goal: close the full publish-and-consume loop while the library is still trivial, so
packaging bugs surface now instead of at release time.

- [ ] Install `tsdown`
- [ ] Create `tsdown.config.ts`: ESM + CJS, `dts: true`, per-module output,
      `external: ["react", "react-dom"]`
- [ ] Verify the per-module output preserves `"use client"` directives
- [ ] Add `react` and `react-dom` to `peerDependencies` (`>=18`)
- [ ] Configure `package.json` for publishing: `files`, `exports` (root + `./styles.css` + `./package.json`), `main`, `module`, `types`, `sideEffects: ["**/*.css"]`
- [ ] Add `build` script chaining `build:js` and `build:css`
- [ ] Implement **Divider** as the pipeline canary (simplest possible component)
- [ ] Run `npm pack --dry-run` and audit the file list
- [ ] Install the tarball into a throwaway Vite app and render the canary
- [ ] Add `publishConfig.access` if a scoped name is chosen (see D-01)

**Exit criteria:** `pnpm build` emits `dist/` and a separate project can install the
tarball, import `pontiui/styles.css` and render `<Divider />` correctly.

---

## Phase 3 - Testing and lint tooling `[ ]`

- [ ] Install `vitest`, `@vitest/browser` or `jsdom`, `@testing-library/react`,
      `@testing-library/user-event`, `@testing-library/jest-dom`
- [ ] Create `vitest.config.ts` and a test setup file
- [ ] Create `tsconfig.test.json` so test globals never leak into published types
- [ ] Install `vitest-axe` for automated accessibility assertions
- [ ] Add `test`, `test:watch`, `test:coverage` scripts
- [ ] Install and configure ESLint (see D-07 for the config choice)
- [ ] Add `eslint-plugin-jsx-a11y` and `eslint-plugin-react-hooks`
- [ ] Install `husky` + `lint-staged` for a pre-commit format and lint pass
- [ ] Create the GitHub Actions CI workflow: install, typecheck, lint, test, build
- [ ] Write the first tests against Divider to validate the setup

**Exit criteria:** CI is green on a pull request and fails on a deliberately broken test.

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

- [x] Divider (delivered in Phase 2 as the canary - revisit against its full plan)
- [ ] Text
- [ ] Spinner
- [ ] Skeleton

**Exit criteria:** all four have plan, implementation, tests, a11y sign-off and stories.

---

## Phase 6 - Button `[ ]`

The reference implementation. Every later component copies its patterns.

- [ ] Button (depends on Spinner for the loading state)
- [ ] Confirm `"use client"` survives the build and works in a Next.js server component
- [ ] Extract the shared focus-ring utility into the token layer if duplication appears

**Exit criteria:** Button is importable in a Next.js App Router page with no directive
added by the consumer.

---

## Phase 7 - Form controls `[ ]`

- [ ] Resolve D-05 (does a control own its label and error text?) before starting
- [ ] Input
- [ ] Textarea
- [ ] Verify both work with React Hook Form via forwarded refs

---

## Phase 8 - Overlay infrastructure and Modal `[ ]`

- [ ] Resolve D-06 (native `<dialog>` versus custom portal implementation)
- [ ] `useControllableState` hook
- [ ] `useLockBodyScroll` hook
- [ ] `useFocusTrap` hook (skip if D-06 resolves to native `<dialog>`)
- [ ] Portal utility with SSR-safe mounting
- [ ] Modal
- [ ] Verify no hydration mismatch in Next.js

---

## Phase 9 - Message (Toast) `[ ]`

- [ ] Resolve D-08 (imperative API shape and whether a provider is mandatory)
- [ ] Toast store and queue
- [ ] `Toaster` render surface
- [ ] Message component and public `toast` object

---

## Phase 10 - Navbar `[ ]`

- [ ] Narrow the scope first: Navbar is the least defined component (see its plan)
- [ ] Navbar with compound subcomponents
- [ ] Mobile disclosure behavior

---

## Phase 11 - Carousel `[ ]`

- [ ] Resolve D-09 (hand-rolled scroll-snap versus an external engine)
- [ ] Carousel

---

## Phase 12 - Theming API `[ ]`

- [ ] `ThemeProvider` (optional, never required to render a component)
- [ ] Exported TypeScript type for the token map
- [ ] Dark theme token values finalized
- [ ] `docs/theming.md` completed with the full token reference
- [ ] Contrast audit of every semantic color pair against WCAG AA

---

## Phase 13 - Versioning and release `[ ]`

- [ ] Install and initialize Changesets
- [ ] Document the semver policy, including that **token names are public API**
- [ ] Remove `"private": true` from `package.json`
- [ ] Add the release GitHub Actions workflow using `changesets/action`
- [ ] Configure npm trusted publishing / `--provenance`
- [ ] Publish `0.1.0`

---

## Phase 14 - Consumer validation `[ ]`

Two separate throwaway projects, because they exercise different failure modes.

- [ ] Vite + React app **without** Tailwind - proves the stylesheet is self-sufficient
- [ ] Next.js App Router app **with** Tailwind - proves `"use client"`, SSR/hydration
      and the absence of class collisions
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
