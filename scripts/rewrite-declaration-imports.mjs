import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const declarations = await findDeclarationFiles("dist");

await Promise.all(
  declarations.map(async (file) => {
    const source = await readFile(file, "utf8");
    const updated = source.replaceAll(
      /(?<quote>["'])((?:\.\.?\/)[^"']+)\.ts\k<quote>/g,
      (match) => match.replace(".ts", ""),
    );

    if (updated !== source) {
      await writeFile(file, updated);
    }
  }),
);

async function findDeclarationFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        return findDeclarationFiles(path);
      }

      return entry.isFile() && entry.name.endsWith(".d.ts") ? [path] : [];
    }),
  );

  return files.flat();
}
