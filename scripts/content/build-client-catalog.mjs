import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../../lib/", import.meta.url);
const native = JSON.parse(await readFile(new URL("questionnaires/catalog.json", root), "utf8"));
const legacy = JSON.parse(await readFile(new URL("entertainment/catalog.json", root), "utf8"));
// Runtime identity and analytics fields only. Public editorial metadata stays on the server.
const projections = {
  "entertainment/clientCatalog.json": {
    native: native.map(({ slug, collection, code, formCode, resultSlugs }) => ({ slug, collection, code, formCode, resultSlugs })),
    legacy: legacy.map(({ slug }) => ({ slug })),
  },
  "entertainment/activityTitles.json": {
    native: native.map(({ slug, title }) => ({ slug, title })),
    legacy: legacy.map(({ slug, title }) => ({ slug, title })),
  },
};
for (const [path, projection] of Object.entries(projections)) {
  const output = new URL(path, root);
  const text = `${JSON.stringify(projection, null, 2)}\n`;
  if (process.argv.includes("--check")) {
    if (await readFile(output, "utf8") !== text) throw new Error(`Stale client projection: ${path}`);
  } else await writeFile(output, text);
}
