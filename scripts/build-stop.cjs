const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const cwd = process.cwd();
const lockPath = path.join(cwd, ".next-build.lock");

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

function killProcessTree(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  if (!isPidAlive(pid)) {
    return false;
  }

  try {
    if (process.platform === "win32") {
      execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      process.kill(pid, "SIGTERM");
    }
    return true;
  } catch {
    return false;
  }
}

function clearLockFile() {
  try {
    fs.rmSync(lockPath, { force: true });
    console.log("[build-stop] Cleared build lock.");
    return;
  } catch {}

  try {
    fs.writeFileSync(
      lockPath,
      JSON.stringify(
        {
          wrapperPid: 0,
          childPid: 0,
          stale: true,
          releasedAt: new Date().toISOString(),
          cwd
        },
        null,
        2
      )
    );
    console.log("[build-stop] Marked lock as stale (delete denied).");
  } catch (error) {
    console.error("[build-stop] Failed to clear lock file:", error.message);
    process.exit(1);
  }
}

if (!fs.existsSync(lockPath)) {
  console.log("[build-stop] No build lock found.");
  process.exit(0);
}

let lock = null;
try {
  lock = readLockPayload(fs.readFileSync(lockPath, "utf8"));
} catch (error) {
  console.warn(`[build-stop] Could not read lock file: ${error.message}`);
}

const pids = Array.from(
  new Set(
    [lock?.wrapperPid, lock?.childPid]
      .map((pid) => normalizePid(pid))
      .filter((pid) => pid > 0)
  )
);

for (const pid of pids) {
  if (!isPidAlive(pid)) {
    console.log(`[build-stop] PID ${pid} is not running.`);
    continue;
  }

  if (killProcessTree(pid)) {
    console.log(`[build-stop] Stopped PID ${pid}.`);
    continue;
  }

  console.warn(`[build-stop] Could not stop PID ${pid}.`);
}

clearLockFile();
