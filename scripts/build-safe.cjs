const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const cwd = process.cwd();
const lockPath = path.join(cwd, ".next-build.lock");
const nextBin = path.join(cwd, "node_modules", "next", "dist", "bin", "next");

let child = null;
let didCleanup = false;

const lockState = {
  wrapperPid: process.pid,
  childPid: 0,
  createdAt: new Date().toISOString(),
  cwd
};

function normalizePid(value) {
  const pid = Number(value);
  return Number.isInteger(pid) && pid > 0 ? pid : 0;
}

function readLockPayload(contents) {
  const trimmed = String(contents || "").trim();
  if (!trimmed) {
    return null;
  }

  if (/^\d+$/.test(trimmed)) {
    return { wrapperPid: normalizePid(trimmed), childPid: 0 };
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return {
      wrapperPid: normalizePid(parsed.wrapperPid ?? parsed.pid),
      childPid: normalizePid(parsed.childPid)
    };
  } catch {
    return null;
  }
}

function writeLockFile(extra = {}) {
  fs.writeFileSync(
    lockPath,
    JSON.stringify(
      {
        ...lockState,
        ...extra,
        updatedAt: new Date().toISOString()
      },
      null,
      2
    )
  );
}

function isPidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return Boolean(error && error.code === "EPERM");
  }
}

function cleanupLock() {
  if (didCleanup) {
    return;
  }
  didCleanup = true;

  try {
    fs.rmSync(lockPath, { force: true });
    return;
  } catch {}

  try {
    // Some synced folders may deny delete; mark stale instead.
    writeLockFile({
      wrapperPid: 0,
      childPid: 0,
      stale: true,
      releasedAt: new Date().toISOString()
    });
  } catch {}
}

function createBuildLockOrExit() {
  if (!fs.existsSync(lockPath)) {
    writeLockFile();
    return;
  }

  let existing = null;
  try {
    existing = readLockPayload(fs.readFileSync(lockPath, "utf8"));
  } catch {}

  const activeWrapperPid = existing && isPidAlive(existing.wrapperPid) ? existing.wrapperPid : 0;
  const activeChildPid = existing && isPidAlive(existing.childPid) ? existing.childPid : 0;

  if (activeWrapperPid || activeChildPid) {
    const activeParts = [];
    if (activeWrapperPid) {
      activeParts.push(`wrapper PID ${activeWrapperPid}`);
    }
    if (activeChildPid) {
      activeParts.push(`child PID ${activeChildPid}`);
    }
    console.error(
      `[build-safe] Another build process is active (${activeParts.join(
        ", "
      )}). Run npm run build:stop to clear it, then rerun npm run build.`
    );
    process.exit(1);
  }

  // Overwrite stale lock instead of requiring delete permissions.
  writeLockFile({ childPid: 0, stale: false, recoveredAt: new Date().toISOString() });
}

function terminateChildAndExit(code) {
  if (child && child.pid) {
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

if (child.pid) {
  writeLockFile({ childPid: child.pid, stale: false });
}

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
