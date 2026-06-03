// @ts-check
import { defineConfig } from "rolldown";

const external = (id) => !/^[./]/.test(id);

export default defineConfig([
  {
    input: "src/index.ts",
    external,
    output: {
      file: "dist/index.js",
      format: "esm",
      codeSplitting: false,
      sourcemap: true,
    },
  },
  {
    input: "src/index.ts",
    external,
    output: {
      file: "dist/index.cjs",
      format: "cjs",
      codeSplitting: false,
      sourcemap: true,
    },
  },
]);
