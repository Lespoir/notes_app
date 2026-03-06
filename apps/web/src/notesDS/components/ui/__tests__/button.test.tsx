import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, buttonVariants } from "../button";

describe("Button", () => {
  describe("rendering", () => {
    it("renders as a <button> element by default", () => {
      render(<Button>Click me</Button>);
      expect(
        screen.getByRole("button", { name: "Click me" }),
      ).toBeInTheDocument();
    });

    it("renders children", () => {
      render(<Button>Submit</Button>);
      expect(screen.getByText("Submit")).toBeInTheDocument();
    });

    it("applies base classes for interactive styling", () => {
      render(<Button data-testid="btn">Click</Button>);
      // Should have cursor-pointer or inline-flex (base styles from CVA)
      const el = screen.getByTestId("btn");
      expect(el.className.length).toBeGreaterThan(0);
    });
  });

  describe("variant: primary (default)", () => {
    it("applies primary variant classes when variant is primary", () => {
      render(
        <Button variant="primary" data-testid="btn">
          Primary
        </Button>,
      );
      // Primary variant should reference a primary bg token
      expect(screen.getByTestId("btn").className).toMatch(/bg-primary/);
    });

    it("applies primary variant as the default when no variant is specified", () => {
      render(<Button data-testid="btn">Default</Button>);
      expect(screen.getByTestId("btn").className).toMatch(/bg-primary/);
    });
  });

  describe("variant: secondary", () => {
    it("applies secondary variant classes", () => {
      render(
        <Button variant="secondary" data-testid="btn">
          Secondary
        </Button>,
      );
      expect(screen.getByTestId("btn").className).toMatch(/bg-secondary/);
    });

    it("does not apply primary background classes", () => {
      render(
        <Button variant="secondary" data-testid="btn">
          Secondary
        </Button>,
      );
      expect(screen.getByTestId("btn")).not.toHaveClass("bg-primary");
    });
  });

  describe("variant: ghost", () => {
    it("applies ghost variant classes (transparent background)", () => {
      render(
        <Button variant="ghost" data-testid="btn">
          Ghost
        </Button>,
      );
      // Ghost variant should not have a solid background
      expect(screen.getByTestId("btn")).not.toHaveClass("bg-primary");
      expect(screen.getByTestId("btn")).not.toHaveClass("bg-secondary");
    });

    it("applies ghost-specific hover class", () => {
      render(
        <Button variant="ghost" data-testid="btn">
          Ghost
        </Button>,
      );
      expect(screen.getByTestId("btn").className).toMatch(/hover:/);
    });
  });

  describe("variant: icon", () => {
    it("applies icon variant classes (square dimensions)", () => {
      render(
        <Button variant="icon" data-testid="btn" aria-label="close">
          X
        </Button>,
      );
      // Icon buttons should be square — check for equal width/height tokens
      const className = screen.getByTestId("btn").className;
      expect(className).toMatch(/h-/);
      expect(className).toMatch(/w-/);
    });

    it("applies no text padding (icon button is compact)", () => {
      render(
        <Button variant="icon" data-testid="btn" aria-label="close">
          X
        </Button>,
      );
      // Icon variant should not have large horizontal padding like primary
      expect(screen.getByTestId("btn")).not.toHaveClass("px-4");
    });
  });

  describe("interaction", () => {
    it("calls onClick handler when clicked", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click me</Button>);
      await user.click(screen.getByRole("button", { name: "Click me" }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button disabled onClick={onClick}>
          Disabled
        </Button>,
      );
      await user.click(screen.getByRole("button", { name: "Disabled" }));
      expect(onClick).not.toHaveBeenCalled();
    });

    it("renders as disabled when disabled prop is set", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
    });
  });

  describe("className override", () => {
    it("merges consumer className with generated classes", () => {
      render(
        <Button className="custom-class" data-testid="btn">
          Button
        </Button>,
      );
      expect(screen.getByTestId("btn")).toHaveClass("custom-class");
    });
  });

  describe("prop forwarding", () => {
    it("forwards type prop", () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });

    it("forwards aria-label prop", () => {
      render(<Button aria-label="close dialog">X</Button>);
      expect(
        screen.getByRole("button", { name: "close dialog" }),
      ).toBeInTheDocument();
    });

    it("forwards data attributes", () => {
      render(<Button data-testid="btn" data-action="save">Save</Button>);
      expect(screen.getByTestId("btn")).toHaveAttribute("data-action", "save");
    });
  });

  describe("buttonVariants export", () => {
    it("exports buttonVariants as a function", () => {
      expect(typeof buttonVariants).toBe("function");
    });

    it("returns a string of class names", () => {
      const result = buttonVariants({ variant: "primary" });
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns different class strings for different variants", () => {
      const primary = buttonVariants({ variant: "primary" });
      const secondary = buttonVariants({ variant: "secondary" });
      expect(primary).not.toBe(secondary);
    });
  });
});
