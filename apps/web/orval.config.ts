import { defineConfig } from "orval";

export default defineConfig({
  notes: {
    input: {
      target: "http://localhost:8000/api/schema/",
    },
    output: {
      mode: "tags-split",
      target: "./src/data/generated",
      schemas: "./src/data/generated/model",
      client: "react-query",
      httpClient: "fetch",
      override: {
        mutator: {
          path: "./src/lib/api/fetcher.ts",
          name: "customFetch",
        },
      },
    },
  },
});
