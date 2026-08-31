import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export function notWsl() {
  return { ok: false, error: "not running in WSL" };
}

export function parameters() {
  return { type: "object", additionalProperties: false, properties: {} };
}

export function outputSchema() {
  return { type: "object", additionalProperties: true };
}

export function format(v) {
  const lines = [`wslconfig_hint ok=${v.ok} path=${v.path || "?"} exists=${v.exists}`];
  if (v.excerpt) lines.push("---\n" + v.excerpt + "\n---");
  for (const a of v.advice || []) lines.push(`- ${a}`);
  return lines.join("\n");
}

export async function execute() {
  // .wslconfig lives on the Windows user profile
  const winUser = process.env.WINDOWS_USER
    || (process.env.PATH || "").match(/\/mnt\/c\/Users\/([^/]+)/)?.[1]
    || "";
  const candidates = [];
  if (winUser) candidates.push(`/mnt/c/Users/${winUser}/.wslconfig`);
  candidates.push("/mnt/c/Users/Public/.wslconfig");
  // also try translating via common home
  const home = homedir();
  let path = candidates.find((p) => existsSync(p)) || candidates[0] || "";
  let excerpt = "";
  let exists = path ? existsSync(path) : false;
  if (exists) {
    try {
      excerpt = readFileSync(path, "utf8").slice(0, 2000);
    } catch {}
  }
  const advice = [
    "This tool is read-only — edit .wslconfig in Windows Notepad, then `wsl --shutdown`.",
    "Useful knobs: memory=, processors=, networkingMode=mirrored, dnsTunneling=true.",
    "Do not raise memory above what the host can spare.",
  ];
  return { ok: true, path, exists, excerpt, advice };
}
