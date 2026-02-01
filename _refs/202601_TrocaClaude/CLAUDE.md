# Claude Code Instructions

## Project Overview
Este é um template para projetos de agentes de IA implementando as melhores práticas de desenvolvimento.

## Package Manager
- Usar **npm** como gerenciador de pacotes para todos os projetos

## Code Standards
- TypeScript para todo código fonte
- ESLint + Prettier para formatação
- Jest para testes
- Zod para validação de schemas

## Project Structure
```
src/           # Código fonte TypeScript
tests/         # Testes (unit, integration, evaluation)
docs/          # Documentação dos 5 pilares
scripts/       # Scripts utilitários
.claude/       # Configuração Claude Code
```

## Security Guidelines
- NUNCA modificar bases de dados de produção sem permissão explícita
- NUNCA commitar secrets ou API keys
- Sempre validar inputs antes de processar
- Seguir OWASP Top 10 guidelines

## AI Development Guidelines
- Documentar todos os prompts em `/src/prompts/`
- Rastrear uso de tokens para análise de custos
- Executar suíte de avaliação antes do deploy
- Seguir o padrão Plan-and-Execute para otimização de custos

## Important Files
- `docs/product/PRD_TEMPLATE.md` - Template de PRD
- `docs/architecture/PATTERNS.md` - Padrões de arquitetura
- `docs/architecture/DECISION_FRAMEWORK.md` - Framework de decisão
- `docs/cost/FINOPS_FRAMEWORK.md` - Gestão de custos
- `docs/management/METHODOLOGY.md` - Metodologia MAISTRO

## Available Commands
- `/review-prd` - Revisar um documento PRD
- `/estimate-cost` - Estimar custos de inferência
- `/run-tests` - Executar suíte de testes
- `/deploy-check` - Verificar prontidão para deploy
- `/generate-adr` - Gerar Architecture Decision Record

## Available Agents
Subagentes especializados disponíveis:
- `architect` - Decisões de arquitetura e padrões
- `product-owner` - Requisitos de produto e PRDs
- `qa-engineer` - Estratégia de testes e qualidade
- `cost-analyst` - Otimização de custos e FinOps
- `devops` - Deploy, MLOps e infraestrutura

## Common Tasks

### Antes de iniciar desenvolvimento
1. Ler PRD relevante em `docs/product/`
2. Verificar ADRs existentes em `docs/architecture/adr/`
3. Revisar métricas de sucesso esperadas

### Ao criar novo agente
1. Usar template em `docs/product/PRD_TEMPLATE.md`
2. Definir métricas usando `docs/product/SUCCESS_METRICS.md`
3. Avaliar arquitetura com `docs/architecture/DECISION_FRAMEWORK.md`

### Antes de deploy
1. Executar `/deploy-check`
2. Verificar custos com `/estimate-cost`
3. Revisar checklist em `docs/management/DEPLOYMENT_CHECKLIST.md`

## Testing Requirements
- Testes unitários para todas as funções
- Testes de integração para fluxos principais
- Testes de avaliação para qualidade do agente:
  - Accuracy > 95%
  - Latency P95 < 3s
  - Handoff rate < 10%

## Cost Awareness
- Preferir modelos menores quando possível (Haiku < Sonnet < Opus)
- Implementar caching para prompts repetitivos
- Usar batching para requisições similares
- Monitorar custo por inferência como KPI principal
