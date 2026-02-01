# Padrão Plan-and-Execute

Padrão de arquitetura para otimização de custos em agentes de IA.

## Visão Geral

O padrão Plan-and-Execute separa o planejamento da execução, usando modelos menores para planejamento e modelos maiores apenas quando necessário. Isso pode resultar em **redução de até 90% nos custos**.

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    User Request                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              PLANNER (Modelo Pequeno)                    │
│  - Analisa a requisição                                 │
│  - Divide em subtarefas                                 │
│  - Estima complexidade                                  │
│  - Seleciona executor apropriado                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   TASK QUEUE                             │
│  1. Tarefa simples → Modelo pequeno                     │
│  2. Tarefa complexa → Modelo grande                     │
│  3. Uso de tools → Agente especializado                 │
└─────────────────────────────────────────────────────────┘
                           │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Modelo    │   │   Modelo    │   │   Agente    │
│   Pequeno   │   │   Grande    │   │ Especializado│
│   (Haiku)   │   │   (Opus)    │   │  (Tools)    │
└─────────────┘   └─────────────┘   └─────────────┘
          │               │               │
          └───────────────┼───────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│              AGGREGATOR (Modelo Pequeno)                 │
│  - Combina resultados                                   │
│  - Valida completude                                    │
│  - Formata resposta                                     │
└─────────────────────────────────────────────────────────┘
```

---

## Componentes

### 1. Planner (Planejador)

**Função**: Analisar a requisição e criar um plano de execução.

**Modelo recomendado**: Haiku (menor custo)

```typescript
interface PlannerConfig {
  model: 'claude-3-haiku';
  maxTokens: 500;
  systemPrompt: `
    Você é um planejador de tarefas.
    Analise a requisição e retorne um plano JSON com:
    1. Lista de subtarefas
    2. Classificação de complexidade de cada uma
    3. Modelo recomendado para cada uma
  `;
}

interface Plan {
  tasks: Task[];
  estimatedCost: number;
  estimatedLatency: number;
}

interface Task {
  id: string;
  description: string;
  complexity: 'simple' | 'moderate' | 'complex';
  recommendedModel: 'haiku' | 'sonnet' | 'opus';
  requiresTools: boolean;
  dependencies: string[];
}
```

### 2. Classificador de Complexidade

**Critérios de classificação**:

| Complexidade | Critérios | Modelo |
|--------------|-----------|--------|
| Simple | Resposta factual, lookup, formatação | Haiku |
| Moderate | Análise, síntese, comparação | Sonnet |
| Complex | Raciocínio multi-step, criatividade, edge cases | Opus |

```typescript
function classifyComplexity(task: string): 'simple' | 'moderate' | 'complex' {
  const simplePatterns = [
    /what is/i,
    /define/i,
    /list/i,
    /format/i,
    /convert/i
  ];

  const complexPatterns = [
    /analyze and recommend/i,
    /compare and contrast.*multiple/i,
    /design.*architecture/i,
    /debug.*complex/i
  ];

  if (simplePatterns.some(p => p.test(task))) return 'simple';
  if (complexPatterns.some(p => p.test(task))) return 'complex';
  return 'moderate';
}
```

### 3. Executor Pool

**Pool de executores com diferentes capacidades**:

```typescript
const executorPool = {
  simple: {
    model: 'claude-3-haiku',
    maxTokens: 1000,
    temperature: 0.3
  },
  moderate: {
    model: 'claude-3-5-sonnet',
    maxTokens: 2000,
    temperature: 0.5
  },
  complex: {
    model: 'claude-opus-4',
    maxTokens: 4000,
    temperature: 0.7
  },
  tools: {
    model: 'claude-3-5-sonnet',
    maxTokens: 2000,
    tools: ['search', 'calculate', 'code_exec']
  }
};
```

### 4. Aggregator (Agregador)

**Função**: Combinar resultados das subtarefas em resposta coerente.

```typescript
interface AggregatorConfig {
  model: 'claude-3-haiku';
  maxTokens: 1000;
  systemPrompt: `
    Você recebe os resultados de múltiplas subtarefas.
    Combine-os em uma resposta coerente e completa.
    Mantenha a estrutura lógica e elimine redundâncias.
  `;
}
```

---

## Matriz de Seleção de Modelo

| Complexidade | Tools | Modelo | Custo Estimado |
|--------------|-------|--------|----------------|
| Simple | Não | Haiku | $0.0001 |
| Simple | Sim | Haiku + Tools | $0.001 |
| Moderate | Não | Sonnet | $0.003 |
| Moderate | Sim | Sonnet + Tools | $0.01 |
| Complex | Não | Opus | $0.03 |
| Complex | Sim | Opus + Tools | $0.10 |

---

## Análise de Custo

### Sem Plan-and-Execute
```
100 requisições × $0.03 (tudo com Opus) = $3.00
```

### Com Plan-and-Execute
```
100 requisições:
  - 70 simples (Haiku): 70 × $0.0001 = $0.007
  - 20 moderadas (Sonnet): 20 × $0.003 = $0.06
  - 10 complexas (Opus): 10 × $0.03 = $0.30
  - Overhead de planejamento: 100 × $0.0001 = $0.01
  - Overhead de agregação: 100 × $0.0001 = $0.01

Total: $0.387 (87% de redução)
```

---

## Implementação

### Exemplo Completo

```typescript
import Anthropic from '@anthropic-ai/sdk';

interface PlanAndExecuteConfig {
  planner: {
    model: string;
    maxTokens: number;
  };
  executors: Record<string, ExecutorConfig>;
  aggregator: {
    model: string;
    maxTokens: number;
  };
}

class PlanAndExecuteAgent {
  private client: Anthropic;
  private config: PlanAndExecuteConfig;

  constructor(config: PlanAndExecuteConfig) {
    this.client = new Anthropic();
    this.config = config;
  }

  async execute(request: string): Promise<string> {
    // 1. Planning
    const plan = await this.plan(request);

    // 2. Execute tasks (parallel when possible)
    const results = await this.executeTasks(plan.tasks);

    // 3. Aggregate results
    const response = await this.aggregate(request, results);

    return response;
  }

  private async plan(request: string): Promise<Plan> {
    const response = await this.client.messages.create({
      model: this.config.planner.model,
      max_tokens: this.config.planner.maxTokens,
      messages: [{
        role: 'user',
        content: `Analise e crie um plano para: ${request}`
      }]
    });

    return JSON.parse(response.content[0].text);
  }

  private async executeTasks(tasks: Task[]): Promise<TaskResult[]> {
    // Identificar tarefas sem dependências (podem rodar em paralelo)
    const independent = tasks.filter(t => t.dependencies.length === 0);
    const dependent = tasks.filter(t => t.dependencies.length > 0);

    // Executar independentes em paralelo
    const independentResults = await Promise.all(
      independent.map(task => this.executeTask(task))
    );

    // Executar dependentes sequencialmente
    const allResults = [...independentResults];
    for (const task of dependent) {
      const result = await this.executeTask(task, allResults);
      allResults.push(result);
    }

    return allResults;
  }

  private async executeTask(task: Task, context?: TaskResult[]): Promise<TaskResult> {
    const executor = this.config.executors[task.complexity];

    const response = await this.client.messages.create({
      model: executor.model,
      max_tokens: executor.maxTokens,
      messages: [{
        role: 'user',
        content: this.buildTaskPrompt(task, context)
      }]
    });

    return {
      taskId: task.id,
      result: response.content[0].text,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens
    };
  }

  private async aggregate(request: string, results: TaskResult[]): Promise<string> {
    const response = await this.client.messages.create({
      model: this.config.aggregator.model,
      max_tokens: this.config.aggregator.maxTokens,
      messages: [{
        role: 'user',
        content: `
          Requisição original: ${request}

          Resultados das subtarefas:
          ${results.map(r => `[${r.taskId}]: ${r.result}`).join('\n\n')}

          Combine em uma resposta coerente.
        `
      }]
    });

    return response.content[0].text;
  }
}
```

---

## Configuração Recomendada

```json
{
  "planAndExecute": {
    "enabled": true,
    "planner": {
      "model": "claude-3-haiku-20240307",
      "maxTokens": 500,
      "temperature": 0.3
    },
    "executors": {
      "simple": {
        "model": "claude-3-haiku-20240307",
        "maxTokens": 1000
      },
      "moderate": {
        "model": "claude-3-5-sonnet-20241022",
        "maxTokens": 2000
      },
      "complex": {
        "model": "claude-opus-4-20250514",
        "maxTokens": 4000
      }
    },
    "aggregator": {
      "model": "claude-3-haiku-20240307",
      "maxTokens": 1000
    },
    "fallback": {
      "enabled": true,
      "escalateOnQualityBelow": 0.8
    }
  }
}
```

---

## Best Practices

### Do's
- ✅ Cache resultados de planejamento para requisições similares
- ✅ Monitorar accuracy de classificação
- ✅ Implementar fallback para modelo maior se qualidade insuficiente
- ✅ Usar execução paralela quando possível
- ✅ Logar custos por componente para otimização

### Don'ts
- ❌ Usar para requisições triviais (overhead > benefício)
- ❌ Confiar cegamente na classificação do planner
- ❌ Ignorar métricas de qualidade em favor de custo
- ❌ Fazer planning síncrono quando poderia ser assíncrono

---

## Métricas a Monitorar

| Métrica | Descrição | Target |
|---------|-----------|--------|
| Classification Accuracy | % de tarefas corretamente classificadas | > 90% |
| Cost Savings | Redução comparada a modelo único | > 70% |
| Quality Retention | Qualidade vs. modelo único | > 95% |
| Latency Overhead | Tempo adicional do padrão | < 20% |
| Escalation Rate | % que precisa de modelo maior | < 15% |

---

## Quando Usar

### Ideal para
- Alto volume de requisições variadas
- Budget limitado
- Mix de tarefas simples e complexas
- Latência não é crítica (overhead aceitável)

### Não ideal para
- Volume baixo (overhead não compensa)
- Todas as tarefas são complexas
- Latência ultra-baixa necessária
- Tarefas muito interdependentes
