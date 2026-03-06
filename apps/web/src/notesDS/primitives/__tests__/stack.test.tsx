import { render, screen } from "@testing-library/react";
import { Stack } from "../stack";

describe("Stack", () => {
  it("renders children", () => {
    render(
      <Stack>
        <p>child</p>
      </Stack>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("renders as a div by default", () => {
    render(<Stack data-testid="stack">content</Stack>);
    expect(screen.getByTestId("stack").tagName).toBe("DIV");
  });

  it("renders as a custom element via the as prop", () => {
    render(
      <Stack as="section" data-testid="stack">
        content
      </Stack>,
    );
    expect(screen.getByTestId("stack").tagName).toBe("SECTION");
  });

  it("applies flex-col direction class", () => {
    render(<Stack data-testid="stack">content</Stack>);
    expect(screen.getByTestId("stack")).toHaveClass("flex-col");
  });

  it("applies gap class corresponding to the gap prop", () => {
    render(
      <Stack gap={4} data-testid="stack">
        content
      </Stack>,
    );
    expect(screen.getByTestId("stack")).toHaveClass("gap-4");
  });

  it("applies align class corresponding to the align prop", () => {
    render(
      <Stack align="center" data-testid="stack">
        content
      </Stack>,
    );
    expect(screen.getByTestId("stack")).toHaveClass("items-center");
  });

  it("applies justify class corresponding to the justify prop", () => {
    render(
      <Stack justify="between" data-testid="stack">
        content
      </Stack>,
    );
    expect(screen.getByTestId("stack")).toHaveClass("justify-between");
  });

  it("merges consumer className with generated classes", () => {
    render(
      <Stack className="custom-class" data-testid="stack">
        content
      </Stack>,
    );
    const el = screen.getByTestId("stack");
    expect(el).toHaveClass("custom-class");
    expect(el).toHaveClass("flex");
  });

  it("forwards additional HTML attributes", () => {
    render(
      <Stack aria-label="stack container" data-testid="stack">
        content
      </Stack>,
    );
    expect(screen.getByTestId("stack")).toHaveAttribute(
      "aria-label",
      "stack container",
    );
  });
});
