/**
 * ESM --import entry. Delegates to the synchronous CJS hook so either
 * Node preload flag installs the same Server.close() guard.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require("./safe-http-close.cjs");
