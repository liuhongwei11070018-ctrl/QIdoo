export type TaskStatus = 'working' | 'idle' | 'waiting' | 'error' | 'done' | 'offline';
export type Operation = { kind: 'read' | 'edit' | 'command' | 'check' | 'attention' | 'output' | 'message'; text: string; raw?: string };
export type TaskConversation = { id: string; role: 'user' | 'assistant' | 'tool' | 'note' | 'summary'; text: string; timestamp?: string; kind?: Operation['kind']; raw?: string };
export type TaskOperation = Operation & { id?: string; timestamp?: string };
export type TaskSubagent = { id: string; parentTaskId: string; name: string; description?: string; status: TaskStatus; model?: string; startedAt?: string; endedAt?: string; steps?: number; conversation?: TaskConversation[] };
export type TaskUsage = { tokens?: number; contextTokens?: number; contextLimit?: number; costUsd?: number };
export type TaskSnapshot = {
  taskId: string; revision: number; agentId: string; title: string; status: TaskStatus;
  outcome?: 'queued'|'running'|'waiting'|'stopping'|'done'|'interrupted'|'failed'|'unknown';
  objective?: string; currentStep?: string; output?: string; startedAt?: string; updatedAt?: string; legacy?: boolean;
  steps?: { title: string; done: boolean }[];
  artifacts: { id: string; name: string; url: string; mimeType?: string; version?: string }[];
  sessionUrl?: string | null;
  deviceIds?: string[];
  conversation?: TaskConversation[];
  // Cumulative operations supplied for this task; records remain report history.
  operations?: TaskOperation[];
  subagents?: TaskSubagent[];
  usage?: TaskUsage;
  source?: { label: string; workspace?: string; model?: string };
  blocking?: { kind: 'approval' | 'input' | 'dependency'; title: string; reason: string; subject?: string; impact?: string } | null;
  records: { timestamp: string; status: TaskStatus; message: string; details: Operation[] }[];
};
