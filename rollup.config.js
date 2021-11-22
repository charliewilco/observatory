// @ts-check
import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";

export default defineConfig([
  {
    input: "src/index.ts",
    external: (id) => !/^[./]/.test(id),
    plugins: [esbuild()],
    output: [
      {
        file: "dist/index.cjs.js",
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/index.esm.js",
        format: "es",
        sourcemap: true,
      },
    ],
  },
  {
    input: "src/index.ts",
    external: (id) => !/^[./]/.test(id),
    plugins: [dts()],
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
  },
]);
