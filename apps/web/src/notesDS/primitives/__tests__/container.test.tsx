import { render, screen } from "@testing-library/react";
import { Container } from "../container";

describe("Container", () => {
  it("renders children", () => {
    render(
      <Container>
        <p>child</p>
      </Container>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("renders as a div by default", () => {
    render(<Container data-testid="container">content</Container>);
    expect(screen.getByTestId("container").tagName).toBe("DIV");
  });

  it("renders as a custom element via the as prop", () => {
    render(
      <Container as="main" data-testid="container">
        content
      </Container>,
    );
    expect(screen.getByTestId("container").tagName).toBe("MAIN");
  });

  it("applies mx-auto for centering", () => {
    render(<Container data-testid="container">content</Container>);
    expect(screen.getByTestId("container")).toHaveClass("mx-auto");
  });

  it("applies a max-width class for the sm size", () => {
    render(
      <Container size="sm" data-testid="container">
        content
      </Container>,
    );
    expect(screen.getByTestId("container")).toHaveClass("max-w-sm");
  });

  it("applies a max-width class for the md size", () => {
    render(
      <Container size="md" data-testid="container">
        content
      </Container>,
    );
    expect(screen.getByTestId("container")).toHaveClass("max-w-md");
  });

  it("applies a max-width class for the lg size", () => {
    render(
      <Container size="lg" data-testid="container">
        content
      </Container>,
    );
    expect(screen.getByTestId("container")).toHaveClass("max-w-lg");
  });

  it("applies a max-width class for the xl size", () => {
    render(
      <Container size="xl" data-testid="container">
        content
      </Container>,
    );
    expect(screen.getByTestId("container")).toHaveClass("max-w-xl");
  });

  it("applies no max-width constraint for the full size", () => {
    render(
      <Container size="full" data-testid="container">
        content
      </Container>,
    );
    expect(screen.getByTestId("container")).toHaveClass("max-w-full");
  });

  it("applies horizontal padding", () => {
    render(<Container data-testid="container">content</Container>);
    const el = screen.getByTestId("container");
    // Should have some horizontal padding (px-*)
    expect(el.className).toMatch(/px-/);
  });

  it("merges consumer className with generated classes", () => {
    render(
      <Container className="custom-class" data-testid="container">
        content
      </Container>,
    );
    expect(screen.getByTestId("container")).toHaveClass("custom-class");
  });

  it("forwards additional HTML attributes", () => {
    render(
      <Container aria-label="page container" data-testid="container">
        content
      </Container>,
    );
    expect(screen.getByTestId("container")).toHaveAttribute(
      "aria-label",
      "page container",
    );
  });
});
