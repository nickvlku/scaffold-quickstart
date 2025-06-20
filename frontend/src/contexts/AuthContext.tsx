// frontend/src/contexts/AuthContext.tsx
'use client';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import apiClient from '../lib/apiClient'; // Adjust path if needed

// 1. Define Types
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  // Add other user fields as needed
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (details: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<User | null>; // Exposed for manual refresh if needed
  clearError: () => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password_1: string; // Assuming password1 and password2 for dj-rest-auth registration
  password_2: string;
  // Add other required signup fields
}

// 2. Create Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create AuthProvider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start true for initial user fetch
  const [error, setError] = useState<string | null>(null);

  const handleApiError = (err: unknown, defaultMessage: string): string => {
    let errorMessage = defaultMessage;
    if (err.response && err.response.data) {
      const responseData = err.response.data;
      // dj_rest_auth often returns errors in 'detail' or field-specific arrays
      if (responseData.detail) {
        errorMessage = responseData.detail;
      } else if (
        Array.isArray(responseData.non_field_errors) &&
        responseData.non_field_errors.length > 0
      ) {
        errorMessage = responseData.non_field_errors.join(', ');
      } else {
        // Collect field-specific errors
        const fieldErrors = Object.entries(responseData)
          .map(
            ([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`
          )
          .join('; ');
        if (fieldErrors) errorMessage = fieldErrors;
      }
    } else if (err.message) {
      errorMessage = err.message;
    }
    console.error('Auth Error:', errorMessage, err);
    return errorMessage;
  };

  const fetchUser = useCallback(async (): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<User>('/api/auth/user/');
      setUser(response.data);
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setUser(null);
      setIsLoading(false);
      if (
        err.response &&
        err.response.status !== 401 &&
        err.response.status !== 403
      ) {
        setError(handleApiError(err, 'Failed to fetch user.')); // handleApiError is now memoized
      }
      console.info('Fetch user failed or no active session.');
      return null;
    }
  }, [handleApiError]);

  // Effect to fetch user on initial load (e.g., if HttpOnly cookie exists)
  useEffect(() => {
    fetchUser();
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      setError(null);
      try {
        // dj_rest_auth login endpoint. It sets HttpOnly cookies.
        // Response might contain user details or just a success message.
        // We'll call fetchUser afterwards to ensure context has the latest user data.
        await apiClient.post('/api/auth/login/', credentials);
        await fetchUser(); // Fetches user data and updates context
      } catch (err) {
        setUser(null);
        setError(
          handleApiError(err, 'Login failed. Please check your credentials.')
        );
        setIsLoading(false);
        throw err; // Re-throw to allow component-level error handling
      }
    },
    [fetchUser, handleApiError]
  ); // Add dependencies

  const signup = useCallback(
    async (details: SignupCredentials) => {
      setIsLoading(true);
      setError(null);
      try {
        // dj_rest_auth registration endpoint.
        // Backend might require email verification before login.
        // If auto-login occurs, cookies are set. If not, user needs to verify then login.
        // For simplicity, we assume success means they can then try to log in,
        // or if it auto-logs in, fetchUser will pick it up.
        // The response might be a user object or a simple success message.
        // Let's assume for now it DOESN'T auto-login, and fetchUser is not called here.
        // Or, if it does auto-login, we could call fetchUser().
        // TDD: "Email confirmation" - suggests registration might not auto-login.
        // Let's assume registration does NOT auto-login and user has to verify email first.
        // The success of signup will thus not call fetchUser().
        await apiClient.post('/api/auth/registration/', details);
        // If registration returns user data and logs in, call await fetchUser();
        // Otherwise, the user needs to verify email and then login separately.
        // For now, let's assume successful registration means "check your email".
        setIsLoading(false);
      } catch (err) {
        setError(handleApiError(err, 'Signup failed. Please try again.'));
        setIsLoading(false);
        throw err; // Re-throw
      }
    },
    [handleApiError]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // dj_rest_auth logout endpoint. Backend clears HttpOnly cookies.
      await apiClient.post('/api/auth/logout/');
      setUser(null);
    } catch (err) {
      // Even if logout API call fails, clear user from frontend state
      setUser(null);
      setError(handleApiError(err, 'Logout failed.'));
      // Don't re-throw, as we've cleared user state locally anyway.
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user, // Derived state: true if user object exists
        error,
        login,
        signup,
        logout,
        fetchUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 4. Create Custom Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
