import { defineConfig } from "orval";

const isCI = Boolean(process.env.CI);
const apiUrl = process.env.API_URL ?? "http://localhost:8000";

export default defineConfig({
  notes: {
    input: {
      target: isCI ? "../api/schema.yaml" : `${apiUrl}/api/schema/`,
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
