import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type SkeletonVariant = "text" | "circle" | "rect";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Placeholder shape.
   *
   * `text` takes its height from the surrounding font size, so it lines up with
   * the real text it stands in for. `circle` is square with a full radius, for
   * avatars. `rect` is a generic block for images and cards.
   *
   * @default "text"
   */
  variant?: SkeletonVariant;

  /** CSS width. Passed straight through, so any unit works. */
  width?: string | number;

  /** CSS height. Passed straight through, so any unit works. */
  height?: string | number;

  /**
   * Number of stacked lines. `text` variant only.
   *
   * Above one, the last line is shortened so the block reads as a paragraph
   * rather than a table.
   *
   * @default 1
   */
  lines?: number;

  /** @default "pulse" */
  animation?: "pulse" | "none";

  /** Corner radius override. Defaults to whatever suits the variant. */
  radius?: "sm" | "md" | "lg" | "full";
}

/**
 * A placeholder that occupies the space of content still loading.
 *
 * Always hidden from assistive technology: a screen reader announcing "loading"
 * a dozen times is noise, not information. **Communicating the loading state is
 * the consumer's job** - put `aria-busy="true"` on the container that owns the
 * region being replaced, and remove it when the content arrives.
 *
 * @example
 * ```tsx
 * <div aria-busy={pending}>
 *   {pending ? <Skeleton lines={3} /> : <Article />}
 * </div>
 * ```
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  {
    variant = "text",
    width,
    height,
    lines = 1,
    animation = "pulse",
    radius,
    className,
    style,
    ...rest
  },
  ref,
) {
  const stacked = variant === "text" && lines > 1;

  return (
    <div
      ref={ref}
      className={cn("pui-skeleton", className)}
      data-pui-variant={variant}
      data-pui-animation={animation}
      data-pui-radius={radius}
      data-pui-stacked={stacked ? "true" : undefined}
      /*
       * width and height are arbitrary consumer values that cannot come from a
       * token, which is the ST-1 exception. The consumer's own `style` is
       * spread last so it still wins.
       */
      style={{ ...toSizeStyle(width, height), ...style }}
      // Never announced. The container communicates loading, not the shape.
      aria-hidden="true"
      {...rest}
    >
      {stacked
        ? Array.from({ length: lines }, (_, i) => <span key={i} className="pui-skeleton-line" />)
        : null}
    </div>
  );
});

Skeleton.displayName = "Skeleton";

function toSizeStyle(width?: string | number, height?: string | number): CSSProperties {
  const style: CSSProperties = {};
  if (width !== undefined) style.width = width;
  if (height !== undefined) style.height = height;
  return style;
}
