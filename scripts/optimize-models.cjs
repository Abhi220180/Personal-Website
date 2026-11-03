const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const workspace = process.cwd();
const modelDirectory = path.join(workspace, "public", "models");
const cliPath = path.join(workspace, "node_modules", "@gltf-transform", "cli", "bin", "cli.js");
const contentPath = path.join(workspace, "lib", "content.ts");
const content = fs.readFileSync(contentPath, "utf8");
const modelNames = Array.from(
  new Set(Array.from(content.matchAll(/\/models\/([^"']+\.glb)/g), (match) => match[1]))
);
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-models-"));

try {
  for (const modelName of modelNames) {
    const inputPath = path.join(modelDirectory, modelName);
    const outputPath = path.join(temporaryDirectory, modelName);
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Missing model: ${modelName}`);
    }

    const before = fs.statSync(inputPath).size;
    const result = spawnSync(
      process.execPath,
      [
        cliPath,
        "optimize",
        inputPath,
        outputPath,
        "--compress",
        "meshopt",
        "--meshopt-level",
        "high",
        "--simplify",
        "false",
        "--texture-compress",
        "false"
      ],
      { cwd: workspace, encoding: "utf8" }
    );

    if (result.status !== 0) {
      throw new Error(
        result.error?.message || result.stderr || result.stdout || `Failed to optimize ${modelName}`
      );
    }

    fs.copyFileSync(outputPath, inputPath);
    const after = fs.statSync(inputPath).size;
    const change = before === 0 ? 0 : Math.round((1 - after / before) * 100);
    console.log(`${modelName}: ${before} -> ${after} bytes (${change}% smaller)`);
  }
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}
