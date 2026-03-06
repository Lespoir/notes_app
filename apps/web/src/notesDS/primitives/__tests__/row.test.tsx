import { render, screen } from "@testing-library/react";
import { Row } from "../row";

describe("Row", () => {
  it("renders children", () => {
    render(
      <Row>
        <p>child</p>
      </Row>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("renders as a div by default", () => {
    render(<Row data-testid="row">content</Row>);
    expect(screen.getByTestId("row").tagName).toBe("DIV");
  });

  it("renders as a custom element via the as prop", () => {
    render(
      <Row as="nav" data-testid="row">
        content
      </Row>,
    );
    expect(screen.getByTestId("row").tagName).toBe("NAV");
  });

  it("applies flex-row direction class", () => {
    render(<Row data-testid="row">content</Row>);
    expect(screen.getByTestId("row")).toHaveClass("flex-row");
  });

  it("applies gap class corresponding to the gap prop", () => {
    render(
      <Row gap={6} data-testid="row">
        content
      </Row>,
    );
    expect(screen.getByTestId("row")).toHaveClass("gap-6");
  });

  it("applies align class corresponding to the align prop", () => {
    render(
      <Row align="center" data-testid="row">
        content
      </Row>,
    );
    expect(screen.getByTestId("row")).toHaveClass("items-center");
  });

  it("applies justify class corresponding to the justify prop", () => {
    render(
      <Row justify="between" data-testid="row">
        content
      </Row>,
    );
    expect(screen.getByTestId("row")).toHaveClass("justify-between");
  });

  it("applies flex-wrap when wrap prop is provided", () => {
    render(
      <Row wrap data-testid="row">
        content
      </Row>,
    );
    expect(screen.getByTestId("row")).toHaveClass("flex-wrap");
  });

  it("merges consumer className with generated classes", () => {
    render(
      <Row className="custom-class" data-testid="row">
        content
      </Row>,
    );
    const el = screen.getByTestId("row");
    expect(el).toHaveClass("custom-class");
    expect(el).toHaveClass("flex");
  });

  it("forwards additional HTML attributes", () => {
    render(
      <Row aria-label="row container" data-testid="row">
        content
      </Row>,
    );
    expect(screen.getByTestId("row")).toHaveAttribute(
      "aria-label",
      "row container",
    );
  });
});
