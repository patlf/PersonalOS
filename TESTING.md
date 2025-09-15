# Testing Documentation

This document outlines the comprehensive testing strategy for the Productivity Platform.

## Test Types

### 1. Unit Tests
- **Location**: `src/**/__tests__/*.test.{ts,tsx}`
- **Purpose**: Test individual components, functions, and modules in isolation
- **Framework**: Vitest + React Testing Library
- **Coverage**: All components, hooks, utilities, and business logic

#### Running Unit Tests
```bash
npm run test              # Watch mode
npm run test:run          # Single run
npm run test:coverage     # With coverage report
```

### 2. Integration Tests
- **Location**: `src/**/*.integration.test.{ts,tsx}`
- **Purpose**: Test interactions between components and external services
- **Framework**: Vitest + React Testing Library + Prisma
- **Coverage**: API routes, database operations, component interactions

#### Running Integration Tests
```bash
npm run test:integration
```

### 3. End-to-End Tests
- **Location**: `e2e/*.spec.ts`
- **Purpose**: Test complete user workflows and critical paths
- **Framework**: Playwright
- **Coverage**: Task management flows, navigation, user interactions

#### Running E2E Tests
```bash
npm run test:e2e          # Headless mode
npm run test:e2e:ui       # Interactive UI mode
```

### 4. Visual Regression Tests
- **Location**: `e2e/visual-regression.spec.ts`
- **Purpose**: Detect unintended visual changes
- **Framework**: Playwright with screenshot comparison
- **Coverage**: All major UI states and responsive layouts

#### Running Visual Tests
```bash
npm run test:visual
```

### 5. Accessibility Tests
- **Location**: `e2e/accessibility.spec.ts`
- **Purpose**: Ensure WCAG compliance and keyboard navigation
- **Framework**: Playwright with accessibility testing
- **Coverage**: ARIA labels, keyboard navigation, screen reader support

#### Running Accessibility Tests
```bash
npm run test:accessibility
```

## Test Structure

### Unit Test Example
```typescript
describe('Component Name', () => {
  describe('Requirement X.Y: Description', () => {
    it('should behave as expected', () => {
      // Test implementation
    });
  });
});
```

### Integration Test Example
```typescript
describe('API Integration', () => {
  beforeEach(async () => {
    // Setup test data
  });

  it('should handle database operations', async () => {
    // Test database interactions
  });
});
```

### E2E Test Example
```typescript
test('should complete user workflow', async ({ page }) => {
  await page.goto('/tasks');
  // Test user interactions
});
```

## Coverage Requirements

### Minimum Coverage Thresholds
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports
- HTML report: `coverage/index.html`
- LCOV report: `coverage/lcov.info`
- JSON report: `coverage/coverage-final.json`

## Test Data Management

### Unit Tests
- Use mocked data and functions
- Mock external dependencies
- Focus on component behavior

### Integration Tests
- Use test database with clean state
- Real database operations
- Isolated test environment

### E2E Tests
- Use seeded test data
- Real application environment
- Clean state between tests

## Continuous Integration

### GitHub Actions Workflow
The CI pipeline runs multiple test suites:

1. **Unit Tests**: Fast feedback on code changes
2. **Integration Tests**: Database and API testing
3. **E2E Tests**: Critical user flows
4. **Visual Regression**: UI consistency
5. **Accessibility**: WCAG compliance
6. **Performance**: Core Web Vitals

### Test Execution Order
1. Unit tests (fastest)
2. Integration tests
3. E2E tests
4. Visual regression tests
5. Accessibility tests
6. Performance tests

## Best Practices

### Writing Tests
1. **Descriptive Names**: Test names should clearly describe what is being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
3. **Single Responsibility**: Each test should verify one specific behavior
4. **Independent Tests**: Tests should not depend on each other
5. **Realistic Data**: Use realistic test data that matches production scenarios

### Mocking Guidelines
1. **Mock External Dependencies**: APIs, databases, third-party services
2. **Don't Mock What You Own**: Test real implementations of your own code
3. **Mock at the Boundary**: Mock at the integration points
4. **Verify Mock Interactions**: Ensure mocks are called correctly

### Performance Considerations
1. **Parallel Execution**: Run tests in parallel when possible
2. **Test Isolation**: Ensure tests can run independently
3. **Resource Cleanup**: Clean up resources after tests
4. **Selective Testing**: Use test patterns to run specific test suites

## Test Utilities

### Custom Render Function
```typescript
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryProvider>
      <DndProvider>
        <ThemeProvider>
          {ui}
        </ThemeProvider>
      </DndProvider>
    </QueryProvider>
  );
};
```

### Test Helpers
- `src/test/setup.ts`: Global test setup
- `src/test/integration-setup.ts`: Integration test setup
- `src/test/helpers/`: Reusable test utilities

## Debugging Tests

### Unit Tests
```bash
# Run specific test file
npm run test -- task-card.test.tsx

# Run tests matching pattern
npm run test -- --grep "drag and drop"

# Debug mode
npm run test -- --inspect-brk
```

### E2E Tests
```bash
# Run in headed mode
npx playwright test --headed

# Debug specific test
npx playwright test --debug task-management.spec.ts

# Generate test code
npx playwright codegen localhost:3000
```

## Test Maintenance

### Regular Tasks
1. **Update Snapshots**: When UI changes are intentional
2. **Review Coverage**: Ensure coverage thresholds are met
3. **Clean Test Data**: Remove obsolete test data and mocks
4. **Update Dependencies**: Keep testing frameworks up to date

### Monitoring
1. **Test Execution Time**: Monitor for slow tests
2. **Flaky Tests**: Identify and fix unreliable tests
3. **Coverage Trends**: Track coverage over time
4. **CI Performance**: Monitor build times and success rates

## Troubleshooting

### Common Issues
1. **Flaky Tests**: Usually caused by timing issues or shared state
2. **Slow Tests**: Often due to unnecessary waits or heavy operations
3. **Memory Leaks**: Check for uncleaned resources or event listeners
4. **Mock Issues**: Verify mock implementations match real behavior

### Solutions
1. **Use waitFor**: For asynchronous operations
2. **Clean State**: Reset state between tests
3. **Proper Cleanup**: Use cleanup functions and afterEach hooks
4. **Realistic Mocks**: Ensure mocks behave like real implementations

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)