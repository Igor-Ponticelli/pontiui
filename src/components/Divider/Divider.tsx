import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Axis of the rule.
   *
   * `vertical` stretches to the height of its container, so the parent must
   * have a resolved height - a flex row, a grid track, or an explicit value.
   * A vertical divider in a parent with no height renders nothing visible.
   *
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";

  /**
   * Whether the divider is purely visual.
   *
   * When `true` it is hidden from assistive technology, which is correct for
   * the overwhelmingly common case of separating content that is already
   * grouped semantically. Set it to `false` only when the separation itself
   * carries meaning that a screen reader would otherwise miss.
   *
   * Has no effect when a label is present: a label is content, so it is always
   * exposed.
   *
   * @default true
   */
  decorative?: boolean;

  /** Margin along the divider's main axis. @default "md" */
  spacing?: "none" | "sm" | "md" | "lg";

  /**
   * Optional label, centred between two halves of the rule.
   *
   * Horizontal only. A label passed alongside `orientation="vertical"` is
   * ignored rather than rejected, because orientation is often driven by a
   * responsive value and a label that is valid at one breakpoint should not
   * throw at another.
   */
  children?: ReactNode;
}

/**
 * A thin rule that separates content, optionally with a centred label.
 *
 * @example
 * ```tsx
 * <Divider />
 * <Divider orientation="vertical" spacing="sm" />
 * <Divider>or</Divider>
 * ```
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { orientation = "horizontal", decorative = true, spacing = "md", children, className, ...rest },
  ref,
) {
  const labelled = orientation === "horizontal" && children != null && children !== false;

  /*
   * A label is content, and content is never hidden - so a labelled divider
   * gets no ARIA at all and its text is exposed as ordinary text.
   *
   * `decorative` therefore has no effect once a label is present, and that is
   * deliberate rather than an oversight. Neither alternative works: keeping
   * aria-hidden would drop the label from the accessibility tree, and
   * role="separator" has presentational children in ARIA 1.2, so it would
   * suppress the label too. The two spans either side are empty, so they
   * contribute nothing and need no aria-hidden of their own (A11Y-11).
   *
   * Without a label, `decorative` behaves exactly as documented: hidden when
   * true, a real separator when false. aria-orientation is set on both axes
   * rather than only the non-default one, so the exposed semantics never
   * depend on a user agent's idea of the default.
   */
  const semantics = labelled
    ? {}
    : decorative
      ? { "aria-hidden": true }
      : { role: "separator", "aria-orientation": orientation };

  return (
    <div
      ref={ref}
      className={cn("pui-divider", className)}
      data-pui-orientation={orientation}
      data-pui-spacing={spacing}
      data-pui-labelled={labelled ? "true" : undefined}
      {...semantics}
      {...rest}
    >
      {labelled ? (
        <>
          <span className="pui-divider-line" />
          <span className="pui-divider-label">{children}</span>
          <span className="pui-divider-line" />
        </>
      ) : null}
    </div>
  );
});

Divider.displayName = "Divider";
