# dsh-wsl-wslconfig
> **Install set:** part of [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit). Prefer `KIT_SET=daily` | `llm` | `github` | `full`. Fault tree: [TROUBLESHOOTING.md](https://github.com/173787247/dsh-wsl-kit/blob/master/docs/TROUBLESHOOTING.md).

DeepSeek Harness tool: **`wslconfig_hint`** — read-only parse of Windows `.wslconfig` (mirrored/memory) and advise dsh **:3081** relay (never `dsh --host 0.0.0.0`).

[中文说明 → README.zh.md](./README.zh.md)

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-wslconfig
npm test
```

MIT
