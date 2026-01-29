/**
 * Agent type definitions
 */

export interface AgentConfig {
  name: string;
  description: string;
  model: 'haiku' | 'sonnet' | 'opus';
  systemPrompt: string;
  tools?: string[];
  maxTokens?: number;
  temperature?: number;
}

export interface AgentResponse {
  content: string;
  usage: TokenUsage;
  latencyMs: number;
  model: string;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AgentRequest {
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
}
