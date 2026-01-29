/**
 * Cost Tracker - Track and analyze token consumption and costs
 */

import { Logger } from './logger';

export interface TokenUsageRecord {
  requestId: string;
  timestamp: Date;
  model: string;
  inputTokens: number;
  outputTokens: number;
  feature?: string;
  userId?: string;
  sessionId?: string;
}

export interface CostReport {
  period: string;
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  avgCostPerRequest: number;
  byModel: Record<string, ModelStats>;
  byFeature: Record<string, FeatureStats>;
}

interface ModelStats {
  requests: number;
  tokens: number;
  cost: number;
}

interface FeatureStats {
  requests: number;
  cost: number;
}

// Pricing per 1M tokens (as of January 2025)
const PRICING: Record<string, { input: number; output: number }> = {
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
  'claude-opus-4-20250514': { input: 15.0, output: 75.0 },
};

export class CostTracker {
  private records: TokenUsageRecord[] = [];
  private logger: Logger;

  constructor() {
    this.logger = new Logger('CostTracker');
  }

  async track(usage: TokenUsageRecord): Promise<void> {
    const cost = this.calculateCost(usage);

    this.records.push(usage);

    this.logger.debug('Tracked usage', {
      model: usage.model,
      tokens: usage.inputTokens + usage.outputTokens,
      cost: cost.toFixed(6),
    });

    // Emit metrics (could integrate with Prometheus, DataDog, etc.)
    this.emitMetrics(usage, cost);
  }

  calculateCost(usage: TokenUsageRecord): number {
    const pricing = PRICING[usage.model];
    if (!pricing) {
      this.logger.warn(`Unknown model: ${usage.model}`);
      return 0;
    }

    const inputCost = (usage.inputTokens / 1_000_000) * pricing.input;
    const outputCost = (usage.outputTokens / 1_000_000) * pricing.output;

    return inputCost + outputCost;
  }

  private emitMetrics(usage: TokenUsageRecord, cost: number): void {
    // Placeholder for metrics integration
    // Could emit to Prometheus, DataDog, CloudWatch, etc.
  }

  async getReport(period: 'daily' | 'weekly' | 'monthly'): Promise<CostReport> {
    const now = new Date();
    const startDate = this.getStartDate(period, now);

    const filteredRecords = this.records.filter(
      (r) => r.timestamp >= startDate
    );

    const byModel: Record<string, ModelStats> = {};
    const byFeature: Record<string, FeatureStats> = {};

    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;

    for (const record of filteredRecords) {
      const cost = this.calculateCost(record);
      const tokens = record.inputTokens + record.outputTokens;

      totalInputTokens += record.inputTokens;
      totalOutputTokens += record.outputTokens;
      totalCost += cost;

      // By model
      if (!byModel[record.model]) {
        byModel[record.model] = { requests: 0, tokens: 0, cost: 0 };
      }
      byModel[record.model].requests++;
      byModel[record.model].tokens += tokens;
      byModel[record.model].cost += cost;

      // By feature
      const feature = record.feature || 'unknown';
      if (!byFeature[feature]) {
        byFeature[feature] = { requests: 0, cost: 0 };
      }
      byFeature[feature].requests++;
      byFeature[feature].cost += cost;
    }

    return {
      period,
      totalRequests: filteredRecords.length,
      totalInputTokens,
      totalOutputTokens,
      totalCost,
      avgCostPerRequest:
        filteredRecords.length > 0 ? totalCost / filteredRecords.length : 0,
      byModel,
      byFeature,
    };
  }

  private getStartDate(period: 'daily' | 'weekly' | 'monthly', now: Date): Date {
    const date = new Date(now);

    switch (period) {
      case 'daily':
        date.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        date.setDate(date.getDate() - 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() - 1);
        break;
    }

    return date;
  }

  clearRecords(): void {
    this.records = [];
  }
}
