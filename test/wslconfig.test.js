import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildWslconfigAdvice,
  format,
  parseWslconfig,
  resolveWslconfigPath,
} from "../lib/wslconfig.js";

describe("parseWslconfig", () => {
  it("reads mirrored and memory", () => {
    const s = parseWslconfig(`[wsl2]
networkingMode=mirrored
memory=64GB
processors=16
dnsTunneling=true
`);
    assert.equal(s.networkingMode, "mirrored");
    assert.equal(s.memory, "64GB");
    assert.equal(s.processors, "16");
    assert.equal(s.dnsTunneling, "true");
  });
});

describe("buildWslconfigAdvice", () => {
  it("warns when missing file", () => {
    const tips = buildWslconfigAdvice({}, { exists: false });
    assert.ok(tips.some((t) => /No \.wslconfig/i.test(t)));
  });

  it("explains mirrored + dsh :3081", () => {
    const tips = buildWslconfigAdvice({ networkingMode: "mirrored" }, { exists: true });
    assert.ok(tips.some((t) => /3081/i.test(t)));
  });

  it("explains NAT and forbids dsh 0.0.0.0", () => {
    const tips = buildWslconfigAdvice({ networkingMode: "nat" }, { exists: true });
    assert.ok(tips.some((t) => /never dsh --host 0\.0\.0\.0/i.test(t)));
  });

  it("suggests memory cap on large hosts", () => {
    const tips = buildWslconfigAdvice({}, { exists: true, hostRamHintGiB: 250 });
    assert.ok(tips.some((t) => /memory=32GB|64GB/i.test(t)));
  });
});

describe("resolveWslconfigPath", () => {
  it("prefers WINDOWS_USER path when present", () => {
    const { path } = resolveWslconfigPath({
      env: { WINDOWS_USER: "tester" },
      exists: (p) => p.includes("/tester/.wslconfig"),
    });
    assert.equal(path, "/mnt/c/Users/tester/.wslconfig");
  });
});

describe("format", () => {
  it("includes settings line", () => {
    const text = format({
      ok: true,
      path: "/mnt/c/Users/a/.wslconfig",
      exists: true,
      settings: { networkingMode: "mirrored", memory: "32GB", processors: "8" },
      advice: ["tip"],
    });
    assert.match(text, /networkingMode=mirrored/);
    assert.match(text, /tip/);
  });
});
