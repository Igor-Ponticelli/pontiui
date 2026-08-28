import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, Ref } from "react";
import { cn } from "../../utils/cn";

/**
 * Elements `Text` can render.
 *
 * A restricted union rather than full polymorphic generics (D-25). Every member
 * carries the same attribute surface, so props stay a plain interface and the
 * error a consumer sees when they mistype `as` is a short list of valid values
 * instead of an unreadable generic mismatch.
 */
export type TextElement = "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type TextSize =
  "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";

export type TextWeight = "regular" | "medium" | "semibold" | "bold";

export type TextTone = "default" | "muted" | "primary" | "danger" | "success";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /**
   * Element to render.
   *
   * Independent of `size`: heading semantics come from `as`, never from how
   * large the text looks. `<Text as="h2" size="md">` is a real heading that
   * happens to be small, and `<Text size="4xl">` is a large paragraph that is
   * not a heading. Getting this backwards is the most likely misuse of this
   * component.
   *
   * @default "p"
   */
  as?: TextElement;

  /** Type scale step. @default "md" */
  size?: TextSize;

  /** @default "regular" */
  weight?: TextWeight;

  /** Semantic colour role. @default "default" */
  tone?: TextTone;

  /** Text alignment. Logical, so it follows the writing direction. */
  align?: "start" | "center" | "end";

  /**
   * Clamp to a single line with an ellipsis. Requires a constrained width.
   *
   * Ignored when `lineClamp` is set, since a line count is the more specific
   * instruction.
   */
  truncate?: boolean;

  /** Clamp to this many lines with an ellipsis. Takes precedence over `truncate`. */
  lineClamp?: number;
}

/**
 * Renders text on the library's type scale.
 *
 * No margin of its own: spacing belongs to the parent, so the component
 * composes predictably wherever it is placed.
 *
 * @example
 * ```tsx
 * <Text>Body copy</Text>
 * <Text as="h1" size="4xl" weight="bold">Page title</Text>
 * <Text tone="muted" size="sm">Caption</Text>
 * <Text lineClamp={2}>Long description…</Text>
 * ```
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as: Component = "p",
    size = "md",
    weight = "regular",
    tone = "default",
    align,
    truncate = false,
    lineClamp,
    className,
    style,
    ...rest
  },
  ref,
) {
  const clamped = typeof lineClamp === "number" && lineClamp > 0;

  return (
    <Component
      /*
       * Every member of TextElement is an HTMLElement, so this ref is always
       * valid at runtime. TypeScript resolves the JSX ref of a union of
       * intrinsic tags to one concrete element type rather than to their common
       * supertype, so the widened ref has to be narrowed back for the call.
       *
       * This single cast is the entire cost of the restricted union (D-25).
       * Full polymorphic generics would remove it and hand the cost to every
       * consumer instead, in the form of generic error messages. Paying it once
       * here is the better trade. No `any` and no `@ts-expect-error` are
       * involved (TS-1, TS-2).
       */
      ref={ref as Ref<HTMLHeadingElement>}
      className={cn("pui-text", className)}
      data-pui-size={size}
      data-pui-weight={weight}
      data-pui-tone={tone}
      data-pui-align={align}
      data-pui-truncate={!clamped && truncate ? "true" : undefined}
      data-pui-clamp={clamped ? "true" : undefined}
      /*
       * The one sanctioned use of inline style (ST-1): the line count is a
       * genuinely dynamic value that cannot exist as a token. It is handed to
       * CSS as a custom property so the clamping rule itself stays in the
       * stylesheet. The consumer's own `style` is spread after, so they keep
       * the last word.
       */
      style={clamped ? { ...toClampStyle(lineClamp), ...style } : style}
      {...rest}
    />
  );
});

Text.displayName = "Text";

function toClampStyle(lines: number): CSSProperties {
  return { "--pui-text-line-clamp": lines } as CSSProperties;
}
