import { rmSync, existsSync } from "fs";
import { spawn } from "child_process";
import { join } from "path";

const root = process.cwd();

function remove(path) {
  try {
    rmSync(path, { recursive: true, force: true });
    console.log(`Removed ${path}`);
  } catch {
    /* ignore */
  }
}

remove(join(root, ".next"));
remove(join(root, "node_modules", ".cache"));

console.log("Cache cleared. Starting Next.js dev server...\n");

const child = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
  cwd: root,
});

child.on("exit", (code) => process.exit(code ?? 0));
