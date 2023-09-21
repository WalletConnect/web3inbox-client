import { sassPlugin } from "esbuild-sass-plugin";
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
  esbuildPlugins: [sassPlugin()],
  clean: true,
  format: ["cjs", "esm"],
  external: ["react"],
  dts: true,
  ...options,
}));
