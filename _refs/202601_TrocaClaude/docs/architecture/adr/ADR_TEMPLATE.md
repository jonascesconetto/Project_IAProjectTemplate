# ADR-[NÚMERO]: [TÍTULO]

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Data
[YYYY-MM-DD]

## Contexto

[Descrever o contexto e a declaração do problema. Qual é a questão que requer uma decisão?]

### Problema
[Descrição clara do problema]

### Restrições
- [Restrição 1]
- [Restrição 2]

### Requisitos
- [Requisito 1]
- [Requisito 2]

## Decisão

[Descrever a decisão que foi tomada e por quê]

### Solução Escolhida
[Descrição da solução]

### Justificativa
[Por que esta solução foi escolhida]

## Consequências

### Positivas
- [Consequência positiva 1]
- [Consequência positiva 2]

### Negativas
- [Consequência negativa 1]
- [Consequência negativa 2]

### Neutras
- [Consequência neutra 1]

## Alternativas Consideradas

### Alternativa 1: [Nome]
- **Descrição**: [Descrição da alternativa]
- **Prós**: [Lista de prós]
- **Contras**: [Lista de contras]
- **Por que rejeitada**: [Razão]

### Alternativa 2: [Nome]
- **Descrição**: [Descrição da alternativa]
- **Prós**: [Lista de prós]
- **Contras**: [Lista de contras]
- **Por que rejeitada**: [Razão]

## Notas de Implementação

[Quaisquer notas sobre como implementar esta decisão]

### Tarefas
- [ ] [Tarefa 1]
- [ ] [Tarefa 2]

### Riscos de Implementação
- [Risco 1]: [Mitigação]
- [Risco 2]: [Mitigação]

## Referências

- [Link para documentação relevante]
- [Link para ADRs relacionadas]
- [Link para discussões/issues]

---

## Metadados

| Campo | Valor |
|-------|-------|
| Data da Decisão | [YYYY-MM-DD] |
| Decisores | [Nomes] |
| Data de Revisão | [YYYY-MM-DD] |
| Tags | [tag1, tag2] |

---

## Histórico de Revisões

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0 | [YYYY-MM-DD] | [Nome] | Versão inicial |

---

# Exemplo Preenchido

## ADR-001: Arquitetura de Agente para Atendimento ao Cliente

### Status
Accepted

### Data
2024-01-15

### Contexto

#### Problema
Precisamos implementar um agente de IA para atendimento ao cliente que possa responder perguntas sobre produtos, processar reclamações e escalar para humanos quando necessário.

#### Restrições
- Latência máxima de 3 segundos
- Budget de $0.05 por interação
- Deve integrar com CRM existente

#### Requisitos
- Responder FAQs com 95% de precisão
- Processar reclamações com coleta de dados estruturados
- Escalar automaticamente casos complexos

### Decisão

#### Solução Escolhida
Arquitetura **multi-agent com padrão Handoff**:
- Router Agent: Classifica intenção e roteia
- FAQ Agent: Responde perguntas frequentes
- Complaint Agent: Processa reclamações
- Escalation Agent: Prepara handoff para humanos

#### Justificativa
O padrão Handoff permite especialização por domínio, mantendo latência aceitável através de roteamento eficiente.

### Consequências

#### Positivas
- Especialização permite maior precisão
- Escalável para novos domínios
- Manutenção isolada por agente

#### Negativas
- Latência adicional de classificação (~500ms)
- Complexidade de coordenação

#### Neutras
- Requer treinamento de classificador

### Alternativas Consideradas

#### Alternativa 1: Single Agent com Tools
- **Prós**: Menor latência, mais simples
- **Contras**: Menor precisão, contexto limitado
- **Por que rejeitada**: Não atinge 95% de precisão em testes

#### Alternativa 2: Pipeline Sequencial
- **Prós**: Simples de implementar
- **Contras**: Latência alta, não paralelizável
- **Por que rejeitada**: Excede limite de 3s em casos complexos

### Notas de Implementação

#### Tarefas
- [ ] Implementar Router Agent
- [ ] Implementar FAQ Agent com RAG
- [ ] Implementar Complaint Agent
- [ ] Implementar Escalation Agent
- [ ] Integrar com CRM

### Referências
- docs/architecture/PATTERNS.md
- docs/product/PRD_ATENDIMENTO.md
