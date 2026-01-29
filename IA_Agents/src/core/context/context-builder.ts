/**
 * Context Builder - Manages context construction within token budgets
 */

import {
  ContextConfig,
  BuiltContext,
  UserProfile,
  ConversationMessage,
} from './context-types';

// Simple token estimation (4 chars ≈ 1 token)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export class ContextBuilder {
  private config: ContextConfig;

  constructor(config?: Partial<ContextConfig>) {
    this.config = {
      maxTokens: config?.maxTokens || 8000,
      systemPromptBudget: config?.systemPromptBudget || 1000,
      userContextBudget: config?.userContextBudget || 500,
      domainKnowledgeBudget: config?.domainKnowledgeBudget || 4000,
      historyBudget: config?.historyBudget || 2000,
    };
  }

  build(params: {
    systemPrompt: string;
    userProfile?: UserProfile;
    domainKnowledge?: string[];
    history?: ConversationMessage[];
  }): BuiltContext {
    const result: BuiltContext = {
      systemPrompt: this.truncateToTokens(
        params.systemPrompt,
        this.config.systemPromptBudget
      ),
      totalTokens: 0,
    };

    result.totalTokens += estimateTokens(result.systemPrompt);

    // Add user context if provided
    if (params.userProfile) {
      result.userContext = this.buildUserContext(params.userProfile);
      result.totalTokens += estimateTokens(result.userContext);
    }

    // Add domain knowledge if provided
    if (params.domainKnowledge && params.domainKnowledge.length > 0) {
      result.domainKnowledge = this.buildDomainKnowledge(params.domainKnowledge);
      result.totalTokens += estimateTokens(result.domainKnowledge);
    }

    // Add conversation history if provided
    if (params.history && params.history.length > 0) {
      result.conversationHistory = this.buildHistory(params.history);
      result.totalTokens += estimateTokens(result.conversationHistory);
    }

    return result;
  }

  private buildUserContext(profile: UserProfile): string {
    const parts: string[] = [];

    if (profile.name) {
      parts.push(`Nome: ${profile.name}`);
    }
    if (profile.role) {
      parts.push(`Função: ${profile.role}`);
    }
    if (profile.preferences) {
      parts.push(`Preferências: ${JSON.stringify(profile.preferences)}`);
    }

    const context = parts.join('\n');
    return this.truncateToTokens(context, this.config.userContextBudget);
  }

  private buildDomainKnowledge(documents: string[]): string {
    let combinedDocs = documents.join('\n\n---\n\n');
    return this.truncateToTokens(combinedDocs, this.config.domainKnowledgeBudget);
  }

  private buildHistory(messages: ConversationMessage[]): string {
    // Keep most recent messages first when truncating
    const formatted = messages
      .slice(-10) // Keep last 10 messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    return this.truncateToTokens(formatted, this.config.historyBudget);
  }

  private truncateToTokens(text: string, maxTokens: number): string {
    const currentTokens = estimateTokens(text);

    if (currentTokens <= maxTokens) {
      return text;
    }

    // Truncate to approximate character count
    const targetChars = maxTokens * 4;
    return text.slice(0, targetChars) + '...';
  }
}
