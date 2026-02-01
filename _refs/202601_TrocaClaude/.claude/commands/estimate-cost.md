# /estimate-cost

Estimar custos de inferência de IA para uma carga de trabalho específica.

## Usage
```
/estimate-cost [opções]
```

## Arguments
- `$ARGUMENTS` - Pode conter: número de requisições, modelo, tokens estimados

## Instructions

1. **Coletar parâmetros** (perguntar se não fornecidos):
   - Requisições por dia
   - Tokens de input médios por requisição
   - Tokens de output médios por requisição
   - Modelo(s) a serem usados

2. **Usar pricing atual**:
   | Modelo | Input (1M tokens) | Output (1M tokens) |
   |--------|-------------------|---------------------|
   | Claude 3 Haiku | $0.25 | $1.25 |
   | Claude 3.5 Sonnet | $3.00 | $15.00 |
   | Claude Opus 4 | $15.00 | $75.00 |

3. **Calcular custos**:
   - Custo diário por modelo
   - Custo mensal (30 dias)
   - Custo anual

4. **Estimar otimização com Plan-and-Execute**:
   - Assumir distribuição: 70% simples, 20% moderado, 10% complexo
   - Calcular economia potencial

5. **Gerar relatório de custos**

## Output Format

```markdown
# Cost Estimate Report

## Parâmetros
- Requisições/dia: X
- Tokens input médio: X
- Tokens output médio: X
- Modelo base: [modelo]

## Custo Sem Otimização

| Modelo | Diário | Mensal | Anual |
|--------|--------|--------|-------|
| Haiku | $X.XX | $X.XX | $X.XX |
| Sonnet | $X.XX | $X.XX | $X.XX |
| Opus | $X.XX | $X.XX | $X.XX |

## Custo Com Plan-and-Execute

Distribuição assumida:
- 70% simples → Haiku
- 20% moderado → Sonnet
- 10% complexo → Opus

| Estratégia | Diário | Mensal | Economia |
|------------|--------|--------|----------|
| Otimizado | $X.XX | $X.XX | XX% |

## Breakdown Detalhado

### Por Componente
| Componente | % Total | Custo Mensal |
|------------|---------|--------------|
| Input tokens | XX% | $X.XX |
| Output tokens | XX% | $X.XX |

## Recomendações

1. **Modelo recomendado**: [recomendação baseada em trade-off custo/qualidade]
2. **Otimizações sugeridas**:
   - [Otimização 1]
   - [Otimização 2]

## Alertas de Budget

Com base no custo estimado, configurar alertas em:
- Warning: $X.XX/dia (80% do estimado)
- Critical: $X.XX/dia (100% do estimado)
```

## Reference Files
- docs/cost/FINOPS_FRAMEWORK.md
- docs/cost/TOKEN_TRACKING.md
- docs/management/PLAN_AND_EXECUTE.md
