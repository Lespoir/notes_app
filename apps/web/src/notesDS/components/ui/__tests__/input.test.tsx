import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input, inputVariants } from "../input";

describe("Input", () => {
  describe("rendering", () => {
    it("renders as an <input> element", () => {
      render(<Input aria-label="text field" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders with a placeholder when provided", () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("renders with an associated label when id and htmlFor are provided", () => {
      render(
        <label htmlFor="name-input">
          Name
          <Input id="name-input" />
        </label>,
      );
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
    });
  });

  describe("variant: default", () => {
    it("applies border class for the default variant", () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId("input")).toHaveClass("border");
    });

    it("applies rounded class for the default variant", () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId("input").className).toMatch(/rounded/);
    });

    it("applies background class referencing a theme token", () => {
      render(<Input data-testid="input" />);
      // Should reference bg-background or similar token (not a hardcoded color)
      expect(screen.getByTestId("input").className).toMatch(/bg-/);
    });
  });

  describe("variant: error", () => {
    it("applies error-specific border color class", () => {
      render(<Input variant="error" data-testid="input" />);
      // Error variant should reference destructive or error token
      expect(screen.getByTestId("input").className).toMatch(
        /border-destructive|border-error/,
      );
    });

    it("does not apply default border color for error variant", () => {
      render(<Input variant="error" data-testid="input" />);
      expect(screen.getByTestId("input")).not.toHaveClass("border-input");
    });
  });

  describe("interaction", () => {
    it("accepts typed input", async () => {
      const user = userEvent.setup();
      render(<Input aria-label="text field" />);
      const input = screen.getByRole("textbox");
      await user.type(input, "hello");
      expect(input).toHaveValue("hello");
    });

    it("calls onChange handler when value changes", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Input aria-label="text field" onChange={onChange} />);
      await user.type(screen.getByRole("textbox"), "a");
      expect(onChange).toHaveBeenCalled();
    });

    it("does not allow typing when disabled", async () => {
      const user = userEvent.setup();
      render(<Input aria-label="text field" disabled />);
      const input = screen.getByRole("textbox");
      await user.type(input, "hello");
      expect(input).toHaveValue("");
    });

    it("is marked as disabled when disabled prop is set", () => {
      render(<Input aria-label="text field" disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });
  });

  describe("className override", () => {
    it("merges consumer className with generated classes", () => {
      render(<Input className="custom-class" data-testid="input" />);
      expect(screen.getByTestId("input")).toHaveClass("custom-class");
    });
  });

  describe("prop forwarding", () => {
    it("forwards type prop", () => {
      render(<Input type="email" data-testid="input" />);
      expect(screen.getByTestId("input")).toHaveAttribute("type", "email");
    });

    it("forwards name prop", () => {
      render(<Input name="email" data-testid="input" />);
      expect(screen.getByTestId("input")).toHaveAttribute("name", "email");
    });

    it("forwards value and readOnly props", () => {
      render(<Input value="fixed" readOnly data-testid="input" />);
      expect(screen.getByTestId("input")).toHaveValue("fixed");
    });

    it("forwards maxLength prop", () => {
      render(<Input maxLength={100} data-testid="input" />);
      expect(screen.getByTestId("input")).toHaveAttribute("maxLength", "100");
    });

    it("forwards aria-describedby prop", () => {
      render(
        <Input aria-describedby="help-text" data-testid="input" />,
      );
      expect(screen.getByTestId("input")).toHaveAttribute(
        "aria-describedby",
        "help-text",
      );
    });
  });

  describe("inputVariants export", () => {
    it("exports inputVariants as a function", () => {
      expect(typeof inputVariants).toBe("function");
    });

    it("returns a string of class names", () => {
      const result = inputVariants({});
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns different class strings for default vs error variants", () => {
      const defaultClasses = inputVariants({ variant: "default" });
      const errorClasses = inputVariants({ variant: "error" });
      expect(defaultClasses).not.toBe(errorClasses);
    });
  });
});
