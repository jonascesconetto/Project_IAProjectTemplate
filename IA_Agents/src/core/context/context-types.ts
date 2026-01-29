/**
 * Context type definitions
 */

export interface ContextConfig {
  maxTokens: number;
  systemPromptBudget: number;
  userContextBudget: number;
  domainKnowledgeBudget: number;
  historyBudget: number;
}

export interface BuiltContext {
  systemPrompt: string;
  userContext?: string;
  domainKnowledge?: string;
  conversationHistory?: string;
  totalTokens: number;
}

export interface UserProfile {
  id: string;
  name?: string;
  role?: string;
  preferences?: Record<string, unknown>;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
