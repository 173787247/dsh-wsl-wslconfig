import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";

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
  if (v.settings && Object.keys(v.settings).length) {
    lines.push(
      `settings: networkingMode=${v.settings.networkingMode || "?"} memory=${v.settings.memory || "?"} processors=${v.settings.processors || "?"}`,
    );
  }
  if (v.excerpt) lines.push("---\n" + v.excerpt + "\n---");
  for (const a of v.advice || []) lines.push(`- ${a}`);
  return lines.join("\n");
}

/** Parse key=value style .wslconfig (INI-ish; [wsl2] section). */
export function parseWslconfig(text) {
  const settings = {
    networkingMode: null,
    memory: null,
    processors: null,
    dnsTunneling: null,
    autoMemoryReclaim: null,
    raw: {},
  };
  let section = "";
  for (const line of String(text || "").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || t.startsWith(";")) continue;
    const sec = t.match(/^\[([^\]]+)\]$/);
    if (sec) {
      section = sec[1].toLowerCase();
      continue;
    }
    const kv = t.match(/^([^=]+)=(.*)$/);
    if (!kv) continue;
    const key = kv[1].trim();
    const value = kv[2].trim();
    const lk = key.toLowerCase();
    settings.raw[section ? `${section}.${lk}` : lk] = value;
    if (section === "wsl2" || section === "") {
      if (lk === "networkingmode") settings.networkingMode = value.toLowerCase();
      if (lk === "memory") settings.memory = value;
      if (lk === "processors") settings.processors = value;
      if (lk === "dnstunneling") settings.dnsTunneling = value.toLowerCase();
      if (lk === "automemoryreclaim") settings.autoMemoryReclaim = value;
    }
  }
  return settings;
}

export function buildWslconfigAdvice(settings = {}, { exists = false, hostRamHintGiB = null } = {}) {
  const tips = [
    "This tool is read-only — edit .wslconfig in Windows Notepad (user profile), then `wsl --shutdown`.",
  ];
  if (!exists) {
    tips.push(
      "No .wslconfig found yet. Creating one with networkingMode=mirrored often fixes Windows-browser ↔ WSL localhost and local LLM reachability.",
    );
  }

  const mode = settings.networkingMode;
  if (mode === "mirrored") {
    tips.push(
      "networkingMode=mirrored: Windows 127.0.0.1 usually reaches WSL listeners. For dsh UI use kit scripts/restart-dsh-web.sh → http://127.0.0.1:3081/ (dsh itself still binds 127.0.0.1:3080 only).",
    );
    tips.push("Local Ollama on Windows may work via 127.0.0.1 from WSL; still run host_reach to confirm baseURL.");
  } else if (mode === "nat" || !mode) {
    tips.push(
      "Classic NAT (or unset networkingMode): Windows browser often cannot hit WSL 127.0.0.1. Prefer mirrored, or use the :3081 relay / wsl_expose portproxy — never dsh --host 0.0.0.0.",
    );
    tips.push("Windows-hosted Ollama may need OLLAMA_HOST=0.0.0.0:11434 when WSL is NAT.");
  } else {
    tips.push(`networkingMode=${mode}: verify localhost behavior with host_reach and the :3081 relay.`);
  }

  if (settings.memory) {
    tips.push(
      `memory=${settings.memory} is set. Leave headroom for Windows + GPU drivers; on large hosts prefer an explicit cap over letting WSL balloon unchecked.`,
    );
  } else if (hostRamHintGiB && hostRamHintGiB >= 64) {
    tips.push(
      `Host looks large (~${hostRamHintGiB} GiB hint). Consider memory=32GB or 64GB in [wsl2] so Windows UI/GPU stays responsive during heavy builds.`,
    );
  }

  tips.push("Other useful knobs: processors=, dnsTunneling=true, autoMemoryReclaim=drop/gradual.");
  tips.push("After edits: wsl --shutdown from PowerShell, reopen distro, then restart-dsh-web.sh.");
  return tips;
}

export function resolveWslconfigPath({
  env = process.env,
  exists = existsSync,
  home = homedir(),
} = {}) {
  const winUser =
    env.WINDOWS_USER ||
    (env.PATH || "").match(/\/mnt\/c\/Users\/([^/\\]+)/)?.[1] ||
    (home.match(/^\/mnt\/c\/Users\/([^/]+)/) || [])[1] ||
    "";
  const candidates = [];
  if (winUser) candidates.push(`/mnt/c/Users/${winUser}/.wslconfig`);
  // Common when HOME is Linux but Windows profile is still reachable
  if (env.USERPROFILE) {
    const m = String(env.USERPROFILE).replace(/\\/g, "/").match(/Users\/([^/]+)/i);
    if (m) candidates.push(`/mnt/c/Users/${m[1]}/.wslconfig`);
  }
  candidates.push("/mnt/c/Users/Public/.wslconfig");
  const existing = candidates.find((p) => exists(p));
  return { path: existing || candidates[0] || "", candidates };
}

export async function execute(_args, _config = {}, deps = {}) {
  const env = deps.env || process.env;
  const exists = deps.exists || existsSync;
  const readFile = deps.readFile || readFileSync;
  const home = deps.home || homedir();
  const { path } = resolveWslconfigPath({ env, exists, home });
  const fileExists = Boolean(path && exists(path));
  let excerpt = "";
  let settings = parseWslconfig("");
  if (fileExists) {
    try {
      excerpt = readFile(path, "utf8").slice(0, 2000);
      settings = parseWslconfig(excerpt);
    } catch {
      /* ignore */
    }
  }
  const advice = buildWslconfigAdvice(settings, { exists: fileExists });
  return { ok: true, path, exists: fileExists, excerpt, settings, advice };
}
