# Testing Strategy

Estratégia de testes para agentes de IA.

## Pirâmide de Testes para IA

```
                    ┌─────────────┐
                    │   E2E/UAT   │  ← Menos testes, mais caros
                    ├─────────────┤
                    │ Integration │
                    ├─────────────┤
                    │  Evaluation │  ← Específico para IA
                    ├─────────────┤
                    │    Unit     │  ← Mais testes, mais baratos
                    └─────────────┘
```

---

## Níveis de Teste

### 1. Testes Unitários

**Objetivo**: Testar componentes isolados (funções, classes, prompts individuais)

**Cobertura target**: > 80%

```typescript
// tests/unit/prompt-builder.test.ts
describe('PromptBuilder', () => {
  describe('buildSystemPrompt', () => {
    it('should include identity section', () => {
      const prompt = buildSystemPrompt({ role: 'assistant' });
      expect(prompt).toContain('Você é um assistente');
    });

    it('should respect token limit', () => {
      const prompt = buildSystemPrompt({ maxTokens: 500 });
      expect(countTokens(prompt)).toBeLessThan(500);
    });
  });

  describe('formatUserContext', () => {
    it('should handle missing fields gracefully', () => {
      const context = formatUserContext({ name: 'João' });
      expect(context).not.toContain('undefined');
    });
  });
});
```

### 2. Testes de Integração

**Objetivo**: Testar integração entre componentes (APIs, databases, serviços)

```typescript
// tests/integration/agent-api.test.ts
describe('Agent API Integration', () => {
  it('should process request end-to-end', async () => {
    const response = await agent.process({
      message: 'Olá, como posso criar uma conta?',
      userId: 'test-user-123'
    });

    expect(response.status).toBe('success');
    expect(response.message).toBeDefined();
    expect(response.latencyMs).toBeLessThan(3000);
  });

  it('should handle API errors gracefully', async () => {
    // Simular falha de API externa
    mockExternalApi.mockRejectedValue(new Error('Service unavailable'));

    const response = await agent.process({
      message: 'Consultar status do pedido #123'
    });

    expect(response.status).toBe('error');
    expect(response.message).toContain('tente novamente');
  });
});
```

### 3. Testes de Avaliação (AI-Specific)

**Objetivo**: Avaliar qualidade das respostas do agente

#### 3.1 Accuracy Tests
```typescript
// tests/evaluation/accuracy.test.ts
describe('Accuracy Evaluation', () => {
  const testCases = loadTestCases('fixtures/accuracy-tests.json');

  testCases.forEach(({ id, input, expectedOutput, tolerance }) => {
    it(`should handle case ${id} correctly`, async () => {
      const response = await agent.process({ message: input });

      const similarity = calculateSimilarity(response.message, expectedOutput);
      expect(similarity).toBeGreaterThan(tolerance || 0.85);
    });
  });
});
```

#### 3.2 Latency Tests
```typescript
// tests/evaluation/latency.test.ts
describe('Latency Evaluation', () => {
  const samples = 100;
  const latencies: number[] = [];

  beforeAll(async () => {
    for (let i = 0; i < samples; i++) {
      const start = Date.now();
      await agent.process({ message: getRandomPrompt() });
      latencies.push(Date.now() - start);
    }
  });

  it('should have P50 latency < 1s', () => {
    expect(percentile(latencies, 50)).toBeLessThan(1000);
  });

  it('should have P95 latency < 3s', () => {
    expect(percentile(latencies, 95)).toBeLessThan(3000);
  });

  it('should have P99 latency < 5s', () => {
    expect(percentile(latencies, 99)).toBeLessThan(5000);
  });
});
```

#### 3.3 Safety Tests
```typescript
// tests/evaluation/safety.test.ts
describe('Safety Evaluation', () => {
  const adversarialPrompts = loadTestCases('fixtures/adversarial.json');

  adversarialPrompts.forEach(({ id, prompt, shouldRefuse }) => {
    it(`should handle adversarial case ${id}`, async () => {
      const response = await agent.process({ message: prompt });

      if (shouldRefuse) {
        expect(response.refused).toBe(true);
        expect(response.message).not.toContain(/* harmful content */);
      }

      // Verificar que não vazou informações do sistema
      expect(response.message).not.toMatch(/system prompt|instruções/i);
    });
  });
});
```

### 4. Testes E2E / UAT

**Objetivo**: Validar fluxos completos do usuário

```typescript
// tests/e2e/user-journey.test.ts
describe('User Journey: Suporte ao Cliente', () => {
  let session: Session;

  beforeEach(() => {
    session = createSession();
  });

  it('should complete support flow', async () => {
    // Passo 1: Saudação
    let response = await session.send('Olá');
    expect(response).toContain('Olá');

    // Passo 2: Pergunta sobre produto
    response = await session.send('Qual o preço do plano premium?');
    expect(response).toMatch(/R\$|preço|valor/i);

    // Passo 3: Pergunta de follow-up
    response = await session.send('E tem desconto anual?');
    expect(response).toMatch(/desconto|anual/i);

    // Passo 4: Encerramento
    response = await session.send('Obrigado, era só isso');
    expect(response).toMatch(/ajudar|disponível/i);
  });
});
```

---

## Tipos de Avaliação

### 1. Avaliação Automatizada

| Tipo | Método | Frequência |
|------|--------|------------|
| Accuracy | Comparação com golden answers | Diária |
| Latency | Medição de tempo de resposta | Contínua |
| Safety | Testes adversariais | A cada deploy |
| Regression | Comparação com baseline | A cada PR |

### 2. Avaliação por LLM (LLM-as-Judge)

```typescript
async function llmEvaluate(
  prompt: string,
  response: string,
  criteria: EvaluationCriteria
): Promise<EvaluationResult> {
  const evaluation = await llm.complete({
    model: 'claude-3-5-sonnet',
    prompt: `
      Avalie a seguinte resposta de acordo com os critérios:

      PERGUNTA: ${prompt}
      RESPOSTA: ${response}

      CRITÉRIOS:
      ${criteria.map(c => `- ${c.name}: ${c.description}`).join('\n')}

      Para cada critério, dê uma nota de 1-5 e justificativa.
      Retorne em formato JSON.
    `
  });

  return JSON.parse(evaluation);
}
```

### 3. Avaliação Humana

**Processo**:
1. Selecionar amostra aleatória (n=100+)
2. Distribuir para avaliadores (2+ por amostra)
3. Avaliar com rubrica padronizada
4. Calcular inter-rater agreement
5. Agregar resultados

**Rubrica de Avaliação**:
| Critério | 1 (Ruim) | 3 (OK) | 5 (Excelente) |
|----------|----------|--------|---------------|
| Relevância | Fora do tópico | Parcialmente relevante | Totalmente relevante |
| Precisão | Incorreto | Parcialmente correto | Totalmente correto |
| Completude | Incompleto | Adequado | Completo e detalhado |
| Tom | Inadequado | Aceitável | Perfeito para o contexto |

---

## Fixtures e Test Data

### Estrutura de Fixtures

```
tests/fixtures/
├── accuracy-tests.json      # Testes de precisão
├── adversarial.json         # Prompts adversariais
├── edge-cases.json          # Casos de borda
├── golden-answers.json      # Respostas de referência
└── user-journeys.json       # Fluxos de usuário
```

### Formato de Test Case

```json
{
  "id": "ACC-001",
  "category": "product_info",
  "input": "Qual o preço do plano básico?",
  "expectedOutput": "O plano básico custa R$ 29,90 por mês.",
  "tolerance": 0.85,
  "tags": ["pricing", "happy_path"]
}
```

---

## CI/CD Integration

### Pipeline de Testes

```yaml
# .github/workflows/test.yml
name: Test Pipeline

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:unit
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration

  evaluation-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:eval
      - name: Check thresholds
        run: |
          if [ $(cat results/accuracy.txt) -lt 95 ]; then
            echo "Accuracy below threshold"
            exit 1
          fi
```

### Quality Gates

| Gate | Threshold | Blocking |
|------|-----------|----------|
| Unit test coverage | > 80% | Sim |
| Integration tests | 100% passing | Sim |
| Accuracy | > 95% | Sim |
| Safety tests | 100% passing | Sim |
| Latency P95 | < 3s | Warning |

---

## Regression Testing

### Baseline Management

```typescript
// Salvar baseline
async function saveBaseline(version: string): Promise<void> {
  const results = await runEvaluationSuite();
  await fs.writeFile(
    `baselines/${version}.json`,
    JSON.stringify(results, null, 2)
  );
}

// Comparar com baseline
async function compareWithBaseline(baselineVersion: string): Promise<RegressionReport> {
  const baseline = await loadBaseline(baselineVersion);
  const current = await runEvaluationSuite();

  const regressions = findRegressions(baseline, current);

  return {
    baselineVersion,
    currentVersion: getCurrentVersion(),
    regressions,
    improvements: findImprovements(baseline, current),
    unchanged: findUnchanged(baseline, current)
  };
}
```

### Regression Report

```markdown
# Regression Report

## Summary
- Baseline: v1.2.3
- Current: v1.3.0
- Status: ⚠️ 2 regressions found

## Regressions
| Test ID | Baseline | Current | Delta |
|---------|----------|---------|-------|
| ACC-042 | 0.95 | 0.88 | -7% |
| LAT-015 | 1200ms | 1800ms | +50% |

## Improvements
| Test ID | Baseline | Current | Delta |
|---------|----------|---------|-------|
| ACC-003 | 0.85 | 0.92 | +7% |

## Recommendation
Review and fix regressions before merge.
```

---

## Checklist de Testes

### Antes de Cada PR
- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Sem regressions vs. baseline
- [ ] Coverage mantida ou melhorada

### Antes de Cada Release
- [ ] Suíte de avaliação completa executada
- [ ] Safety tests 100% passando
- [ ] UAT aprovado
- [ ] Performance benchmarks dentro do target
- [ ] Novo baseline salvo
