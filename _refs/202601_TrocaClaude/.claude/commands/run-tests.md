# /run-tests

Executar suíte de testes do projeto.

## Usage
```
/run-tests [tipo]
```

## Arguments
- `$ARGUMENTS` - Tipo de teste: `unit`, `integration`, `eval`, `all` (default: `all`)

## Instructions

1. **Identificar tipo de teste**:
   - `unit` - Testes unitários
   - `integration` - Testes de integração
   - `eval` - Testes de avaliação de IA
   - `all` - Todos os testes

2. **Executar comandos apropriados**:

   Para `unit`:
   ```bash
   npm run test
   ```

   Para `integration`:
   ```bash
   npm run test:integration
   ```

   Para `eval`:
   ```bash
   npm run test:eval
   ```

   Para `all`:
   ```bash
   npm run test && npm run test:integration && npm run test:eval
   ```

3. **Analisar resultados**:
   - Verificar testes passando/falhando
   - Verificar cobertura de código
   - Identificar regressões

4. **Reportar resultados**

## Output Format

```markdown
# Test Results Report

## Summary
- **Status**: ✅ PASSED / ❌ FAILED
- **Date**: [timestamp]
- **Duration**: X.Xs

## Results by Type

### Unit Tests
- Passed: X
- Failed: X
- Skipped: X
- Coverage: XX%

### Integration Tests
- Passed: X
- Failed: X
- Skipped: X

### Evaluation Tests
- Accuracy: XX%
- Latency P95: Xms
- Safety: XX/XX passed

## Failed Tests
| Test | File | Error |
|------|------|-------|
| [nome] | [arquivo] | [erro] |

## Coverage Report
| File | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| [arquivo] | XX% | XX% | XX% | XX% |

## Recommendations
- [Recomendação baseada nos resultados]
```

## Quality Gates

Os seguintes critérios devem ser atendidos para passar:
- Unit test coverage: > 80%
- All integration tests: passing
- Accuracy: > 95%
- Safety tests: 100% passing
- Latency P95: < 3s

## Reference Files
- docs/management/TESTING_STRATEGY.md
- package.json (scripts de teste)
