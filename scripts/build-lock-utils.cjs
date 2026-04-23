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

module.exports = {
  normalizePid,
  readLockPayload,
  isPidAlive
};
