/**
 * Base Agent class - foundation for all AI agents
 */

import Anthropic from '@anthropic-ai/sdk';
import { AgentConfig, AgentRequest, AgentResponse, TokenUsage } from './types';
import { CostTracker } from '../utils/cost-tracker';
import { Logger } from '../utils/logger';

const MODEL_MAP = {
  haiku: 'claude-3-haiku-20240307',
  sonnet: 'claude-3-5-sonnet-20241022',
  opus: 'claude-opus-4-20250514',
} as const;

export class BaseAgent {
  protected client: Anthropic;
  protected config: AgentConfig;
  protected costTracker: CostTracker;
  protected logger: Logger;

  constructor(config: AgentConfig) {
    this.client = new Anthropic();
    this.config = config;
    this.costTracker = new CostTracker();
    this.logger = new Logger(config.name);
  }

  async execute(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      this.logger.info('Processing request', { userId: request.userId });

      const response = await this.client.messages.create({
        model: MODEL_MAP[this.config.model],
        max_tokens: this.config.maxTokens || 2048,
        system: this.config.systemPrompt,
        messages: [
          {
            role: 'user',
            content: request.message,
          },
        ],
      });

      const latencyMs = Date.now() - startTime;

      const usage: TokenUsage = {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      };

      // Track costs
      await this.costTracker.track({
        requestId: crypto.randomUUID(),
        timestamp: new Date(),
        model: MODEL_MAP[this.config.model],
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        feature: this.config.name,
        userId: request.userId,
        sessionId: request.sessionId,
      });

      const content =
        response.content[0].type === 'text' ? response.content[0].text : '';

      this.logger.info('Request completed', { latencyMs, tokens: usage.totalTokens });

      return {
        content,
        usage,
        latencyMs,
        model: MODEL_MAP[this.config.model],
      };
    } catch (error) {
      this.logger.error('Request failed', { error });
      throw error;
    }
  }

  getName(): string {
    return this.config.name;
  }

  getConfig(): AgentConfig {
    return { ...this.config };
  }
}
