# Deployment Checklist

Checklist completo para deploy de agentes de IA.

---

## Pre-Deployment

### 1. Quality Gates ✓

- [ ] **Testes passando**
  - [ ] Unit tests: 100% passing
  - [ ] Integration tests: 100% passing
  - [ ] Evaluation tests: Todos thresholds atingidos
  - [ ] Coverage: > 80%

- [ ] **Métricas de qualidade**
  - [ ] Accuracy: > 95%
  - [ ] Latency P95: < 3s
  - [ ] Safety tests: 100% passing
  - [ ] No regressions vs. baseline

- [ ] **Code review**
  - [ ] Aprovado por pelo menos 1 reviewer
  - [ ] Comentários resolvidos
  - [ ] PR description completa

### 2. Documentation ✓

- [ ] **Código documentado**
  - [ ] Funções principais documentadas
  - [ ] Prompts documentados
  - [ ] ADRs atualizados

- [ ] **Runbook atualizado**
  - [ ] Procedimentos de deploy
  - [ ] Procedimentos de rollback
  - [ ] Contatos de emergência
  - [ ] Troubleshooting comum

- [ ] **Changelog atualizado**
  - [ ] Todas as mudanças listadas
  - [ ] Breaking changes destacados
  - [ ] Migration guide (se necessário)

### 3. Security ✓

- [ ] **Security review**
  - [ ] Nenhuma credencial hardcoded
  - [ ] Inputs sanitizados
  - [ ] Outputs filtrados
  - [ ] Rate limiting configurado

- [ ] **Privacy compliance**
  - [ ] PII handling verificado
  - [ ] Data retention conforme política
  - [ ] Consent flows (se aplicável)

- [ ] **Access control**
  - [ ] Permissões revisadas
  - [ ] API keys rotacionadas (se necessário)
  - [ ] Logs de auditoria ativos

### 4. Infrastructure ✓

- [ ] **Resources**
  - [ ] Capacity planning atualizado
  - [ ] Auto-scaling configurado
  - [ ] Recursos provisionados

- [ ] **Monitoring**
  - [ ] Dashboards criados/atualizados
  - [ ] Alertas configurados
  - [ ] Log aggregation funcionando

- [ ] **Backup**
  - [ ] Backups verificados
  - [ ] Restore testado recentemente

---

## Deployment Steps

### Step 1: Prepare (1h antes)

```bash
# 1. Verificar status do ambiente
npm run deploy:check

# 2. Criar tag de release
git tag -a v1.x.x -m "Release v1.x.x"
git push origin v1.x.x

# 3. Notificar stakeholders
# [Enviar comunicação de deploy agendado]
```

### Step 2: Deploy to Staging

```bash
# 1. Deploy para staging
npm run deploy:staging

# 2. Verificar health check
curl https://staging.api.example.com/health

# 3. Rodar smoke tests
npm run test:smoke -- --env=staging

# 4. Verificar métricas iniciais
# [Checar dashboard de staging]
```

**Checklist de Staging:**
- [ ] Health check OK
- [ ] Smoke tests passando
- [ ] Logs sem erros
- [ ] Métricas normais

### Step 3: Deploy to Production

**Estratégia: Canary Deployment**

```bash
# Fase 1: 5% do tráfego
npm run deploy:prod -- --canary=5

# Aguardar 15 minutos, monitorar métricas
# Se OK, continuar

# Fase 2: 25% do tráfego
npm run deploy:prod -- --canary=25

# Aguardar 15 minutos, monitorar métricas
# Se OK, continuar

# Fase 3: 100% do tráfego
npm run deploy:prod -- --canary=100
```

**Checklist por Fase:**
- [ ] Error rate < 0.1%
- [ ] Latency P95 < 3s
- [ ] No safety violations
- [ ] User feedback normal

### Step 4: Verify Production

```bash
# 1. Health check
curl https://api.example.com/health

# 2. Smoke tests
npm run test:smoke -- --env=production

# 3. Verificar métricas
# [Checar dashboards de produção]

# 4. Verificar logs
# [Checar logs de erros]
```

**Checklist de Produção:**
- [ ] Health check OK
- [ ] Smoke tests passando
- [ ] Métricas dentro do esperado
- [ ] Sem erros críticos nos logs
- [ ] Alertas não disparados

---

## Post-Deployment

### 1. Monitoring (Primeiras 24h)

**Hora 0-1:**
- [ ] Monitorar erro rate continuamente
- [ ] Verificar latência
- [ ] Checar logs de erro

**Hora 1-4:**
- [ ] Monitorar métricas de qualidade
- [ ] Verificar feedback de usuários
- [ ] Checar custo

**Hora 4-24:**
- [ ] Verificar métricas agregadas
- [ ] Comparar com baseline
- [ ] Documentar anomalias

### 2. Communication

```markdown
# Deploy Completed: v1.x.x

## Summary
- Deploy time: [timestamp]
- Status: ✅ Successful

## Changes
- [Feature 1]
- [Bug fix 1]

## Metrics (first hour)
- Error rate: X%
- Latency P95: Xms
- Request volume: X/min

## Next Steps
- [Any follow-up actions]
```

### 3. Cleanup

- [ ] Feature flags antigos removidos
- [ ] Código deprecated removido
- [ ] Recursos não utilizados desprovisionados
- [ ] Documentação finalizada

---

## Rollback Procedure

### Quando fazer Rollback

| Condição | Ação |
|----------|------|
| Error rate > 1% | Rollback imediato |
| Safety violation | Rollback imediato |
| Latency P95 > 5s | Avaliar, considerar rollback |
| Accuracy < 90% | Avaliar, considerar rollback |

### Procedimento de Rollback

```bash
# 1. Pausar o deploy (se em progresso)
npm run deploy:pause

# 2. Rollback para versão anterior
npm run deploy:rollback -- --version=v1.x.x

# 3. Verificar health
curl https://api.example.com/health

# 4. Verificar métricas
# [Confirmar que métricas normalizaram]

# 5. Notificar stakeholders
# [Comunicar rollback]
```

### Post-Rollback

- [ ] Criar incident report
- [ ] Investigar root cause
- [ ] Documentar learnings
- [ ] Planejar correção

---

## Emergency Contacts

| Role | Contact | When to Call |
|------|---------|--------------|
| On-call Engineer | [phone/slack] | Qualquer incidente |
| Tech Lead | [phone/slack] | Decisões técnicas |
| Product Owner | [phone/slack] | Impacto em usuários |
| Security | [phone/slack] | Safety violations |

---

## Runbook Quick Reference

### Health Check Failures
```bash
# 1. Verificar logs
kubectl logs -l app=agent --tail=100

# 2. Verificar recursos
kubectl top pods -l app=agent

# 3. Verificar conectividade
curl -v https://api.example.com/health
```

### High Error Rate
```bash
# 1. Identificar tipo de erro
grep "ERROR" /var/log/agent/*.log | head -50

# 2. Verificar dependências externas
npm run check:dependencies

# 3. Considerar rollback se > 1%
```

### High Latency
```bash
# 1. Verificar load
kubectl top pods -l app=agent

# 2. Verificar rate limiting
npm run check:ratelimits

# 3. Verificar API externa
npm run check:external-apis
```

---

## Appendix: Approval Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tech Lead | | | |
| QA Lead | | | |
| Product Owner | | | |
| Security | | | |

---

**Last Updated**: [Date]
**Version**: 1.0
