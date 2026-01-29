# AI Agent Architecture Patterns

Catálogo de padrões de arquitetura para agentes de IA.

---

## 1. Padrão Centralizado/Supervisor

### Descrição
Um agente supervisor coordena múltiplos agentes workers, delegando tarefas e agregando resultados.

### Arquitetura
```
                    ┌────────────────┐
                    │   Supervisor   │
                    │     Agent      │
                    └───────┬────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
   ┌────────────┐    ┌────────────┐    ┌────────────┐
   │  Worker A  │    │  Worker B  │    │  Worker C  │
   │ (Research) │    │ (Analysis) │    │ (Writing)  │
   └────────────┘    └────────────┘    └────────────┘
```

### Quando Usar
- Tarefas complexas requerendo múltiplas capacidades
- Necessidade de controle centralizado e monitoramento
- Resultados precisam ser agregados
- Workflow com etapas definidas

### Implementação
```typescript
class SupervisorAgent {
  private workers: Map<string, WorkerAgent>;

  async execute(task: Task): Promise<Result> {
    // 1. Planejar
    const plan = await this.plan(task);

    // 2. Delegar para workers
    const assignments = this.assignToWorkers(plan);

    // 3. Executar (paralelo ou sequencial)
    const results = await Promise.all(
      assignments.map(a => this.workers.get(a.worker)!.execute(a.subtask))
    );

    // 4. Agregar resultados
    return this.aggregate(results);
  }

  private async plan(task: Task): Promise<Plan> {
    // Usar LLM para decompor tarefa
  }

  private aggregate(results: Result[]): Result {
    // Combinar resultados dos workers
  }
}
```

### Prós e Contras
| Prós | Contras |
|------|---------|
| Controle centralizado | Single point of failure |
| Fácil de monitorar | Supervisor pode ser gargalo |
| Coordenação clara | Maior latência |

---

## 2. Padrão Sequencial (Pipeline)

### Descrição
Agentes processam tarefas em uma cadeia linear, cada um construindo sobre o output do anterior.

### Arquitetura
```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Agent 1 │───▶│ Agent 2 │───▶│ Agent 3 │───▶│ Agent 4 │
│ (Input) │    │(Process)│    │(Refine) │    │(Output) │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

### Quando Usar
- Pipelines de processamento de dados
- Cada estágio transforma dados
- Ordem importa
- Refinamento iterativo

### Implementação
```typescript
class SequentialPipeline {
  private stages: Agent[];

  async execute(input: any): Promise<any> {
    let result = input;

    for (const stage of this.stages) {
      result = await stage.process(result);

      // Verificar se deve continuar
      if (this.shouldStop(result)) {
        break;
      }
    }

    return result;
  }
}

// Exemplo de uso
const pipeline = new SequentialPipeline([
  new DataCleanerAgent(),
  new AnalyzerAgent(),
  new SummarizerAgent(),
  new FormatterAgent()
]);
```

### Prós e Contras
| Prós | Contras |
|------|---------|
| Simples de entender | Latência acumulada |
| Fácil de debugar | Não paralelizável |
| Determinístico | Um estágio bloqueia todos |

---

## 3. Padrão Concorrente (Paralelo)

### Descrição
Múltiplos agentes processam tarefas simultaneamente, com resultados combinados ao final.

### Arquitetura
```
                    ┌────────────────┐
                    │    Splitter    │
                    └───────┬────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
   ┌────────────┐    ┌────────────┐    ┌────────────┐
   │  Agent A   │    │  Agent B   │    │  Agent C   │
   └──────┬─────┘    └──────┬─────┘    └──────┬─────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                    ┌───────▼────────┐
                    │    Merger      │
                    └────────────────┘
```

### Quando Usar
- Subtarefas independentes
- Otimização de latência necessária
- Cargas de trabalho paralelizáveis
- Múltiplas perspectivas sobre mesmo input

### Implementação
```typescript
class ConcurrentExecutor {
  private agents: Agent[];

  async execute(input: any): Promise<any[]> {
    // Dividir input (se necessário)
    const tasks = this.split(input);

    // Executar em paralelo
    const results = await Promise.all(
      tasks.map((task, i) => this.agents[i].execute(task))
    );

    // Combinar resultados
    return this.merge(results);
  }

  // Com timeout
  async executeWithTimeout(input: any, timeoutMs: number): Promise<any[]> {
    const results = await Promise.race([
      this.execute(input),
      this.timeout(timeoutMs)
    ]);

    return results;
  }
}
```

### Prós e Contras
| Prós | Contras |
|------|---------|
| Menor latência total | Maior custo (paralelo) |
| Escalável | Mais complexo |
| Resiliente a falhas | Coordenação de merge |

---

## 4. Padrão Handoff (Delegação)

### Descrição
Agentes transferem controle para especialistas baseado nos requisitos da tarefa.

### Arquitetura
```
┌─────────────┐
│   Router    │
│   Agent     │
└──────┬──────┘
       │
       ├──── Customer Support ────▶ Support Agent
       │
       ├──── Technical Issue ─────▶ Tech Agent
       │
       └──── Billing Question ────▶ Billing Agent
```

### Quando Usar
- Domínios especializados
- Cenários de escalação
- Decisões de roteamento
- Diferentes níveis de serviço

### Implementação
```typescript
class HandoffRouter {
  private specialists: Map<string, Agent>;
  private classifier: Classifier;

  async route(request: Request): Promise<Response> {
    // 1. Classificar a requisição
    const classification = await this.classifier.classify(request);

    // 2. Selecionar especialista
    const specialist = this.specialists.get(classification.domain);

    if (!specialist) {
      return this.handleUnknown(request);
    }

    // 3. Transferir contexto e executar
    return specialist.handle(request, {
      context: classification.extractedContext,
      priority: classification.priority
    });
  }
}

// Classificador
class Classifier {
  async classify(request: Request): Promise<Classification> {
    // Usar LLM para classificar domínio
    const response = await llm.complete({
      prompt: `Classifique a seguinte requisição em uma das categorias:
        - customer_support
        - technical
        - billing

        Requisição: ${request.message}`
    });

    return parseClassification(response);
  }
}
```

### Prós e Contras
| Prós | Contras |
|------|---------|
| Especialização | Classificação pode errar |
| Escalável | Latência de roteamento |
| Manutenção isolada | Handoff pode perder contexto |

---

## 5. Padrão Descentralizado (Rede)

### Descrição
Agentes colaboram peer-to-peer sem coordenação central.

### Arquitetura
```
     ┌─────────────┐
     │   Agent A   │◀────────┐
     └──────┬──────┘         │
            │                │
            ▼                │
     ┌─────────────┐         │
     │   Agent B   │◀────────┤
     └──────┬──────┘         │
            │                │
            ▼                │
     ┌─────────────┐         │
     │   Agent C   │─────────┘
     └─────────────┘
```

### Quando Usar
- Negociações complexas
- Sem fonte única de verdade
- Resolução colaborativa de problemas
- Sistemas auto-organizáveis

### Implementação
```typescript
class DecentralizedNetwork {
  private agents: Agent[];
  private messageQueue: MessageQueue;

  async collaborate(problem: Problem): Promise<Solution> {
    // Iniciar discussão
    await this.broadcast({
      type: 'problem',
      content: problem
    });

    // Coletar propostas
    const proposals = await this.collectProposals();

    // Processo de consenso
    const solution = await this.reachConsensus(proposals);

    return solution;
  }

  private async reachConsensus(proposals: Proposal[]): Promise<Solution> {
    // Algoritmo de votação ou consenso
    let currentBest = proposals[0];

    for (const proposal of proposals.slice(1)) {
      const votes = await this.voteOnProposal(proposal, currentBest);

      if (votes.proposal > votes.currentBest) {
        currentBest = proposal;
      }
    }

    return currentBest.solution;
  }
}
```

### Prós e Contras
| Prós | Contras |
|------|---------|
| Altamente resiliente | Muito complexo |
| Sem ponto único de falha | Difícil de debugar |
| Adaptável | Consenso pode demorar |

---

## Padrões Compostos

### Supervisor + Sequential
```
Supervisor → [Pipeline A] → Aggregator
          → [Pipeline B] →
```
Útil para: Processamento de múltiplos documentos

### Concurrent + Handoff
```
Classifier → Agent A (parallel)
          → Agent B (parallel) → Specialist
          → Agent C (parallel)
```
Útil para: Análise multi-aspecto com escalação

---

## Guia de Seleção Rápida

| Cenário | Padrão Recomendado |
|---------|-------------------|
| Atendimento ao cliente | Handoff |
| Análise de dados | Sequential |
| Pesquisa web | Concurrent |
| Orquestração de tarefas | Supervisor |
| Debate/Brainstorm | Decentralized |
| Code review | Supervisor + Concurrent |
| Pipeline de conteúdo | Sequential |

---

## Checklist de Implementação

### Para qualquer padrão multi-agent:
- [ ] Definir protocolo de comunicação
- [ ] Implementar tratamento de erros
- [ ] Configurar timeouts
- [ ] Implementar fallbacks
- [ ] Adicionar logging/tracing
- [ ] Definir métricas de monitoramento
- [ ] Testar cenários de falha
- [ ] Documentar decisões de arquitetura (ADR)
