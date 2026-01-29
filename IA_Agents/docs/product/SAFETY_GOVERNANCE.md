# Safety & Governance Framework

Framework de segurança e governança para agentes de IA.

## 1. Princípios de Safety

### 1.1 Princípios Fundamentais
1. **Não causar dano**: O agente nunca deve gerar conteúdo que possa causar dano físico, emocional ou financeiro
2. **Transparência**: O agente deve ser claro sobre suas limitações e capacidades
3. **Privacidade**: Proteger dados pessoais e sensíveis dos usuários
4. **Controle humano**: Sempre permitir escalação para humanos

### 1.2 Hierarquia de Decisão
```
1. Safety (mais alta prioridade)
2. Compliance legal/regulatório
3. Políticas da empresa
4. Satisfação do usuário
5. Eficiência operacional (menor prioridade)
```

---

## 2. Categorias de Risco

### 2.1 Matriz de Risco
| Categoria | Descrição | Severidade | Probabilidade |
|-----------|-----------|------------|---------------|
| Conteúdo Harmful | Violência, ódio, auto-dano | Crítica | Baixa |
| Vazamento de Dados | PII, credenciais, dados sensíveis | Crítica | Média |
| Desinformação | Informações falsas, hallucinations | Alta | Alta |
| Uso Indevido | Fraude, spam, manipulação | Alta | Média |
| Viés | Discriminação, estereótipos | Média | Alta |
| Falha de Compliance | LGPD, GDPR, regulações | Crítica | Baixa |

### 2.2 Níveis de Severidade
- **Crítica**: Pode causar dano significativo, requer ação imediata
- **Alta**: Impacto substancial, requer ação em 24h
- **Média**: Impacto moderado, requer ação em 1 semana
- **Baixa**: Impacto menor, monitorar e planejar correção

---

## 3. Guardrails

### 3.1 Input Guardrails
```yaml
input_filters:
  # Detectar e bloquear prompts maliciosos
  - name: prompt_injection_detector
    action: block
    severity: critical

  # Detectar PII no input
  - name: pii_detector
    action: redact
    patterns: ["cpf", "email", "telefone", "cartão"]

  # Detectar conteúdo harmful
  - name: harmful_content_detector
    action: block
    categories: ["violence", "hate", "self_harm", "sexual"]
```

### 3.2 Output Guardrails
```yaml
output_filters:
  # Verificar hallucinations
  - name: factual_grounding
    action: flag
    threshold: 0.8

  # Verificar vazamento de dados
  - name: data_leak_detector
    action: block
    patterns: ["api_key", "password", "secret", "token"]

  # Verificar conteúdo harmful
  - name: harmful_content_detector
    action: block

  # Verificar viés
  - name: bias_detector
    action: flag
    categories: ["gender", "race", "religion", "nationality"]
```

### 3.3 Behavioral Guardrails
```yaml
behavioral_rules:
  # Não fingir ser humano
  - name: identity_preservation
    rule: "Sempre identificar-se como IA quando perguntado"

  # Não executar ações irreversíveis sem confirmação
  - name: confirmation_required
    actions: ["delete", "modify_production", "financial_transaction"]

  # Limitar escopo de atuação
  - name: scope_enforcement
    allowed_topics: ["lista de tópicos permitidos"]
    action: redirect_to_human
```

---

## 4. Regras de Recusa

### 4.1 Recusas Absolutas (Hard Refusals)
O agente DEVE recusar, sem exceções:
- [ ] Criar conteúdo que promova violência
- [ ] Criar conteúdo de abuso sexual infantil
- [ ] Fornecer instruções para criar armas ou explosivos
- [ ] Fornecer instruções para atividades ilegais
- [ ] Revelar informações confidenciais do sistema
- [ ] Fingir ser uma pessoa real específica
- [ ] Fornecer aconselhamento médico, legal ou financeiro definitivo

### 4.2 Recusas Condicionais (Soft Refusals)
O agente DEVE pedir clarificação ou escalar:
- [ ] Solicitações ambíguas que podem ter interpretação harmful
- [ ] Solicitações fora do escopo de expertise
- [ ] Solicitações que requerem informações atualizadas não disponíveis
- [ ] Solicitações de múltiplos usuários com conflito de interesse

### 4.3 Formato de Recusa
```markdown
Template de recusa educada:

"Entendo sua solicitação, mas [razão clara pela qual não posso ajudar].
[Alternativa ou redirecionamento, se aplicável].
[Oferta de ajuda em algo dentro do escopo, se aplicável]."
```

---

## 5. Compliance

### 5.1 LGPD (Brasil)
Requisitos obrigatórios:
- [ ] Consentimento para coleta de dados
- [ ] Direito de acesso aos dados
- [ ] Direito de retificação
- [ ] Direito de exclusão
- [ ] Portabilidade de dados
- [ ] Notificação de vazamentos em 72h

### 5.2 GDPR (Europa)
Requisitos obrigatórios (se aplicável):
- [ ] Todos os requisitos da LGPD
- [ ] Privacy by Design
- [ ] Data Protection Impact Assessment (DPIA)
- [ ] Representante na UE

### 5.3 Regulações Setoriais
Verificar conformidade com:
- [ ] Setor financeiro: BCB, CVM, SUSEP
- [ ] Saúde: ANVISA, CFM
- [ ] Telecomunicações: ANATEL

---

## 6. Audit Trail

### 6.1 O que Registrar
```yaml
audit_log:
  required_fields:
    - timestamp
    - session_id
    - user_id (anonimizado se necessário)
    - input_prompt (redacted)
    - output_response (redacted)
    - model_version
    - guardrails_triggered
    - safety_score

  optional_fields:
    - latency_ms
    - tokens_used
    - cost_usd
```

### 6.2 Retenção de Dados
| Tipo de Dado | Retenção | Justificativa |
|--------------|----------|---------------|
| Logs de safety | 2 anos | Compliance |
| Logs operacionais | 90 dias | Debugging |
| Dados de usuário | Conforme política | LGPD |
| Métricas agregadas | Indefinido | Analytics |

### 6.3 Acesso aos Logs
- **Read**: Time de segurança, compliance
- **Admin**: DPO (Data Protection Officer)
- **Audit**: Auditores externos (sob NDA)

---

## 7. Incident Response

### 7.1 Classificação de Incidentes
| Nível | Descrição | Tempo de Resposta |
|-------|-----------|-------------------|
| P0 | Vazamento de dados, conteúdo harmful em produção | 15 minutos |
| P1 | Falha de compliance, comportamento inesperado crítico | 1 hora |
| P2 | Bug de safety em ambiente não-produção | 24 horas |
| P3 | Melhoria de safety identificada | Próxima sprint |

### 7.2 Processo de Resposta
```
1. DETECTAR
   - Monitoramento automatizado
   - Reporte de usuário
   - Auditoria interna

2. CONTER
   - Isolar sistema afetado
   - Rollback se necessário
   - Ativar guardrails adicionais

3. INVESTIGAR
   - Análise de root cause
   - Identificar impacto
   - Documentar timeline

4. REMEDIAR
   - Implementar correção
   - Testar extensivamente
   - Deploy gradual

5. COMUNICAR
   - Notificar stakeholders
   - Notificar usuários afetados (se aplicável)
   - Notificar reguladores (se requerido)

6. APRENDER
   - Post-mortem
   - Atualizar guardrails
   - Treinar time
```

---

## 8. Revisão e Atualização

### 8.1 Frequência de Revisão
- **Guardrails**: Semanal
- **Políticas de recusa**: Mensal
- **Framework completo**: Trimestral
- **Após incidente**: Imediato

### 8.2 Responsáveis
| Componente | Owner | Revisor |
|------------|-------|---------|
| Guardrails técnicos | Engenharia | Security |
| Políticas | Product | Legal |
| Compliance | DPO | Auditoria |
| Incident Response | Security | CTO |

---

## Checklist de Implementação

### Antes do Deploy
- [ ] Todos os guardrails implementados e testados
- [ ] Regras de recusa documentadas e testadas
- [ ] Audit trail funcionando
- [ ] Processo de incident response definido
- [ ] Compliance verificado
- [ ] Treinamento do time completado

### Pós-Deploy
- [ ] Monitoramento ativo
- [ ] Alertas configurados
- [ ] Revisão semanal agendada
- [ ] Canal de feedback de usuários
