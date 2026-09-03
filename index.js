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
    text: "Use wslconfig_hint before fixing Windows↔WSL networking: reads %UserProfile%\\.wslconfig (mirrored/memory) and reminds that dsh UI uses :3081 relay — never --host 0.0.0.0.",
  });

  ctx.tools.register({
    name: "wslconfig_hint",
    description: "Read-only parse of Windows .wslconfig (networkingMode/memory) plus mirrored vs NAT advice for dsh :3081.",
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
