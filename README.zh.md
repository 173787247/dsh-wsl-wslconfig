# dsh-wsl-wslconfig

> **套件安装：** 见 [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)。推荐 `KIT_SET=daily` | `llm` | `github` | `full`。故障树：[TROUBLESHOOTING.zh.md](https://github.com/173787247/dsh-wsl-kit/blob/master/docs/TROUBLESHOOTING.zh.md)。

DeepSeek Harness 工具：**`wslconfig_hint`** — 只读解析 Windows `%UserProfile%\.wslconfig`（`networkingMode` / `memory` 等），并给出 mirrored vs NAT、dsh **:3081** 中继建议（**禁止** `dsh --host 0.0.0.0`）。

[English → README.md](./README.md)

## 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-wslconfig
```

重启 `dsh web` 并开**新**会话。

## 测试

```sh
npm test
```

## 许可

MIT
