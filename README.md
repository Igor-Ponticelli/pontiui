# PontiUI

Accessible React component library with CSS-variable theming, built with Tailwind CSS v4.

> **Status:** early development. Not published to npm yet. APIs will change without notice until `1.0.0`.

## Why

PontiUI ships as a traditional package: install it, import it, done. No code generation, no files copied into your repo. Styles are precompiled and namespaced, so the library works whether or not your project uses Tailwind, and it will not collide with your own CSS.

- **Zero-config styling** - one CSS import and components look right
- **Themeable via CSS variables** - override a handful of custom properties, no rebuild required
- **Namespaced** - every class is prefixed with `pui:`, no global reset is shipped
- **Tree-shakeable** - ESM-first with per-module output
- **RSC-ready** - client components are marked with `"use client"`
- **Typed** - written in TypeScript, props exported for extension

## Installation

```bash
npm install @igor_ponti/pontiui
```

React 18 or newer is required as a peer dependency.

## Usage

Import the stylesheet once, at the root of your app:

```tsx
// app/layout.tsx (Next.js) or src/main.tsx (Vite)
import "pontiui/styles.css";
```

Then import components anywhere:

```tsx
import { Button, Modal, Input } from "pontiui";

export function Example() {
  return (
    <Button variant="primary" size="md">
      Save changes
    </Button>
  );
}
```

## Theming

Every visual value is a CSS custom property. Override the ones you need in your own stylesheet, loaded **after** the PontiUI import:

```css
@import "pontiui/styles.css";

:root {
  --pui-color-primary: #7c3aed;
  --pui-color-primary-hover: #6d28d9;
  --pui-radius-md: 0.25rem;
  --pui-font-sans: "Inter", sans-serif;
}
```

Dark mode is opt-in through a data attribute on any ancestor element:

```html
<body data-pui-theme="dark"></body>
```

See [Theming](./docs/theming.md) for the full token reference.

## Components

| Component | Status  |
| --------- | ------- |
| Button    | planned |
| Input     | planned |
| Textarea  | planned |
| Text      | planned |
| Divider   | planned |
| Spinner   | planned |
| Skeleton  | planned |
| Modal     | planned |
| Toast     | planned |
| Navbar    | planned |
| Carousel  | planned |

## Development

Requires Node 20+ and pnpm.

```bash
pnpm install
pnpm dev          # Storybook on http://localhost:6006
pnpm test         # unit tests
pnpm typecheck    # type checking
pnpm build        # emit dist/
```

### Project structure

```
src/
├── components/   one folder per component (source, variants, tests, stories)
├── hooks/        shared behavioral hooks
├── utils/        pure helpers
├── theme/        theme provider and token types
└── styles/       Tailwind entry point and design tokens
```

## Contributing

Commits follow [Conventional Commits](https://www.conventionalcommits.org/). Every user-facing change needs a changeset:

```bash
pnpm changeset
```

## License

MIT © Igor Patrick Ponticelli
