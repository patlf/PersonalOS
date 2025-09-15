#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running Comprehensive Test Suite\n');

const results = {
  unit: { passed: 0, failed: 0, coverage: 0 },
  integration: { passed: 0, failed: 0 },
  e2e: { passed: 0, failed: 0 },
  visual: { passed: 0, failed: 0 },
  accessibility: { passed: 0, failed: 0 },
  performance: { passed: 0, failed: 0 },
};

// Helper function to run command and capture output
function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} completed successfully\n`);
    return { success: true, output };
  } catch (error) {
    console.log(`❌ ${description} failed\n`);
    console.log(error.stdout || error.message);
    return { success: false, output: error.stdout || error.message };
  }
}

// Run Unit Tests
console.log('1️⃣ Running Unit Tests');
const unitResult = runCommand('npm run test:run', 'Unit Tests');
if (unitResult.success) {
  // Parse coverage from output
  const coverageMatch = unitResult.output.match(/All files\s+\|\s+([\d.]+)/);
  if (coverageMatch) {
    results.unit.coverage = parseFloat(coverageMatch[1]);
  }
  
  // Parse test results
  const testMatch = unitResult.output.match(/(\d+) passed/);
  if (testMatch) {
    results.unit.passed = parseInt(testMatch[1]);
  }
  
  const failMatch = unitResult.output.match(/(\d+) failed/);
  if (failMatch) {
    results.unit.failed = parseInt(failMatch[1]);
  }
}

// Run Integration Tests
console.log('2️⃣ Running Integration Tests');
const integrationResult = runCommand('npm run test:integration', 'Integration Tests');
if (integrationResult.success) {
  const testMatch = integrationResult.output.match(/(\d+) passed/);
  if (testMatch) {
    results.integration.passed = parseInt(testMatch[1]);
  }
  
  const failMatch = integrationResult.output.match(/(\d+) failed/);
  if (failMatch) {
    results.integration.failed = parseInt(failMatch[1]);
  }
}

// Check if development server is running
console.log('3️⃣ Checking Development Server');
try {
  execSync('curl -f http://localhost:3000 > /dev/null 2>&1');
  console.log('✅ Development server is running\n');
} catch (error) {
  console.log('⚠️  Development server not running, starting it...');
  console.log('Please run "npm run dev" in another terminal and then run this script again.\n');
  process.exit(1);
}

// Run E2E Tests
console.log('4️⃣ Running End-to-End Tests');
const e2eResult = runCommand('npx playwright test --reporter=line', 'E2E Tests');
if (e2eResult.success) {
  const testMatch = e2eResult.output.match(/(\d+) passed/);
  if (testMatch) {
    results.e2e.passed = parseInt(testMatch[1]);
  }
  
  const failMatch = e2eResult.output.match(/(\d+) failed/);
  if (failMatch) {
    results.e2e.failed = parseInt(failMatch[1]);
  }
}

// Run Visual Regression Tests
console.log('5️⃣ Running Visual Regression Tests');
const visualResult = runCommand('npx playwright test e2e/visual-regression.spec.ts --reporter=line', 'Visual Regression Tests');
if (visualResult.success) {
  const testMatch = visualResult.output.match(/(\d+) passed/);
  if (testMatch) {
    results.visual.passed = parseInt(testMatch[1]);
  }
  
  const failMatch = visualResult.output.match(/(\d+) failed/);
  if (failMatch) {
    results.visual.failed = parseInt(failMatch[1]);
  }
}

// Run Accessibility Tests
console.log('6️⃣ Running Accessibility Tests');
const accessibilityResult = runCommand('npx playwright test e2e/accessibility.spec.ts --reporter=line', 'Accessibility Tests');
if (accessibilityResult.success) {
  const testMatch = accessibilityResult.output.match(/(\d+) passed/);
  if (testMatch) {
    results.accessibility.passed = parseInt(testMatch[1]);
  }
  
  const failMatch = accessibilityResult.output.match(/(\d+) failed/);
  if (failMatch) {
    results.accessibility.failed = parseInt(failMatch[1]);
  }
}

// Run Performance Tests
console.log('7️⃣ Running Performance Tests');
const performanceResult = runCommand('npx playwright test e2e/performance.spec.ts --reporter=line', 'Performance Tests');
if (performanceResult.success) {
  const testMatch = performanceResult.output.match(/(\d+) passed/);
  if (testMatch) {
    results.performance.passed = parseInt(testMatch[1]);
  }
  
  const failMatch = performanceResult.output.match(/(\d+) failed/);
  if (failMatch) {
    results.performance.failed = parseInt(failMatch[1]);
  }
}

// Generate Summary Report
console.log('\n📊 Test Summary Report');
console.log('='.repeat(50));

const totalPassed = Object.values(results).reduce((sum, result) => sum + result.passed, 0);
const totalFailed = Object.values(results).reduce((sum, result) => sum + result.failed, 0);
const totalTests = totalPassed + totalFailed;

console.log(`\n📈 Overall Results:`);
console.log(`   Total Tests: ${totalTests}`);
console.log(`   Passed: ${totalPassed} (${totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0}%)`);
console.log(`   Failed: ${totalFailed} (${totalTests > 0 ? Math.round((totalFailed / totalTests) * 100) : 0}%)`);

console.log(`\n🧪 Test Type Breakdown:`);
console.log(`   Unit Tests:        ${results.unit.passed}/${results.unit.passed + results.unit.failed} (Coverage: ${results.unit.coverage}%)`);
console.log(`   Integration Tests: ${results.integration.passed}/${results.integration.passed + results.integration.failed}`);
console.log(`   E2E Tests:         ${results.e2e.passed}/${results.e2e.passed + results.e2e.failed}`);
console.log(`   Visual Tests:      ${results.visual.passed}/${results.visual.passed + results.visual.failed}`);
console.log(`   Accessibility:     ${results.accessibility.passed}/${results.accessibility.passed + results.accessibility.failed}`);
console.log(`   Performance:       ${results.performance.passed}/${results.performance.passed + results.performance.failed}`);

// Coverage Analysis
console.log(`\n📋 Coverage Analysis:`);
if (results.unit.coverage >= 80) {
  console.log(`   ✅ Coverage target met: ${results.unit.coverage}% (≥80%)`);
} else {
  console.log(`   ❌ Coverage below target: ${results.unit.coverage}% (<80%)`);
}

// Quality Gates
console.log(`\n🚪 Quality Gates:`);
const qualityGates = [
  { name: 'Unit Test Coverage', passed: results.unit.coverage >= 80 },
  { name: 'No Failing Unit Tests', passed: results.unit.failed === 0 },
  { name: 'No Failing E2E Tests', passed: results.e2e.failed === 0 },
  { name: 'Accessibility Compliance', passed: results.accessibility.failed === 0 },
  { name: 'Performance Standards', passed: results.performance.failed === 0 },
];

qualityGates.forEach(gate => {
  console.log(`   ${gate.passed ? '✅' : '❌'} ${gate.name}`);
});

const allGatesPassed = qualityGates.every(gate => gate.passed);

console.log(`\n🎯 Overall Status: ${allGatesPassed ? '✅ PASSED' : '❌ FAILED'}`);

// Generate JSON report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalTests,
    totalPassed,
    totalFailed,
    successRate: totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0,
  },
  results,
  qualityGates: qualityGates.reduce((acc, gate) => {
    acc[gate.name] = gate.passed;
    return acc;
  }, {}),
  overallStatus: allGatesPassed ? 'PASSED' : 'FAILED',
};

// Save report
const reportPath = path.join(__dirname, '..', 'test-results', 'summary.json');
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n📄 Detailed report saved to: ${reportPath}`);

// Exit with appropriate code
process.exit(allGatesPassed ? 0 : 1);