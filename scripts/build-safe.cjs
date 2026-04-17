const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const cwd = process.cwd();
const lockPath = path.join(cwd, ".next-build.lock");
const nextBin = path.join(cwd, "node_modules", "next", "dist", "bin", "next");

let child = null;
let didCleanup = false;

function cleanupLock() {
  if (didCleanup) {
    return;
  }
  didCleanup = true;
  try {
    fs.rmSync(lockPath, { force: true });
  } catch {}
}

function readPidFromLock(contents) {
  const trimmed = String(contents || "").trim();
  if (!trimmed) {
    return null;
  }

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && Number.isInteger(parsed.pid)) {
      return parsed.pid;
    }
  } catch {}

  return null;
}

function isPidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error && error.code === "EPERM";
  }
}

function createBuildLockOrExit() {
  if (!fs.existsSync(lockPath)) {
    const lockPayload = JSON.stringify(
      {
        pid: process.pid,
        createdAt: new Date().toISOString(),
        cwd
      },
      null,
      2
    );
    fs.writeFileSync(lockPath, lockPayload);
    return;
  }

  const existing = fs.readFileSync(lockPath, "utf8");
  const existingPid = readPidFromLock(existing);

  if (isPidAlive(existingPid)) {
    console.error(
      `[build-safe] Another build process is active (PID ${existingPid}). Stop it first, then rerun npm run build.`
    );
    process.exit(1);
  }

  try {
    fs.rmSync(lockPath, { force: true });
  } catch {}

  const lockPayload = JSON.stringify(
    {
      pid: process.pid,
      createdAt: new Date().toISOString(),
      cwd
    },
    null,
    2
  );
  fs.writeFileSync(lockPath, lockPayload);
}

function terminateChildAndExit(code) {
  if (child && !child.killed) {
    try {
      child.kill("SIGTERM");
    } catch {}
  }
  cleanupLock();
  process.exit(code);
}

if (!fs.existsSync(nextBin)) {
  console.error("[build-safe] next binary not found. Run npm install first.");
  process.exit(1);
}

createBuildLockOrExit();

process.on("SIGINT", () => terminateChildAndExit(130));
process.on("SIGTERM", () => terminateChildAndExit(143));
process.on("uncaughtException", (error) => {
  console.error(error);
  terminateChildAndExit(1);
});
process.on("unhandledRejection", (error) => {
  console.error(error);
  terminateChildAndExit(1);
});
process.on("exit", cleanupLock);

child = spawn(process.execPath, [nextBin, "build"], {
  cwd,
  env: process.env,
  stdio: "inherit"
});

child.on("error", (error) => {
  console.error(error);
  terminateChildAndExit(1);
});

child.on("exit", (code, signal) => {
  cleanupLock();
  if (signal) {
    process.exit(1);
    return;
  }
  process.exit(code || 0);
});
