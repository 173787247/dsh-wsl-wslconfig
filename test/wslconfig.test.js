import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { format } from "../lib/wslconfig.js";

describe("wslconfig_hint", () => {
  it("formats", () => {
    assert.match(format({ ok: true }), /ok/i);
  });
});
