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
import apiClient from '../services/apiClient';
import axios from 'axios'; // <--- ADD THIS LINE to import the main axios object

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
  signup: (details: SignupCredentials) => Promise<{
    success: boolean;
    requiresVerification?: boolean;
    email?: string;
  }>;
  resendVerificationEmail: (
    credentials: ResendEmailCredentials
  ) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<User | null>; // Exposed for manual refresh if needed
  clearError: () => void;
  forgotPassword: (credentials: ForgotPasswordCredentials) => Promise<void>;
  resetPasswordConfirm: (
    credentials: ResetPasswordConfirmCredentials
  ) => Promise<void>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password1: string;
  password2: string;
  // Add other fields like first_name, last_name if your serializer needs them
  // For example:
  // first_name?: string;
  // last_name?: string;
}

export interface ResendEmailCredentials {
  email: string;
}

export interface ForgotPasswordCredentials {
  email: string;
}

export interface ResetPasswordConfirmCredentials {
  uid: string;
  token: string;
  new_password1: string;
  new_password2: string;
}

// 2. Create Context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// 3. Create AuthProvider Component
interface AuthProviderProps {
  children: ReactNode;
  initialAuthState?: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  };
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, initialAuthState }) => {
  // Use server-side initial state if provided, otherwise default to loading
  const [user, setUser] = useState<User | null>(initialAuthState?.user || null);
  const [isLoading, setIsLoading] = useState<boolean>(initialAuthState?.isLoading ?? true);
  const [error, setError] = useState<string | null>(null);
  
  console.log('[AuthProvider] Initialized with:', {
    hasInitialState: !!initialAuthState,
    isAuthenticated: initialAuthState?.isAuthenticated,
    hasUser: !!initialAuthState?.user,
    isLoading: initialAuthState?.isLoading
  });

  const handleApiError = useCallback(
    (err: unknown, defaultMessage: string): string => {
      let errorMessage = defaultMessage;

      // Define mappings for backend field names to user-friendly names
      const friendlyFieldNames: Record<string, string> = {
        email: 'Email',
        password1: 'Password',
        password2: 'Password Confirmation',
        // Add other common fields your app might use
        // e.g., first_name: 'First Name', last_name: 'Last Name'
      };

      if (axios.isAxiosError(err) && err.response && err.response.data) {
        const responseData = err.response.data as Record<string, unknown>; // Better typing than any

        if (responseData.detail) {
          errorMessage = String(responseData.detail);
        } else if (
          Array.isArray(responseData.non_field_errors) &&
          responseData.non_field_errors.length > 0
        ) {
          errorMessage = responseData.non_field_errors.join(', ');
        } else if (typeof responseData === 'object' && responseData !== null) {
          // Collect and format field-specific errors
          const fieldErrors = Object.entries(responseData)
            .map(([key, value]) => {
              const friendlyName =
                friendlyFieldNames[key] ||
                key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()); // Default formatting for unknown keys
              const messageArray = Array.isArray(value)
                ? value
                : [String(value)];

              return messageArray
                .map((msg) => {
                  // Simplify common "This field is required" messages
                  if (
                    typeof msg === 'string' &&
                    msg.toLowerCase().includes('this field is required')
                  ) {
                    return `${friendlyName} is required.`;
                  }
                  return `${friendlyName}: ${msg}`;
                })
                .join(' '); // Join messages for the same field if multiple
            })
            .join(' '); // Join different field error messages with a space or newline for better readability

          if (fieldErrors) {
            errorMessage = fieldErrors;
          } else if (Object.keys(responseData).length > 0) {
            // Fallback for unexpected object structure, just stringify
            errorMessage =
              'An unexpected error occurred. Please check the form data.';
            console.error('Unparsed API error data:', responseData);
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      console.error(
        'Auth Error (handled):',
        errorMessage,
        'Original error:',
        err
      );
      return errorMessage;
    },
    []
  );

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
        axios.isAxiosError(err) &&
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

  // Effect to fetch user on initial load (only if no server-side state provided)
  useEffect(() => {
    if (!initialAuthState) {
      console.log('[AuthProvider] No initial state provided, fetching user from API');
      fetchUser();
    } else {
      console.log('[AuthProvider] Using server-side initial state, skipping API call');
    }
  }, [initialAuthState]);

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
        const errorMessage = handleApiError(
          err,
          'Login failed. Please check your credentials.'
        );
        setError(errorMessage);
        setIsLoading(false);

        // Check if the error is due to unverified email
        const axiosError = err as {
          response?: { data?: { non_field_errors?: string[] } };
        };
        const errorDetails =
          axiosError.response?.data?.non_field_errors?.[0] || '';

        if (
          errorDetails.toLowerCase().includes('email') &&
          errorDetails.toLowerCase().includes('verif')
        ) {
          // This is an email verification error - we'll handle this in the login component
          const enhancedError = new Error(errorMessage) as Error & {
            isEmailVerificationError: boolean;
            email: string;
          };
          enhancedError.isEmailVerificationError = true;
          enhancedError.email = credentials.email;
          throw enhancedError;
        }

        throw err; // Re-throw to allow component-level error handling
      }
    },
    [fetchUser, handleApiError]
  ); // Add dependencies

  const signup = useCallback(
    async (
      details: SignupCredentials
    ): Promise<{
      success: boolean;
      requiresVerification?: boolean;
      email?: string;
    }> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.post(
          '/api/auth/custom-registration/',
          details
        );

        // Check the registration response to determine if verification is required
        const responseData = response.data;
        const isVerificationSent =
          responseData?.detail?.toLowerCase().includes('verification') ||
          responseData?.detail?.toLowerCase().includes('sent');

        // Check environment configuration
        const emailVerificationEnabled =
          process.env.NEXT_PUBLIC_EMAIL_VERIFICATION === 'mandatory';

        // If the response mentions verification being sent OR env requires verification, user needs to verify
        if (isVerificationSent || emailVerificationEnabled) {
          setIsLoading(false);
          return {
            success: true,
            requiresVerification: true,
            email: details.email,
          };
        }

        // Otherwise check if user was auto-logged in
        try {
          // Call fetchUser() to establish proper authentication state from cookies
          const user = await fetchUser();

          if (user) {
            // fetchUser() already set the user state and isLoading(false)
            return {
              success: true,
              requiresVerification: false, // User is logged in via cookies
              email: details.email,
            };
          } else {
            // Registration succeeded but user is not authenticated
            setIsLoading(false);
            return {
              success: true,
              requiresVerification: true, // Default to requiring verification
              email: details.email,
            };
          }
        } catch (fetchErr) {
          console.error(
            'AuthContext: Failed to verify authentication after registration:',
            fetchErr
          );
          // Registration succeeded but authentication verification failed
          setIsLoading(false);
          return {
            success: true,
            requiresVerification: true, // Default to requiring verification
            email: details.email,
          };
        }
      } catch (err) {
        setError(handleApiError(err, 'Signup failed. Please try again.'));
        setIsLoading(false);
        throw err;
      }
    },
    [handleApiError, login] // Fixed dependency - login is used, not fetchUser
  );

  const resendVerificationEmail = useCallback(
    async (credentials: ResendEmailCredentials) => {
      setIsLoading(true);
      setError(null);
      try {
        // Use our custom resend endpoint that invalidates old tokens
        await apiClient.post(
          '/api/auth/custom-registration/resend-email/',
          credentials
        );
        setIsLoading(false);
      } catch (err) {
        setError(handleApiError(err, 'Failed to resend verification email.'));
        setIsLoading(false);
        throw err;
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

  const forgotPassword = useCallback(
    async (credentials: ForgotPasswordCredentials) => {
      setIsLoading(true);
      setError(null);
      try {
        await apiClient.post('/api/auth/password/reset/', credentials);
        // Don't set isLoading(false) here if you want to show a message on the page
        // and keep the loading state until the user navigates or the message is dismissed.
        // For simplicity, we'll set it here.
        setIsLoading(false);
        // The component calling this will typically show a message like
        // "If an account with this email exists, a reset link has been sent."
      } catch (err) {
        // Even if the email doesn't exist, backend often returns 200 OK to prevent email enumeration.
        // So, a catch here might be for network errors or unexpected 500s.
        // We generally don't want to tell the user if the email was found or not.
        setError(handleApiError(err, 'An error occurred. Please try again.'));
        setIsLoading(false);
        throw err; // Re-throw so the component can also handle it if needed
      }
    },
    [handleApiError]
  );

  const resetPasswordConfirm = useCallback(
    async (credentials: ResetPasswordConfirmCredentials) => {
      setIsLoading(true);
      setError(null);
      try {
        await apiClient.post('/api/auth/password/reset/confirm/', credentials);
        setIsLoading(false);
        // On success, the component calling this will redirect to login with a success message.
      } catch (err) {
        setError(
          handleApiError(
            err,
            'Password reset failed. The link may be invalid or expired.'
          )
        );
        setIsLoading(false);
        throw err; // Re-throw for component-level handling
      }
    },
    [handleApiError]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user, // Derived state: true if user object exists
        error,
        login,
        signup,
        resendVerificationEmail,
        logout,
        fetchUser,
        clearError,
        forgotPassword,
        resetPasswordConfirm,
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
