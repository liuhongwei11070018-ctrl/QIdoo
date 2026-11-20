# Selected source modules / 开源范围

| Directory | Purpose / 用途 |
| --- | --- |
| `packages/agent-control/` | Local Agent registration, heartbeat, pause/resume receipts and a Codex control bridge / 本机 Agent 注册、心跳、暂停恢复回执与 Codex 控制桥 |
| `packages/task-protocol/` | TypeScript task, operation, result and subtask data types / 任务、操作、交付物与子任务数据类型 |
| `packages/scene-layout/` | Bubble collision avoidance and popover placement / 气泡避让与弹窗定位 |
| `packages/ui/` | React select component and its styles / React 选择器及配套样式 |
| `examples/` | Minimal local examples / 最小本机示例 |
| `tests/` | Tests retained for the exported modules / 对应模块测试 |

These modules use the MIT License. The complete application is maintained in a private repository. Community contributions can focus on integrations, protocol compatibility, accessibility and layout behavior.

这些模块采用 MIT 许可证，完整应用在私有仓库维护。欢迎围绕接入、协议兼容、无障碍和布局行为提交反馈与改进。

The Agent control client and bridge currently accept loopback endpoints. They require a compatible local QIdoo service or a compatible host implementing the same protocol. Successful pause/resume receipts depend on the executor callback or native client confirming the actual operation.

Agent 控制客户端和控制桥当前使用本机回环地址，需要本机 QIdoo 服务或实现相同协议的宿主。暂停、恢复由实际执行器确认后回执。
