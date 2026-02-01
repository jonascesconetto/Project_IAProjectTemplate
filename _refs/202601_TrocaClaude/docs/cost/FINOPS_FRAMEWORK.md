# AI FinOps Framework

Framework para gestão e otimização de custos de IA.

## Visão Geral

FinOps para IA é a prática de gerenciar custos de inferência e infraestrutura de forma a maximizar o valor entregue por cada dólar gasto.

---

## Estrutura de Custos

### Custos de Inferência

| Modelo | Input (1M tokens) | Output (1M tokens) | Notas |
|--------|-------------------|---------------------|-------|
| Claude 3 Haiku | $0.25 | $1.25 | Mais econômico |
| Claude 3.5 Sonnet | $3.00 | $15.00 | Balanceado |
| Claude Opus 4 | $15.00 | $75.00 | Mais capaz |

### Componentes de Custo Total

```
┌─────────────────────────────────────────────────┐
│              CUSTO TOTAL DE IA                   │
├─────────────────────────────────────────────────┤
│  Inferência (60-80%)                            │
│  ├── Input tokens                               │
│  ├── Output tokens                              │
│  └── Retries/Fallbacks                          │
├─────────────────────────────────────────────────┤
│  Infraestrutura (15-25%)                        │
│  ├── Compute (CPU/GPU)                          │
│  ├── Storage                                    │
│  └── Networking                                 │
├─────────────────────────────────────────────────┤
│  Desenvolvimento (5-15%)                        │
│  ├── Testes e avaliação                         │
│  └── Experimentação                             │
└─────────────────────────────────────────────────┘
```

---

## Estratégias de Otimização

### 1. Seleção de Modelo

**Princípio**: Usar o menor modelo que atenda aos requisitos de qualidade.

```typescript
const modelSelector = {
  simple: {
    model: 'claude-3-haiku',
    costPer1KTokens: 0.00025,
    useCases: ['FAQ', 'classificação', 'formatação']
  },
  moderate: {
    model: 'claude-3-5-sonnet',
    costPer1KTokens: 0.003,
    useCases: ['análise', 'síntese', 'code review']
  },
  complex: {
    model: 'claude-opus-4',
    costPer1KTokens: 0.015,
    useCases: ['raciocínio complexo', 'criatividade', 'edge cases']
  }
};

function selectModel(task: Task): Model {
  const complexity = classifyComplexity(task);
  return modelSelector[complexity];
}
```

### 2. Plan-and-Execute Pattern

**Economia potencial**: Até 90%

```
Sem otimização:  100 req × $0.03 (Opus) = $3.00
Com P&E:         70 Haiku + 20 Sonnet + 10 Opus = $0.38
Economia: 87%
```

### 3. Otimização de Prompts

```typescript
// Antes: 500 tokens de system prompt
const longPrompt = `
  Você é um assistente especializado em...
  [muita explicação]
  [exemplos detalhados]
  [regras extensas]
`;

// Depois: 150 tokens de system prompt
const optimizedPrompt = `
  Assistente de suporte. Responda FAQs sobre produtos.
  Tom: profissional, conciso.
  Se incerto: escale para humano.
`;

// Economia: 70% em tokens de input
```

### 4. Caching

```typescript
interface CacheConfig {
  semantic: {
    enabled: true,
    similarityThreshold: 0.95,
    ttl: 3600 // 1 hora
  },
  exact: {
    enabled: true,
    ttl: 86400 // 24 horas
  }
}

class CachedInference {
  async query(prompt: string): Promise<string> {
    // 1. Check exact cache
    const exactHit = await this.exactCache.get(hash(prompt));
    if (exactHit) return exactHit;

    // 2. Check semantic cache
    const semanticHit = await this.semanticCache.findSimilar(prompt);
    if (semanticHit) return semanticHit;

    // 3. Call API
    const response = await this.api.complete(prompt);

    // 4. Cache result
    await this.cacheResponse(prompt, response);

    return response;
  }
}
```

### 5. Batching

```typescript
class BatchProcessor {
  private queue: Request[] = [];
  private batchSize = 10;
  private batchTimeout = 100; // ms

  async add(request: Request): Promise<Response> {
    return new Promise((resolve) => {
      this.queue.push({ request, resolve });

      if (this.queue.length >= this.batchSize) {
        this.processBatch();
      } else {
        setTimeout(() => this.processBatch(), this.batchTimeout);
      }
    });
  }

  private async processBatch(): Promise<void> {
    const batch = this.queue.splice(0, this.batchSize);
    const responses = await this.api.batchComplete(batch.map(b => b.request));
    batch.forEach((b, i) => b.resolve(responses[i]));
  }
}
```

---

## Tracking de Custos

### Métricas Essenciais

| Métrica | Descrição | Frequência |
|---------|-----------|------------|
| Cost per request | Custo médio por requisição | Real-time |
| Daily cost | Custo total diário | Diário |
| Cost per user | Custo por usuário ativo | Semanal |
| Cost per feature | Custo por funcionalidade | Mensal |
| Token efficiency | Tokens úteis / total | Contínuo |

### Implementação

```typescript
interface CostTracker {
  trackRequest(data: {
    requestId: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    feature: string;
    userId?: string;
  }): void;

  getReport(period: 'daily' | 'weekly' | 'monthly'): CostReport;
}

class CostTrackerImpl implements CostTracker {
  private pricing = {
    'claude-3-haiku': { input: 0.25, output: 1.25 },
    'claude-3-5-sonnet': { input: 3, output: 15 },
    'claude-opus-4': { input: 15, output: 75 }
  };

  trackRequest(data: RequestData): void {
    const cost = this.calculateCost(data);

    // Log to database
    this.db.insert('cost_log', {
      ...data,
      cost,
      timestamp: new Date()
    });

    // Emit to monitoring
    this.metrics.gauge('ai.cost', cost, {
      model: data.model,
      feature: data.feature
    });
  }

  private calculateCost(data: RequestData): number {
    const pricing = this.pricing[data.model];
    return (data.inputTokens * pricing.input + data.outputTokens * pricing.output) / 1_000_000;
  }
}
```

---

## Budget Management

### Alocação de Budget

| Categoria | % do Total | Notas |
|-----------|------------|-------|
| Produção | 60% | Tráfego de usuários |
| Staging | 10% | Testes de integração |
| Desenvolvimento | 20% | Experimentação |
| Buffer | 10% | Imprevistos |

### Sistema de Alertas

```yaml
alerts:
  warning:
    threshold: 80%  # do budget diário
    action: notify_slack
    message: "AI cost at 80% of daily budget"

  critical:
    threshold: 95%
    action: notify_pagerduty
    message: "AI cost critical - near budget limit"

  emergency:
    threshold: 100%
    action:
      - notify_pagerduty
      - enable_rate_limiting
      - fallback_to_cheaper_model
    message: "Budget exceeded - emergency measures activated"
```

### Rate Limiting por Budget

```typescript
class BudgetRateLimiter {
  private dailyBudget: number;
  private spent: number = 0;

  async checkBudget(estimatedCost: number): Promise<boolean> {
    if (this.spent + estimatedCost > this.dailyBudget) {
      // Opções:
      // 1. Rejeitar requisição
      // 2. Usar modelo mais barato
      // 3. Queue para depois

      if (this.spent > this.dailyBudget * 0.95) {
        return false; // Rejeitar
      }

      // Fallback para modelo mais barato
      return this.useFallbackModel();
    }

    return true;
  }
}
```

---

## Cloud vs On-Premise

### Critérios de Avaliação

| Fator | Cloud | On-Premise |
|-------|-------|------------|
| Custo Inicial | Baixo (pay-as-you-go) | Alto (hardware + setup) |
| Custo Operacional | Variável | Fixo |
| Escalabilidade | Fácil | Complexo |
| Manutenção | Gerenciada | Auto-gerenciada |
| Privacidade | Dados saem da empresa | Controle total |
| Latência | Variável | Controlável |
| Lock-in | Alto | Baixo |

### Quando usar Cloud

- [ ] Carga de trabalho variável
- [ ] Necessidade de escala rápida
- [ ] Time pequeno de infraestrutura
- [ ] Velocidade de mercado é prioridade
- [ ] Investimento inicial limitado

### Quando usar On-Premise

- [ ] Privacidade de dados crítica
- [ ] Carga previsível e alta (>1M req/dia)
- [ ] Requisitos de latência < 100ms
- [ ] Requisitos regulatórios específicos
- [ ] Time de ML/Infra experiente

### Modelo Híbrido

```
┌─────────────────────────────────────────────────┐
│                   HÍBRIDO                        │
├─────────────────────────────────────────────────┤
│  On-Premise                                     │
│  ├── Dados sensíveis (PII, financeiro)          │
│  ├── Modelos fine-tuned proprietários           │
│  └── Cache e pré-processamento                  │
├─────────────────────────────────────────────────┤
│  Cloud                                          │
│  ├── Modelos foundation (Claude API)            │
│  ├── Picos de demanda                           │
│  └── Experimentos e desenvolvimento             │
└─────────────────────────────────────────────────┘
```

---

## Relatórios

### Daily Report

```markdown
# Daily Cost Report - [Date]

## Summary
- Total Cost: $XX.XX
- vs Budget: +/-XX%
- vs Yesterday: +/-XX%

## By Model
| Model | Requests | Tokens | Cost | % Total |
|-------|----------|--------|------|---------|
| Haiku | XXX | XXX | $X.XX | XX% |
| Sonnet | XXX | XXX | $X.XX | XX% |

## By Feature
| Feature | Requests | Cost | Avg Cost |
|---------|----------|------|----------|
| Chat | XXX | $X.XX | $0.XXX |

## Anomalies
- [Any anomalies detected]

## Recommendations
- [Cost optimization suggestions]
```

### Monthly Review

```markdown
# Monthly Cost Review - [Month]

## Executive Summary
- Total Spend: $X,XXX
- Budget: $X,XXX
- Variance: +/-XX%

## Trends
[Cost trend analysis]

## Top Cost Drivers
1. [Feature 1]: $XXX (XX%)
2. [Feature 2]: $XXX (XX%)

## Optimization Actions Taken
- [Action 1]: Saved $XXX
- [Action 2]: Saved $XXX

## Recommendations for Next Month
- [Recommendation 1]
- [Recommendation 2]
```

---

## Checklist de Implementação

### Fase 1: Fundação
- [ ] Implementar tracking de tokens
- [ ] Configurar métricas básicas
- [ ] Definir budget inicial
- [ ] Criar alertas básicos

### Fase 2: Otimização
- [ ] Implementar seleção de modelo
- [ ] Implementar caching
- [ ] Otimizar prompts
- [ ] Configurar batching

### Fase 3: Governança
- [ ] Definir budget por time/feature
- [ ] Implementar chargebacks
- [ ] Criar dashboards executivos
- [ ] Estabelecer revisões mensais
