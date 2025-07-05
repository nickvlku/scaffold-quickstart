# End-to-End Testing with Playwright

This directory contains end-to-end tests for the authentication system using Playwright. These tests simulate real user interactions with the application in a browser environment.

## Test Coverage

The E2E test suite covers the following authentication scenarios:

### ✅ User Registration

- **Successful registration**: Create a new user account with valid credentials
- **Auto-login after registration**: Verify users are automatically logged in when email validation is disabled
- **Duplicate email handling**: Ensure appropriate error messages when attempting to register with existing email

### ✅ User Login

- **Successful login**: Login with valid credentials
- **Invalid credentials**: Test error handling for wrong passwords and unregistered emails
- **Redirect behavior**: Verify authenticated users are redirected away from login/signup pages

### ✅ User Logout

- **Logout functionality**: Verify users can successfully log out and lose access to protected pages

### ✅ Password Reset

- **Reset request**: Test the password reset flow (form submission and success message)
- **Security**: Verify the system doesn't expose whether an email exists

### ✅ Authentication State Management

- **Protected routes**: Ensure unauthenticated users can't access protected pages
- **Persistent login**: Verify authentication state persists across page refreshes
- **Automatic redirects**: Test redirect behavior for authenticated/unauthenticated users

## Running the Tests

### Prerequisites

1. Ensure both frontend and backend servers are running
2. Install Playwright browsers: `npx playwright install`

### Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode (interactive)
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test auth.spec.ts

# Run tests in a specific browser
npx playwright test --project=chromium
```

### Test Configuration

The tests are configured via `playwright.config.ts`:

- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit
- **Web Server**: Automatically starts `npm run dev` before testing
- **Reports**: HTML reports generated in `playwright-report/`

## Test Structure

### Test Helpers (`helpers.ts`)

#### `AuthHelpers`

- `generateRandomEmail()`: Creates unique test email addresses
- `generateRandomPassword()`: Creates secure test passwords
- `fillLoginForm()`: Fills login form with credentials
- `fillSignupForm()`: Fills signup form with credentials
- `submitForm()`: Submits authentication forms
- `expectErrorMessage()`: Verifies error messages
- `expectSuccessMessage()`: Verifies success messages
- `logout()`: Performs logout action
- `clearAuthState()`: Clears authentication cookies and state

#### `TestDataHelpers`

- `createTestUser()`: Creates test user data
- `registerUser()`: Registers a user via the UI
- `getRegisteredUsers()`: Returns list of registered test users
- `clearRegisteredUsers()`: Cleans up test user data

### Test Implementation (`auth.spec.ts`)

Each test follows this pattern:

1. **Setup**: Create test data and clear authentication state
2. **Action**: Perform user actions (navigation, form submission, etc.)
3. **Assertion**: Verify expected outcomes and error states
4. **Cleanup**: Clear authentication state after each test

## Test Data IDs

The tests use `data-testid` attributes for reliable element selection:

- `email-input`: Email input fields
- `password-input`: Password input fields
- `password-confirm-input`: Password confirmation input
- `submit-button`: Form submission buttons
- `error-message`: Error message containers
- `success-message`: Success message containers
- `logout-button`: Logout button in navbar

## Best Practices

### 1. Test Isolation

- Each test starts with a clean authentication state
- Tests use unique email addresses to avoid conflicts
- Database state is not shared between tests

### 2. Realistic User Flows

- Tests simulate actual user interactions (clicking, typing, navigation)
- Forms are filled using realistic data
- Error scenarios test edge cases users might encounter

### 3. Robust Assertions

- Tests wait for elements to appear before interacting
- Error messages are checked for appropriate content
- Navigation is verified with URL pattern matching

### 4. Test Data Management

- Random email generation prevents test conflicts
- Helper functions encapsulate common operations
- Test users are tracked and can be cleaned up

## Debugging Tests

### Visual Debugging

```bash
# Run with headed browser
npx playwright test --headed

# Run with debug mode
npx playwright test --debug
```

### Test Reports

```bash
# Generate and view HTML report
npx playwright show-report
```

### Screenshots and Videos

Tests automatically capture:

- Screenshots on failure
- Video recordings for failed tests
- Traces for debugging (when retry occurs)

## CI/CD Integration

The tests are configured for continuous integration:

- Retry failed tests up to 2 times on CI
- Run tests in parallel when possible
- Generate HTML reports for test results

## Troubleshooting

### Common Issues

1. **Server not running**: Ensure frontend dev server is running on port 3000
2. **Browser installation**: Run `npx playwright install` if browsers are missing
3. **Timeouts**: Increase timeout values in `playwright.config.ts` if tests are slow
4. **Element not found**: Verify `data-testid` attributes are present in components

### Debug Mode

Use debug mode to step through tests:

```bash
npx playwright test --debug auth.spec.ts
```

This opens the Playwright inspector where you can:

- Step through test execution
- Inspect page elements
- View console logs
- Modify test code on the fly

## Future Enhancements

Potential improvements for the test suite:

1. **Email Testing**: Integration with email testing services for complete password reset flow
2. **Multi-browser Testing**: Enable mobile browser testing
3. **Performance Testing**: Add performance assertions for authentication flows
4. **Visual Regression**: Add screenshot comparison tests
5. **API Testing**: Direct API testing alongside UI tests
6. **Test Data Seeding**: Database seeding for more complex test scenarios
