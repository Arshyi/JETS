const fs = require("fs");

const originalReadlink = fs.readlink.bind(fs);
const originalReadlinkSync = fs.readlinkSync.bind(fs);
const originalPromisesReadlink = fs.promises.readlink.bind(fs.promises);

function shouldNormalizeReadlinkError(error, path) {
  if (process.platform !== "win32" || !error || error.code !== "EISDIR") {
    return false;
  }

  try {
    return !fs.lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
}

function normalizeReadlinkError(error) {
  const normalized = new Error(error.message.replaceAll("EISDIR", "EINVAL"));

  Object.assign(normalized, error);
  normalized.code = "EINVAL";
  normalized.message = normalized.message.replaceAll("EISDIR", "EINVAL");

  return normalized;
}

fs.readlink = function readlink(path, options, callback) {
  const cb = typeof options === "function" ? options : callback;
  const opts = typeof options === "function" ? undefined : options;

  return originalReadlink(path, opts, (error, linkString) => {
    if (shouldNormalizeReadlinkError(error, path)) {
      cb(normalizeReadlinkError(error));
      return;
    }

    cb(error, linkString);
  });
};

fs.readlinkSync = function readlinkSync(path, options) {
  try {
    return originalReadlinkSync(path, options);
  } catch (error) {
    if (shouldNormalizeReadlinkError(error, path)) {
      throw normalizeReadlinkError(error);
    }

    throw error;
  }
};

fs.promises.readlink = async function readlink(path, options) {
  try {
    return await originalPromisesReadlink(path, options);
  } catch (error) {
    if (shouldNormalizeReadlinkError(error, path)) {
      throw normalizeReadlinkError(error);
    }

    throw error;
  }
};
