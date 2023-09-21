import { defineConfig, Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: {
    index: "src/index.ts",
  },
  loader: {
    ".css": "text",
  },
  clean: true,
  format: ["cjs", "esm"],
  dts: true,
  ...options,
}));
