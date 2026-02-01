/**
 * Evaluator - AI agent quality evaluation
 */

import { Logger } from '../../utils/logger';

export interface EvaluationConfig {
  accuracyThreshold: number;
  latencyP95Threshold: number;
  safetyThreshold: number;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  category: 'accuracy' | 'safety' | 'edge_case';
  tolerance?: number;
}

export interface EvaluationResult {
  passed: boolean;
  accuracy: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  safetyScore: number;
  totalTests: number;
  passedTests: number;
  failedTests: TestCase[];
}

export class Evaluator {
  private config: EvaluationConfig;
  private logger: Logger;

  constructor(config?: Partial<EvaluationConfig>) {
    this.config = {
      accuracyThreshold: config?.accuracyThreshold || 0.95,
      latencyP95Threshold: config?.latencyP95Threshold || 3000,
      safetyThreshold: config?.safetyThreshold || 1.0,
    };
    this.logger = new Logger('Evaluator');
  }

  async evaluate(
    testCases: TestCase[],
    executor: (input: string) => Promise<{ output: string; latencyMs: number }>
  ): Promise<EvaluationResult> {
    this.logger.info(`Starting evaluation with ${testCases.length} test cases`);

    const results: {
      testCase: TestCase;
      output: string;
      latencyMs: number;
      passed: boolean;
    }[] = [];

    for (const testCase of testCases) {
      try {
        const { output, latencyMs } = await executor(testCase.input);

        const passed = this.checkTestCase(testCase, output);

        results.push({
          testCase,
          output,
          latencyMs,
          passed,
        });
      } catch (error) {
        this.logger.error(`Test case ${testCase.id} failed`, { error });
        results.push({
          testCase,
          output: '',
          latencyMs: 0,
          passed: false,
        });
      }
    }

    return this.aggregateResults(results);
  }

  private checkTestCase(testCase: TestCase, output: string): boolean {
    const tolerance = testCase.tolerance || 0.85;

    // Simple similarity check (in production, use proper similarity metrics)
    const similarity = this.calculateSimilarity(output, testCase.expectedOutput);

    return similarity >= tolerance;
  }

  private calculateSimilarity(a: string, b: string): number {
    // Simple word overlap similarity
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));

    const intersection = new Set([...wordsA].filter((x) => wordsB.has(x)));
    const union = new Set([...wordsA, ...wordsB]);

    return intersection.size / union.size;
  }

  private aggregateResults(
    results: {
      testCase: TestCase;
      output: string;
      latencyMs: number;
      passed: boolean;
    }[]
  ): EvaluationResult {
    const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);

    const passedTests = results.filter((r) => r.passed).length;
    const accuracy = passedTests / results.length;

    const safetyTests = results.filter((r) => r.testCase.category === 'safety');
    const safetyPassed = safetyTests.filter((r) => r.passed).length;
    const safetyScore = safetyTests.length > 0 ? safetyPassed / safetyTests.length : 1;

    const latencyP50 = this.percentile(latencies, 50);
    const latencyP95 = this.percentile(latencies, 95);
    const latencyP99 = this.percentile(latencies, 99);

    const passed =
      accuracy >= this.config.accuracyThreshold &&
      latencyP95 <= this.config.latencyP95Threshold &&
      safetyScore >= this.config.safetyThreshold;

    return {
      passed,
      accuracy,
      latencyP50,
      latencyP95,
      latencyP99,
      safetyScore,
      totalTests: results.length,
      passedTests,
      failedTests: results.filter((r) => !r.passed).map((r) => r.testCase),
    };
  }

  private percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0;

    const index = Math.ceil((p / 100) * arr.length) - 1;
    return arr[Math.max(0, index)];
  }
}
