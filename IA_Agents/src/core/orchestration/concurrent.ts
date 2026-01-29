/**
 * Concurrent Executor - Parallel agent execution
 */

import { BaseAgent } from '../../agents/base-agent';
import { AgentRequest, AgentResponse } from '../../agents/types';
import { Logger } from '../../utils/logger';

export class ConcurrentExecutor {
  private agents: BaseAgent[] = [];
  private logger: Logger;

  constructor() {
    this.logger = new Logger('ConcurrentExecutor');
  }

  addAgent(agent: BaseAgent): void {
    this.agents.push(agent);
    this.logger.info(`Added agent: ${agent.getName()}`);
  }

  async execute(request: AgentRequest): Promise<AgentResponse[]> {
    this.logger.info(`Starting concurrent execution with ${this.agents.length} agents`);

    const startTime = Date.now();

    const results = await Promise.all(
      this.agents.map(async (agent) => {
        this.logger.info(`Executing agent: ${agent.getName()}`);
        return agent.execute(request);
      })
    );

    const totalLatency = Date.now() - startTime;
    this.logger.info(`Concurrent execution completed in ${totalLatency}ms`);

    return results;
  }

  async executeWithTimeout(
    request: AgentRequest,
    timeoutMs: number
  ): Promise<AgentResponse[]> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), timeoutMs);
    });

    return Promise.race([this.execute(request), timeoutPromise]);
  }

  merge(results: AgentResponse[]): AgentResponse {
    const combinedContent = results.map((r) => r.content).join('\n\n---\n\n');

    const totalUsage = {
      inputTokens: results.reduce((sum, r) => sum + r.usage.inputTokens, 0),
      outputTokens: results.reduce((sum, r) => sum + r.usage.outputTokens, 0),
      totalTokens: results.reduce((sum, r) => sum + r.usage.totalTokens, 0),
    };

    const maxLatency = Math.max(...results.map((r) => r.latencyMs));

    return {
      content: combinedContent,
      usage: totalUsage,
      latencyMs: maxLatency,
      model: 'concurrent',
    };
  }
}
