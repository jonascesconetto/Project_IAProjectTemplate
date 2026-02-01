/**
 * Supervisor Orchestrator - Centralized multi-agent coordination
 */

import { BaseAgent } from '../../agents/base-agent';
import { AgentRequest, AgentResponse } from '../../agents/types';
import { Logger } from '../../utils/logger';

interface Task {
  id: string;
  description: string;
  assignedAgent: string;
  dependencies: string[];
}

interface Plan {
  tasks: Task[];
}

export class SupervisorOrchestrator {
  private agents: Map<string, BaseAgent> = new Map();
  private logger: Logger;

  constructor() {
    this.logger = new Logger('SupervisorOrchestrator');
  }

  registerAgent(name: string, agent: BaseAgent): void {
    this.agents.set(name, agent);
    this.logger.info(`Registered agent: ${name}`);
  }

  async execute(request: AgentRequest): Promise<AgentResponse> {
    this.logger.info('Starting supervised execution');

    // 1. Plan - decompose task into subtasks
    const plan = await this.plan(request);

    // 2. Execute tasks respecting dependencies
    const results = await this.executePlan(plan, request);

    // 3. Aggregate results
    const aggregated = this.aggregate(results);

    return aggregated;
  }

  private async plan(request: AgentRequest): Promise<Plan> {
    // Simple planning - in production, use LLM for task decomposition
    const tasks: Task[] = [];

    // For now, create a single task for each registered agent
    let taskId = 1;
    for (const [name] of this.agents) {
      tasks.push({
        id: `task-${taskId++}`,
        description: `Process with ${name}`,
        assignedAgent: name,
        dependencies: [],
      });
    }

    return { tasks };
  }

  private async executePlan(
    plan: Plan,
    request: AgentRequest
  ): Promise<AgentResponse[]> {
    const results: AgentResponse[] = [];
    const completed = new Set<string>();

    // Execute tasks in order, respecting dependencies
    while (completed.size < plan.tasks.length) {
      const readyTasks = plan.tasks.filter(
        (task) =>
          !completed.has(task.id) &&
          task.dependencies.every((dep) => completed.has(dep))
      );

      if (readyTasks.length === 0) {
        throw new Error('Circular dependency detected in plan');
      }

      // Execute ready tasks in parallel
      const taskResults = await Promise.all(
        readyTasks.map(async (task) => {
          const agent = this.agents.get(task.assignedAgent);
          if (!agent) {
            throw new Error(`Agent not found: ${task.assignedAgent}`);
          }

          this.logger.info(`Executing task ${task.id} with ${task.assignedAgent}`);
          return agent.execute(request);
        })
      );

      results.push(...taskResults);
      readyTasks.forEach((task) => completed.add(task.id));
    }

    return results;
  }

  private aggregate(results: AgentResponse[]): AgentResponse {
    // Combine all responses
    const combinedContent = results.map((r) => r.content).join('\n\n---\n\n');

    const totalUsage = {
      inputTokens: results.reduce((sum, r) => sum + r.usage.inputTokens, 0),
      outputTokens: results.reduce((sum, r) => sum + r.usage.outputTokens, 0),
      totalTokens: results.reduce((sum, r) => sum + r.usage.totalTokens, 0),
    };

    const totalLatency = results.reduce((sum, r) => sum + r.latencyMs, 0);

    return {
      content: combinedContent,
      usage: totalUsage,
      latencyMs: totalLatency,
      model: 'multi-agent',
    };
  }
}
