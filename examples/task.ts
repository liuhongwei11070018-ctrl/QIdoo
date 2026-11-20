import type {TaskSnapshot} from '../packages/task-protocol/task-types';

export const task: TaskSnapshot = {
  taskId: 'example-task-1',
  revision: 1,
  agentId: 'ai-researcher',
  title: 'Review a project brief',
  status: 'working',
  outcome: 'running',
  objective: 'Summarize the requirements and identify open questions.',
  artifacts: [],
  records: [],
};
