# Multi-Agent Coordination

Convenções e protocolos para coordenação de múltiplos agentes neste projeto.

## Agent Registry

### architect
- **Role**: Especialista em arquitetura
- **Capabilities**: Decisões de design, seleção de padrões, análise de escalabilidade
- **Trigger**: Tarefas relacionadas a arquitetura, design de sistema, ADRs
- **Configuration**: `.claude/agents/architect.md`
- **Model Preference**: Sonnet (análise detalhada) ou Opus (decisões complexas)

### product-owner
- **Role**: Especialista em requisitos de produto
- **Capabilities**: Revisão de PRD, criação de user stories, acceptance criteria
- **Trigger**: Tarefas relacionadas a produto, requisitos, especificações
- **Configuration**: `.claude/agents/product-owner.md`
- **Model Preference**: Sonnet

### qa-engineer
- **Role**: Especialista em qualidade
- **Capabilities**: Estratégia de testes, design de avaliação, análise de bugs
- **Trigger**: Tarefas relacionadas a testes, qualidade, avaliação
- **Configuration**: `.claude/agents/qa-engineer.md`
- **Model Preference**: Sonnet

### cost-analyst
- **Role**: Especialista em FinOps
- **Capabilities**: Estimativa de custos, otimização, análise de ROI
- **Trigger**: Tarefas relacionadas a custos, orçamento, otimização
- **Configuration**: `.claude/agents/cost-analyst.md`
- **Model Preference**: Haiku (análises simples) ou Sonnet (otimizações complexas)

### devops
- **Role**: Especialista em MLOps
- **Capabilities**: Deploy, monitoramento, CI/CD, infraestrutura
- **Trigger**: Tarefas relacionadas a deploy, infra, pipelines
- **Configuration**: `.claude/agents/devops.md`
- **Model Preference**: Sonnet

## Coordination Protocol

### Task Routing
1. Tarefas são roteadas baseadas em keywords do domínio
2. Agentes podem solicitar handoff para especialistas
3. Agente supervisor (main) coordena tarefas multi-agente

### Communication Format
```json
{
  "from": "main",
  "to": "architect",
  "task": "Avaliar arquitetura single vs multi-agent",
  "context": {
    "project": "nome-do-projeto",
    "requirements": ["req1", "req2"],
    "constraints": ["constraint1"]
  },
  "priority": "high",
  "deadline": "2024-01-15"
}
```

### Handoff Rules

#### When to Handoff
- Tarefa requer expertise específica
- Contexto atual não tem informação suficiente
- Decisão impacta outras áreas do projeto

#### Handoff Protocol
1. Agente atual documenta contexto e progresso
2. Identifica agente alvo baseado em expertise
3. Transfere tarefa com todo contexto relevante
4. Agente alvo confirma recebimento
5. Agente original fica disponível para suporte

### Parallel Execution
Para tarefas que podem ser paralelizadas:

```
┌─────────────────────────────────────────────┐
│              Supervisor (main)               │
└─────────────────────┬───────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │architect│   │qa-engineer│  │cost-analyst│
   └────┬────┘   └────┬─────┘   └─────┬──────┘
        │             │               │
        └─────────────┼───────────────┘
                      ▼
              ┌───────────────┐
              │   Aggregator  │
              └───────────────┘
```

## Conflict Resolution

### Priority Matrix
| Conflict Type | Resolution |
|--------------|------------|
| Architecture vs Cost | Architect decides with cost constraints |
| Quality vs Speed | QA Engineer + Product Owner decide |
| Security vs Usability | Security wins, find alternatives |

### Escalation Path
1. Agentes tentam resolver entre si
2. Escalar para supervisor (main)
3. Documentar decisão em ADR

## Agent Invocation

### Explicit Invocation
```
"Peça ao architect para revisar este design"
"Consulte o cost-analyst sobre otimização"
```

### Implicit Routing
Sistema roteia automaticamente baseado em:
- Keywords na tarefa
- Tipo de arquivo sendo modificado
- Histórico de contexto

## Best Practices

### Para novos agentes
1. Definir role claramente em uma frase
2. Listar capabilities específicas
3. Documentar triggers de ativação
4. Especificar modelo preferido

### Para coordenação
1. Manter contexto compartilhado mínimo
2. Documentar todas as decisões importantes
3. Usar formato padrão de comunicação
4. Evitar loops de handoff

### Para eficiência
1. Preferir execução paralela quando possível
2. Usar modelo menor para tarefas simples
3. Cachear resultados de análises repetitivas
4. Limitar profundidade de delegação (max 3 níveis)
