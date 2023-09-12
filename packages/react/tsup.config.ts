import { defineConfig, Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: {
    index: "src/index.tsx",
  },
  banner: {
    js: "'use client'",
  },
  loader: {
    ".scss": "css",
  },
  clean: true,
  format: ["cjs", "esm"],
  external: ["react"],
  dts: true,
  ...options,
}));
