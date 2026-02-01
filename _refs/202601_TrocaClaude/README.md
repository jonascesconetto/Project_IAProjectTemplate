# AI Project Template

Template completo para projetos de agentes de IA, cobrindo 5 pilares essenciais: **Produto**, **Gestão**, **Arquitetura**, **Organização** e **Custo**.

## Quick Start

```bash
# Clonar o template
git clone https://github.com/jonascesconetto/Project_IAProjectTemplate.git
cd Project_IAProjectTemplate

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar testes
npm test

# Iniciar desenvolvimento
npm run dev
```

## Estrutura do Projeto

```
├── docs/                    # Documentação completa
│   ├── product/            # Pilar 1: Requisitos e PRD
│   ├── management/         # Pilar 2: Gestão e ciclo de vida
│   ├── architecture/       # Pilar 3: Padrões e decisões
│   ├── organization/       # Pilar 4: Organização Claude Code
│   ├── cost/               # Pilar 5: FinOps e custos
│   ├── wiki/               # Base de conhecimento
│   └── logs/               # Changelogs e runbooks
│
├── .claude/                # Configuração Claude Code
│   ├── commands/           # Slash commands
│   ├── agents/             # Subagentes especializados
│   └── hooks/              # Automação
│
├── src/                    # Código fonte TypeScript
├── tests/                  # Testes (unit, integration, evaluation)
├── scripts/                # Scripts utilitários
└── .github/                # CI/CD workflows
```

## Os 5 Pilares

### 1. Produto
- Templates de PRD (Product Requirements Document)
- User stories e acceptance criteria
- Métricas de sucesso (KPIs)
- Safety e governance frameworks
- Context engineering

### 2. Gestão
- Framework MAISTRO (metodologia ágil para IA)
- Ciclo de desenvolvimento em 6 estágios
- Padrão Plan-and-Execute
- Estratégias de teste e validação
- Checklists de deployment

### 3. Arquitetura
- Framework de decisão single vs multi-agent
- 5 padrões de arquitetura documentados
- Architecture Decision Records (ADRs)
- Considerações de escalabilidade

### 4. Organização
- 5 slash commands pré-configurados
- 5 subagentes especializados
- CLAUDE.md e AGENTS.md configurados
- Guias de configuração completos

### 5. Custo
- Framework FinOps para IA
- Tracking de tokens
- Estratégias de otimização (até 90% redução)
- Avaliação cloud vs on-premise

## Slash Commands Disponíveis

| Comando | Descrição |
|---------|-----------|
| `/review-prd` | Revisar documento de requisitos |
| `/estimate-cost` | Estimar custos de inferência |
| `/run-tests` | Executar suíte de testes |
| `/deploy-check` | Verificar prontidão para deploy |
| `/generate-adr` | Gerar Architecture Decision Record |

## Subagentes Especializados

| Agente | Função |
|--------|--------|
| `architect` | Decisões de arquitetura |
| `product-owner` | Requisitos de produto |
| `qa-engineer` | Estratégia de testes |
| `cost-analyst` | Otimização de custos |
| `devops` | Deploy e MLOps |

## Scripts npm

```bash
# Desenvolvimento
npm run dev          # Iniciar em modo desenvolvimento
npm run build        # Build de produção
npm run start        # Executar build

# Testes
npm test             # Executar testes
npm run test:eval    # Testes de avaliação de IA
npm run test:coverage # Cobertura de testes

# Qualidade
npm run lint         # Verificar código
npm run format       # Formatar código

# Custos
npm run cost:daily   # Relatório diário
npm run cost:weekly  # Relatório semanal
npm run cost:monthly # Relatório mensal

# Deploy
npm run deploy:check # Verificar prontidão
npm run evaluate     # Executar avaliações
```

## Documentação

- [PRD Template](docs/product/PRD_TEMPLATE.md)
- [Metodologia MAISTRO](docs/management/METHODOLOGY.md)
- [Padrões de Arquitetura](docs/architecture/PATTERNS.md)
- [Framework FinOps](docs/cost/FINOPS_FRAMEWORK.md)
- [Guia de Configuração Claude Code](docs/organization/CLAUDE_CODE_SETUP.md)

## Licença

MIT
