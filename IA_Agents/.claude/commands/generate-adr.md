# /generate-adr

Gerar um Architecture Decision Record (ADR).

## Usage
```
/generate-adr [título]
```

## Arguments
- `$ARGUMENTS` - Título ou descrição da decisão arquitetural

## Instructions

1. **Coletar informações sobre a decisão**:
   - Qual é o problema ou questão?
   - Quais são as restrições?
   - Quais são os requisitos?

2. **Identificar alternativas**:
   - Listar 2-3 alternativas viáveis
   - Documentar prós e contras de cada uma

3. **Determinar próximo número de ADR**:
   - Verificar arquivos em `docs/architecture/adr/`
   - Usar próximo número sequencial

4. **Gerar o ADR** usando o template

5. **Salvar o arquivo** em `docs/architecture/adr/`

## Template

```markdown
# ADR-[XXX]: [Título]

## Status
Proposed

## Data
[YYYY-MM-DD]

## Contexto

### Problema
[Descrição clara do problema ou questão]

### Restrições
- [Restrição 1]
- [Restrição 2]

### Requisitos
- [Requisito 1]
- [Requisito 2]

## Decisão

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
- **Descrição**: [Descrição]
- **Prós**: [Lista]
- **Contras**: [Lista]
- **Por que rejeitada**: [Razão]

### Alternativa 2: [Nome]
- **Descrição**: [Descrição]
- **Prós**: [Lista]
- **Contras**: [Lista]
- **Por que rejeitada**: [Razão]

## Notas de Implementação

### Tarefas
- [ ] [Tarefa 1]
- [ ] [Tarefa 2]

## Referências
- [Link para documentação relevante]

---

| Campo | Valor |
|-------|-------|
| Data da Decisão | [YYYY-MM-DD] |
| Decisores | [Nomes] |
| Tags | [tags] |
```

## Output

Após gerar o ADR:
1. Salvar em `docs/architecture/adr/XXX-[slug-do-titulo].md`
2. Confirmar localização do arquivo
3. Sugerir próximos passos (revisão, aprovação)

## Reference Files
- docs/architecture/adr/ADR_TEMPLATE.md
- docs/architecture/DECISION_FRAMEWORK.md
- docs/architecture/PATTERNS.md
