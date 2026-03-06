import { render, screen } from "@testing-library/react";
import { Section } from "../section";

describe("Section", () => {
  it("renders children", () => {
    render(
      <Section>
        <p>child</p>
      </Section>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("renders as a <section> element by default", () => {
    render(<Section data-testid="section">content</Section>);
    expect(screen.getByTestId("section").tagName).toBe("SECTION");
  });

  it("renders as a custom element via the as prop", () => {
    render(
      <Section as="article" data-testid="section">
        content
      </Section>,
    );
    expect(screen.getByTestId("section").tagName).toBe("ARTICLE");
  });

  it("applies vertical padding", () => {
    render(<Section data-testid="section">content</Section>);
    const el = screen.getByTestId("section");
    // Should have some vertical padding (py-*)
    expect(el.className).toMatch(/py-/);
  });

  it("applies gap class when gap prop is provided", () => {
    render(
      <Section gap={4} data-testid="section">
        content
      </Section>,
    );
    expect(screen.getByTestId("section")).toHaveClass("gap-4");
  });

  it("merges consumer className with generated classes", () => {
    render(
      <Section className="custom-class" data-testid="section">
        content
      </Section>,
    );
    expect(screen.getByTestId("section")).toHaveClass("custom-class");
  });

  it("forwards additional HTML attributes", () => {
    render(
      <Section aria-label="main section" data-testid="section">
        content
      </Section>,
    );
    expect(screen.getByTestId("section")).toHaveAttribute(
      "aria-label",
      "main section",
    );
  });
});
