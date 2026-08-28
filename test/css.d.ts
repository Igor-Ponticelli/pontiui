/**
 * The test setup imports the library's stylesheet so assertions can read
 * computed styles in the browser. Vite handles that import at runtime;
 * TypeScript needs to be told the module exists.
 *
 * Scoped to the test program (`tsconfig.test.json`) on purpose, so it can never
 * leak into the published types.
 */
declare module "*.css" {
  const content: string;
  export default content;
}
