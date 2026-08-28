import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Diameter, expressed in `em` so the spinner scales with the font size it
   * sits in. A spinner inside a small Button is small without being told.
   *
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Where the colour comes from.
   *
   * `current` inherits `currentColor`, which is why it is the default: it works
   * inside a Button of any variant, on any background, with no configuration.
   *
   * @default "current"
   */
  tone?: "current" | "primary" | "muted";

  /**
   * Accessible name, announced when the spinner stands on its own.
   *
   * @default "Loading"
   */
  label?: string;

  /**
   * Whether the spinner is purely visual.
   *
   * Set this whenever the spinner sits inside something that already
   * communicates the busy state - a Button with `aria-busy`, for example.
   * Without it the state is announced twice, which is the most common
   * accessibility mistake made with loading indicators.
   *
   * Named to match `Divider`, since it is the same concept library-wide
   * (X-1): whether this element reaches assistive technology.
   *
   * @default false
   */
  decorative?: boolean;
}

/**
 * An indeterminate loading indicator.
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="sm" label="Saving changes" />
 * <Spinner decorative />   // inside a control that already announces busy
 * ```
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", tone = "current", label = "Loading", decorative = false, className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn("pui-spinner", className)}
      data-pui-size={size}
      data-pui-tone={tone}
      // A decorative spinner leaves the accessibility tree entirely. Otherwise
      // it is a status region named by its own visually hidden label.
      {...(decorative ? { "aria-hidden": true } : { role: "status" })}
      {...rest}
    >
      {/*
       * Geometry lives in viewBox units rather than tokens: it describes the
       * shape, not a design value, and scales with the element (ST-4 covers
       * colour, space, radius, shadow, type and duration).
       *
       * Two circles: a faint full ring for the track, and an arc for the head.
       * `focusable="false"` keeps legacy engines from putting the SVG in the
       * tab order.
       */}
      <svg className="pui-spinner-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle className="pui-spinner-track" cx="12" cy="12" r="10" fill="none" strokeWidth="3" />
        <circle
          className="pui-spinner-head"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          strokeWidth="3"
          strokeDasharray="16 47"
          strokeLinecap="round"
        />
      </svg>
      {decorative ? null : <span className="pui-spinner-label">{label}</span>}
    </span>
  );
});

Spinner.displayName = "Spinner";
