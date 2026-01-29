# Context Engineering

Guia para engenharia de contexto em agentes de IA.

## O que é Context Engineering?

Context Engineering é a prática de projetar, organizar e otimizar as informações fornecidas a um modelo de IA para maximizar a qualidade das respostas e minimizar custos.

## Componentes do Contexto

### 1. System Prompt
Define a identidade, personalidade e regras fundamentais do agente.

```yaml
system_prompt:
  identity: "Você é [nome], um assistente especializado em [domínio]"

  capabilities:
    - "Responder perguntas sobre [tópico 1]"
    - "Auxiliar com [tarefa 1]"
    - "Guiar usuários em [processo 1]"

  constraints:
    - "Não fornecer aconselhamento médico/legal/financeiro"
    - "Sempre citar fontes quando disponíveis"
    - "Escalar para humano quando incerto"

  tone: "Profissional, amigável, objetivo"

  format_preferences:
    - "Usar markdown para formatação"
    - "Listas para múltiplos itens"
    - "Código em blocos apropriados"
```

### 2. User Context
Informações sobre o usuário que melhoram a personalização.

```yaml
user_context:
  profile:
    id: "user_123"
    name: "João"
    role: "developer"
    experience_level: "senior"
    preferences:
      language: "pt-BR"
      detail_level: "técnico"

  history:
    previous_interactions: 5
    last_topic: "arquitetura de microserviços"
    satisfaction_score: 4.5

  current_session:
    start_time: "2024-01-15T10:00:00Z"
    turns: 3
    current_topic: "deploy de containers"
```

### 3. Domain Knowledge
Conhecimento específico do domínio necessário para respostas precisas.

```yaml
domain_knowledge:
  static:
    - type: "documentation"
      source: "product_manual_v2.pdf"
      last_updated: "2024-01-01"

  dynamic:
    - type: "api"
      source: "inventory_service"
      cache_ttl: 300  # segundos

  retrieval:
    - type: "vector_search"
      index: "knowledge_base"
      top_k: 5
      similarity_threshold: 0.8
```

### 4. Conversation History
Histórico da conversa atual para manter contexto.

```yaml
conversation_history:
  format: "alternating"  # human/assistant/human/assistant
  max_turns: 10
  summarization:
    enabled: true
    trigger: "turns > 10"
    model: "haiku"
```

---

## Token Budget Management

### Budget Allocation

| Componente | % do Budget | Max Tokens | Prioridade |
|------------|-------------|------------|------------|
| System Prompt | 10% | 1,000 | Crítica |
| User Context | 5% | 500 | Alta |
| Domain Knowledge | 40% | 4,000 | Alta |
| Conversation History | 30% | 3,000 | Média |
| Output Buffer | 15% | 1,500 | Crítica |
| **Total** | 100% | 10,000 | - |

### Estratégias de Compressão

#### 1. Summarization
```typescript
async function compressHistory(history: Message[], maxTokens: number): Promise<string> {
  if (countTokens(history) <= maxTokens) {
    return formatHistory(history);
  }

  // Manter últimas N mensagens intactas
  const recentMessages = history.slice(-4);
  const olderMessages = history.slice(0, -4);

  // Sumarizar mensagens antigas
  const summary = await summarize(olderMessages, {
    model: 'haiku',
    maxTokens: maxTokens * 0.3
  });

  return `[Resumo do histórico anterior: ${summary}]\n\n${formatHistory(recentMessages)}`;
}
```

#### 2. Retrieval-Augmented Generation (RAG)
```typescript
interface RAGConfig {
  vectorStore: VectorStore;
  topK: number;
  similarityThreshold: number;
  reranker?: Reranker;
}

async function retrieveContext(query: string, config: RAGConfig): Promise<string> {
  // 1. Buscar documentos relevantes
  const candidates = await config.vectorStore.search(query, config.topK * 2);

  // 2. Filtrar por threshold
  const filtered = candidates.filter(d => d.score >= config.similarityThreshold);

  // 3. Reranking (opcional)
  const ranked = config.reranker
    ? await config.reranker.rerank(query, filtered)
    : filtered;

  // 4. Retornar top K
  return formatDocuments(ranked.slice(0, config.topK));
}
```

#### 3. Dynamic Context Selection
```typescript
async function selectContext(
  query: string,
  availableContext: ContextSource[],
  budget: number
): Promise<string[]> {
  // Classificar relevância de cada fonte
  const scored = await Promise.all(
    availableContext.map(async (source) => ({
      source,
      relevance: await scoreRelevance(query, source),
      tokens: source.estimatedTokens
    }))
  );

  // Ordenar por relevância
  scored.sort((a, b) => b.relevance - a.relevance);

  // Selecionar dentro do budget
  const selected: string[] = [];
  let usedTokens = 0;

  for (const item of scored) {
    if (usedTokens + item.tokens <= budget) {
      selected.push(await item.source.getContent());
      usedTokens += item.tokens;
    }
  }

  return selected;
}
```

---

## Patterns de Context Engineering

### 1. Layered Context
```
┌─────────────────────────────────────────────┐
│ Layer 1: System Prompt (sempre presente)    │
├─────────────────────────────────────────────┤
│ Layer 2: User Profile (se disponível)       │
├─────────────────────────────────────────────┤
│ Layer 3: Domain Knowledge (RAG)             │
├─────────────────────────────────────────────┤
│ Layer 4: Conversation History               │
├─────────────────────────────────────────────┤
│ Layer 5: Current Query                      │
└─────────────────────────────────────────────┘
```

### 2. Contextual Injection Points
```typescript
const contextTemplate = `
${systemPrompt}

${userContext ? `## Sobre o usuário\n${userContext}` : ''}

${domainKnowledge ? `## Informações relevantes\n${domainKnowledge}` : ''}

${conversationHistory ? `## Histórico da conversa\n${conversationHistory}` : ''}

## Pergunta atual
${currentQuery}
`;
```

### 3. Progressive Disclosure
```typescript
// Começar com contexto mínimo
let context = buildMinimalContext(query);

// Adicionar mais contexto se necessário
if (requiresMoreContext(initialResponse)) {
  context = enrichContext(context, query);
  // Retry com contexto enriquecido
}
```

---

## Otimização de Context

### Métricas a Monitorar

| Métrica | Descrição | Target |
|---------|-----------|--------|
| Context Utilization | % do budget usado | 70-90% |
| Retrieval Precision | Documentos relevantes / Total | > 80% |
| Context Freshness | Idade média do contexto | < 24h |
| Compression Ratio | Tokens originais / Tokens comprimidos | > 3:1 |

### Testes de Contexto
```typescript
describe('Context Engineering', () => {
  it('should fit within token budget', async () => {
    const context = await buildContext(testQuery);
    expect(countTokens(context)).toBeLessThan(MAX_TOKENS);
  });

  it('should include relevant information', async () => {
    const context = await buildContext(testQuery);
    expect(context).toContain(expectedKeyword);
  });

  it('should maintain coherence after compression', async () => {
    const compressed = await compressHistory(longHistory);
    const response = await getResponse(compressed);
    expect(response.quality).toBeGreaterThan(0.9);
  });
});
```

---

## Best Practices

### Do's
- ✅ Priorizar informações mais relevantes primeiro
- ✅ Usar estrutura clara e consistente
- ✅ Manter system prompt conciso e focado
- ✅ Implementar caching para contexto estático
- ✅ Monitorar utilização de tokens
- ✅ Testar com diferentes tamanhos de contexto

### Don'ts
- ❌ Incluir informação redundante
- ❌ Usar formatação inconsistente
- ❌ Exceder o budget de tokens
- ❌ Ignorar a ordem de importância
- ❌ Cachear informações que mudam frequentemente
- ❌ Assumir que mais contexto = melhor resposta

---

## Checklist de Implementação

### Antes de Deploy
- [ ] System prompt revisado e otimizado
- [ ] Budget de tokens definido e respeitado
- [ ] RAG configurado e testado
- [ ] Estratégia de compressão implementada
- [ ] Métricas de contexto configuradas
- [ ] Testes de qualidade passando

### Monitoramento Contínuo
- [ ] Utilização de tokens dentro do budget
- [ ] Qualidade de retrieval aceitável
- [ ] Tempo de construção de contexto aceitável
- [ ] Sem vazamento de contexto entre sessões
