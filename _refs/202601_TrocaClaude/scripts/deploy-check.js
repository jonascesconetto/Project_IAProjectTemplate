#!/usr/bin/env node

/**
 * Deploy Readiness Check
 *
 * Verifies that all quality gates are met before deployment.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const checks = {
  passed: [],
  failed: [],
  warnings: [],
};

function runCheck(name, fn) {
  try {
    const result = fn();
    if (result.passed) {
      checks.passed.push({ name, details: result.details });
      console.log(`✅ ${name}: ${result.details}`);
    } else if (result.warning) {
      checks.warnings.push({ name, details: result.details });
      console.log(`⚠️  ${name}: ${result.details}`);
    } else {
      checks.failed.push({ name, details: result.details });
      console.log(`❌ ${name}: ${result.details}`);
    }
  } catch (error) {
    checks.failed.push({ name, details: error.message });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

// Check 1: Package.json exists
runCheck('Package.json', () => {
  const exists = fs.existsSync(path.join(process.cwd(), 'package.json'));
  return { passed: exists, details: exists ? 'Found' : 'Not found' };
});

// Check 2: Dependencies installed
runCheck('Dependencies', () => {
  const nodeModules = fs.existsSync(path.join(process.cwd(), 'node_modules'));
  return {
    passed: nodeModules,
    details: nodeModules ? 'Installed' : 'Run npm install',
  };
});

// Check 3: TypeScript compiles
runCheck('TypeScript', () => {
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    return { passed: true, details: 'Compiles successfully' };
  } catch {
    return { passed: false, details: 'Compilation errors' };
  }
});

// Check 4: Lint passes
runCheck('Linting', () => {
  try {
    execSync('npm run lint 2>/dev/null', { stdio: 'pipe' });
    return { passed: true, details: 'No lint errors' };
  } catch {
    return { passed: false, details: 'Lint errors found' };
  }
});

// Check 5: Tests pass
runCheck('Tests', () => {
  try {
    execSync('npm test 2>/dev/null', { stdio: 'pipe' });
    return { passed: true, details: 'All tests passing' };
  } catch {
    return { passed: false, details: 'Test failures' };
  }
});

// Check 6: Environment file
runCheck('Environment', () => {
  const envExample = fs.existsSync(path.join(process.cwd(), '.env.example'));
  return {
    passed: envExample,
    details: envExample ? '.env.example found' : '.env.example missing',
  };
});

// Check 7: Documentation
runCheck('Documentation', () => {
  const readme = fs.existsSync(path.join(process.cwd(), 'README.md'));
  const claudeMd = fs.existsSync(path.join(process.cwd(), 'CLAUDE.md'));
  const both = readme && claudeMd;
  return {
    passed: both,
    details: both ? 'README.md and CLAUDE.md found' : 'Documentation incomplete',
  };
});

// Check 8: No hardcoded secrets (basic check)
runCheck('Secrets', () => {
  const srcDir = path.join(process.cwd(), 'src');
  if (!fs.existsSync(srcDir)) {
    return { passed: true, details: 'No src directory to check' };
  }

  try {
    const result = execSync(
      `grep -r "api_key\\|password\\|secret" ${srcDir} --include="*.ts" 2>/dev/null || true`,
      { encoding: 'utf-8' }
    );
    const hasSecrets = result.trim().length > 0;
    return {
      passed: !hasSecrets,
      warning: hasSecrets,
      details: hasSecrets ? 'Potential secrets found - review manually' : 'No obvious secrets',
    };
  } catch {
    return { passed: true, details: 'Check passed' };
  }
});

// Summary
console.log('\n========================================');
console.log('Deploy Readiness Summary');
console.log('========================================\n');

console.log(`✅ Passed: ${checks.passed.length}`);
console.log(`⚠️  Warnings: ${checks.warnings.length}`);
console.log(`❌ Failed: ${checks.failed.length}`);

const ready = checks.failed.length === 0;
console.log(`\nStatus: ${ready ? '✅ READY TO DEPLOY' : '❌ NOT READY'}`);

if (checks.failed.length > 0) {
  console.log('\nBlockers:');
  checks.failed.forEach((c) => console.log(`  - ${c.name}: ${c.details}`));
}

if (checks.warnings.length > 0) {
  console.log('\nWarnings (non-blocking):');
  checks.warnings.forEach((c) => console.log(`  - ${c.name}: ${c.details}`));
}

process.exit(ready ? 0 : 1);
