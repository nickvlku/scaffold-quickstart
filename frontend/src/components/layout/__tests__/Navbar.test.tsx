// frontend/src/components/layout/__tests__/Navbar.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthContext, User } from '../../../contexts/AuthContext';

import Navbar from '../Navbar';

// Mock useRouter from next/navigation
// The global mock in jest.setup.js should cover this, but you can also mock per test suite if preferred.
// const mockRouterPush = jest.fn();
// jest.mock('next/navigation', () => ({
//   useRouter: () => ({
//     push: mockRouterPush,
//   }),
// }));

describe('Navbar Component', () => {
  const suiteMockLogout = jest.fn(); // Renamed to avoid confusion

  const renderNavbarWithAuth = (
    isAuthenticated: boolean,
    user: User | null,
    isLoading: boolean = false,
    logoutFn: jest.Mock = suiteMockLogout
  ) => {
    // We don't need to clear routerMock.push here anymore if afterEach in jest.setup.js does it.
    // const routerMock = require('next/navigation').useRouter();
    // routerMock.push.mockClear(); // This line can likely be removed

    return render(
      <AuthContext.Provider
        value={{
          isAuthenticated,
          user,
          isLoading,
          logout: logoutFn,
          login: jest.fn(),
          signup: jest.fn(),
          fetchUser: jest.fn().mockResolvedValue(null),
          clearError: jest.fn(),
          error: null,
        }}
      >
        <Navbar />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    // Clear mocks before each test
    suiteMockLogout.mockClear();
    // mockPush.mockClear(); // If using a local mockRouterPush
  });

  test('renders Login and Sign Up buttons when not authenticated', () => {
    renderNavbarWithAuth(false, null);

    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /logout/i })
    ).not.toBeInTheDocument();
  });

  test('renders user email and Logout button when authenticated', () => {
    const testUser = { id: 'US_test123', email: 'test@example.com' };
    renderNavbarWithAuth(true, testUser);

    expect(screen.getByText(`Welcome, ${testUser.email}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /login/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /sign up/i })
    ).not.toBeInTheDocument();
  });

  test('calls logout and redirects to home on logout button click', async () => {
    const testUser = { id: 'US_test123', email: 'test@example.com' };
    const currentTestAsyncMockLogout = jest.fn().mockResolvedValue(undefined);

    renderNavbarWithAuth(true, testUser, false, currentTestAsyncMockLogout);

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    // Get the mocked router module to access its push function
    // This push function is THE one defined in jest.setup.js
    const navigationMock = require('next/navigation');
    const pushSpy = navigationMock.useRouter().push; // This should be the mockPush from setup

    await waitFor(() => {
      expect(currentTestAsyncMockLogout).toHaveBeenCalledTimes(1);
    });
    console.log('Mock logout called and awaited.');

    // Now assert on the persistent mock 'pushSpy'
    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith('/');
    console.log('Router.push checked.');
  });

  test('shows loading state when isLoading is true', () => {
    renderNavbarWithAuth(false, null, true);
    // Assuming your loading state shows a specific element or text.
    // The Navbar has: <div className="animate-pulse h-6 w-24 bg-slate-700 rounded"></div>
    // This is hard to query directly without a data-testid or specific role/text.
    // For simplicity, let's just check that login/logout buttons are NOT there during loading.
    expect(
      screen.queryByRole('link', { name: /login/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /logout/i })
    ).not.toBeInTheDocument();
    // If you add a data-testid="loading-indicator" to the loading div, you could do:
    // expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });
});
