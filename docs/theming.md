# Theming

Every visual value in PontiUI is a CSS custom property. Theming means redefining some of
them in your own stylesheet. There is no rebuild, no config file and no provider.

```css
@import "@igor_ponti/pontiui/styles.css";

:root {
  --pui-color-primary: #0ea5e9;
  --pui-color-primary-hover: #0284c7;
}
```

---

## What you can rely on

**Token names are public API.** They follow semver: renaming or removing one is a
breaking change.

**Class names are not.** `.pui-button` is readable so your DOM stays readable, not so you
can target it. Style it and a minor release may break you.

All library CSS is emitted inside cascade layers:

```css
@layer pui.tokens, pui.reset, pui.base, pui.components;
```

Anything you write sits outside those layers, so **it wins automatically** — regardless
of specificity, and with no `!important` on either side. That is the supported way to
override anything a token does not cover.

---

## The two tiers

Primitives hold the raw scale. Semantics give a role to a primitive. **Components only
ever reference semantics**, which is what makes rebranding a matter of a handful of
lines.

```css
/* primitive - the palette */
--pui-color-violet-600: #7c3aed;

/* semantic - the role */
--pui-color-primary: var(--pui-color-violet-600);
```

Override a semantic to restyle a role. Override a primitive to shift the whole palette at
once.

---

## Colour

| Token                                                          | Role                                         |
| -------------------------------------------------------------- | -------------------------------------------- |
| `--pui-color-background` / `-foreground`                       | Page surface and its text                    |
| `--pui-color-surface` / `-foreground`                          | Raised surfaces: cards, panels, menus        |
| `--pui-color-muted` / `-foreground`                            | De-emphasised backgrounds and secondary text |
| `--pui-color-primary` / `-hover` / `-active` / `-foreground`   | The main action                              |
| `--pui-color-secondary` / `-hover` / `-active` / `-foreground` | Supporting actions                           |
| `--pui-color-danger` / `-hover` / `-foreground`                | Destructive actions                          |
| `--pui-color-success` / `-foreground`                          | Positive status                              |
| `--pui-color-warning` / `-foreground`                          | Cautionary status                            |
| `--pui-color-info` / `-foreground`                             | Informational status                         |
| `--pui-color-border` / `-strong`                               | Separators and control outlines              |
| `--pui-color-ring`                                             | Focus ring                                   |
| `--pui-color-overlay`                                          | Backdrop behind modals                       |

Primitive scales: `--pui-color-violet-{50…950}`, `--pui-color-neutral-{0,50…950}`, plus
`red`, `green`, `amber` and `blue` steps used by the status roles.

---

## Dark mode

Dark mode is token values only. No component contains a dark-mode conditional, so a theme
switch cannot change layout or behaviour — only colour.

```html
<body data-pui-theme="dark"></body>
```

The attribute works on any ancestor, so a single section can be themed independently:

```html
<div data-pui-theme="dark">
  <!-- dark island inside a light page -->
</div>
```

---

## Scaling: two separate axes

Type and density are independent, so you can enlarge text without inflating every
control, or tighten controls without shrinking text.

| Token                  | Controls                                           |
| ---------------------- | -------------------------------------------------- |
| `--pui-font-size-base` | The whole type scale (`xs` … `7xl` derive from it) |
| `--pui-space-unit`     | Spacing, radii and control heights                 |

```css
:root {
  --pui-space-unit: 0.3rem; /* roomier controls, type untouched */
}
```

### These two only work at the root

Both knobs take effect at `:root` and nowhere else. Setting either on a wrapper element
silently does nothing:

```css
:root {
  --pui-font-size-base: 1.125rem; /* works */
}

.my-card {
  --pui-font-size-base: 1.125rem; /* does nothing */
}
```

The reason is how CSS resolves custom properties. `--pui-font-size-lg` is declared as a
calculation over `--pui-font-size-base`, and that substitution happens where the property
is _declared_, which is `:root`. Redefining the input further down the tree cannot
re-derive a value that has already been resolved.

Nothing else behaves this way. Semantic tokens and the individual scale steps are read
directly by components, so overriding them on any ancestor works as you would expect:

```css
.my-card {
  --pui-color-primary: #0ea5e9; /* works */
  --pui-font-size-md: 1.25rem; /* works */
}
```

In short: change the two knobs globally, override individual tokens locally.

### Scaling type with the root font size

Because the type scale is expressed in `rem`, it follows the document root. Set that
root **relatively**:

```css
html {
  font-size: 112.5%; /* correct */
}
```

```css
html {
  font-size: 18px; /* wrong */
}
```

A percentage scales from whatever default the reader has chosen. A fixed pixel value
overrides it — and that default is the setting people with low vision rely on. Use the
percentage form.

---

## Spacing, radii and control heights

Everything below derives from `--pui-space-unit` (`0.25rem` by default).

- **Spacing** — `--pui-space-{0,1,2,3,4,5,6,8,10,12,16}`
- **Radii** — `--pui-radius-{none,sm,md,lg,xl,full}`
- **Control heights** — `--pui-control-height-{sm,md,lg}`

Control heights are a shared token rather than a per-component value on purpose: Button,
Input and Textarea must line up exactly when placed side by side at the same size step.

---

## Typography

- `--pui-font-sans`, `--pui-font-mono`
- `--pui-font-size-{xs,sm,md,lg,xl,2xl,3xl}`
- `--pui-font-weight-{normal,medium,semibold,bold}`
- `--pui-line-height-{tight,normal,relaxed}`
- `--pui-letter-spacing-{tight,normal,wide}`

---

## Borders, shadows, focus

- `--pui-border-width`, `--pui-border-width-strong`
- `--pui-shadow-{sm,md,lg}`
- `--pui-focus-ring-width`, `--pui-focus-ring-offset`, and `--pui-color-ring`

The focus ring is declared once, library-wide, so it is provably identical on every
component. It appears on keyboard focus only (`:focus-visible`), never on a mouse click.

---

## Layering and motion

- `--pui-z-{base,dropdown,overlay,modal,toast}`
- `--pui-duration-{fast,normal,slow}`
- `--pui-easing-{standard,enter,exit}`

---

## Known gaps

- **Contrast has not been audited yet.** The default pairs were chosen to clear WCAG AA
  for normal text (`--pui-color-primary` on `--pui-color-primary-foreground` measures
  5.7:1), but hover and status pairs have not been measured. The full audit is Phase 12.
- **The browser baseline is not fixed yet** (D-18). The library uses cascade layers and
  modern colour syntax; the supported matrix will be stated here and in the README once
  decided.
