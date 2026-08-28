import { describe, expect, it } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { expectNoAxeViolations } from "../../../test/axe";
import { Text } from "./Text";

function resolveToken(token: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

function fontSizeOf(el: Element): number {
  return parseFloat(getComputedStyle(el).fontSize);
}

describe("Text", () => {
  it("renders a paragraph by default", () => {
    const { container } = render(<Text>body</Text>);
    expect(container.firstElementChild!.tagName).toBe("P");
  });

  it("has no accessibility violations by default", async () => {
    const { container } = render(<Text>body</Text>);
    await expectNoAxeViolations(container);
  });

  it("renders a real heading when asked, addressable by role", () => {
    render(<Text as="h2">Section</Text>);
    expect(screen.getByRole("heading", { level: 2, name: "Section" })).toBeInTheDocument();
  });

  it("keeps size and semantics independent", () => {
    // The most likely misuse of this component is treating size as a heading
    // level. A small h1 and a small p must render at the same size, and a
    // large p must not become a heading.
    render(
      <>
        <Text as="h1" size="sm">
          small heading
        </Text>
        <Text size="sm">small paragraph</Text>
        <Text size="5xl">large paragraph</Text>
      </>,
    );

    expect(fontSizeOf(screen.getByText("small heading"))).toBe(
      fontSizeOf(screen.getByText("small paragraph")),
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("small heading");
    expect(screen.queryByRole("heading", { name: "large paragraph" })).toBeNull();
  });

  it("orders the whole type scale from xs to 7xl", () => {
    const sizes = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"] as const;
    const rendered = sizes.map((size) => {
      const { container, unmount } = render(<Text size={size}>x</Text>);
      const px = fontSizeOf(container.firstElementChild!);
      unmount();
      return px;
    });

    for (let i = 1; i < rendered.length; i += 1) {
      expect(rendered[i]!).toBeGreaterThan(rendered[i - 1]!);
    }
  });

  it("follows the base type token when it is set at the root", () => {
    // D-22: type is one axis, and every step derives from --pui-font-size-base.
    document.documentElement.style.setProperty("--pui-font-size-base", "2rem");
    try {
      const { container } = render(<Text size="md">x</Text>);
      expect(fontSizeOf(container.querySelector(".pui-text")!)).toBe(32);
    } finally {
      document.documentElement.style.removeProperty("--pui-font-size-base");
    }
  });

  it("does not re-derive the scale when the base is overridden on a subtree", () => {
    // Pinning a real limitation rather than a preference. A custom property
    // that references another is substituted where it is *declared* - at
    // :root - so redefining the input further down cannot re-derive the steps
    // that were already resolved. The scale knobs are root-level; a subtree
    // scales by overriding the derived step instead (next test).
    const { container } = render(
      <div style={{ "--pui-font-size-base": "2rem" } as React.CSSProperties}>
        <Text size="md">x</Text>
      </div>,
    );
    expect(fontSizeOf(container.querySelector(".pui-text")!)).toBe(16);
  });

  it("honours a derived step overridden on a subtree", () => {
    const { container } = render(
      <div style={{ "--pui-font-size-md": "2rem" } as React.CSSProperties}>
        <Text size="md">x</Text>
      </div>,
    );
    expect(fontSizeOf(container.querySelector(".pui-text")!)).toBe(32);
  });

  it("maps each tone to its semantic token", () => {
    const cases = [
      ["muted", "--pui-color-muted-foreground"],
      ["primary", "--pui-color-primary"],
      ["danger", "--pui-color-danger"],
      ["success", "--pui-color-success"],
    ] as const;

    for (const [tone, token] of cases) {
      const { container, unmount } = render(<Text tone={tone}>x</Text>);
      expect(getComputedStyle(container.firstElementChild!).color).toBe(resolveToken(token));
      unmount();
    }
  });

  it("carries no margin of its own, including on headings", () => {
    // The library ships no global reset (D-04), so the user-agent margin on
    // h1-h6 has to be cleared by the component itself.
    const { container } = render(<Text as="h1">title</Text>);
    const style = getComputedStyle(container.firstElementChild!);
    expect(style.marginTop).toBe("0px");
    expect(style.marginBottom).toBe("0px");
  });

  it("truncates to a single line with an ellipsis", () => {
    const { container } = render(<Text truncate>long text</Text>);
    const style = getComputedStyle(container.firstElementChild!);
    expect(style.textOverflow).toBe("ellipsis");
    expect(style.whiteSpace).toBe("nowrap");
  });

  it("clamps to the requested number of lines", () => {
    const { container } = render(<Text lineClamp={3}>long text</Text>);
    expect(getComputedStyle(container.firstElementChild!).webkitLineClamp).toBe("3");
  });

  it("lets lineClamp win when both are set", () => {
    const { container } = render(
      <Text truncate lineClamp={2}>
        long text
      </Text>,
    );
    const style = getComputedStyle(container.firstElementChild!);
    expect(style.webkitLineClamp).toBe("2");
    expect(style.whiteSpace).not.toBe("nowrap");
  });

  it("falls back to truncate when lineClamp is not a usable count", () => {
    const { container } = render(
      <Text truncate lineClamp={0}>
        long text
      </Text>,
    );
    expect(getComputedStyle(container.firstElementChild!).textOverflow).toBe("ellipsis");
  });

  it("keeps a consumer style alongside the injected line count", () => {
    const { container } = render(
      <Text lineClamp={2} style={{ color: "rgb(1, 2, 3)" }}>
        x
      </Text>,
    );
    const style = getComputedStyle(container.firstElementChild!);
    expect(style.webkitLineClamp).toBe("2");
    expect(style.color).toBe("rgb(1, 2, 3)");
  });

  it("forwards its ref for both a heading and a span", () => {
    const heading = createRef<HTMLElement>();
    const span = createRef<HTMLElement>();
    render(
      <>
        <Text as="h3" ref={heading}>
          h
        </Text>
        <Text as="span" ref={span}>
          s
        </Text>
      </>,
    );

    expect(heading.current).toBeInstanceOf(HTMLHeadingElement);
    expect(span.current).toBeInstanceOf(HTMLSpanElement);
  });

  it("merges a consumer className and spreads unknown props", () => {
    const { container } = render(
      <Text className="consumer" data-analytics="x">
        x
      </Text>,
    );
    const el = container.firstElementChild as HTMLElement;

    expect(el).toHaveClass("consumer");
    expect(el).toHaveAttribute("data-analytics", "x");
    expect(getComputedStyle(el).fontFamily).not.toBe("");
  });
});
