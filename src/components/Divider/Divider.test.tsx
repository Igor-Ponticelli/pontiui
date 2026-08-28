import { describe, expect, it } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { expectNoAxeViolations } from "../../../test/axe";
import { Divider } from "./Divider";

describe("Divider", () => {
  it("renders a horizontal rule by default", () => {
    const { container } = render(<Divider />);
    const el = container.firstElementChild as HTMLElement;

    // Reading computed style rather than class names (T-1): this asserts the
    // thickness token actually resolved, not that a string was written.
    expect(getComputedStyle(el).height).toBe("1px");
    expect(parseFloat(getComputedStyle(el).width)).toBeGreaterThan(0);
  });

  it("has no accessibility violations by default", async () => {
    const { container } = render(<Divider />);
    await expectNoAxeViolations(container);
  });

  it("keeps a decorative divider out of the accessibility tree", () => {
    render(<Divider />);
    expect(screen.queryByRole("separator")).toBeNull();
  });

  it("exposes a separator with its orientation when it is meaningful", () => {
    const { rerender } = render(<Divider decorative={false} />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "horizontal");

    rerender(<Divider decorative={false} orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("exposes the label of a labelled divider", () => {
    // Regression test (T-8). The first implementation applied aria-hidden here
    // because `decorative` defaults to true, which hid the label of
    // <Divider>or</Divider> from screen readers entirely.
    render(<Divider>or</Divider>);
    expect(screen.getByText("or")).toBeVisible();
  });

  it("exposes the label even when decorative is set explicitly", () => {
    render(<Divider decorative>or</Divider>);
    expect(screen.getByText("or")).toBeVisible();
  });

  it("ignores a label on a vertical divider", () => {
    render(<Divider orientation="vertical">ignored</Divider>);
    expect(screen.queryByText("ignored")).toBeNull();
  });

  it("forwards its ref to the rendered element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Divider ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges a consumer className instead of replacing its own styling", () => {
    const { container } = render(<Divider className="consumer" />);
    const el = container.firstElementChild as HTMLElement;

    expect(el).toHaveClass("consumer");
    // The library's own rule still applies, so the merge did not drop it.
    expect(getComputedStyle(el).height).toBe("1px");
  });

  it("spreads unknown props onto the element", () => {
    const { container } = render(<Divider data-analytics="x" id="d" />);
    const el = container.firstElementChild as HTMLElement;

    expect(el).toHaveAttribute("data-analytics", "x");
    expect(el.id).toBe("d");
  });
});
