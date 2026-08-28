import { describe, expect, it } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { expectNoAxeViolations } from "../../../test/axe";
import { Skeleton } from "./Skeleton";

function styleOf(container: HTMLElement, selector = ".pui-skeleton"): CSSStyleDeclaration {
  return getComputedStyle(container.querySelector(selector)!);
}

describe("Skeleton", () => {
  it("renders a text placeholder by default", () => {
    const { container } = render(<Skeleton />);
    const style = styleOf(container);

    // Height follows the font size, so it lines up with the text it replaces.
    expect(parseFloat(style.height)).toBeCloseTo(parseFloat(style.fontSize), 1);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Skeleton />);
    await expectNoAxeViolations(container);
  });

  it("is never announced", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    // Nothing inside carries text either, so there is nothing to read out.
    expect(container.textContent).toBe("");
  });

  it("renders a circle as a square with a full radius", () => {
    const { container } = render(<Skeleton variant="circle" />);
    const style = styleOf(container);

    expect(parseFloat(style.width)).toBeCloseTo(parseFloat(style.height), 1);
    // A full radius resolves to half the box or more, never a small value.
    expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThanOrEqual(
      parseFloat(style.width) / 2,
    );
  });

  it("accepts arbitrary dimensions the token scale cannot express", () => {
    const { container } = render(<Skeleton variant="rect" width={137} height="3.5rem" />);
    const style = styleOf(container);

    expect(style.width).toBe("137px");
    expect(style.height).toBe("56px");
  });

  it("lets a consumer style survive alongside the injected dimensions", () => {
    // Deliberately not opacity: the pulse animates it, and a running animation
    // wins over an inline value for the property it animates. That is how CSS
    // works rather than a defect, but it makes opacity a bad probe here.
    const { container } = render(<Skeleton width={100} style={{ marginTop: "7px" }} />);
    const style = styleOf(container);

    expect(style.width).toBe("100px");
    expect(style.marginTop).toBe("7px");
  });

  it("renders the requested number of stacked lines", () => {
    const { container } = render(<Skeleton lines={4} />);
    expect(container.querySelectorAll(".pui-skeleton-line")).toHaveLength(4);
  });

  it("shortens the last line so a stack reads as a paragraph", () => {
    const { container } = render(<Skeleton lines={3} />);
    const lines = [...container.querySelectorAll(".pui-skeleton-line")];
    const widths = lines.map((l) => parseFloat(getComputedStyle(l).width));

    expect(widths[0]).toBe(widths[1]);
    expect(widths[2]!).toBeLessThan(widths[0]!);
  });

  it("does not stack when there is a single line", () => {
    const { container } = render(<Skeleton lines={1} />);
    expect(container.querySelectorAll(".pui-skeleton-line")).toHaveLength(0);
  });

  it("ignores lines on shapes that are not text", () => {
    const { container } = render(<Skeleton variant="circle" lines={3} />);
    expect(container.querySelectorAll(".pui-skeleton-line")).toHaveLength(0);
  });

  it("animates by default and stops when asked", () => {
    const { container, unmount } = render(<Skeleton />);
    expect(styleOf(container).animationName).toBe("pui-skeleton-pulse");
    unmount();

    const still = render(<Skeleton animation="none" />);
    expect(styleOf(still.container).animationName).toBe("none");
  });

  it("overrides the per-variant radius when asked", () => {
    const { container } = render(<Skeleton variant="rect" radius="full" />);
    expect(parseFloat(styleOf(container).borderTopLeftRadius)).toBeGreaterThan(100);
  });

  it("forwards its ref to the rendered element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges a consumer className and spreads unknown props", () => {
    const { container } = render(<Skeleton className="consumer" data-analytics="x" />);
    const el = container.firstElementChild as HTMLElement;

    expect(el).toHaveClass("consumer");
    expect(el).toHaveAttribute("data-analytics", "x");
    // The library's own rule survived the merge.
    expect(getComputedStyle(el).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("stays out of the accessibility tree even inside a busy container", () => {
    render(
      <div aria-busy="true" data-testid="region">
        <Skeleton lines={2} />
      </div>,
    );
    // The container carries the loading state; the placeholder carries nothing.
    expect(screen.getByTestId("region")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByTestId("region").textContent).toBe("");
  });
});
