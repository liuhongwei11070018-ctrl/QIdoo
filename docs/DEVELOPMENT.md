# Development / 开发说明

## Run the module tests

Requires Node.js 22.13 or later. Agent and layout tests use the Node.js standard library.

```sh
node --test tests/*.test.mjs
node examples/layout.mjs
```

测试覆盖控制回执、执行器暂停与恢复、过期命令、回环地址约束、HTTP 接入和气泡避让。React 选择器随源码与样式提供，需要在消费项目的实际浏览器中检查视觉和交互。

The tests cover control receipts, executor pause/resume, expired commands, loopback endpoint restrictions, HTTP integration and bubble placement. The React component is supplied as source and styles, with browser validation performed in the consuming application.

## Agent integration

Import the client into a cooperative executor that connects to a compatible local QIdoo service.

```js
import {runAgentControl} from './packages/agent-control/agent-control-client.mjs';

const stop = new AbortController();
await runAgentControl({
  office: 'http://127.0.0.1:4312',
  agentId: 'ai-01',
  signal: stop.signal,
  onPause: async ({signal}) => {
    await executor.pauseAndDrain({signal});
    return {state: 'paused'};
  },
  onResume: async ({signal}) => {
    await executor.resume({signal});
    return {state: 'running'};
  },
});
```

`executor` represents your actual executor. Its callbacks must complete the operation before returning and must honor cancellation. Pause/resume handlers should support repeated calls. The client accepts loopback endpoints.

`executor` 代表实际执行器。回调完成实际操作后再返回，并支持取消与重复调用。当前客户端使用本机回环地址。

The host receives JSON requests at `/api/future/control`. `register` returns a runner token, `poll` retrieves commands, and `ack` confirms the outcome. The exported `createControlHub` supplies the in-memory host implementation. The HTTP integration test demonstrates a compatible local host.

宿主在 `/api/future/control` 接收 JSON。`register` 返回执行器令牌，`poll` 获取命令，`ack` 提交实际结果。`createControlHub` 提供内存实现，HTTP 测试包含本机宿主示例。

## Codex bridge

Use a reachable local App Server that owns the target thread, then start the bridge.

```sh
node packages/agent-control/codex-control-bridge.mjs \
  --url ws://127.0.0.1:4500 \
  --thread THREAD_ID \
  --agent ai-01
```

The bridge currently accepts `ai-01` through `ai-06`. The generic control client accepts other compatible Agent identifiers. Codex pause interrupts the active turn and waits for confirmation. Resume continues the same thread. Authorization requests are handled by the native client.

控制桥当前接受 `ai-01` 至 `ai-06`。通用控制客户端可使用其他符合协议的 Agent 标识。Codex 暂停通过中断当前轮次实现，恢复在同一线程继续，操作授权由原生客户端处理。

## React component

Copy `packages/ui/OfficeSelect.tsx` and `office-select.css` into a React 19 project with React DOM and a CSS-capable build pipeline. `examples/OfficeSelectExample.tsx` demonstrates usage. The host may customize typography, trigger styling and theme variables. The component supports disabled options, keyboard navigation, type-ahead selection, outside dismissal and Escape handling.

将选择器与配套样式一起放入支持 CSS 的 React 19 工程。宿主按自身设计设置字体、触发器和主题变量。使用示例见 `examples/OfficeSelectExample.tsx`。

## Task types and scene layout

`examples/task.ts` demonstrates a typed task record. `examples/layout.mjs` shows bubble and popover placement with synthetic coordinates. These modules can be reused independently.

任务格式示例与场景布局示例使用合成数据，可以独立运行或导入。
