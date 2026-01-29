# Metodologia MAISTRO

**M**anage **A**I **I**terations with **S**tructured **T**esting and **R**eliable **O**utputs

Framework ágil adaptado para desenvolvimento de agentes de IA.

## Princípios Fundamentais

### 1. Iterative Refinement
- Iterações pequenas e mensuráveis
- Avaliação contínua de qualidade
- Loops de feedback rápidos
- Ajustes baseados em dados, não intuição

### 2. Evaluation-First Development
- Definir métricas antes de desenvolver
- Criar suíte de avaliação antes do código
- Toda mudança deve ser validada por métricas
- Regressions são bloqueadores de release

### 3. Human Oversight
- Human-in-the-loop para decisões críticas
- Auditorias regulares de safety
- Protocolos de escalação claros
- Review humano de edge cases

### 4. Cost Awareness
- Custo por inferência como KPI
- Otimização contínua de token usage
- Trade-off consciente entre qualidade e custo
- Budget definido por sprint

---

## Estrutura de Sprint (2 Semanas)

### Semana 1: Build

| Dia | Foco | Atividades |
|-----|------|------------|
| 1 | Planning | Sprint planning, revisão de PRD, definição de métricas |
| 2 | Development | Implementação de features/prompts |
| 3 | Development | Implementação de features/prompts |
| 4 | Testing | Testes unitários, integração inicial |
| 5 | Testing | Testes de integração, debug |

### Semana 2: Evaluate

| Dia | Foco | Atividades |
|-----|------|------------|
| 6 | Evaluation | Rodar suíte de avaliação completa |
| 7 | Analysis | Analisar resultados, identificar gaps |
| 8 | Refinement | Ajustes baseados em avaliação |
| 9 | Refinement | Bug fixes, otimizações |
| 10 | Demo | Demo, retrospective, documentação |

---

## Cerimônias

### 1. Sprint Planning (Dia 1, 2-4h)

**Participantes**: Product Owner, Tech Lead, Desenvolvedores

**Agenda**:
1. Revisão do PRD e acceptance criteria
2. Estimativa de complexidade (não tempo)
3. Definição de métricas de sucesso da sprint
4. Criação da suíte de avaliação
5. Commitment da sprint

**Artefatos**:
- [ ] Sprint backlog definido
- [ ] Métricas de sucesso documentadas
- [ ] Suíte de avaliação criada

### 2. Daily Standup (Diário, 15 min)

**Formato**:
```
1. O que completei ontem?
2. Resultados de avaliação (se aplicável)
3. O que vou fazer hoje?
4. Bloqueadores?
```

**Foco especial em**:
- Resultados de testes de avaliação
- Métricas de qualidade
- Custo acumulado

### 3. Evaluation Review (Dia 7, 2h)

**Participantes**: Time completo + Stakeholders

**Agenda**:
1. Apresentar resultados de avaliação
2. Comparar com baselines e targets
3. Identificar regressions
4. Decidir: ship, iterate, ou rollback

**Decisão Matrix**:
| Métricas | Decisão |
|----------|---------|
| Todos targets atingidos | Ship |
| Métricas críticas OK, menores falhando | Iterate |
| Métricas críticas falhando | Rollback/Major rework |

### 4. Sprint Retrospective (Dia 10, 1h)

**Formato**:
```
1. O que funcionou bem?
2. O que precisa melhorar?
3. Experimentos para próxima sprint
4. Action items
```

**Tópicos específicos de IA**:
- Qualidade dos prompts
- Eficiência de custo
- Cobertura de edge cases
- Processo de avaliação

---

## Artefatos por Sprint

### Obrigatórios

| Artefato | Responsável | Deadline |
|----------|-------------|----------|
| Sprint Backlog | Tech Lead | Dia 1 |
| Evaluation Suite | QA | Dia 2 |
| Evaluation Results | QA | Dia 7 |
| Cost Report | DevOps | Dia 10 |
| Sprint Summary | Product Owner | Dia 10 |

### Templates

#### Sprint Planning Template
```markdown
# Sprint [N] Planning

## Goals
1. [Goal 1]
2. [Goal 2]

## Success Metrics
| Metric | Baseline | Target |
|--------|----------|--------|

## Backlog Items
| ID | Description | Estimate | Owner |
|----|-------------|----------|-------|

## Evaluation Plan
- Test suite: [location]
- Baseline: [version]
- Evaluation date: [Day 7]

## Risks
- [Risk 1]: [Mitigation]
```

#### Evaluation Report Template
```markdown
# Sprint [N] Evaluation Report

## Summary
- Overall Score: [X/10]
- Ship Decision: [Yes/No/Iterate]

## Metrics
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|

## Regressions
- [List any regressions]

## Improvements
- [List improvements over baseline]

## Recommendations
- [Action items]
```

---

## Roles e Responsabilidades

### Product Owner (PO)
- Definir requisitos e acceptance criteria
- Priorizar backlog
- Aprovar releases
- Comunicar com stakeholders

### Tech Lead
- Decisões técnicas
- Arquitetura de prompts
- Code review
- Mentoria do time

### AI Engineer
- Implementação de agentes
- Prompt engineering
- Otimização de performance
- Debugging

### QA Engineer
- Criar suítes de avaliação
- Executar testes
- Reportar métricas
- Validar safety

### FinOps / Cost Analyst
- Monitorar custos
- Otimizar token usage
- Reportar custo por sprint
- Alertar sobre anomalias

---

## Métricas de Processo

### Velocity
- Story points completados por sprint
- Trend line de velocity
- Capacity planning

### Quality
- Bugs encontrados em produção
- Regressions por sprint
- Cobertura de testes

### Efficiency
- Custo por story point
- Tempo de cycle (idea → production)
- Rework rate

### Team Health
- Sprint commitment vs delivery
- Retrospective action items closed
- Team satisfaction score

---

## Escalonamento

### Quando Escalar
- Métricas críticas abaixo do target
- Safety concerns
- Custo excedendo budget
- Bloqueadores não resolvidos em 24h

### Escalation Path
```
1. Tech Lead (dentro de 2h)
2. Product Owner (dentro de 4h)
3. Engineering Manager (dentro de 24h)
4. CTO (crítico/urgente)
```

---

## Integração com CI/CD

### Pipeline de Avaliação
```yaml
# .github/workflows/evaluation.yml
name: AI Evaluation Pipeline

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Evaluation Suite
        run: npm run test:eval

      - name: Check Thresholds
        run: npm run evaluate:check

      - name: Generate Report
        run: npm run evaluate:report

      - name: Upload Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: evaluation-report
          path: reports/
```

### Gates de Qualidade
- [ ] Testes unitários passando (100%)
- [ ] Testes de integração passando (100%)
- [ ] Accuracy > 95%
- [ ] Safety tests passando (100%)
- [ ] Custo dentro do budget
- [ ] Code review aprovado

---

## Checklist de Adoção

### Fase 1: Fundação (Sprint 1-2)
- [ ] Definir métricas de sucesso
- [ ] Criar suíte de avaliação básica
- [ ] Estabelecer baseline
- [ ] Treinar time nas cerimônias

### Fase 2: Otimização (Sprint 3-4)
- [ ] Refinar processo baseado em feedback
- [ ] Automatizar avaliações
- [ ] Implementar dashboards
- [ ] Documentar learnings

### Fase 3: Maturidade (Sprint 5+)
- [ ] Processo estável e previsível
- [ ] Métricas consistentes
- [ ] Time autônomo
- [ ] Melhoria contínua estabelecida
