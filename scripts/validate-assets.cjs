const fs = require("node:fs");
const path = require("node:path");

const workspace = process.cwd();
const sourceRoots = ["app", "components", "lib"];
const sourceExtensions = new Set([".css", ".js", ".jsx", ".md", ".mjs", ".ts", ".tsx"]);
const assetPattern = /["'`](\/(?:assets|fonts|images|models)\/[^"'`?#]+)["'`]/g;
const missing = [];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

for (const root of sourceRoots) {
  for (const sourcePath of walk(path.join(workspace, root))) {
    if (!sourceExtensions.has(path.extname(sourcePath))) continue;
    const source = fs.readFileSync(sourcePath, "utf8");
    for (const match of source.matchAll(assetPattern)) {
      const publicPath = path.join(workspace, "public", ...decodeURIComponent(match[1]).split("/").filter(Boolean));
      if (!fs.existsSync(publicPath)) {
        missing.push(`${path.relative(workspace, sourcePath)} -> ${match[1]}`);
      }
    }
  }
}

if (missing.length > 0) {
  console.error("Missing public assets:\n" + missing.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log("All referenced public assets exist.");
