import { defineConfig, Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: {
    index: "src/exports/index.ts",
    react: "src/exports/react/index.ts",
  },
  splitting: true,
  treeshake: true,
  bundle: false,
  clean: true,
  format: ["cjs", "esm"],
  external: ["react"],
  dts: true,
  ...options,
}));
