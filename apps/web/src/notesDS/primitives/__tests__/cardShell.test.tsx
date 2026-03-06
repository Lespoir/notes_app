import { render, screen } from "@testing-library/react";
import { CardShell } from "../cardShell";

describe("CardShell", () => {
  it("renders children", () => {
    render(
      <CardShell>
        <p>child</p>
      </CardShell>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("renders as a div by default", () => {
    render(<CardShell data-testid="card">content</CardShell>);
    expect(screen.getByTestId("card").tagName).toBe("DIV");
  });

  it("applies a border class for the bordered surface", () => {
    render(<CardShell data-testid="card">content</CardShell>);
    expect(screen.getByTestId("card")).toHaveClass("border");
  });

  it("applies a rounded class for the rounded surface", () => {
    render(<CardShell data-testid="card">content</CardShell>);
    expect(screen.getByTestId("card").className).toMatch(/rounded/);
  });

  it("applies sm padding class when padding is sm", () => {
    render(
      <CardShell padding="sm" data-testid="card">
        content
      </CardShell>,
    );
    expect(screen.getByTestId("card")).toHaveClass("p-2");
  });

  it("applies md padding class when padding is md", () => {
    render(
      <CardShell padding="md" data-testid="card">
        content
      </CardShell>,
    );
    expect(screen.getByTestId("card")).toHaveClass("p-4");
  });

  it("applies lg padding class when padding is lg", () => {
    render(
      <CardShell padding="lg" data-testid="card">
        content
      </CardShell>,
    );
    expect(screen.getByTestId("card")).toHaveClass("p-6");
  });

  it("applies no padding class when padding is none", () => {
    render(
      <CardShell padding="none" data-testid="card">
        content
      </CardShell>,
    );
    const el = screen.getByTestId("card");
    expect(el).not.toHaveClass("p-2");
    expect(el).not.toHaveClass("p-4");
    expect(el).not.toHaveClass("p-6");
  });

  it("merges consumer className with generated classes", () => {
    render(
      <CardShell className="custom-class" data-testid="card">
        content
      </CardShell>,
    );
    expect(screen.getByTestId("card")).toHaveClass("custom-class");
  });

  it("forwards additional HTML attributes", () => {
    render(
      <CardShell aria-label="note card" data-testid="card">
        content
      </CardShell>,
    );
    expect(screen.getByTestId("card")).toHaveAttribute(
      "aria-label",
      "note card",
    );
  });
});
