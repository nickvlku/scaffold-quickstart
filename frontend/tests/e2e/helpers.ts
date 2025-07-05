import { Page } from '@playwright/test';

export class AuthHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async generateRandomEmail(): Promise<string> {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `test-${timestamp}-${randomSuffix}@example.com`;
  }

  async generateRandomPassword(): Promise<string> {
    return `TestPassword${Math.random().toString(36).substring(2, 10)}!`;
  }

  async fillLoginForm(email: string, password: string): Promise<void> {
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
  }

  async fillSignupForm(email: string, password: string): Promise<void> {
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.fill('[data-testid="password-confirm-input"]', password);
  }

  async submitForm(): Promise<void> {
    // Wait for button to be enabled before clicking
    await this.page.waitForSelector(
      '[data-testid="submit-button"]:not([disabled])',
      { timeout: 10000 }
    );
    await this.page.click('[data-testid="submit-button"]');
  }

  async waitForNavigation(): Promise<void> {
    await this.page.waitForURL('/');
  }

  async expectErrorMessage(message: string): Promise<void> {
    await this.page.waitForSelector('[data-testid="error-message"]');
    const errorText = await this.page.textContent(
      '[data-testid="error-message"]'
    );
    if (!errorText?.includes(message)) {
      throw new Error(
        `Expected error message to contain "${message}", but got: ${errorText}`
      );
    }
  }

  async expectSuccessMessage(message: string): Promise<void> {
    await this.page.waitForSelector('[data-testid="success-message"]');
    const successText = await this.page.textContent(
      '[data-testid="success-message"]'
    );
    if (!successText?.includes(message)) {
      throw new Error(
        `Expected success message to contain "${message}", but got: ${successText}`
      );
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="logout-button"]', {
        timeout: 5000,
      });
      return true;
    } catch {
      return false;
    }
  }

  async logout(): Promise<void> {
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('/');
  }

  async clearAuthState(): Promise<void> {
    await this.page.context().clearCookies();
    await this.page.context().clearPermissions();
  }

  async expectLoggedInHomePage(): Promise<void> {
    await this.page.waitForSelector('text=You are logged in as');
  }

  async expectLoggedOutHomePage(): Promise<void> {
    await this.page.waitForSelector('text=Get started');
  }
}

export interface TestUser {
  email: string;
  password: string;
}

export class TestDataHelpers {
  private registeredUsers: TestUser[] = [];

  async createTestUser(): Promise<TestUser> {
    const helpers = new AuthHelpers(this.page);
    const email = await helpers.generateRandomEmail();
    const password = await helpers.generateRandomPassword();
    const user = { email, password };
    this.registeredUsers.push(user);
    return user;
  }

  async registerUser(page: Page, user: TestUser): Promise<void> {
    const helpers = new AuthHelpers(page);
    await page.goto('/signup');
    await helpers.fillSignupForm(user.email, user.password);
    await helpers.submitForm();
  }

  getRegisteredUsers(): TestUser[] {
    return this.registeredUsers;
  }

  clearRegisteredUsers(): void {
    this.registeredUsers = [];
  }

  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}
