/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");

function normalizeReadlinkError(error) {
  if (error && error.code === "EISDIR") {
    error.code = "EINVAL";
  }
  return error;
}

const readlinkSync = fs.readlinkSync.bind(fs);
fs.readlinkSync = function patchedReadlinkSync(...args) {
  try {
    return readlinkSync(...args);
  } catch (error) {
    throw normalizeReadlinkError(error);
  }
};

const readlinkCallback = fs.readlink.bind(fs);
fs.readlink = function patchedReadlink(...args) {
  const callback = args[args.length - 1];
  if (typeof callback !== "function") {
    return readlinkCallback(...args);
  }

  const wrapped = (error, result) => {
    callback(normalizeReadlinkError(error), result);
  };
  readlinkCallback(...args.slice(0, -1), wrapped);
};

if (fs.promises?.readlink) {
  const readlink = fs.promises.readlink.bind(fs.promises);
  fs.promises.readlink = async function patchedReadlink(...args) {
    try {
      return await readlink(...args);
    } catch (error) {
      throw normalizeReadlinkError(error);
    }
  };
}
