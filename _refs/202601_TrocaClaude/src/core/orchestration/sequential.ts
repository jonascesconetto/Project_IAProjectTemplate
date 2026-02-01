/**
 * Sequential Pipeline - Linear chain of agents
 */

import { BaseAgent } from '../../agents/base-agent';
import { AgentRequest, AgentResponse } from '../../agents/types';
import { Logger } from '../../utils/logger';

export class SequentialPipeline {
  private stages: BaseAgent[] = [];
  private logger: Logger;

  constructor() {
    this.logger = new Logger('SequentialPipeline');
  }

  addStage(agent: BaseAgent): void {
    this.stages.push(agent);
    this.logger.info(`Added stage: ${agent.getName()}`);
  }

  async execute(request: AgentRequest): Promise<AgentResponse> {
    this.logger.info(`Starting pipeline with ${this.stages.length} stages`);

    let currentRequest = request;
    let totalLatency = 0;
    let totalUsage = {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    };

    let lastResponse: AgentResponse | null = null;

    for (let i = 0; i < this.stages.length; i++) {
      const stage = this.stages[i];
      this.logger.info(`Executing stage ${i + 1}: ${stage.getName()}`);

      const response = await stage.execute(currentRequest);

      totalLatency += response.latencyMs;
      totalUsage.inputTokens += response.usage.inputTokens;
      totalUsage.outputTokens += response.usage.outputTokens;
      totalUsage.totalTokens += response.usage.totalTokens;

      // Pass output as input to next stage
      currentRequest = {
        ...request,
        message: response.content,
      };

      lastResponse = response;
    }

    if (!lastResponse) {
      throw new Error('Pipeline has no stages');
    }

    return {
      content: lastResponse.content,
      usage: totalUsage,
      latencyMs: totalLatency,
      model: 'pipeline',
    };
  }
}
