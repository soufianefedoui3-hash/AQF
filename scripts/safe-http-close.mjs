/**
 * Hostinger's Node process manager calls http.Server.close() during
 * startup probes / double-starts. On Node 18+ that throws
 * ERR_SERVER_NOT_RUNNING if listen() never completed, which Next.js
 * does not catch — the process exits and Hostinger restarts in a loop.
 *
 * This preload only makes close() safe when the server is not listening.
 * It does not start or stop any HTTP server.
 */
import { Server } from "node:http";

const nativeClose = Server.prototype.close;

if (!Server.prototype.__aqfSafeClose) {
  Server.prototype.__aqfSafeClose = true;
  Server.prototype.close = function safeClose(callback) {
    if (!this.listening) {
      if (typeof callback === "function") {
        queueMicrotask(() => callback.call(this));
      }
      return this;
    }
    return nativeClose.call(this, callback);
  };
}

function isCloseRace(error) {
  if (!error) return false;
  const code = error.code || "";
  const message = error.message || String(error);
  return code === "ERR_SERVER_NOT_RUNNING" || /Server is not running/i.test(message);
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
