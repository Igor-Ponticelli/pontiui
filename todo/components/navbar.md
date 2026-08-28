# Navbar

**Status:** `[?]` blocked
**Phase:** 10
**Depends on:** Button, Divider, and the Modal focus utilities if a mobile drawer is in
scope
**Blocked by:** **D-16** - scope is not defined
**Client component:** yes, if it owns any disclosure state

## Goal

Currently undefined, and that is the main problem. "Navbar" describes a page region, not
a component with a contract. Unlike Button, there is no shared understanding of what it
should do, so **the first task is narrowing the scope, not writing code**.

Every mainstream library resolves this differently: some ship an unstyled layout shell,
some ship a full responsive navigation system with menus and a drawer. The gap between
those is weeks of work.

## Scoping questions to answer first (D-16)

1. Is it a **layout shell** (brand, links, actions, responsive collapse) or a
   **navigation system** (dropdown menus, active state, routing awareness)?
2. Does it own responsive behavior, or does the consumer compose two layouts?
3. Does it include a mobile drawer? That pulls in focus trapping, scroll lock and
   inertness, effectively half of Modal.
4. Does it know about routing? Any coupling to a router is a hard no, but an `active`
   prop the consumer sets is fine.
5. Are dropdown menus in scope? If so, this needs the full WAI-ARIA menu pattern,
   which is substantial on its own and probably deserves a separate Menu component.
6. Sticky and scroll behavior: in scope or the consumer's CSS?

**Recommended narrowing for 0.1.0:** layout shell plus a simple mobile disclosure, no
dropdown menus, no routing awareness, `active` set by the consumer. Anything more is a
separate component and a later phase.

## When not to use it

- As a general layout container. It is a navigation landmark.
- For in-page section navigation. That is a different pattern.
- When the application needs a fundamentally different navigation model (sidebar,
  command palette).

## Public API (draft, assumes the narrowed scope)

| Prop         | Type                   | Default | Description                      |
| ------------ | ---------------------- | ------- | -------------------------------- |
| `sticky`     | `boolean`              | `false` | Sticks to the top on scroll      |
| `bordered`   | `boolean`              | `true`  | Bottom border                    |
| `collapseAt` | `"sm" \| "md" \| "lg"` | `"md"`  | Breakpoint for the mobile layout |
| `children`   | `ReactNode`            | -       | Composed subcomponents           |

Subcomponents: `Navbar.Brand`, `Navbar.Links`, `Navbar.Link`, `Navbar.Actions`,
`Navbar.Toggle`, `Navbar.Drawer`.

`Navbar.Link` takes `active` and `href`, and renders an anchor. It must be composable
with a router's link component, which means supporting an `as` prop or accepting the
consumer's element as a child. Decide which.

## Variants

None until the scope is settled.

## Sizes

A single height token, matching the Button `md` height plus vertical padding.

## States

Desktop expanded, mobile collapsed, drawer open.

## Behavior

1. Renders as a `<nav>` landmark with an accessible name.
2. Above `collapseAt`, links render inline; below it they collapse behind a toggle.
3. The toggle communicates its expanded state.
4. The drawer, if in scope, traps focus, closes on Esc, and returns focus to the toggle.
5. `active` on a link is exposed as `aria-current="page"`.
6. The collapse breakpoint must be pure CSS where possible, to avoid a flash of the
   wrong layout during hydration.

## Implementation notes

- Compound components with static properties (E-6).
- Any drawer behavior reuses the Modal hooks. Do not write a second focus trap (X-3).
- Prefer CSS-driven responsive behavior over JavaScript breakpoint detection, which
  causes hydration mismatches.

## Accessibility

- `<nav>` with `aria-label`, especially when a page has more than one navigation region.
- Links are real anchors, never buttons with click handlers.
- Toggle has `aria-expanded` and `aria-controls`.
- Drawer follows the dialog pattern if it overlays content.
- Current page marked with `aria-current="page"`.
- Full keyboard operability, logical tab order.

## Tokens used

Surface, border, foreground, muted, spacing, `--pui-z-navbar`, shadow when sticky.

## Tests

Deferred until the scope is settled. At minimum: renders a navigation landmark, toggle
reflects expanded state, active link exposes `aria-current`, drawer traps and restores
focus.

## Documentation

Realistic compositions: brand plus links plus a call to action, and the mobile layout.
Document explicitly what the Navbar does not do, since expectations vary widely.

## Open questions

All of D-16. This plan cannot be executed until that is resolved.

## Definition of done

- [ ] **D-16 resolved and this plan rewritten against the agreed scope**
- [ ] Then the standard checklist
