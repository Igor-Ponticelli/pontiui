/**
 * Compiles the stylesheet.
 *
 * Lightning CSS resolves the @import chain declared in src/styles/index.css,
 * so the concatenation order is whatever that file says it is, then minifies
 * the result into a single dist/styles.css (D-21).
 */
import { bundle } from "lightningcss";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entry = resolve(root, "src/styles/index.css");
const outFile = resolve(root, "dist/styles.css");

const { code } = bundle({
  filename: entry,
  minify: true,
  // Browser targets are deliberately not pinned yet - that is D-18, still open.
  // Until it is decided, Lightning CSS is left to its own defaults rather than
  // having a baseline invented here.
});

/*
 * The override contract in D-23 depends entirely on the layer order.
 *
 * Lightning CSS honours the `@layer a, b, c;` statement in index.css and
 * re-expresses it as empty layer declarations placed at the right points in the
 * output, so import order does not matter while that statement is present. It
 * is therefore load-bearing: delete it and the order silently falls back to
 * import order, which would hand consumers an override contract that quietly
 * stops holding.
 *
 * Assert the emitted order so that failure surfaces here, at build time, rather
 * than as an unexplainable override bug in someone else's application.
 */
const EXPECTED_LAYERS = ["pui.tokens", "pui.reset", "pui.base", "pui.components"];

const css = code.toString();
const emitted = [];
for (const [, name] of css.matchAll(/@layer\s+([a-z.]+)\s*[{;]/g)) {
  if (!emitted.includes(name)) emitted.push(name);
}

if (emitted.join() !== EXPECTED_LAYERS.join()) {
  throw new Error(
    `Cascade layer order broken (D-23).\n` +
      `  expected: ${EXPECTED_LAYERS.join(" -> ")}\n` +
      `  emitted:  ${emitted.join(" -> ")}\n` +
      `Check the @import order in src/styles/index.css.`,
  );
}

await mkdir(dirname(outFile), { recursive: true });
await writeFile(outFile, code);

console.log(
  `dist/styles.css  ${(code.length / 1024).toFixed(2)} kB  layers: ${emitted.join(" -> ")}`,
);
