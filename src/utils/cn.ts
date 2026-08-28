/**
 * Joins class names, dropping anything falsy.
 *
 * Deliberately not a dependency. Variants are data attributes selected in CSS
 * (D-20), so this never has to resolve conflicting classes - its whole job is
 * appending the consumer's `className` after the component's own. Conflicts
 * between the library's rules and the consumer's are settled by the cascade
 * layers instead (D-23). At this size, DEP-4 rules out reaching for `clsx`.
 *
 * `className` is always passed last, so it always ends up last in the output
 * (ST-3 in spirit, R-5 in the letter).
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
