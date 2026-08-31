import { detectWsl } from "./lib/wsl-host.js";
import * as core from "./lib/wslconfig.js";

export const name = "dsh-wsl-wslconfig";
export const inject = ["tools", "systemPrompt"];

export function apply(ctx, config = {}) {
  const timeoutMs = positive(config.timeoutMs, 15_000);
  const wsl = detectWsl();

  ctx.systemPrompt.section({
    name: "tool:wslconfig_hint",
    order: 123,
    text: "Use wslconfig_hint for WSL/Windows interop: Read-only advice for .wslconfig memory/mirrored networking.",
  });

  ctx.tools.register({
    name: "wslconfig_hint",
    description: "Read-only advice for .wslconfig memory/mirrored networking.",
    parameters: core.parameters(config),
    output: {
      schema: core.outputSchema(),
      render: (_args, value) => [{ type: "text", text: core.format(value) }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      if (!wsl) return core.notWsl ? core.notWsl() : { ok: false, error: "not running in WSL" };
      return core.execute(args, config);
    },
    presentCall: () => ({ card: "generic", title: "wslconfig_hint" }),
    presentResult: (_args, result) => (
      result.isError
        ? { card: "generic", title: "wslconfig_hint failed", content: result.content }
        : { card: "generic", title: "wslconfig_hint", content: result.content }
    ),
  });
}

function positive(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
