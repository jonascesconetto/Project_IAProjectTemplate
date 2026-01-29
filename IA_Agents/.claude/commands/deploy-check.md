# /deploy-check

Verificar prontidão para deploy de um agente de IA.

## Usage
```
/deploy-check
```

## Instructions

1. **Verificar Quality Gates**:
   - [ ] Testes unitários passando (100%)
   - [ ] Testes de integração passando (100%)
   - [ ] Testes de avaliação dentro dos thresholds
   - [ ] Cobertura de código > 80%

2. **Verificar Documentação**:
   - [ ] CHANGELOG atualizado
   - [ ] README atualizado
   - [ ] ADRs documentados
   - [ ] Runbook atualizado

3. **Verificar Segurança**:
   - [ ] Nenhuma credencial hardcoded
   - [ ] Safety tests passando
   - [ ] Security review aprovado (se aplicável)

4. **Verificar Infraestrutura**:
   - [ ] Variáveis de ambiente configuradas
   - [ ] Monitoramento configurado
   - [ ] Alertas configurados
   - [ ] Rollback plan documentado

5. **Verificar Custos**:
   - [ ] Estimativa de custo realizada
   - [ ] Budget aprovado
   - [ ] Alertas de custo configurados

6. **Gerar relatório de prontidão**

## Output Format

```markdown
# Deploy Readiness Check

## Overall Status: ✅ READY / ⚠️ WARNINGS / ❌ NOT READY

## Quality Gates

| Check | Status | Details |
|-------|--------|---------|
| Unit Tests | ✅/❌ | XX% passing |
| Integration Tests | ✅/❌ | XX% passing |
| Evaluation Tests | ✅/❌ | Accuracy: XX% |
| Code Coverage | ✅/❌ | XX% |

## Documentation

| Check | Status | Details |
|-------|--------|---------|
| CHANGELOG | ✅/❌ | [details] |
| README | ✅/❌ | [details] |
| ADRs | ✅/❌ | [details] |
| Runbook | ✅/❌ | [details] |

## Security

| Check | Status | Details |
|-------|--------|---------|
| No Hardcoded Secrets | ✅/❌ | [details] |
| Safety Tests | ✅/❌ | XX% passing |
| Security Review | ✅/❌/N/A | [details] |

## Infrastructure

| Check | Status | Details |
|-------|--------|---------|
| Environment Variables | ✅/❌ | [details] |
| Monitoring | ✅/❌ | [details] |
| Alerts | ✅/❌ | [details] |
| Rollback Plan | ✅/❌ | [details] |

## Cost

| Check | Status | Details |
|-------|--------|---------|
| Cost Estimate | ✅/❌ | $X.XX/day |
| Budget Approved | ✅/❌ | [details] |
| Cost Alerts | ✅/❌ | [details] |

## Blockers
[Lista de itens que impedem o deploy]

## Warnings
[Lista de itens que não bloqueiam mas merecem atenção]

## Recommendation
[Recomendação: PROCEED / FIX ISSUES / REVIEW]

## Next Steps
1. [Próximo passo 1]
2. [Próximo passo 2]
```

## Reference Files
- docs/management/DEPLOYMENT_CHECKLIST.md
- docs/management/TESTING_STRATEGY.md
- docs/cost/FINOPS_FRAMEWORK.md
