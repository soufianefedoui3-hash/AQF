/**
 * Hostinger's Node process manager calls Server.close() during startup
 * probes / double-starts — often on net.Server, or on an instance method
 * captured before listen() finishes.
 *
 * Node 18+ throws ERR_SERVER_NOT_RUNNING ("Server is not running").
 * Next.js does not catch that (and logs the callback error), which shows
 * up as a single boot error after SQLite opens.
 *
 * This file is a synchronous --require hook so it installs before Next's
 * CJS http/net load. It does not start or stop any HTTP server.
 */
"use strict";

const net = require("node:net");
const http = require("node:http");
const https = require("node:https");
const path = require("node:path");

function isCloseRace(error) {
  if (!error) return false;
  const code = error.code || "";
  const message = error.message || String(error);
  return code === "ERR_SERVER_NOT_RUNNING" || /Server is not running/i.test(message);
}

function invokeOk(server, callback) {
  if (typeof callback === "function") {
    process.nextTick(() => callback.call(server));
  }
  return server;
}

function makeSafeClose(nativeClose) {
  if (typeof nativeClose !== "function" || nativeClose.__aqfSafeClose) {
    return nativeClose;
  }

  function safeClose(callback) {
    const onClose =
      typeof callback === "function"
        ? function onClose(err) {
            if (isCloseRace(err)) {
              callback.call(this);
              return;
            }
            callback.apply(this, arguments);
          }
        : undefined;

    // listen() has not finished — Hostinger probe. Do not throw and do
    // not abort Next's in-flight listen().
    if (!this.listening && !this._handle) {
      return invokeOk(this, callback);
    }

    try {
      return nativeClose.call(this, onClose);
    } catch (error) {
      if (isCloseRace(error)) {
        return invokeOk(this, callback);
      }
      throw error;
    }
  }

  safeClose.__aqfSafeClose = true;
  return safeClose;
}

function makeSafeConnectionsClose(native) {
  if (typeof native !== "function" || native.__aqfSafeClose) {
    return native;
  }
  function safeConnectionsClose() {
    try {
      return native.apply(this, arguments);
    } catch (error) {
      if (isCloseRace(error)) return;
      throw error;
    }
  }
  safeConnectionsClose.__aqfSafeClose = true;
  return safeConnectionsClose;
}

function patchPrototype(proto) {
  if (!proto || proto.__aqfSafeCloseProto) return;
  proto.__aqfSafeCloseProto = true;
  proto.close = makeSafeClose(proto.close);
  if (typeof proto.closeAllConnections === "function") {
    proto.closeAllConnections = makeSafeConnectionsClose(proto.closeAllConnections);
  }
  if (typeof proto.closeIdleConnections === "function") {
    proto.closeIdleConnections = makeSafeConnectionsClose(proto.closeIdleConnections);
  }
}

function wrapServerInstance(server) {
  if (!server || server.__aqfSafeCloseInstance) return server;
  server.__aqfSafeCloseInstance = true;
  server.close = makeSafeClose(server.close.bind(server));
  if (typeof server.closeAllConnections === "function") {
    server.closeAllConnections = makeSafeConnectionsClose(
      server.closeAllConnections.bind(server)
    );
  }
  if (typeof server.closeIdleConnections === "function") {
    server.closeIdleConnections = makeSafeConnectionsClose(
      server.closeIdleConnections.bind(server)
    );
  }
  return server;
}

function wrapCreateServer(mod) {
  if (!mod || typeof mod.createServer !== "function" || mod.createServer.__aqfSafeClose) {
    return;
  }
  const nativeCreate = mod.createServer;
  function createServer() {
    return wrapServerInstance(nativeCreate.apply(this, arguments));
  }
  createServer.__aqfSafeClose = true;
  Object.setPrototypeOf(createServer, nativeCreate);
  for (const key of Object.keys(nativeCreate)) {
    try {
      createServer[key] = nativeCreate[key];
    } catch {
      // ignore read-only copies
    }
  }
  mod.createServer = createServer;
}

function install() {
  patchPrototype(net.Server.prototype);
  patchPrototype(http.Server.prototype);
  patchPrototype(https.Server.prototype);
  wrapCreateServer(net);
  wrapCreateServer(http);
  wrapCreateServer(https);
}

install();

const flag = `--require ${JSON.stringify(path.resolve(__dirname, "safe-http-close.cjs"))}`;
const current = process.env.NODE_OPTIONS || "";
if (!current.includes("safe-http-close.cjs")) {
  process.env.NODE_OPTIONS = current ? `${flag} ${current}` : flag;
}

if (!globalThis.__aqfSafeCloseListeners) {
  globalThis.__aqfSafeCloseListeners = true;
  process.on("uncaughtException", (error) => {
    if (isCloseRace(error)) return;
    console.error(error);
    process.exit(1);
  });
  process.on("unhandledRejection", (reason) => {
    if (isCloseRace(reason)) return;
    console.error(reason);
  });
}
