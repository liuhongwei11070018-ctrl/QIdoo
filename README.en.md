# QIdoo

An entire studio for your next idea.

[简体中文](README.md) · [Download QIdoo 1.0](https://github.com/liuhongwei11070018-ctrl/QIdoo/releases/tag/v1.0.0) · [Report an issue](https://github.com/liuhongwei11070018-ctrl/QIdoo/issues) · [Open-source modules](OPEN-SOURCE-SCOPE.md)

QIdoo is a visual AI workspace for independent creators, solo businesses, developers and small studios. It brings AI collaborators, teams, conversations, tasks and deliverables into one place, keeping the work connected from the initial brief through review.

## Work together in one studio

- **See your team at work.** A 3D studio and list views show collaborators, task status, reported progress and items that need attention.
- **Connect familiar tools.** The desktop app supports integrations for Codex, Claude Code, Gemini CLI and CodeBuddy CLI, alongside model APIs and external Agent services. Available capabilities depend on the integration and executor.
- **Organize work around a goal.** Use direct messages, group conversations, mentions and workgroups to connect responsibilities, task dependencies, materials and deliverables.
- **Make decisions when they matter.** Handle questions, operation approvals, execution failures, retries and deliverable reviews in context.
- **Keep the results.** Browse conversations, attachments and work records, preview supported deliverables, download files and continue revisions.
- **Make it your workspace.** Chinese and English, light and dark themes, scene and sound settings, guided onboarding and reduced-motion options are available.

## Desktop downloads

| Platform | Installer |
| --- | --- |
| macOS · Apple Silicon | [Download DMG](https://github.com/liuhongwei11070018-ctrl/QIdoo/releases/download/v1.0.0/QIdoo-1.0-macOS-AppleSilicon.dmg) |
| macOS · Intel | [Download DMG](https://github.com/liuhongwei11070018-ctrl/QIdoo/releases/download/v1.0.0/QIdoo-1.0-macOS-Intel.dmg) |
| Windows · x64 | [Download installer](https://github.com/liuhongwei11070018-ctrl/QIdoo/releases/download/v1.0.0/QIdoo-1.0-Windows-x64.exe) |

Checksums are available in [SHA256SUMS.txt](SHA256SUMS.txt) and on the [release page](https://github.com/liuhongwei11070018-ctrl/QIdoo/releases/tag/v1.0.0).

Choose the installer that matches your processor, install QIdoo and follow the connection setup in the app. The desktop app uses a local workspace. Supply your own service accounts, API credentials and any required CLI tools. Model and tool charges are billed by their providers.

### Installation and validation

The 1.0 installers are unsigned, so your operating system may display publisher or security prompts. Verify the download source and checksum, and back up important work before use.

The supplied build record reports isolated runtime verification on an Intel Mac. Windows x64 and Apple Silicon packages have completed cross-packaging, architecture and file-integrity checks. Installation and runtime verification on their respective hardware remains pending. Reports from these environments are welcome through Issues.

## Web version

The web version includes a public demonstration and an administrator workspace. The demonstration uses isolated sample sessions. The real workspace currently uses administrator login, with public registration planned for a later stage.

Real web tasks use online model APIs from the server workspace. Local CLI connections, device controls, local projects and local previews are available through the desktop app. A public web address will be added after deployment.

## Open source and contributions

This repository distributes desktop installers and these selected MIT-licensed modules.

| Module | Contents |
| --- | --- |
| [Agent integration](packages/agent-control/) | Registration, heartbeat, pause/resume receipts and a Codex control bridge |
| [Task protocol](packages/task-protocol/) | TypeScript types for tasks, operations, deliverables and subtasks |
| [Scene layout](packages/scene-layout/) | Bubble collision avoidance and popover placement |
| [UI components](packages/ui/) | A React select component and its styles |

See the [development guide](docs/DEVELOPMENT.md), [source scope](OPEN-SOURCE-SCOPE.md) and [third-party notices](THIRD-PARTY-NOTICES.md). The complete application is maintained in a private repository.

## Direction

Development will continue with execution reliability, recovery, review workflows and cost visibility. Longer-term directions include human–AI teams, roles and shared knowledge, curated role capabilities, project learning and reusable templates. An employee marketplace, organization expansion, creative competitions and transactions are planned areas of exploration.

## Early release and maintenance

QIdoo is independently developed and maintained as a personal project. This is an early release, and you may encounter bugs, compatibility issues or instability. Responses and fixes may take some time due to limited maintenance capacity. Please report issues with reproduction steps, your operating system version and relevant screenshots, with credentials and personal information removed. Thank you for your patience, understanding and support.
