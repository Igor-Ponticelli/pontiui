import axe from "axe-core";
import { expect } from "vitest";

/**
 * Runs axe against a rendered subtree and fails with the readable violation
 * list rather than a boolean.
 *
 * Written here instead of pulling in `vitest-axe`, which loads through
 * `createRequire` and therefore cannot run in browser mode - which is exactly
 * where axe belongs, since colour contrast needs real rendering to evaluate.
 */
export async function expectNoAxeViolations(element: HTMLElement): Promise<void> {
  const results = await axe.run(element, {
    rules: {
      // Components are rendered in isolation, with no page landmarks around
      // them. That is a property of the test harness, not of the component.
      region: { enabled: false },
    },
  });

  const summary = results.violations
    .map((v) => {
      const nodes = v.nodes.map((n) => `      ${n.html}`).join("\n");
      return `  [${v.impact}] ${v.id}: ${v.help}\n${nodes}`;
    })
    .join("\n");

  expect(summary, `axe found ${results.violations.length} violation(s):\n${summary}`).toBe("");
}
