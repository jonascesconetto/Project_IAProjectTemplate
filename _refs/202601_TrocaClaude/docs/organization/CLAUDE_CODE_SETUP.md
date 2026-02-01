# Claude Code Setup Guide

Guia completo de configuração do Claude Code para o projeto.

## Estrutura de Arquivos

```
.claude/
├── settings.local.json    # Configurações locais
├── commands/              # Slash commands personalizados
│   ├── review-prd.md
│   ├── estimate-cost.md
│   ├── run-tests.md
│   ├── deploy-check.md
│   └── generate-adr.md
├── agents/                # Subagentes especializados
│   ├── architect.md
│   ├── product-owner.md
│   ├── qa-engineer.md
│   ├── cost-analyst.md
│   └── devops.md
└── hooks/                 # Scripts de automação
```

## Arquivos de Configuração

### CLAUDE.md (Raiz do Projeto)

```markdown
# Claude Code Instructions

## Project Overview
[Descrição do projeto]

## Code Standards
- [Padrão 1]
- [Padrão 2]

## Security Guidelines
- [Guideline 1]
- [Guideline 2]

## Available Commands
- /command1 - Descrição
- /command2 - Descrição

## Available Agents
- agent1: Descrição
- agent2: Descrição

## Important Files
- path/to/file1.md
- path/to/file2.md
```

### settings.local.json

```json
{
  "permissions": {
    "allow": [
      "WebSearch",
      "Bash(npm:*)",
      "Bash(git:*)",
      "Bash(tree:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(sudo:*)"
    ]
  },
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

---

## Slash Commands

### Criando um Command

**Localização**: `.claude/commands/[nome-do-comando].md`

**Formato**:
```markdown
# /command-name

Descrição do que o comando faz.

## Usage
\`\`\`
/command-name [argumentos]
\`\`\`

## Instructions

1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

## Output Format
[Descrever formato esperado de output]
```

### Exemplo: /review-prd

```markdown
# /review-prd

Review a Product Requirements Document for completeness.

## Usage
\`\`\`
/review-prd [path-to-prd]
\`\`\`

## Instructions

1. Read the PRD file specified
2. Evaluate against checklist:
   - [ ] Clear problem statement
   - [ ] Success metrics defined
   - [ ] User stories with acceptance criteria
   - [ ] Safety considerations

3. Generate review report with:
   - Overall score (1-10)
   - Missing sections
   - Recommendations
```

---

## Subagentes

### Criando um Subagente

**Localização**: `.claude/agents/[nome-do-agente].md`

**Formato com Frontmatter**:
```markdown
---
name: agent-name
description: Quando usar este agente
model: sonnet
tools:
  - Read
  - Grep
  - Glob
disallowedTools:
  - Edit
  - Write
---

# Agent Name

## Role
[Descrição do papel do agente]

## Capabilities
- [Capability 1]
- [Capability 2]

## Context
[Contexto que o agente tem acesso]

## Guidelines
1. [Guideline 1]
2. [Guideline 2]

## Response Format
[Como o agente deve formatar respostas]
```

### Exemplo: architect

```markdown
---
name: architect
description: Use for architecture decisions and system design
model: sonnet
tools:
  - Read
  - Grep
  - Glob
  - WebSearch
---

# Architect Agent

## Role
Especialista em arquitetura de software e design de sistemas.

## Capabilities
- Avaliar decisões de arquitetura
- Selecionar padrões apropriados
- Analisar trade-offs
- Criar ADRs

## Context
Você tem acesso a:
- docs/architecture/DECISION_FRAMEWORK.md
- docs/architecture/PATTERNS.md
- docs/architecture/adr/

## Guidelines
1. Sempre começar pelo decision framework
2. Considerar implicações de custo
3. Preferir arquiteturas simples
4. Documentar decisões em ADRs

## Response Format
1. Resumo da recomendação
2. Análise do decision framework
3. Trade-offs
4. Draft de ADR (se decisão significativa)
```

---

## Hooks

### Configurando Hooks

**Localização**: `.claude/settings.json` ou `~/.claude/settings.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": {
          "toolName": "Edit"
        },
        "command": "node .claude/hooks/pre-edit.js"
      }
    ],
    "PostToolUse": [
      {
        "matcher": {
          "toolName": "Edit",
          "filePath": "*.ts"
        },
        "command": "npm run lint:fix"
      }
    ]
  }
}
```

### Tipos de Hooks

| Hook | Descrição | Uso Comum |
|------|-----------|-----------|
| PreToolUse | Antes de executar tool | Validação, bloqueio |
| PostToolUse | Após executar tool | Formatação, testes |
| PermissionRequest | Ao pedir permissão | Logging |
| UserPromptSubmit | Ao submeter prompt | Validação |
| Notification | Ao notificar | Alertas externos |
| Stop | Ao terminar resposta | Cleanup |

### Exemplo: Hook de Formatação

```javascript
// .claude/hooks/post-edit.js
const { execSync } = require('child_process');

// Receber input via stdin
let input = '';
process.stdin.on('data', (chunk) => input += chunk);
process.stdin.on('end', () => {
  const data = JSON.parse(input);

  if (data.tool_input?.file_path?.endsWith('.ts')) {
    try {
      execSync(`npx prettier --write "${data.tool_input.file_path}"`);
      console.log(JSON.stringify({ status: 'success' }));
    } catch (error) {
      console.log(JSON.stringify({ status: 'error', message: error.message }));
    }
  }
});
```

---

## MCP Servers

### Configurando MCP Servers

```bash
# Adicionar servidor HTTP
claude mcp add --transport http notion https://mcp.notion.com/mcp

# Adicionar servidor local
claude mcp add --transport stdio github -- npx -y @modelcontextprotocol/server-github
```

### Servers Recomendados

| Server | Descrição | Comando |
|--------|-----------|---------|
| GitHub | PRs, Issues | `npx -y @modelcontextprotocol/server-github` |
| Filesystem | Acesso a arquivos | `npx -y @modelcontextprotocol/server-filesystem` |
| Postgres | Queries SQL | `npx -y @modelcontextprotocol/server-postgres` |
| Sentry | Error tracking | `npx -y @modelcontextprotocol/server-sentry` |

---

## Permissões

### Níveis de Permissão

| Nível | Descrição |
|-------|-----------|
| allow | Permitido sem confirmação |
| ask | Pede confirmação do usuário |
| deny | Bloqueado |

### Configurando Permissões

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "WebSearch",
      "Bash(npm test:*)",
      "Bash(npm run lint:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(sudo:*)",
      "Bash(chmod:*)"
    ]
  }
}
```

---

## Checklist de Setup

### Inicial
- [ ] Criar `.claude/` directory
- [ ] Configurar `CLAUDE.md` na raiz
- [ ] Configurar `settings.local.json`
- [ ] Criar comandos essenciais
- [ ] Criar agentes especializados

### Avançado
- [ ] Configurar hooks de formatação
- [ ] Configurar MCP servers
- [ ] Definir permissões granulares
- [ ] Documentar para o time

### Manutenção
- [ ] Revisar comandos periodicamente
- [ ] Atualizar agentes conforme necessário
- [ ] Monitorar efetividade
- [ ] Coletar feedback do time
