# /review-prd

Revisar um documento PRD (Product Requirements Document) para completude e considerações específicas de IA.

## Usage
```
/review-prd [caminho-para-prd]
```

## Arguments
- `$ARGUMENTS` - Caminho para o arquivo PRD a ser revisado

## Instructions

1. **Ler o arquivo PRD** especificado em $ARGUMENTS
   - Se nenhum caminho for fornecido, perguntar ao usuário

2. **Avaliar contra o checklist**:
   - [ ] Declaração clara do problema
   - [ ] Métricas de sucesso mensuráveis (accuracy, latency, handoff rate)
   - [ ] User stories com acceptance criteria
   - [ ] Sample prompts (happy path + edge cases)
   - [ ] Seção de Safety e Governance
   - [ ] Requisitos de Context Engineering
   - [ ] Dependências identificadas
   - [ ] Timeline com milestones
   - [ ] Riscos e mitigações

3. **Verificar considerações específicas de IA**:
   - [ ] Guardrails de safety definidos
   - [ ] Regras de recusa documentadas
   - [ ] Métricas de qualidade específicas (hallucination rate, etc.)
   - [ ] Estratégia de avaliação definida
   - [ ] Considerações de custo

4. **Gerar relatório de revisão**

## Output Format

```markdown
# PRD Review: [Nome do Documento]

## Score: X/10

## Completude
| Seção | Status | Notas |
|-------|--------|-------|
| Problem Statement | ✅/⚠️/❌ | [notas] |
| Success Metrics | ✅/⚠️/❌ | [notas] |
| User Stories | ✅/⚠️/❌ | [notas] |
| Sample Prompts | ✅/⚠️/❌ | [notas] |
| Safety & Governance | ✅/⚠️/❌ | [notas] |
| Context Engineering | ✅/⚠️/❌ | [notas] |
| Dependencies | ✅/⚠️/❌ | [notas] |
| Timeline | ✅/⚠️/❌ | [notas] |

## Pontos Fortes
- [Ponto forte 1]
- [Ponto forte 2]

## Áreas de Melhoria
1. [Área 1]: [Recomendação específica]
2. [Área 2]: [Recomendação específica]

## Considerações de IA
- [Consideração 1]
- [Consideração 2]

## Próximos Passos Recomendados
1. [Ação 1]
2. [Ação 2]
```

## Reference Files
- docs/product/PRD_TEMPLATE.md
- docs/product/SUCCESS_METRICS.md
- docs/product/SAFETY_GOVERNANCE.md
