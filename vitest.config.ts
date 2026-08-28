import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    /*
     * Real browser rather than jsdom (Phase 3 decision).
     *
     * The library's CSS is half the product, and jsdom does not compute
     * layout or resolve custom properties. In a real browser a test can assert
     * that a token actually resolved, that reduced motion actually swapped the
     * animation, and axe can evaluate colour contrast - none of which jsdom can
     * do. The cost is a browser download and a slower run.
     */
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }],
    },
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
