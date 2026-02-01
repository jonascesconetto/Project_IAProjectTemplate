/**
 * Cost Tracker Unit Tests
 */

import { CostTracker, TokenUsageRecord } from '../../src/utils/cost-tracker';

describe('CostTracker', () => {
  let tracker: CostTracker;

  beforeEach(() => {
    tracker = new CostTracker();
  });

  afterEach(() => {
    tracker.clearRecords();
  });

  describe('calculateCost', () => {
    it('should calculate cost for Haiku model', () => {
      const usage: TokenUsageRecord = {
        requestId: 'test-1',
        timestamp: new Date(),
        model: 'claude-3-haiku-20240307',
        inputTokens: 1000,
        outputTokens: 500,
        feature: 'test',
      };

      const cost = tracker.calculateCost(usage);

      // Input: 1000 tokens * $0.25/1M = $0.00025
      // Output: 500 tokens * $1.25/1M = $0.000625
      // Total: $0.000875
      expect(cost).toBeCloseTo(0.000875, 6);
    });

    it('should calculate cost for Sonnet model', () => {
      const usage: TokenUsageRecord = {
        requestId: 'test-2',
        timestamp: new Date(),
        model: 'claude-3-5-sonnet-20241022',
        inputTokens: 1000,
        outputTokens: 500,
        feature: 'test',
      };

      const cost = tracker.calculateCost(usage);

      // Input: 1000 tokens * $3/1M = $0.003
      // Output: 500 tokens * $15/1M = $0.0075
      // Total: $0.0105
      expect(cost).toBeCloseTo(0.0105, 6);
    });

    it('should calculate cost for Opus model', () => {
      const usage: TokenUsageRecord = {
        requestId: 'test-3',
        timestamp: new Date(),
        model: 'claude-opus-4-20250514',
        inputTokens: 1000,
        outputTokens: 500,
        feature: 'test',
      };

      const cost = tracker.calculateCost(usage);

      // Input: 1000 tokens * $15/1M = $0.015
      // Output: 500 tokens * $75/1M = $0.0375
      // Total: $0.0525
      expect(cost).toBeCloseTo(0.0525, 6);
    });

    it('should return 0 for unknown model', () => {
      const usage: TokenUsageRecord = {
        requestId: 'test-4',
        timestamp: new Date(),
        model: 'unknown-model',
        inputTokens: 1000,
        outputTokens: 500,
        feature: 'test',
      };

      const cost = tracker.calculateCost(usage);
      expect(cost).toBe(0);
    });
  });

  describe('track', () => {
    it('should track usage record', async () => {
      const usage: TokenUsageRecord = {
        requestId: 'test-5',
        timestamp: new Date(),
        model: 'claude-3-haiku-20240307',
        inputTokens: 1000,
        outputTokens: 500,
        feature: 'test',
      };

      await tracker.track(usage);

      const report = await tracker.getReport('daily');
      expect(report.totalRequests).toBe(1);
      expect(report.totalInputTokens).toBe(1000);
      expect(report.totalOutputTokens).toBe(500);
    });
  });

  describe('getReport', () => {
    it('should aggregate costs by model', async () => {
      await tracker.track({
        requestId: 'test-6',
        timestamp: new Date(),
        model: 'claude-3-haiku-20240307',
        inputTokens: 1000,
        outputTokens: 500,
        feature: 'test',
      });

      await tracker.track({
        requestId: 'test-7',
        timestamp: new Date(),
        model: 'claude-3-5-sonnet-20241022',
        inputTokens: 1000,
        outputTokens: 500,
        feature: 'test',
      });

      const report = await tracker.getReport('daily');

      expect(report.totalRequests).toBe(2);
      expect(Object.keys(report.byModel)).toHaveLength(2);
      expect(report.byModel['claude-3-haiku-20240307'].requests).toBe(1);
      expect(report.byModel['claude-3-5-sonnet-20241022'].requests).toBe(1);
    });

    it('should aggregate costs by feature', async () => {
      await tracker.track({
        requestId: 'test-8',
        timestamp: new Date(),
        model: 'claude-3-haiku-20240307',
        inputTokens: 1000,
        outputTokens: 500,
        feature: 'chat',
      });

      await tracker.track({
        requestId: 'test-9',
        timestamp: new Date(),
        model: 'claude-3-haiku-20240307',
        inputTokens: 1000,
        outputTokens: 500,
        feature: 'search',
      });

      const report = await tracker.getReport('daily');

      expect(report.byFeature['chat'].requests).toBe(1);
      expect(report.byFeature['search'].requests).toBe(1);
    });
  });
});
