/**
 * Metrics Collector - Collect and report evaluation metrics
 */

import { Logger } from '../../utils/logger';

interface MetricValue {
  value: number;
  timestamp: Date;
  labels?: Record<string, string>;
}

export class MetricsCollector {
  private metrics: Map<string, MetricValue[]> = new Map();
  private logger: Logger;

  constructor() {
    this.logger = new Logger('MetricsCollector');
  }

  record(name: string, value: number, labels?: Record<string, string>): void {
    const metric: MetricValue = {
      value,
      timestamp: new Date(),
      labels,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push(metric);
  }

  getMetric(name: string): MetricValue[] {
    return this.metrics.get(name) || [];
  }

  getAverage(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;

    const sum = values.reduce((acc, v) => acc + v.value, 0);
    return sum / values.length;
  }

  getPercentile(name: string, p: number): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;

    const sorted = [...values].map((v) => v.value).sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  getReport(): Record<string, { avg: number; p50: number; p95: number; p99: number; count: number }> {
    const report: Record<string, { avg: number; p50: number; p95: number; p99: number; count: number }> = {};

    for (const [name] of this.metrics) {
      report[name] = {
        avg: this.getAverage(name),
        p50: this.getPercentile(name, 50),
        p95: this.getPercentile(name, 95),
        p99: this.getPercentile(name, 99),
        count: this.metrics.get(name)?.length || 0,
      };
    }

    return report;
  }

  clear(): void {
    this.metrics.clear();
  }
}
