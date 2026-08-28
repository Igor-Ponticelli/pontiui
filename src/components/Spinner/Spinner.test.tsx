import { describe, expect, it } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { expectNoAxeViolations } from "../../../test/axe";
import { Spinner } from "./Spinner";

/** What a token evaluates to in this document, so assertions compare rendered
 *  output against the token itself rather than against a copied literal. */
function resolveToken(token: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

function widthOf(container: HTMLElement, selector: string): number {
  return parseFloat(getComputedStyle(container.querySelector(selector)!).width);
}

describe("Spinner", () => {
  it("announces itself as a status carrying its default label", () => {
    render(<Spinner />);
    // A live region announces its *contents*, not its name: role="status"
    // takes its name from the author only, so a bare aria-label on an empty
    // region would announce nothing. The hidden text is the mechanism.
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
  });

  it("has no accessibility violations by default", async () => {
    const { container } = render(<Spinner />);
    await expectNoAxeViolations(container);
  });

  it("keeps the label in the accessibility tree while hiding it visually", () => {
    render(<Spinner />);
    const label = screen.getByText("Loading");

    // display:none or visibility:hidden would remove it from the tree and
    // silence the announcement, so the visually-hidden technique matters.
    expect(getComputedStyle(label).display).not.toBe("none");
    expect(getComputedStyle(label).visibility).not.toBe("hidden");
    expect(parseFloat(getComputedStyle(label).width)).toBeLessThan(2);
  });

  it("uses a custom label as the announced text", () => {
    render(<Spinner label="Saving changes" />);
    expect(screen.getByRole("status")).toHaveTextContent("Saving changes");
  });

  it("leaves the accessibility tree entirely when decorative", () => {
    render(<Spinner decorative />);
    expect(screen.queryByRole("status")).toBeNull();
    // The label is not rendered at all, so a parent that already reports the
    // busy state cannot announce it a second time.
    expect(screen.queryByText("Loading")).toBeNull();
  });

  it("keeps the graphic hidden from assistive tech in every configuration", () => {
    const { container, rerender } = render(<Spinner />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");

    rerender(<Spinner decorative />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("scales with the font size around it", () => {
    // Sizing in em is why a spinner in small text is small without being told.
    // Only real layout can show this.
    const { container } = render(
      <div style={{ fontSize: "10px" }}>
        <Spinner />
      </div>,
    );
    expect(widthOf(container, "svg")).toBeCloseTo(12.5, 1); // md is 1.25em
  });

  it("orders the three sizes from smallest to largest", () => {
    const widths = (["sm", "md", "lg"] as const).map((size) => {
      const { container, unmount } = render(<Spinner size={size} />);
      const w = widthOf(container, "svg");
      unmount();
      return w;
    });

    expect(widths[0]!).toBeLessThan(widths[1]!);
    expect(widths[1]!).toBeLessThan(widths[2]!);
  });

  it("inherits the surrounding colour by default", () => {
    const { container } = render(
      <div style={{ color: "rgb(1, 2, 3)" }}>
        <Spinner />
      </div>,
    );
    expect(getComputedStyle(container.querySelector(".pui-spinner-head")!).stroke).toBe(
      "rgb(1, 2, 3)",
    );
  });

  it("takes the semantic token when a tone is given", () => {
    const { container } = render(<Spinner tone="primary" />);
    expect(getComputedStyle(container.querySelector(".pui-spinner-head")!).stroke).toBe(
      resolveToken("--pui-color-primary"),
    );
  });

  it("forwards its ref to the rendered element", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it("merges a consumer className and spreads unknown props", () => {
    const { container } = render(<Spinner className="consumer" data-analytics="x" />);
    const el = container.firstElementChild as HTMLElement;

    expect(el).toHaveClass("consumer");
    expect(el).toHaveAttribute("data-analytics", "x");
    // The library's own rule survived the merge.
    expect(getComputedStyle(el).display).toBe("inline-flex");
  });
});
