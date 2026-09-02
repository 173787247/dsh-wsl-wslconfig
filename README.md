# dsh-wsl-wslconfig
> **Install set:** part of [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit). Prefer `KIT_SET=daily` | `llm` | `github` | `full` (see kit README). Fault tree: [TROUBLESHOOTING.md](https://github.com/173787247/dsh-wsl-kit/blob/master/docs/TROUBLESHOOTING.md).


DeepSeek Harness plugin: Read-only advice for Windows .wslconfig memory limits and mirrored networking.

Part of **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**.

[中文说明 → README.zh.md](./README.zh.md)

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-wslconfig
# or local:
dsh plugin --profile web add /absolute/path/to/dsh-wsl-wslconfig
```

Restart `dsh web` and open a **new** session. Tool: `wslconfig_hint`.

## License

MIT
