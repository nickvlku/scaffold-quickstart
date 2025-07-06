// frontend/src/app/(auth)/login/page.tsx
'use client';

import { useEffect, useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path if needed
import { useToast } from '../../../contexts/ToastContext';
import Link from 'next/link'; // For links like "Forgot password?" or "Sign up"

// A wrapper component is needed because useSearchParams() needs to be used in a component
// that is a child of <Suspense>. Next.js pages are server components by default,
// but adding 'use client' makes the whole file a client component.
// Using a sub-component for searchParams is good practice if part of the page could be static.
// Here, the whole page is dynamic.

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, user, isAuthenticated, error, clearError, resendVerificationEmail } =
    useAuth(); // Added user
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailVerificationError, setEmailVerificationError] = useState<{
    hasError: boolean;
    email: string;
  }>({ hasError: false, email: '' });
  const [isResending, setIsResending] = useState(false);

  // EFFECT TO HANDLE REDIRECT IF ALREADY AUTHENTICATED
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Check if user object is also available to avoid race conditions
      // though isAuthenticated should align with user presence
      if (user) {
        const redirectUrl = searchParams.get('redirect') || '/';
        router.push(redirectUrl);
      }
    }
  }, [isAuthenticated, isLoading, user, router, searchParams]); // Dependencies for the effect

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (error) clearError();
    setEmailVerificationError({ hasError: false, email: '' }); // Clear previous verification error

    try {
      await login({ email, password });
      // Show success toast
      showToast('Welcome back! You have successfully logged in.', 'success');
      // After successful login, the useEffect above will handle the redirect
      // when isAuthenticated and user state update.
    } catch (err: unknown) {
      console.error('Login failed:', err);

      // Check if this is an email verification error (enhanced error from AuthContext)
      const enhancedError = err as {
        isEmailVerificationError?: boolean;
        email?: string;
      };
      
      if (enhancedError.isEmailVerificationError && enhancedError.email) {
        setEmailVerificationError({ 
          hasError: true, 
          email: enhancedError.email 
        });
        return;
      }

      // Also check for raw axios error format in case AuthContext doesn't catch it
      const axiosError = err as {
        response?: { 
          data?: { 
            non_field_errors?: string[];
            detail?: string;
          };
        };
      };
      
      const nonFieldErrors = axiosError.response?.data?.non_field_errors || [];
      const detail = axiosError.response?.data?.detail || '';
      
      const isEmailVerificationError = 
        nonFieldErrors.some(error => {
          const lowerError = error.toLowerCase();
          return (lowerError.includes('email') || lowerError.includes('e-mail')) && 
                 (lowerError.includes('verif') || lowerError.includes('not verified'));
        }) ||
        (detail.toLowerCase().includes('email') && 
         detail.toLowerCase().includes('verif'));

      if (isEmailVerificationError) {
        setEmailVerificationError({ 
          hasError: true, 
          email: email // Use the email from the form
        });
        return;
      }

      // For other errors, the error state is already set in AuthContext
    }
  };

  const handleResendVerification = async () => {
    if (!emailVerificationError.email) return;
    
    setIsResending(true);
    try {
      await resendVerificationEmail({ email: emailVerificationError.email });
      showToast('Verification email sent! Please check your email.', 'success');
      // Redirect to check email page
      router.push(`/check-email?email=${encodeURIComponent(emailVerificationError.email)}`);
    } catch (err) {
      console.error('Failed to resend verification email:', err);
      showToast('Failed to send verification email. Please try again.', 'error');
    } finally {
      setIsResending(false);
    }
  };

  // If we are about to redirect (because isAuthenticated is true),
  // it's better to show a loading or null state to prevent flashing the login form.
  if (isAuthenticated && !isLoading && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
        Redirecting...
      </div>
    ); // Or a spinner
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Log in to your account
          </h2>
        </div>

        <div className="bg-slate-800/70 backdrop-blur-md p-8 shadow-2xl rounded-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* ... rest of the form ... (Email, Password inputs) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-slate-600 bg-slate-700 px-3 py-3 text-white placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                  placeholder="you@example.com"
                  data-testid="email-input"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300"
                >
                  Password
                </label>
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-sky-400 hover:text-sky-300"
                    tabIndex={-1}
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-slate-600 bg-slate-700 px-3 py-3 text-white placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                  placeholder="••••••••"
                  data-testid="password-input"
                />
              </div>
            </div>

            {emailVerificationError.hasError && (
              <div className="rounded-md bg-amber-500/20 p-4 border border-amber-500/30">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-sm font-medium text-amber-400">Email Not Verified</h3>
                </div>
                <p className="text-sm text-amber-300 mb-3">
                  Please verify your email address before logging in. Check your email for a verification link.
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-md bg-amber-600 text-white hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
              </div>
            )}

            {error && !emailVerificationError.hasError && (
              <div className="rounded-md bg-red-500/20 p-3">
                <p className="text-sm text-red-400" data-testid="error-message">
                  {error}
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-sky-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-60 disabled:cursor-not-allowed"
                data-testid="submit-button"
              >
                {isLoading && !isAuthenticated ? ( // Only show spinner if logging in, not if already auth and redirecting
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  'Log in'
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Not a member?{' '}
            <Link
              href="/signup"
              className="font-medium text-sky-400 hover:text-sky-300"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
          Loading...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
