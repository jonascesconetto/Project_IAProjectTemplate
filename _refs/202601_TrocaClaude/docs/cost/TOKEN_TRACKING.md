# Token Consumption Tracking

Guia para rastreamento e análise de consumo de tokens.

## Implementação Básica

### Token Tracker

```typescript
// src/utils/cost-tracker.ts

interface TokenUsage {
  requestId: string;
  timestamp: Date;
  model: string;
  inputTokens: number;
  outputTokens: number;
  feature?: string;
  userId?: string;
  sessionId?: string;
}

interface CostReport {
  period: string;
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  avgCostPerRequest: number;
  byModel: Record<string, ModelStats>;
  byFeature: Record<string, FeatureStats>;
}

class TokenTracker {
  private storage: TokenStorage;
  private metrics: MetricsClient;

  private pricing: Record<string, { input: number; output: number }> = {
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
    'claude-opus-4-20250514': { input: 15, output: 75 }
  };

  async track(usage: TokenUsage): Promise<void> {
    const cost = this.calculateCost(usage);

    // Salvar no storage
    await this.storage.save({
      ...usage,
      cost
    });

    // Emitir métricas
    this.emitMetrics(usage, cost);
  }

  private calculateCost(usage: TokenUsage): number {
    const pricing = this.pricing[usage.model];
    if (!pricing) {
      console.warn(`Unknown model: ${usage.model}`);
      return 0;
    }

    const inputCost = (usage.inputTokens / 1_000_000) * pricing.input;
    const outputCost = (usage.outputTokens / 1_000_000) * pricing.output;

    return inputCost + outputCost;
  }

  private emitMetrics(usage: TokenUsage, cost: number): void {
    // Input tokens
    this.metrics.increment('ai.tokens.input', usage.inputTokens, {
      model: usage.model,
      feature: usage.feature || 'unknown'
    });

    // Output tokens
    this.metrics.increment('ai.tokens.output', usage.outputTokens, {
      model: usage.model,
      feature: usage.feature || 'unknown'
    });

    // Cost
    this.metrics.gauge('ai.cost', cost, {
      model: usage.model,
      feature: usage.feature || 'unknown'
    });

    // Request count
    this.metrics.increment('ai.requests', 1, {
      model: usage.model,
      feature: usage.feature || 'unknown'
    });
  }

  async getReport(period: 'daily' | 'weekly' | 'monthly'): Promise<CostReport> {
    const startDate = this.getStartDate(period);
    const data = await this.storage.query({ since: startDate });

    return this.aggregateReport(data, period);
  }
}
```

### Middleware Integration

```typescript
// Express middleware
import { TokenTracker } from './cost-tracker';

const tracker = new TokenTracker();

const trackTokens = async (req: Request, res: Response, next: NextFunction) => {
  // Interceptar resposta
  const originalJson = res.json.bind(res);

  res.json = function(body: any) {
    // Extrair usage da resposta da API
    if (body.usage) {
      tracker.track({
        requestId: req.id,
        timestamp: new Date(),
        model: req.body.model,
        inputTokens: body.usage.input_tokens,
        outputTokens: body.usage.output_tokens,
        feature: req.headers['x-feature'] as string,
        userId: req.user?.id,
        sessionId: req.session?.id
      });
    }

    return originalJson(body);
  };

  next();
};
```

---

## Métricas Prometheus

### Definição de Métricas

```yaml
# prometheus/metrics.yml

metrics:
  - name: ai_tokens_input_total
    type: counter
    help: Total input tokens consumed
    labels: [model, feature]

  - name: ai_tokens_output_total
    type: counter
    help: Total output tokens consumed
    labels: [model, feature]

  - name: ai_request_cost_dollars
    type: histogram
    help: Cost per request in dollars
    labels: [model, feature]
    buckets: [0.0001, 0.001, 0.01, 0.1, 1]

  - name: ai_requests_total
    type: counter
    help: Total number of AI requests
    labels: [model, feature, status]

  - name: ai_token_efficiency
    type: gauge
    help: Ratio of useful tokens to total tokens
    labels: [feature]
```

### Implementação

```typescript
import { Counter, Gauge, Histogram, Registry } from 'prom-client';

const register = new Registry();

const inputTokens = new Counter({
  name: 'ai_tokens_input_total',
  help: 'Total input tokens consumed',
  labelNames: ['model', 'feature'],
  registers: [register]
});

const outputTokens = new Counter({
  name: 'ai_tokens_output_total',
  help: 'Total output tokens consumed',
  labelNames: ['model', 'feature'],
  registers: [register]
});

const requestCost = new Histogram({
  name: 'ai_request_cost_dollars',
  help: 'Cost per request in dollars',
  labelNames: ['model', 'feature'],
  buckets: [0.0001, 0.001, 0.01, 0.1, 1],
  registers: [register]
});

function recordUsage(usage: TokenUsage, cost: number): void {
  inputTokens.inc({
    model: usage.model,
    feature: usage.feature || 'unknown'
  }, usage.inputTokens);

  outputTokens.inc({
    model: usage.model,
    feature: usage.feature || 'unknown'
  }, usage.outputTokens);

  requestCost.observe({
    model: usage.model,
    feature: usage.feature || 'unknown'
  }, cost);
}
```

---

## Dashboard Grafana

### Painéis Recomendados

#### 1. Token Usage Over Time
```promql
# Total tokens por hora
sum(rate(ai_tokens_input_total[1h])) + sum(rate(ai_tokens_output_total[1h]))
```

#### 2. Cost by Model
```promql
# Custo por modelo (últimas 24h)
sum by (model) (
  increase(ai_tokens_input_total[24h]) * 0.000001 * on(model) group_left model_input_price
  +
  increase(ai_tokens_output_total[24h]) * 0.000001 * on(model) group_left model_output_price
)
```

#### 3. Cost by Feature
```promql
# Top 10 features por custo
topk(10, sum by (feature) (increase(ai_request_cost_dollars_sum[24h])))
```

#### 4. Requests per Second
```promql
# Taxa de requisições
rate(ai_requests_total[5m])
```

#### 5. Token Efficiency
```promql
# Eficiência de tokens
ai_token_efficiency
```

---

## Análise de Tokens

### Token Efficiency Score

```typescript
interface TokenAnalysis {
  totalTokens: number;
  usefulTokens: number;
  wastedTokens: number;
  efficiencyScore: number;
  recommendations: string[];
}

function analyzeTokenEfficiency(
  inputPrompt: string,
  output: string,
  systemPrompt: string
): TokenAnalysis {
  const inputTokens = countTokens(inputPrompt);
  const outputTokens = countTokens(output);
  const systemTokens = countTokens(systemPrompt);

  const totalTokens = inputTokens + outputTokens + systemTokens;

  // Estimar tokens úteis (output final visível ao usuário)
  const usefulTokens = outputTokens;

  // Tokens "desperdiçados" (context, system prompt repetido, etc)
  const wastedTokens = totalTokens - usefulTokens;

  const efficiencyScore = usefulTokens / totalTokens;

  const recommendations: string[] = [];

  if (systemTokens > 500) {
    recommendations.push('System prompt muito longo. Considere otimizar.');
  }

  if (inputTokens > outputTokens * 3) {
    recommendations.push('Input muito maior que output. Considere RAG.');
  }

  return {
    totalTokens,
    usefulTokens,
    wastedTokens,
    efficiencyScore,
    recommendations
  };
}
```

### Identificação de Oportunidades

| Padrão | Problema | Solução |
|--------|----------|---------|
| High input, low output | Context muito grande | Usar RAG, summarization |
| High retry rate | Prompts pouco claros | Melhorar prompts |
| Similar requests | Sem cache | Implementar caching |
| All requests to Opus | Sem seleção de modelo | Implementar routing |

---

## Relatórios Automatizados

### Daily Report Script

```typescript
// scripts/cost-report.js

async function generateDailyReport(): Promise<string> {
  const tracker = new TokenTracker();
  const report = await tracker.getReport('daily');

  const markdown = `
# Daily Token Report - ${new Date().toISOString().split('T')[0]}

## Summary
- Total Requests: ${report.totalRequests.toLocaleString()}
- Total Input Tokens: ${report.totalInputTokens.toLocaleString()}
- Total Output Tokens: ${report.totalOutputTokens.toLocaleString()}
- **Total Cost: $${report.totalCost.toFixed(2)}**
- Avg Cost/Request: $${report.avgCostPerRequest.toFixed(4)}

## By Model
| Model | Requests | Tokens | Cost | % Total |
|-------|----------|--------|------|---------|
${Object.entries(report.byModel).map(([model, stats]) => `| ${model} | ${stats.requests} | ${stats.tokens} | $${stats.cost.toFixed(2)} | ${(stats.cost / report.totalCost * 100).toFixed(1)}% |`).join('\n')}

## By Feature
| Feature | Requests | Cost | Avg Cost |
|---------|----------|------|----------|
${Object.entries(report.byFeature).map(([feature, stats]) => `| ${feature} | ${stats.requests} | $${stats.cost.toFixed(2)} | $${(stats.cost / stats.requests).toFixed(4)} |`).join('\n')}

## Anomalies
${report.anomalies?.length ? report.anomalies.map(a => `- ${a}`).join('\n') : 'None detected'}

---
Generated at ${new Date().toISOString()}
  `;

  return markdown;
}
```

### npm Scripts

```json
{
  "scripts": {
    "cost:daily": "ts-node scripts/cost-report.ts --period=daily",
    "cost:weekly": "ts-node scripts/cost-report.ts --period=weekly",
    "cost:monthly": "ts-node scripts/cost-report.ts --period=monthly",
    "cost:analyze": "ts-node scripts/analyze-efficiency.ts"
  }
}
```

---

## Checklist de Implementação

### Básico
- [ ] Implementar TokenTracker
- [ ] Integrar com API wrapper
- [ ] Configurar storage (DB ou file)
- [ ] Criar endpoint de métricas

### Avançado
- [ ] Integrar com Prometheus/Grafana
- [ ] Configurar alertas
- [ ] Automatizar relatórios
- [ ] Implementar análise de eficiência

### Governança
- [ ] Definir SLOs de custo
- [ ] Configurar budgets por time
- [ ] Implementar chargebacks
- [ ] Criar revisões regulares
