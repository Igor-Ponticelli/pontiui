import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",

  // Dual output for the first release (D-07).
  format: ["esm", "cjs"],

  // Types are part of the product (D-05), so they ship generated, not hand-written.
  dts: true,

  /*
   * Per-module output rather than a single bundle (D-08).
   *
   * Two reasons, and both matter: a single bundle would need one "use client"
   * banner at the top, which would drag server-renderable components such as
   * Divider, Text and Skeleton onto the client; and it would stop the
   * consumer's bundler from dropping components they never imported.
   */
  unbundle: true,

  // React is the consumer's, never ours (D-05). jsx-runtime is a separate
  // specifier and is not covered by marking "react" external.
  external: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],

  // The library runs wherever React runs; it is not a Node package.
  platform: "neutral",

  // build:css writes into the same directory afterwards, so the clean has to
  // happen here, in the step that runs first.
  clean: true,
});
