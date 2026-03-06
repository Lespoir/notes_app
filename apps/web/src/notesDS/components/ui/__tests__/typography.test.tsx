import { render, screen } from "@testing-library/react";
import {
  H1,
  H2,
  H3,
  H4,
  P,
  Large,
  Small,
  Muted,
  Lead,
  Overline,
} from "../typography";

describe("Typography components", () => {
  describe("H1", () => {
    it("renders as an <h1> element", () => {
      render(<H1>Heading 1</H1>);
      expect(
        screen.getByRole("heading", { level: 1, name: "Heading 1" }),
      ).toBeInTheDocument();
    });

    it("applies text-3xl class", () => {
      render(<H1 data-testid="h1">Heading 1</H1>);
      expect(screen.getByTestId("h1")).toHaveClass("text-3xl");
    });

    it("applies font-bold class", () => {
      render(<H1 data-testid="h1">Heading 1</H1>);
      expect(screen.getByTestId("h1")).toHaveClass("font-bold");
    });

    it("applies tracking-tight class", () => {
      render(<H1 data-testid="h1">Heading 1</H1>);
      expect(screen.getByTestId("h1")).toHaveClass("tracking-tight");
    });

    it("merges consumer className", () => {
      render(
        <H1 className="custom-class" data-testid="h1">
          Heading 1
        </H1>,
      );
      expect(screen.getByTestId("h1")).toHaveClass("custom-class");
    });

    it("forwards additional HTML attributes", () => {
      render(<H1 id="page-title">Heading 1</H1>);
      expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute(
        "id",
        "page-title",
      );
    });
  });

  describe("H2", () => {
    it("renders as an <h2> element", () => {
      render(<H2>Heading 2</H2>);
      expect(
        screen.getByRole("heading", { level: 2, name: "Heading 2" }),
      ).toBeInTheDocument();
    });

    it("applies text-2xl class", () => {
      render(<H2 data-testid="h2">Heading 2</H2>);
      expect(screen.getByTestId("h2")).toHaveClass("text-2xl");
    });

    it("applies font-bold class", () => {
      render(<H2 data-testid="h2">Heading 2</H2>);
      expect(screen.getByTestId("h2")).toHaveClass("font-bold");
    });

    it("applies tracking-tight class", () => {
      render(<H2 data-testid="h2">Heading 2</H2>);
      expect(screen.getByTestId("h2")).toHaveClass("tracking-tight");
    });

    it("merges consumer className", () => {
      render(
        <H2 className="custom-class" data-testid="h2">
          Heading 2
        </H2>,
      );
      expect(screen.getByTestId("h2")).toHaveClass("custom-class");
    });
  });

  describe("H3", () => {
    it("renders as an <h3> element", () => {
      render(<H3>Heading 3</H3>);
      expect(
        screen.getByRole("heading", { level: 3, name: "Heading 3" }),
      ).toBeInTheDocument();
    });

    it("applies text-xl class", () => {
      render(<H3 data-testid="h3">Heading 3</H3>);
      expect(screen.getByTestId("h3")).toHaveClass("text-xl");
    });

    it("applies font-bold class", () => {
      render(<H3 data-testid="h3">Heading 3</H3>);
      expect(screen.getByTestId("h3")).toHaveClass("font-bold");
    });

    it("merges consumer className", () => {
      render(
        <H3 className="custom-class" data-testid="h3">
          Heading 3
        </H3>,
      );
      expect(screen.getByTestId("h3")).toHaveClass("custom-class");
    });
  });

  describe("H4", () => {
    it("renders as an <h4> element", () => {
      render(<H4>Heading 4</H4>);
      expect(
        screen.getByRole("heading", { level: 4, name: "Heading 4" }),
      ).toBeInTheDocument();
    });

    it("applies text-lg class", () => {
      render(<H4 data-testid="h4">Heading 4</H4>);
      expect(screen.getByTestId("h4")).toHaveClass("text-lg");
    });

    it("applies font-semibold class", () => {
      render(<H4 data-testid="h4">Heading 4</H4>);
      expect(screen.getByTestId("h4")).toHaveClass("font-semibold");
    });

    it("merges consumer className", () => {
      render(
        <H4 className="custom-class" data-testid="h4">
          Heading 4
        </H4>,
      );
      expect(screen.getByTestId("h4")).toHaveClass("custom-class");
    });
  });

  describe("P", () => {
    it("renders as a <p> element", () => {
      render(<P data-testid="p">Paragraph</P>);
      expect(screen.getByTestId("p").tagName).toBe("P");
    });

    it("applies text-sm class", () => {
      render(<P data-testid="p">Paragraph</P>);
      expect(screen.getByTestId("p")).toHaveClass("text-sm");
    });

    it("merges consumer className", () => {
      render(
        <P className="font-medium" data-testid="p">
          Paragraph
        </P>,
      );
      expect(screen.getByTestId("p")).toHaveClass("font-medium");
    });

    it("forwards additional HTML attributes", () => {
      render(<P id="para-1" data-testid="p">Paragraph</P>);
      expect(screen.getByTestId("p")).toHaveAttribute("id", "para-1");
    });
  });

  describe("Large", () => {
    it("renders as a <p> element", () => {
      render(<Large data-testid="large">Large text</Large>);
      expect(screen.getByTestId("large").tagName).toBe("P");
    });

    it("applies text-base class", () => {
      render(<Large data-testid="large">Large text</Large>);
      expect(screen.getByTestId("large")).toHaveClass("text-base");
    });

    it("applies font-bold class", () => {
      render(<Large data-testid="large">Large text</Large>);
      expect(screen.getByTestId("large")).toHaveClass("font-bold");
    });

    it("merges consumer className", () => {
      render(
        <Large className="custom-class" data-testid="large">
          Large text
        </Large>,
      );
      expect(screen.getByTestId("large")).toHaveClass("custom-class");
    });
  });

  describe("Small", () => {
    it("renders as a <p> element", () => {
      render(<Small data-testid="small">Small text</Small>);
      expect(screen.getByTestId("small").tagName).toBe("P");
    });

    it("applies text-xs class", () => {
      render(<Small data-testid="small">Small text</Small>);
      expect(screen.getByTestId("small")).toHaveClass("text-xs");
    });

    it("applies text-caption class", () => {
      render(<Small data-testid="small">Small text</Small>);
      expect(screen.getByTestId("small")).toHaveClass("text-caption");
    });

    it("merges consumer className", () => {
      render(
        <Small className="custom-class" data-testid="small">
          Small text
        </Small>,
      );
      expect(screen.getByTestId("small")).toHaveClass("custom-class");
    });
  });

  describe("Muted", () => {
    it("renders as a <p> element", () => {
      render(<Muted data-testid="muted">Muted text</Muted>);
      expect(screen.getByTestId("muted").tagName).toBe("P");
    });

    it("applies text-sm class", () => {
      render(<Muted data-testid="muted">Muted text</Muted>);
      expect(screen.getByTestId("muted")).toHaveClass("text-sm");
    });

    it("applies text-muted-foreground class", () => {
      render(<Muted data-testid="muted">Muted text</Muted>);
      expect(screen.getByTestId("muted")).toHaveClass("text-muted-foreground");
    });

    it("merges consumer className", () => {
      render(
        <Muted className="custom-class" data-testid="muted">
          Muted text
        </Muted>,
      );
      expect(screen.getByTestId("muted")).toHaveClass("custom-class");
    });
  });

  describe("Lead", () => {
    it("renders as a <p> element", () => {
      render(<Lead data-testid="lead">Lead text</Lead>);
      expect(screen.getByTestId("lead").tagName).toBe("P");
    });

    it("applies text-lg class", () => {
      render(<Lead data-testid="lead">Lead text</Lead>);
      expect(screen.getByTestId("lead")).toHaveClass("text-lg");
    });

    it("applies text-muted-foreground class", () => {
      render(<Lead data-testid="lead">Lead text</Lead>);
      expect(screen.getByTestId("lead")).toHaveClass("text-muted-foreground");
    });

    it("applies leading-relaxed class", () => {
      render(<Lead data-testid="lead">Lead text</Lead>);
      expect(screen.getByTestId("lead")).toHaveClass("leading-relaxed");
    });

    it("merges consumer className", () => {
      render(
        <Lead className="custom-class" data-testid="lead">
          Lead text
        </Lead>,
      );
      expect(screen.getByTestId("lead")).toHaveClass("custom-class");
    });
  });

  describe("Overline", () => {
    it("renders as a <span> element", () => {
      render(<Overline data-testid="overline">Category</Overline>);
      expect(screen.getByTestId("overline").tagName).toBe("SPAN");
    });

    it("applies text-xs class", () => {
      render(<Overline data-testid="overline">Category</Overline>);
      expect(screen.getByTestId("overline")).toHaveClass("text-xs");
    });

    it("applies font-semibold class", () => {
      render(<Overline data-testid="overline">Category</Overline>);
      expect(screen.getByTestId("overline")).toHaveClass("font-semibold");
    });

    it("applies uppercase class", () => {
      render(<Overline data-testid="overline">Category</Overline>);
      expect(screen.getByTestId("overline")).toHaveClass("uppercase");
    });

    it("applies tracking-wider class", () => {
      render(<Overline data-testid="overline">Category</Overline>);
      expect(screen.getByTestId("overline")).toHaveClass("tracking-wider");
    });

    it("applies text-caption class", () => {
      render(<Overline data-testid="overline">Category</Overline>);
      expect(screen.getByTestId("overline")).toHaveClass("text-caption");
    });

    it("merges consumer className", () => {
      render(
        <Overline className="custom-class" data-testid="overline">
          Category
        </Overline>,
      );
      expect(screen.getByTestId("overline")).toHaveClass("custom-class");
    });

    it("forwards additional HTML attributes", () => {
      render(<Overline id="overline-1" data-testid="overline">Category</Overline>);
      expect(screen.getByTestId("overline")).toHaveAttribute("id", "overline-1");
    });
  });
});
