# User Stories Template

## Formato Padrão

```
Como um [PAPEL/PERSONA],
Eu quero [AÇÃO/FUNCIONALIDADE],
Para que [BENEFÍCIO/VALOR].
```

## Campos Obrigatórios

### Identificação
- **ID**: US-[NÚMERO]
- **Título**: [Título curto e descritivo]
- **Epic**: [Epic relacionada]
- **Prioridade**: Must Have / Should Have / Could Have / Won't Have

### Acceptance Criteria (Formato Gherkin)
```gherkin
Dado [contexto/pré-condição]
Quando [ação do usuário]
Então [resultado esperado]
```

## Template Completo

---

### US-001: [Título da User Story]

**Como** um [papel],
**Eu quero** [ação],
**Para que** [benefício].

#### Acceptance Criteria

**AC-001.1**: [Descrição do critério]
```gherkin
Dado que [contexto]
Quando [ação]
Então [resultado]
```

**AC-001.2**: [Descrição do critério]
```gherkin
Dado que [contexto]
Quando [ação]
Então [resultado]
```

#### Sample Prompts (para AI agents)
| Cenário | Prompt do Usuário | Resposta Esperada |
|---------|-------------------|-------------------|
| Happy Path | "[prompt exemplo]" | "[resposta esperada]" |
| Edge Case | "[prompt edge case]" | "[resposta esperada]" |
| Erro | "[prompt de erro]" | "[mensagem de erro]" |

#### Notas Técnicas
- [Nota técnica 1]
- [Nota técnica 2]

#### Dependências
- [ ] [Dependência 1]
- [ ] [Dependência 2]

#### Definition of Done
- [ ] Código implementado e revisado
- [ ] Testes unitários passando (cobertura > 80%)
- [ ] Testes de integração passando
- [ ] Testes de avaliação passando (accuracy > 95%)
- [ ] Documentação atualizada
- [ ] Code review aprovado
- [ ] QA aprovado

---

## Exemplos de User Stories para AI Agents

### Exemplo 1: Assistente de Atendimento

**US-101: Responder perguntas frequentes**

**Como** um cliente,
**Eu quero** fazer perguntas sobre produtos e serviços,
**Para que** eu possa tomar decisões de compra informadas.

#### Acceptance Criteria

**AC-101.1**: Resposta a pergunta direta
```gherkin
Dado que o cliente pergunta sobre horário de funcionamento
Quando a pergunta é clara e específica
Então o agente responde com horário correto em menos de 2 segundos
```

**AC-101.2**: Handoff para humano
```gherkin
Dado que o cliente faz uma pergunta fora do escopo
Quando o agente não tem confiança suficiente (< 80%)
Então o agente transfere para atendente humano com contexto
```

#### Sample Prompts
| Cenário | Prompt | Resposta |
|---------|--------|----------|
| Happy Path | "Qual o horário de funcionamento?" | "Funcionamos de segunda a sexta, das 9h às 18h." |
| Edge Case | "vocês abrem no feriado?" | "Nos feriados nacionais não funcionamos. Posso ajudar com outra informação?" |
| Fora do escopo | "Quero falar sobre minha reclamação #12345" | "Vou transferir você para um atendente que pode ajudar melhor com sua reclamação." |

---

### Exemplo 2: Assistente de Código

**US-201: Revisar código para bugs**

**Como** um desenvolvedor,
**Eu quero** que o agente revise meu código,
**Para que** eu possa identificar bugs antes do deploy.

#### Acceptance Criteria

**AC-201.1**: Identificar bugs comuns
```gherkin
Dado que o desenvolvedor submete código com null pointer
Quando o agente analisa o código
Então o agente identifica o potencial null pointer com explicação
```

**AC-201.2**: Sugerir correção
```gherkin
Dado que o agente identificou um bug
Quando o agente gera sugestão
Então a sugestão inclui código corrigido e explicação
```

---

## Checklist de Qualidade

### User Story bem escrita deve:
- [ ] Ser independente (pode ser desenvolvida isoladamente)
- [ ] Ser negociável (detalhes podem ser discutidos)
- [ ] Ser valiosa (entrega valor ao usuário)
- [ ] Ser estimável (time pode estimar esforço)
- [ ] Ser pequena (cabe em uma sprint)
- [ ] Ser testável (tem acceptance criteria claros)

### Para AI Agents, adicionar:
- [ ] Sample prompts documentados
- [ ] Cenários de edge case definidos
- [ ] Cenários de recusa definidos
- [ ] Métricas de qualidade especificadas
- [ ] Requisitos de latência definidos
