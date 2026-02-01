#!/usr/bin/env node

/**
 * Cost Report Generator
 *
 * Usage:
 *   node scripts/cost-report.js --period=daily
 *   node scripts/cost-report.js --period=weekly
 *   node scripts/cost-report.js --period=monthly
 */

const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
const periodArg = args.find((arg) => arg.startsWith('--period='));
const period = periodArg ? periodArg.split('=')[1] : 'daily';

// Mock data for demonstration (in production, read from database/logs)
const mockData = {
  daily: {
    totalRequests: 1000,
    totalInputTokens: 500000,
    totalOutputTokens: 200000,
    totalCost: 15.5,
    byModel: {
      'claude-3-haiku': { requests: 700, tokens: 350000, cost: 1.5 },
      'claude-3-5-sonnet': { requests: 250, tokens: 300000, cost: 9.0 },
      'claude-opus-4': { requests: 50, tokens: 50000, cost: 5.0 },
    },
    byFeature: {
      chat: { requests: 600, cost: 8.0 },
      search: { requests: 300, cost: 5.0 },
      analysis: { requests: 100, cost: 2.5 },
    },
  },
};

function generateReport(period) {
  const data = mockData.daily; // Use mock data
  const date = new Date().toISOString().split('T')[0];

  const report = `
# ${period.charAt(0).toUpperCase() + period.slice(1)} Cost Report - ${date}

## Summary
- **Total Requests**: ${data.totalRequests.toLocaleString()}
- **Total Input Tokens**: ${data.totalInputTokens.toLocaleString()}
- **Total Output Tokens**: ${data.totalOutputTokens.toLocaleString()}
- **Total Cost**: $${data.totalCost.toFixed(2)}
- **Avg Cost/Request**: $${(data.totalCost / data.totalRequests).toFixed(4)}

## By Model
| Model | Requests | Tokens | Cost | % Total |
|-------|----------|--------|------|---------|
${Object.entries(data.byModel)
  .map(
    ([model, stats]) =>
      `| ${model} | ${stats.requests.toLocaleString()} | ${stats.tokens.toLocaleString()} | $${stats.cost.toFixed(2)} | ${((stats.cost / data.totalCost) * 100).toFixed(1)}% |`
  )
  .join('\n')}

## By Feature
| Feature | Requests | Cost | Avg Cost |
|---------|----------|------|----------|
${Object.entries(data.byFeature)
  .map(
    ([feature, stats]) =>
      `| ${feature} | ${stats.requests.toLocaleString()} | $${stats.cost.toFixed(2)} | $${(stats.cost / stats.requests).toFixed(4)} |`
  )
  .join('\n')}

## Recommendations
${data.totalCost > 10 ? '- Consider implementing caching for frequent queries' : ''}
${data.byModel['claude-opus-4']?.requests > 100 ? '- High Opus usage - consider Plan-and-Execute pattern' : ''}
- Monitor cost trends over time

---
*Generated at ${new Date().toISOString()}*
`;

  return report;
}

// Generate and output report
const report = generateReport(period);
console.log(report);

// Optionally save to file
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const filename = `cost-report-${period}-${new Date().toISOString().split('T')[0]}.md`;
fs.writeFileSync(path.join(reportsDir, filename), report);
console.log(`\nReport saved to reports/${filename}`);
