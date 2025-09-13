# Testing Guide for OLMA MVP

## Overview

This document outlines the testing strategy and implementation for the OLMA MVP, covering unit tests, integration tests, and end-to-end tests.

## Testing Stack

- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright
- **Coverage**: Jest coverage reports
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, TypeScript, Husky hooks

## Test Structure

```
src/
├── __tests__/           # Unit tests
│   ├── types/          # Zod schema tests
│   ├── lib/            # Utility function tests
│   └── components/     # Component tests
e2e/                    # End-to-end tests
├── signup-flow.spec.ts # User journey tests
└── auth.spec.ts        # Authentication tests
```

## Unit Tests

### Running Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- utils.test.ts
```

### Test Categories

#### 1. Validators (Zod Schemas)
- **File**: `src/types/__tests__/api.test.ts`
- **Purpose**: Validate API request/response schemas
- **Coverage**: All Zod schemas for data validation

```typescript
// Example test
it('should validate a valid post', () => {
  const validPost = {
    content: 'This is a valid post content',
    privacyLevel: 'public' as const
  }
  const result = createPostSchema.safeParse(validPost)
  expect(result.success).toBe(true)
})
```

#### 2. Safety Utilities
- **File**: `src/lib/__tests__/safety.test.ts`
- **Purpose**: Test content filtering and moderation
- **Coverage**: Profanity detection, PII detection, spam detection

```typescript
// Example test
it('should detect profanity', () => {
  const profaneContent = 'This message contains bad words like damn'
  const result = filterContent(profaneContent)
  expect(result.isClean).toBe(false)
  expect(result.violations).toContain('profanity')
})
```

#### 3. Gamification System
- **File**: `src/lib/__tests__/gamification.test.ts`
- **Purpose**: Test XP calculation, level progression, currency earning
- **Coverage**: Currency ledger invariants, transaction validation

```typescript
// Example test
it('should calculate XP for post creation', () => {
  const xp = calculateXPForAction('create_post')
  expect(xp).toBe(10)
})
```

#### 4. Utility Functions
- **File**: `src/lib/__tests__/utils.test.ts`
- **Purpose**: Test helper functions and utilities
- **Coverage**: Date formatting, string manipulation, validation

```typescript
// Example test
it('should format date correctly', () => {
  const date = new Date('2024-01-15')
  const formatted = formatDate(date)
  expect(formatted).toMatch(/Jan 15, 2024/)
})
```

### Testing Best Practices

1. **Test Structure**: Use describe blocks for grouping related tests
2. **Naming**: Use descriptive test names that explain the expected behavior
3. **Isolation**: Each test should be independent and not rely on other tests
4. **Mocking**: Mock external dependencies (Supabase, API calls)
5. **Coverage**: Aim for >70% code coverage

## End-to-End Tests

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test signup-flow.spec.ts
```

### Test Scenarios

#### 1. Complete User Journey
- **File**: `e2e/signup-flow.spec.ts`
- **Purpose**: Test the full user flow from signup to purchase
- **Steps**:
  1. User signup with email/password
  2. Profile setup with bio and location
  3. Create first post in feed
  4. Create skill offer
  5. Make purchase in shop
  6. Verify achievements earned

#### 2. Authentication Flow
- **File**: `e2e/auth.spec.ts`
- **Purpose**: Test login, logout, and OAuth flows
- **Coverage**: Email/password auth, OAuth providers, error handling

### E2E Testing Best Practices

1. **Page Objects**: Use page object model for better maintainability
2. **Data Attributes**: Use `data-testid` attributes for reliable element selection
3. **Screenshots**: Capture screenshots on test failures
4. **Parallel Execution**: Run tests in parallel for faster execution
5. **Retry Logic**: Implement retry logic for flaky tests

## Continuous Integration

### GitHub Actions Workflow

The CI pipeline runs on every push and pull request:

1. **Linting**: ESLint checks for code quality
2. **Type Checking**: TypeScript compilation check
3. **Unit Tests**: Jest tests with coverage reporting
4. **E2E Tests**: Playwright tests in multiple browsers
5. **Build**: Production build verification

### Pre-commit Hooks

Husky hooks run before each commit:

- **Linting**: Ensure code follows style guidelines
- **Type Checking**: Verify TypeScript compilation
- **Unit Tests**: Run unit tests to catch regressions
- **E2E Tests**: Run smoke tests on main branch

## Code Quality

### Conventional Commits

All commits must follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types**:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```bash
feat(auth): add OAuth login with Google
fix(api): resolve user profile update issue
test(utils): add tests for date formatting functions
```

### ESLint Configuration

ESLint rules ensure code quality:

- **Next.js**: Built-in Next.js rules
- **TypeScript**: TypeScript-specific rules
- **React**: React best practices
- **Accessibility**: Accessibility guidelines

## Coverage Requirements

### Unit Test Coverage

- **Statements**: >70%
- **Branches**: >70%
- **Functions**: >70%
- **Lines**: >70%

### Critical Paths

High-priority areas requiring thorough testing:

1. **Authentication**: Signup, login, OAuth flows
2. **Content Creation**: Posts, skill offers, clubs
3. **Currency System**: Earning, spending, validation
4. **Safety**: Content filtering, moderation
5. **Gamification**: XP, levels, achievements

## Debugging Tests

### Unit Tests

```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test with debugging
npm test -- --testNamePattern="should calculate XP"
```

### E2E Tests

```bash
# Run tests with headed browser
npx playwright test --headed

# Run tests with slow motion
npx playwright test --headed --slowmo=1000

# Debug specific test
npx playwright test signup-flow.spec.ts --debug
```

## Performance Testing

### Lighthouse Testing

```bash
# Run Lighthouse CI
npm run lighthouse

# Test specific pages
npx lighthouse http://localhost:3000 --output=json
```

### Load Testing

```bash
# Run load tests with Artillery
npm run test:load

# Test API endpoints
npx artillery run load-tests/api.yml
```

## Monitoring and Reporting

### Coverage Reports

- **HTML Report**: `coverage/lcov-report/index.html`
- **Codecov Integration**: Automatic coverage upload
- **Threshold Enforcement**: Fails build if coverage drops

### Test Reports

- **Jest**: Console and HTML reports
- **Playwright**: HTML report with screenshots and traces
- **GitHub Actions**: Integrated test results

## Troubleshooting

### Common Issues

1. **Test Timeouts**: Increase timeout for slow operations
2. **Flaky Tests**: Add retry logic and better selectors
3. **Mock Issues**: Ensure proper mocking of external dependencies
4. **Environment Variables**: Set required env vars for tests

### Debug Commands

```bash
# Debug Jest configuration
npm test -- --verbose --no-cache

# Debug Playwright setup
npx playwright install --dry-run

# Check test environment
npm run test:env
```

## Future Improvements

1. **Visual Regression Testing**: Add visual diff testing
2. **API Contract Testing**: Test API contracts with consumers
3. **Performance Testing**: Add performance benchmarks
4. **Security Testing**: Add security vulnerability scanning
5. **Accessibility Testing**: Automated accessibility checks

---

For questions or issues with testing, please refer to the project documentation or create an issue in the repository.


















