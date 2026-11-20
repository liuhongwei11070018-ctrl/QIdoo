# QIdoo

让一个人的想法，拥有一整个工作室。

[English](README.en.md) · [下载 QIdoo 1.0](https://github.com/liuhongwei11070018-ctrl/QIdoo/releases/tag/v1.0.0) · [反馈问题](https://github.com/liuhongwei11070018-ctrl/QIdoo/issues) · [开源模块](OPEN-SOURCE-SCOPE.md)

QIdoo 是面向个人创作者、一人公司、独立开发者和小型工作室的可视化 AI 工作室。把 AI 搭档、工作小组、对话、任务与交付放在同一个空间，从交代目标到检查成果，保留清楚的工作脉络。

## 官网与在线演示

- 官网 · [https://47.250.58.133/](https://47.250.58.133/)
- Web 演示 · [https://47.250.58.133/account](https://47.250.58.133/account)，打开后点击 **体验演示**，无需登录。

## 在一间工作室里协作

- **看见团队**。三维工作室与列表视图结合，查看成员、任务状态、公开进展与需要关注的事项。
- **连接常用工具**。桌面端支持 Codex、Claude Code、Gemini CLI、CodeBuddy CLI 等对应接入方式，以及模型 API 和外部 Agent 服务。各项能力取决于所选接入方式和执行器。
- **围绕目标组织工作**。通过私聊、群聊、点名与工作小组安排职责，关联任务依赖、资料和交付结果。
- **在关键处作决定**。集中处理提问、操作授权、执行异常、重试与待验收成果。
- **把成果带走**。查看聊天、附件、工作记录和支持格式的交付预览，下载成果文件，继续修改与确认。
- **保留自己的工作方式**。提供中英文、明暗主题、场景与声音设置、功能导览和减少动态效果选项。

## 下载桌面版

| 平台 | 安装文件 |
| --- | --- |
| macOS · Apple Silicon | [下载 DMG](https://github.com/liuhongwei11070018-ctrl/QIdoo/releases/download/v1.0.0/QIdoo-1.0-macOS-AppleSilicon.dmg) |
| macOS · Intel | [下载 DMG](https://github.com/liuhongwei11070018-ctrl/QIdoo/releases/download/v1.0.0/QIdoo-1.0-macOS-Intel.dmg) |
| Windows · x64 | [下载安装程序](https://github.com/liuhongwei11070018-ctrl/QIdoo/releases/download/v1.0.0/QIdoo-1.0-Windows-x64.exe) |

文件校验值见 [SHA256SUMS.txt](SHA256SUMS.txt)。[发布页](https://github.com/liuhongwei11070018-ctrl/QIdoo/releases/tag/v1.0.0)也提供相同校验文件。

下载与你的处理器对应的安装包，完成安装后打开 QIdoo，按界面指引配置所需连接。桌面版直接使用本机工作室。AI 服务账户、API 凭据和所需 CLI 由使用者自行配置，模型及工具费用由相应服务商收取。

### 安装与验证情况

当前 1.0 安装包为未签名版本，操作系统可能显示发布者或安全提示，请核对文件来源及校验值。请在安装前备份重要资料。

本次随附构建记录显示，Intel Mac 已进行隔离运行验证。Windows x64 与 Apple Silicon 已完成交叉打包、架构及文件完整性检查，对应实机安装运行仍待补充。相关环境中的问题欢迎通过 Issues 反馈。

## Web 版

Web 版包含公开演示入口和管理员真实工作室。演示使用独立示例会话，真实工作室目前仅供管理员登录，公众注册尚在后续计划中。

Web 版的真实任务围绕服务器上的在线模型 API 运行。连接本机 CLI、设备控制、本地项目和本地预览等能力通过桌面版使用。线上访问地址将在部署完成后补充。

## 开源与参与

本仓库提供桌面安装包及以下 MIT 授权模块。

| 模块 | 内容 |
| --- | --- |
| [Agent 接入工具](packages/agent-control/) | 注册、心跳、暂停与恢复回执、Codex 控制桥 |
| [任务数据协议](packages/task-protocol/) | 任务、操作、成果与子任务 TypeScript 类型 |
| [场景布局](packages/scene-layout/) | 气泡避让、弹窗定位 |
| [交互组件](packages/ui/) | React 选择器和配套样式 |

本机示例见 [开发说明](docs/DEVELOPMENT.md)，完整授权范围见 [开源范围](OPEN-SOURCE-SCOPE.md) 与 [第三方声明](THIRD-PARTY-NOTICES.md)。完整应用由私有仓库维护。

## 发展方向

接下来将持续完善执行稳定性、恢复、验收与成本可见性，并逐步探索真人与 AI 团队、角色与共享知识、精选岗位能力、项目经验交流和模板复用。员工市场、组织扩容、创作比赛与交易属于后续发展方向。

## 使用与维护说明

QIdoo 是个人独立开发和维护的项目，目前处于早期版本。使用中可能遇到功能缺陷、兼容性或稳定性问题。受个人精力所限，反馈回复和问题修复可能需要一些时间。欢迎在 Issues 中留下复现步骤、系统版本和相关截图，提交前请隐藏密钥与个人资料。感谢你的理解、耐心与支持。
