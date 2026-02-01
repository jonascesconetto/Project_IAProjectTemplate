# Guia Completo: Desenvolvimento de Software com Agentes de IA

> **Best Practices para Claude Code & Claude.ai**  
> Versão: Janeiro 2025 | Autor: CESCOTECH

---

## Sumário

1. [Produto (Definições e Requisitos)](#1-produto-definições-e-requisitos)
2. [Gestão (Planejamento e Ciclo de Desenvolvimento)](#2-gestão-planejamento-e-ciclo-de-desenvolvimento)
3. [Arquitetura (Definições e Padrões)](#3-arquitetura-definições-e-padrões)
4. [Organização (Commands, Subagents, Documentação)](#4-organização-commands-subagents-documentação)
5. [Fullstack & DevOps (Desenvolvimento, Testes, Deploy)](#5-fullstack--devops-desenvolvimento-testes-deploy)
6. [Registro e Histórico (Aprimorar Contexto da IA)](#6-registro-e-histórico-aprimorar-contexto-da-ia)
7. [Custos (Tokens e Infraestrutura)](#7-custos-tokens-e-infraestrutura)
8. [Como Iniciar um Projeto no Claude.ai](#8-como-iniciar-um-projeto-no-claudeai)

---

## 1. Produto (Definições e Requisitos)

### 1.1 PRD - Product Requirements Document

O PRD é o documento central que guia todo o desenvolvimento com agentes de IA. Diferente do PRD tradicional, o PRD para IA deve ser **estruturado de forma que o modelo consiga interpretar e executar corretamente**.

#### Estrutura Recomendada do PRD

| Seção | Descrição | Importância |
|-------|-----------|-------------|
| **Visão Geral** | Descrição do produto em 2-3 parágrafos | Alta |
| **User Stories** | Formato: "Como [persona], quero [ação] para [benefício]" | Crítica |
| **Acceptance Criteria** | Critérios verificáveis de sucesso | Crítica |
| **Technical Requirements** | Stack, integrações, constraints | Alta |
| **Non-Functional Requirements** | Performance, segurança, escalabilidade | Média |
| **Edge Cases** | Cenários de borda e tratamento de erros | Alta |

> **💡 Dica Importante:** Mantenha o PRD conciso (idealmente < 500 linhas). Agentes de IA performam melhor com instruções claras e específicas do que com documentos extensos e vagos.

#### Exemplo de User Story bem estruturada:

```markdown
## US-001: Login com Google

**Como** usuário não autenticado  
**Quero** fazer login usando minha conta Google  
**Para** acessar o sistema sem criar nova senha

### Acceptance Criteria:
- [ ] Botão "Login com Google" visível na tela de login
- [ ] Redirect para OAuth do Google ao clicar
- [ ] Criar usuário no banco se primeiro acesso
- [ ] Redirecionar para dashboard após sucesso
- [ ] Exibir mensagem de erro se falhar

### Edge Cases:
- Usuário cancela no meio do OAuth
- Email já cadastrado com senha (oferecer merge)
- Google retorna erro de API
```

### 1.2 Spec-Driven Development (SDD)

A abordagem Spec-Driven Development **inverte a relação tradicional**: especificações não servem ao código - o código serve às especificações. O PRD se torna a fonte de verdade que gera a implementação.

#### Arquivos Fundamentais do SDD:

```
docs/
├── CONSTITUTION.md    # Princípios imutáveis do projeto
├── PRD.md             # Requisitos do produto (versionado)
├── SPEC.md            # Especificação técnica detalhada
└── ARCHITECTURE.md    # Decisões arquiteturais (ADRs)
```

#### CONSTITUTION.md - Exemplo:

```markdown
# Constitution do Projeto

## Princípios Imutáveis

1. **Segurança First**: Nunca armazenar senhas em plain text
2. **Test Coverage**: Mínimo 80% de cobertura de testes
3. **Code Review**: Todo PR requer aprovação antes do merge
4. **Documentation**: Código sem documentação não vai para produção

## Governança

- Constitution supersede todas as outras práticas
- Alterações requerem documentação e aprovação
- Desvios requerem justificativa explícita
```

---

## 2. Gestão (Planejamento e Ciclo de Desenvolvimento)

### 2.1 Workflow: Plan → Execute → Validate

O princípio fundamental é: **SEMPRE planejar antes de executar.** Sem isso, Claude tende a pular direto para codificação, gerando soluções incompletas.

#### Ciclo de Desenvolvimento com IA

| Fase | Ação | Comando/Técnica |
|------|------|-----------------|
| **1. Research** | Coletar contexto do problema | Usar subagents para investigar |
| **2. Plan** | Criar plano detalhado | Usar `think hard` ou Plan Mode |
| **3. Test First** | Escrever testes antes do código | TDD com Claude |
| **4. Implement** | Implementar seguindo o plano | Diffs pequenos e incrementais |
| **5. Validate** | Verificar implementação | Rodar testes, linters |
| **6. Commit** | Commitar com mensagem descritiva | Claude gera commit message |

#### Workflow Visual:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  RESEARCH   │ ──▶ │    PLAN     │ ──▶ │  TEST FIRST │
│  (Subagent) │     │ (think hard)│     │    (TDD)    │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   COMMIT    │ ◀── │  VALIDATE   │ ◀── │  IMPLEMENT  │
│   (Git)     │     │  (Testes)   │     │ (Diffs <200)│
└─────────────┘     └─────────────┘     └─────────────┘
```

### 2.2 Extended Thinking (Níveis de Raciocínio)

Use palavras-chave para ativar diferentes níveis de processamento:

| Comando | Nível | Quando Usar |
|---------|-------|-------------|
| `think` | Básico | Problemas simples, correções pontuais |
| `think hard` | Médio | Features moderadas, debugging |
| `think harder` | Alto | Problemas complexos, múltiplos arquivos |
| `ultrathink` | Máximo | Arquitetura, refatoração crítica, decisões importantes |

#### Exemplo de uso:

```
Analise o problema de performance no endpoint /api/users.
Think harder sobre as possíveis causas e proponha um plano
de otimização antes de implementar qualquer mudança.
```

### 2.3 Session Management

Para projetos longos, gerencie sessões de forma eficiente:

| Comando | Função |
|---------|--------|
| `/clear` | Limpa contexto entre tarefas (use frequentemente!) |
| `claude --resume` | Retoma sessões anteriores |
| `/rewind` | Volta a pontos anteriores (Checkpoints) |
| `claude --continue` | Continua última sessão |

#### Regra dos 60%:
> **Nunca exceda 60% do context window.** Divida o trabalho em 4 fases: Research → Plan → Implement → Validate. Limpe contexto entre cada fase.

### 2.4 Git Worktrees para Paralelismo

Execute múltiplas instâncias de Claude em branches diferentes:

```bash
# Criar worktrees
git worktree add ../project-feature-auth feature-auth
git worktree add ../project-feature-payments feature-payments
git worktree add ../project-bugfix-api bugfix-api

# Abrir Claude em cada worktree (terminais separados)
cd ../project-feature-auth && claude
cd ../project-feature-payments && claude

# Limpar quando terminar
git worktree remove ../project-feature-auth
```

---

## 3. Arquitetura (Definições e Padrões)

### 3.1 Seleção de Arquitetura por Complexidade

| Complexidade | Arquitetura | Características | Exemplo |
|--------------|-------------|-----------------|---------|
| **Baixa (MVP)** | Monolito Simples | Rápido desenvolvimento, fácil deploy | Landing page, API simples |
| **Média** | Modular Monolith | Separação de concerns, escalável | SaaS pequeno/médio |
| **Alta** | Microservices | Independência de deploy | Plataformas grandes |
| **Enterprise** | Event-Driven + CQRS | Alta escalabilidade, resiliência | Sistemas financeiros |

### 3.2 Documentação de Arquitetura

```
docs/
├── ARCHITECTURE.md          # Visão geral
├── adr/                     # Architecture Decision Records
│   ├── 001-database-choice.md
│   ├── 002-auth-strategy.md
│   └── 003-api-versioning.md
├── diagrams/                # Diagramas Mermaid/PlantUML
│   ├── system-context.md
│   ├── container-diagram.md
│   └── sequence-flows.md
└── api/                     # Especificações
    └── openapi.yaml
```

#### Template de ADR (Architecture Decision Record):

```markdown
# ADR-001: Escolha do Banco de Dados

## Status
Aceito

## Contexto
Precisamos de um banco de dados para armazenar dados de usuários
e transações com requisitos de ACID compliance.

## Decisão
Usaremos PostgreSQL 16.

## Consequências

### Positivas:
- ACID compliance nativo
- Excelente suporte a JSON
- Comunidade ativa

### Negativas:
- Mais complexo que SQLite para desenvolvimento local
- Requer gerenciamento de conexões

## Alternativas Consideradas
- MongoDB: Descartado por falta de ACID nativo
- MySQL: Descartado por limitações em JSON
```

### 3.3 Estrutura de Diretórios Recomendada

```
project/
├── .claude/
│   ├── CLAUDE.md              # Contexto principal do projeto
│   ├── CLAUDE.local.md        # Preferências pessoais (gitignore)
│   ├── commands/              # Slash commands customizados
│   │   ├── fix-issue.md
│   │   ├── create-feature.md
│   │   └── deploy.md
│   ├── skills/                # Skills do projeto
│   │   ├── testing-patterns/
│   │   └── api-design/
│   └── settings.json          # Configurações e permissões
│
├── docs/
│   ├── PRD.md                 # Requisitos do produto
│   ├── SPEC.md                # Especificação técnica
│   ├── ARCHITECTURE.md        # Documentação de arquitetura
│   ├── adr/                   # Decision records
│   └── api/                   # OpenAPI specs
│
├── src/                       # Código fonte
│   ├── components/
│   ├── services/
│   ├── utils/
│   └── index.ts
│
├── tests/                     # Testes
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/                   # Scripts de automação
│
├── CLAUDE.md                  # Ou ROADMAP.md na raiz
├── README.md
└── package.json
```

---

## 4. Organização (Commands, Subagents, Documentação)

### 4.1 CLAUDE.md - O Arquivo Central

O CLAUDE.md é carregado **automaticamente em toda sessão**. É a "constituição" que Claude segue estritamente.

#### Regras de Ouro:
- **Mantenha conciso**: < 300 linhas (idealmente < 100)
- **Seja específico**: "Use 2-space indent" > "Formate código corretamente"
- **Atualize frequentemente**: Use `#` para adicionar instruções durante o trabalho

#### Template de CLAUDE.md:

```markdown
# Project: [Nome do Projeto]

## Quick Facts
- **Stack**: React 18, TypeScript, Node.js, PostgreSQL
- **Test Command**: `npm test`
- **Build Command**: `npm run build`
- **Lint Command**: `npm run lint`

## Key Directories
- `src/components/` - React components
- `src/services/` - Business logic
- `src/api/` - API routes
- `tests/` - Test files

## Code Style
- TypeScript strict mode
- Prefer interfaces over types
- No `any` - use `unknown` when needed
- 2-space indentation
- Imports: ES modules only

## Testing
- Jest + React Testing Library
- Mínimo 80% coverage
- Testes antes de código (TDD)

## Git Workflow
- Branch naming: `feature/`, `bugfix/`, `hotfix/`
- Commits em português
- Squash merge para PRs

## ⚠️ Gotchas
- API de pagamento requer timeout de 30s
- Não modificar `src/legacy/` sem aprovação
- Variáveis de ambiente em `.env.local`

## References
- @docs/PRD.md
- @docs/ARCHITECTURE.md
```

#### Localização dos CLAUDE.md:

| Local | Escopo | Uso |
|-------|--------|-----|
| `~/.claude/CLAUDE.md` | Global | Preferências pessoais para todos projetos |
| `./CLAUDE.md` | Projeto | Compartilhado via git com o time |
| `./.claude/CLAUDE.md` | Projeto | Alternativa dentro de pasta .claude |
| `./CLAUDE.local.md` | Pessoal | Gitignore, preferências individuais |
| `./subdir/CLAUDE.md` | Subpasta | Carregado quando trabalha nessa pasta |

### 4.2 Slash Commands Customizados

Armazene comandos repetitivos em `.claude/commands/` como arquivos Markdown.

#### Estrutura:
```
.claude/commands/
├── fix-issue.md        # /project:fix-issue
├── create-feature.md   # /project:create-feature
├── deploy.md           # /project:deploy
├── review-pr.md        # /project:review-pr
└── run-tests.md        # /project:run-tests
```

#### Exemplo: fix-issue.md

```markdown
Analise e corrija a issue do GitHub: $ARGUMENTS

## Passos:

1. Use `gh issue view $ARGUMENTS` para obter detalhes
2. Pesquise arquivos relevantes no codebase
3. Crie um plano de correção (não implemente ainda)
4. Aguarde aprovação do plano
5. Implemente as mudanças necessárias
6. Escreva/atualize testes
7. Execute lint e type checking
8. Crie commit com mensagem descritiva
9. Crie PR linkando a issue

## Regras:
- Diffs < 200 linhas
- Testes obrigatórios
- Não modificar arquivos não relacionados
```

#### Exemplo: create-feature.md

```markdown
Crie a feature: $ARGUMENTS

## Workflow:

### 1. Research (não codifique ainda)
- Leia os arquivos relacionados
- Entenda o contexto existente
- Liste dependências necessárias

### 2. Plan (think hard)
- Proponha arquitetura da feature
- Liste arquivos a criar/modificar
- Defina acceptance criteria

### 3. Aguarde Aprovação
PARE e apresente o plano para revisão.

### 4. Test First (após aprovação)
- Escreva testes baseados nos criteria
- Confirme que falham

### 5. Implement
- Código mínimo para passar testes
- Commits incrementais

### 6. Validate
- Todos testes passando
- Lint sem erros
- Types sem erros

### 7. Finalize
- Atualize documentação se necessário
- Crie PR com descrição detalhada
```

### 4.3 Subagents (Delegação de Tarefas)

Subagents executam tarefas em **contextos isolados**, preservando o contexto principal.

| Tipo | Comando | Uso | Benefício |
|------|---------|-----|-----------|
| **Explore** | Plan Mode | Investigação read-only | Não polui contexto principal |
| **Task** | `Task(...)` | Execução paralela | Múltiplas tarefas simultâneas |
| **Research** | Subagent de pesquisa | Busca de informações | Contexto isolado de investigação |
| **Review** | Subagent de review | Code review independente | Análise imparcial |

#### Quando usar Subagents:

```
✅ Use Subagents para:
- Investigar código antes de modificar
- Pesquisar documentação externa
- Executar tarefas em paralelo
- Code review independente
- Análise de logs extensos

❌ Evite Subagents para:
- Tarefas simples e rápidas
- Quando precisa do contexto principal
- Edições que dependem de estado atual
```

#### Exemplo de prompt com Subagent:

```
Antes de implementar a feature de autenticação:

1. Use um subagent Explore para:
   - Analisar como auth funciona atualmente
   - Listar todos arquivos relacionados
   - Identificar padrões existentes

2. Compile os findings em um resumo
3. Só então proponha o plano de implementação
```

### 4.4 Skills (Conhecimento Reutilizável)

Skills são pacotes de conhecimento procedural que Claude carrega **automaticamente quando relevante**.

#### Estrutura de uma Skill:

```
.claude/skills/
└── testing-patterns/
    ├── SKILL.md           # Arquivo principal
    ├── examples/          # Exemplos de código
    │   ├── unit-test.ts
    │   └── integration-test.ts
    └── templates/         # Templates reutilizáveis
        └── test-template.ts
```

#### Exemplo: SKILL.md

```markdown
---
name: testing-patterns
description: |
  Padrões de teste Jest para este projeto.
  Use quando: escrevendo testes, criando mocks, seguindo TDD.
  Triggers: "test", "jest", "mock", "TDD", "coverage"
allowed-tools: Read, Grep, Bash(npm:*)
---

# Testing Patterns

## Quando Usar
- Ao escrever novos testes
- Ao criar mocks e stubs
- Ao seguir workflow TDD
- Ao debuggar testes falhando

## Estrutura Padrão

```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Reset state
  });

  describe('methodName', () => {
    it('should do X when Y', () => {
      // Arrange
      const input = createTestInput();
      
      // Act
      const result = component.method(input);
      
      // Assert
      expect(result).toEqual(expected);
    });

    it('should throw when invalid input', () => {
      expect(() => component.method(null))
        .toThrow('Invalid input');
    });
  });
});
```

## Mocking Patterns

```typescript
// Mock de módulo
jest.mock('../services/api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: 1, name: 'Test' })
}));

// Mock de função
const mockCallback = jest.fn();
mockCallback.mockReturnValue(42);
```

## Coverage Requirements
- Mínimo 80% global
- 100% para código crítico (auth, payments)
- Ignore arquivos de config
```

#### Diferença entre Commands e Skills:

| Aspecto | Slash Commands | Skills |
|---------|----------------|--------|
| **Invocação** | Manual (`/comando`) | Automática (por contexto) |
| **Propósito** | Workflows específicos | Conhecimento reutilizável |
| **Estrutura** | Arquivo único | Diretório com recursos |
| **Trigger** | Usuário digita | Claude decide |

---

## 5. Fullstack & DevOps (Desenvolvimento, Testes, Deploy)

### 5.1 Test-Driven Development (TDD) com IA

TDD se torna ainda mais poderoso com agentes de IA porque fornece **alvos claros e verificáveis** para iteração.

#### Workflow TDD com Claude:

```
┌──────────────────────────────────────────────────────────────┐
│  1. RED: Peça testes baseados em input/output esperado       │
│     "Escreva testes para UserService.create() que deve..."   │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  2. CONFIRME FALHA: Rode testes e confirme que falham        │
│     "Rode os testes e confirme que falham pelos motivos      │
│      certos (não por erro de sintaxe)"                       │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  3. COMMIT TESTES: Commite os testes aprovados               │
│     "Commite os testes com mensagem: test: add UserService   │
│      creation tests"                                         │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  4. GREEN: Peça código que passe nos testes                  │
│     "Implemente UserService.create() para passar nos testes. │
│      NÃO modifique os testes."                               │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  5. REFACTOR: Melhore mantendo testes passando               │
│     "Refatore o código para melhor legibilidade mantendo     │
│      todos os testes passando"                               │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  6. COMMIT CÓDIGO: Commite a implementação                   │
│     "Commite com mensagem: feat: implement UserService       │
│      creation"                                               │
└──────────────────────────────────────────────────────────────┘
```

#### Prompt para TDD:

```markdown
Vamos implementar a feature de reset de senha usando TDD.

## Requisitos:
- Usuário solicita reset com email
- Sistema gera token válido por 1 hora
- Email é enviado com link
- Usuário define nova senha com token válido

## Regras TDD:
1. Escreva APENAS testes primeiro
2. Não escreva implementação ainda
3. Cubra casos de sucesso E falha
4. Inclua edge cases (token expirado, email inválido)

Comece pelos testes.
```

### 5.2 Integração Contínua com Claude

Configure GitHub Actions para automação:

#### .github/workflows/claude-review.yml

```yaml
name: Claude PR Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Claude Code Review
        uses: anthropics/claude-code-action@v1
        with:
          prompt: |
            Revise este PR focando em:
            1. Bugs potenciais
            2. Problemas de segurança
            3. Performance
            4. Aderência aos padrões do projeto
            
            Seja construtivo e específico.
```

#### Automações Recomendadas:

| Automação | Trigger | Ação |
|-----------|---------|------|
| **PR Review** | PR aberto/atualizado | Claude revisa código |
| **Issue Triage** | Issue criada | Classifica e adiciona labels |
| **Changelog** | Release tag | Gera changelog automático |
| **Docs Update** | Merge em main | Atualiza documentação |

### 5.3 Deploy e Ambientes

| Ambiente | Recomendação | Considerações |
|----------|--------------|---------------|
| **Desenvolvimento** | Docker Dev Containers | Isola ambiente, reproduzível |
| **Staging** | Preview Deployments | Testes de integração, QA |
| **Produção** | CI/CD Pipeline | Aprovação manual obrigatória |

#### Docker Dev Container para Claude Code:

```dockerfile
# .devcontainer/Dockerfile
FROM mcr.microsoft.com/devcontainers/javascript-node:20

# Instalar dependências
RUN npm install -g claude-code

# Configurar ambiente
ENV ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}

# Sem acesso à internet (segurança)
# Use --network none ao rodar
```

#### Comando seguro para YOLO mode:

```bash
# Rodar Claude em container isolado sem internet
docker run --network none -v $(pwd):/workspace \
  claude-dev claude --dangerously-skip-permissions
```

---

## 6. Registro e Histórico (Aprimorar Contexto da IA)

### 6.1 Session Logs e Memory Bank

Mantenha histórico de sessões para melhorar contexto em sessões futuras:

```
.claude/sessions/
├── SESSION_001_2025-01-20_feature-auth.md
├── SESSION_002_2025-01-21_bugfix-api.md
├── SESSION_003_2025-01-22_refactor-db.md
└── CURRENT_SESSION.md
```

#### Template de Session Log:

```markdown
# Sessão: 003 - Refatoração do Banco de Dados
**Data**: 2025-01-22
**Duração**: ~2 horas
**Branch**: refactor/database-optimization

## Objetivo
Otimizar queries lentas identificadas no monitoring.

## Contexto Inicial
- Query `/api/users` levando 3.2s
- Índices não otimizados
- N+1 queries em relacionamentos

## Decisões Tomadas
1. ✅ Adicionar índice composto em `users(email, status)`
2. ✅ Implementar eager loading para relacionamentos
3. ❌ Descartado: Denormalização (complexidade não justifica)

## Problemas Encontrados
- Migration falhou por lock na tabela
  - **Solução**: Rodar em horário de baixo uso
- Testes de integração quebraram
  - **Solução**: Atualizar fixtures com novos índices

## Resultados
- Query reduzida de 3.2s para 180ms
- Coverage mantido em 85%

## Próximos Passos
- [ ] Monitorar performance em produção
- [ ] Aplicar padrão similar em `/api/orders`

## Arquivos Modificados
- `src/models/User.ts`
- `src/repositories/UserRepository.ts`
- `migrations/20250122_add_user_indexes.ts`
- `tests/integration/users.test.ts`
```

### 6.2 Error Tracking e Correções

Documente erros e correções para evitar repetição:

```
docs/
├── ERRORS.md          # Log de erros encontrados
├── FIXES.md           # Correções aplicadas
├── PATTERNS.md        # Padrões que funcionam
└── ANTI-PATTERNS.md   # O que evitar
```

#### Exemplo: ERRORS.md

```markdown
# Error Log

## ERR-001: TypeScript strict null checks
**Data**: 2025-01-15
**Erro**: `Object is possibly 'undefined'`
**Contexto**: Acesso a propriedades opcionais sem verificação
**Solução**: Usar optional chaining (`?.`) ou type guards
**Referência**: [FIXES.md#FIX-001](./FIXES.md#fix-001)

---

## ERR-002: React hydration mismatch
**Data**: 2025-01-18
**Erro**: `Hydration failed because the initial UI does not match`
**Contexto**: Componente usa `Date.now()` no render
**Solução**: Mover lógica de data para useEffect
**Referência**: [FIXES.md#FIX-002](./FIXES.md#fix-002)
```

#### Exemplo: ANTI-PATTERNS.md

```markdown
# Anti-Patterns - O que NÃO fazer

## ❌ AP-001: Fetch em render
```typescript
// ERRADO
function Component() {
  const [data, setData] = useState(null);
  fetch('/api/data').then(r => r.json()).then(setData); // 🚫
  return <div>{data}</div>;
}

// CORRETO
function Component() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);
  return <div>{data}</div>;
}
```

## ❌ AP-002: any ao invés de unknown
```typescript
// ERRADO
function parse(input: any) { // 🚫
  return input.data;
}

// CORRETO
function parse(input: unknown) {
  if (isValidInput(input)) {
    return input.data;
  }
  throw new Error('Invalid input');
}
```
```

### 6.3 Aprimoramento Contínuo do CLAUDE.md

Use o comando `#` durante o trabalho para adicionar instruções:

```bash
# Durante uma sessão, ao descobrir algo importante:
> # sempre rode npm test antes de commitar
> # API de pagamento requer timeout de 30s
> # não use barrel exports em src/components
```

Essas instruções são automaticamente adicionadas ao CLAUDE.md.

#### Ciclo de Melhoria:

```
Sessão de trabalho
       │
       ▼
┌─────────────────┐
│ Problema/Erro   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Solução encontr.│ ──▶ │ Documentar em   │
└────────┬────────┘     │ ERRORS/FIXES.md │
         │              └─────────────────┘
         ▼
┌─────────────────┐
│ É recorrente?   │
└────────┬────────┘
         │ Sim
         ▼
┌─────────────────┐
│ Adicionar ao    │
│ CLAUDE.md com # │
└─────────────────┘
```

---

## 7. Custos (Tokens e Infraestrutura)

### 7.1 Otimização de Consumo de Tokens

| Estratégia | Economia | Como Implementar |
|------------|----------|------------------|
| **Contexto Conciso** | 30-50% | CLAUDE.md < 300 linhas |
| **Usar /clear** | 20-30% | Entre tarefas independentes |
| **Subagents para pesquisa** | 40-60% | Isola contexto de investigação |
| **Model Selection** | 50-80% | Sonnet para tarefas simples |
| **Prompt Caching** | 75% | Instruções estáticas no início |

#### Dicas Práticas:

```markdown
✅ FAÇA:
- Limpe contexto com /clear entre tarefas
- Use subagents para investigação
- Mantenha diffs < 200 linhas
- Seja específico nos prompts
- Use Haiku para tarefas triviais

❌ EVITE:
- CLAUDE.md com mais de 300 linhas
- Contexto irrelevante nas mensagens
- Pedir "melhore o código" sem especificar
- Rodar sem /clear por horas
- Opus para tarefas simples
```

### 7.2 Comparativo de Custos por Modelo

| Modelo | Input (1M tokens) | Output (1M tokens) | Uso Recomendado |
|--------|-------------------|--------------------|-----------------| 
| **Claude Opus 4.5** | $15.00 | $75.00 | Arquitetura, decisões críticas |
| **Claude Sonnet 4.5** | $3.00 | $15.00 | Desenvolvimento geral, features |
| **Claude Haiku 4.5** | $0.25 | $1.25 | Scripts, formatação, tarefas simples |

### 7.3 Estimativa de Custos por Projeto

#### Fórmula:
```
Custo Mensal = (Tokens Input × Preço/1M) + (Tokens Output × Preço/1M)
```

#### Cenários Típicos (usando Sonnet):

| Cenário | Tokens Input/dia | Tokens Output/dia | Custo Mensal |
|---------|------------------|-------------------|--------------|
| **Desenvolvedor Solo** | 200K | 50K | ~$25 |
| **Projeto Médio** | 500K | 100K | ~$66 |
| **Time Ativo (5 devs)** | 2M | 400K | ~$264 |

#### Planos Claude (Alternativa):

| Plano | Preço | Benefício |
|-------|-------|-----------|
| **Claude Pro** | $20/mês | 5x mais uso que free |
| **Claude Max** | $100/mês | Uso ilimitado pessoal |
| **Claude Team** | $30/usuário/mês | 5x mais que Pro, colaboração |

### 7.4 Custos de Infraestrutura

| Componente | Cloud (AWS/GCP) | On-Premise |
|------------|-----------------|------------|
| **Compute** | $50-500/mês | Hardware inicial + energia |
| **Storage** | $20-100/mês | SSDs + backup |
| **CI/CD** | $0-50/mês | Servidor Jenkins/GitLab |
| **Monitoring** | $20-100/mês | Prometheus + Grafana |
| **Database** | $50-200/mês | PostgreSQL gerenciado |

#### ROI Estimado:

```
Sem IA:
- Desenvolvedor: 8h/dia × $50/h = $400/dia
- Feature média: 5 dias = $2.000

Com IA (30% mais produtivo):
- Feature média: 3.5 dias = $1.400
- Economia: $600/feature
- Custo IA: ~$100/mês

ROI em projeto com 10 features/mês:
- Economia: $6.000
- Custo IA: $100
- ROI: 5900% ✅
```

---

## 8. Como Iniciar um Projeto no Claude.ai

### 8.1 Checklist de Inicialização

```markdown
## Antes de Começar
- [ ] Definir PRD com requisitos claros
- [ ] Escolher stack tecnológico
- [ ] Criar repositório Git

## Setup Inicial
- [ ] `git init` e `.gitignore`
- [ ] Criar estrutura de pastas
- [ ] Executar `/init` no Claude Code
- [ ] Revisar e refinar CLAUDE.md gerado

## Configuração
- [ ] Adicionar comandos ao CLAUDE.md
- [ ] Criar slash commands para workflows
- [ ] Configurar MCP servers se necessário
- [ ] Definir permissões em settings.json

## Documentação
- [ ] Criar docs/PRD.md
- [ ] Criar docs/ARCHITECTURE.md
- [ ] Setup de ADRs

## Verificação
- [ ] Testar /init funcionou
- [ ] Testar slash commands
- [ ] Confirmar .gitignore correto
```

### 8.2 Primeiro Prompt - Template

```markdown
# Contexto do Projeto

[Descreva o projeto em 2-3 parágrafos claros. O que é, para quem,
qual problema resolve.]

# Objetivo desta Sessão

[O que você quer alcançar HOJE. Seja específico.]

# Restrições

- Stack: [tecnologias específicas]
- Padrões: [convenções a seguir]
- Evitar: [o que não usar/fazer]

# Pedido

Antes de começar a codificar:

1. **Leia** os arquivos relevantes para entender o contexto atual
2. **Crie um plano** detalhado (use "think hard")
3. **Aguarde** minha aprovação do plano
4. **Só então** implemente em pequenos passos

Comece pelo passo 1.
```

### 8.3 Exemplo Completo de Início

```markdown
# Contexto do Projeto

Estou criando um sistema de gestão de tarefas para equipes pequenas.
O sistema deve permitir criar projetos, adicionar tarefas com prazos,
atribuir responsáveis e acompanhar progresso. Será uma aplicação web
com API REST.

# Stack Definido

- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- Backend: Node.js + Express + Prisma
- Database: PostgreSQL
- Auth: NextAuth.js com Google OAuth
- Deploy: Vercel (frontend) + Railway (backend)

# Objetivo desta Sessão

Configurar o projeto inicial com:
- Estrutura de pastas
- Configuração do TypeScript
- Setup do Prisma com modelo básico de User
- Primeiro endpoint de health check

# Restrições

- Seguir padrões do Next.js App Router
- TypeScript strict mode
- ESLint + Prettier configurados
- Testes com Jest desde o início

# Pedido

1. Primeiro, analise a estrutura típica de projetos Next.js 14 
   com App Router
2. Proponha uma estrutura de pastas para este projeto
3. Aguarde minha aprovação
4. Então configure passo a passo

Think hard sobre a melhor estrutura antes de propor.
```

### 8.4 Melhores Práticas de Uso Diário

#### ✅ FAÇA:

| Prática | Por quê |
|---------|---------|
| **Seja específico** | Instruções vagas geram código vago |
| **Use imagens** | Cole screenshots de mocks, erros, diagramas |
| **Corrija cedo** | Pressione `Escape` para interromper e redirecionar |
| **Use Tab completion** | `@` para mencionar arquivos rapidamente |
| **Mantenha diffs pequenos** | < 200 linhas por iteração |
| **Commite frequentemente** | Checkpoints permitem voltar atrás |
| **Use /clear** | Entre tarefas independentes |
| **Peça plano primeiro** | "Não codifique ainda, primeiro faça um plano" |

#### ❌ EVITE:

| Anti-Padrão | Consequência |
|-------------|--------------|
| Prompts vagos como "melhore isso" | Resultado imprevisível |
| Sessões longas sem /clear | Contexto poluído, erros |
| Pular direto para código | Soluções incompletas |
| Ignorar erros de lint/type | Dívida técnica acumula |
| Diffs gigantes (500+ linhas) | Difícil revisar, bugs ocultos |
| Não commitar por horas | Perde trabalho se der erro |

### 8.5 Recursos Adicionais

| Recurso | URL |
|---------|-----|
| **Documentação Oficial** | https://claude.ai/code |
| **Best Practices Anthropic** | anthropic.com/engineering/claude-code-best-practices |
| **GitHub Spec-Kit** | github.com/github/spec-kit |
| **Awesome Claude Code** | github.com/hesreallyhim/awesome-claude-code |
| **MCP Servers** | github.com/modelcontextprotocol/servers |

---

## Resumo Executivo

### Os 7 Princípios Fundamentais

1. **Plan Before Execute** - Sempre planejar antes de codificar
2. **Context is King** - CLAUDE.md conciso e relevante
3. **TDD with AI** - Testes primeiro, código depois
4. **Small Diffs** - Mudanças incrementais < 200 linhas
5. **Clear Often** - /clear entre tarefas independentes
6. **Document Everything** - Erros, fixes, decisões
7. **Optimize Costs** - Modelo certo para cada tarefa

### Quick Reference

```bash
# Iniciar projeto
cd my-project && claude
/init

# Workflow diário
/clear                          # Limpar contexto
"Leia X e faça plano para Y"    # Research + Plan
"think hard"                    # Extended thinking
"Implemente passo 1"            # Execute
"Rode testes"                   # Validate
"Commite"                       # Commit

# Comandos úteis
/project:fix-issue 123          # Slash command customizado
claude --resume                 # Retomar sessão
Escape                          # Interromper e redirecionar
#                               # Adicionar ao CLAUDE.md
```

---

> **Documento criado por CESCOTECH**  
> Versão 1.0 - Janeiro 2025  
> Baseado em pesquisa das melhores práticas de desenvolvimento com IA
