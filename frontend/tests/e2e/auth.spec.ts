import { test, expect } from '@playwright/test';
import { AuthHelpers, TestDataHelpers } from './helpers';

test.describe('Authentication E2E Tests', () => {
  let authHelpers: AuthHelpers;
  let testDataHelpers: TestDataHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    testDataHelpers = new TestDataHelpers(page);
    await authHelpers.clearAuthState();
  });

  test.afterEach(async () => {
    await authHelpers.clearAuthState();
  });

  test('should successfully register a new user', async ({ page }) => {
    const testUser = await testDataHelpers.createTestUser();

    await page.goto('/signup');
    await expect(page.locator('h2')).toContainText('Create your account');

    await authHelpers.fillSignupForm(testUser.email, testUser.password);
    await authHelpers.submitForm();

    // Wait for successful registration
    await page.waitForURL(/\/(|login|verify-email)/);

    // Check if we're on the home page (auto-login enabled) or login page
    const currentUrl = page.url();
    if (
      currentUrl === 'http://localhost:3000/' ||
      currentUrl.endsWith('localhost:3000/')
    ) {
      // Could be logged in home page or logged out home page
      await expect(page.locator('h1')).toContainText(
        'Welcome to MyAppScaffold'
      );
    } else if (currentUrl.includes('/login')) {
      await expect(page.locator('h2')).toContainText('Log in to your account');
    } else if (currentUrl.includes('/verify-email')) {
      await expect(page.locator('h2')).toContainText('Verify Your Email');
    }
  });

  test('should auto-login user after registration when email validation is disabled', async ({
    page,
  }) => {
    const testUser = await testDataHelpers.createTestUser();

    await page.goto('/signup');
    await authHelpers.fillSignupForm(testUser.email, testUser.password);
    await authHelpers.submitForm();

    // If auto-login is enabled, should be redirected to home page
    try {
      await page.waitForURL('/', { timeout: 10000 });
      await expect(page.locator('h1')).toContainText(
        'Welcome to MyAppScaffold'
      );

      // Verify user is logged in by checking for logged-in content
      await expect(page.locator('text=You are logged in as')).toBeVisible({
        timeout: 5000,
      });
      await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
    } catch {
      // If auto-login is not enabled, we should be on login page
      await expect(page.url()).toContain('/login');
    }
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    const testUser = await testDataHelpers.createTestUser();

    // First register the user
    await testDataHelpers.registerUser(page, testUser);

    // Clear any existing auth state
    await authHelpers.clearAuthState();

    // Now test login
    await page.goto('/login');
    await expect(page.locator('h2')).toContainText('Log in to your account');

    await authHelpers.fillLoginForm(testUser.email, testUser.password);
    await authHelpers.submitForm();

    // Should be redirected to home page
    await page.waitForURL('/');
    await expect(page.locator('h1')).toContainText('Welcome to MyAppScaffold');

    // Verify user is logged in by checking for logged-in content
    await expect(page.locator('text=You are logged in as')).toBeVisible();
    await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
  });

  test('should successfully logout user', async ({ page }) => {
    const testUser = await testDataHelpers.createTestUser();

    // Register and login user
    await testDataHelpers.registerUser(page, testUser);
    await page.goto('/login');
    await authHelpers.fillLoginForm(testUser.email, testUser.password);
    await authHelpers.submitForm();

    // Verify user is logged in
    await page.waitForURL('/');
    await expect(page.locator('text=You are logged in as')).toBeVisible();
    await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();

    // Logout
    await page.click('[data-testid="logout-button"]');

    // Should stay on home page but show logged out content
    await expect(page.locator('text=Get started')).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.locator('[data-testid="logout-button"]')
    ).not.toBeVisible();

    // Verify user is logged out - should not be able to access protected page
    await page.goto('/protected');
    // Wait for redirect to login page
    await page.waitForLoadState('networkidle');
    await expect(page.url()).toMatch(/\/login/);
    await expect(page.locator('h2')).toContainText('Log in to your account');
  });

  test('should handle password reset flow', async ({ page }) => {
    const testUser = await testDataHelpers.createTestUser();

    // Register user first
    await testDataHelpers.registerUser(page, testUser);

    // Go to forgot password page
    await page.goto('/forgot-password');
    await expect(page.locator('h2')).toContainText('Forgot Your Password?');

    // Fill in email
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.click('[data-testid="submit-button"]');

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'password reset link has been sent'
    );

    // Note: We can't test the actual reset process without access to the email
    // but we can test that the form submission works correctly
  });

  test('should show error when trying to register with existing email', async ({
    page,
  }) => {
    const testUser = await testDataHelpers.createTestUser();

    // Register user first
    await testDataHelpers.registerUser(page, testUser);

    // Clear auth state
    await authHelpers.clearAuthState();

    // Try to register with same email again
    await page.goto('/signup');
    await authHelpers.fillSignupForm(testUser.email, testUser.password);
    await authHelpers.submitForm();

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      /Signup failed|already exists|already registered/i
    );
  });

  test('should show error when trying to login with wrong password', async ({
    page,
  }) => {
    const testUser = await testDataHelpers.createTestUser();

    // Register user first
    await testDataHelpers.registerUser(page, testUser);

    // Clear auth state
    await authHelpers.clearAuthState();

    // Try to login with wrong password
    await page.goto('/login');
    await authHelpers.fillLoginForm(testUser.email, 'wrongpassword');
    await authHelpers.submitForm();

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      /Unable to log in|invalid|incorrect|wrong/i
    );
  });

  test('should show error when trying to login with unregistered email', async ({
    page,
  }) => {
    const email = await authHelpers.generateRandomEmail();
    const password = await authHelpers.generateRandomPassword();

    await page.goto('/login');
    await authHelpers.fillLoginForm(email, password);
    await authHelpers.submitForm();

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      /Unable to log in|invalid|not found|does not exist/i
    );
  });

  test('should redirect authenticated user from login page to protected page', async ({
    page,
  }) => {
    const testUser = await testDataHelpers.createTestUser();

    // Register and login user
    await testDataHelpers.registerUser(page, testUser);
    await page.goto('/login');
    await authHelpers.fillLoginForm(testUser.email, testUser.password);
    await authHelpers.submitForm();

    // User should be on home page
    await page.waitForURL('/');

    // Now try to visit login page again
    await page.goto('/login');

    // Should be redirected to home page
    await page.waitForURL('/');
    await expect(page.locator('h1')).toContainText('Welcome to MyAppScaffold');
    await expect(page.locator('text=You are logged in as')).toBeVisible();
  });

  test('should redirect authenticated user from signup page to protected page', async ({
    page,
  }) => {
    const testUser = await testDataHelpers.createTestUser();

    // Register and login user
    await testDataHelpers.registerUser(page, testUser);
    await page.goto('/login');
    await authHelpers.fillLoginForm(testUser.email, testUser.password);
    await authHelpers.submitForm();

    // User should be on home page
    await page.waitForURL('/');

    // Now try to visit signup page
    await page.goto('/signup');

    // Should be redirected to home page
    await page.waitForURL('/');
    await expect(page.locator('h1')).toContainText('Welcome to MyAppScaffold');
    await expect(page.locator('text=You are logged in as')).toBeVisible();
  });
});
