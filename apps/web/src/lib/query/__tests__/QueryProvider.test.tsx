import { render, screen } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import { QueryProvider } from "../QueryProvider";

function QueryClientConsumer() {
  const client = useQueryClient();
  return <div data-testid="client">{client ? "connected" : "none"}</div>;
}

describe("QueryProvider", () => {
  it("renders children", () => {
    render(
      <QueryProvider>
        <p>hello</p>
      </QueryProvider>,
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("provides a QueryClient to descendants", () => {
    render(
      <QueryProvider>
        <QueryClientConsumer />
      </QueryProvider>,
    );
    expect(screen.getByTestId("client")).toHaveTextContent("connected");
  });
});
