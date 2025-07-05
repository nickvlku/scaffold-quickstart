// frontend/src/app/(auth)/signup/page.tsx
'use client';

import { useState, FormEvent, Suspense, useEffect } from 'react'; // Added useEffect
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, SignupCredentials } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import Link from 'next/link';

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    signup,
    isLoading: isSignupLoading,
    error: apiError,
    clearError: clearApiError,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Effect to redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      const redirectUrl = searchParams.get('redirect') || '/'; // Default to homepage or dashboard
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isAuthLoading, router, searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (apiError) clearApiError();
    setFormError(null);

    if (password !== password2) {
      setFormError('Passwords do not match. Please try again.');
      return;
    }
    try {
      const signupDetails: SignupCredentials = {
        email,
        password1: password,
        password2: password2,
      };
      const result = await signup(signupDetails); // This is from AuthContext

      // After signup, AuthContext's isAuthenticated state might have updated if auto-login occurred.
      // The useEffect for redirecting authenticated users should then handle the redirect.
      // However, the state update might not be immediate for this component instance.
      // So, we still need explicit navigation logic here, but it might be simplified.

      const loginOnRegistrationFrontendFlag =
        process.env.NEXT_PUBLIC_LOGIN_ON_REGISTRATION === 'true';

      if (result.success) {
        // Show success toast
        showToast(
          'Account created successfully! Welcome to the app.',
          'success'
        );

        // Only redirect manually if auto-login wasn't configured/successful
        // OR if verification is still required.
        // The `isAuthenticated` check in `useEffect` will handle the success case of auto-login.
        if (result.requiresVerification && result.email) {
          router.push(
            `/verify-email?email=${encodeURIComponent(result.email)}`
          );
        } else if (!loginOnRegistrationFrontendFlag) {
          // If auto-login was never intended by frontend config, go to login page.
          router.push(
            '/login?signup_success=true&email=' +
              encodeURIComponent(result.email || '')
          );
        }
        // If loginOnRegistrationFrontendFlag is true and no verification,
        // we *expect* the useEffect (watching isAuthenticated) to handle the redirect.
        // If it doesn't become true, the user remains on the signup page (which is an issue if login failed silently).
        // The signup function in AuthContext should ideally indicate if auto-login failed.
        // For now, if auto-login was attempted but isAuthenticated isn't true yet,
        // the user effectively stays on signup or gets redirected by the effect if it later becomes true.
        // A robust solution might involve the signup promise resolving AFTER auto-login fully settles.
      }
    } catch (err) {
      // API error is already set in AuthContext by the signup function
      console.error('Signup failed on page:', err);
    }
  };

  // If already authenticated and redirecting, show a loading message
  if (isAuthenticated && !isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
        Redirecting...
      </div>
    );
  }

  const displayError = formError || apiError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Create your account
          </h2>
        </div>

        <div className="bg-slate-800/70 backdrop-blur-md p-8 shadow-2xl rounded-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full appearance-none rounded-lg border border-slate-600 bg-slate-700 px-3 py-3 text-white placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                placeholder="you@example.com"
                data-testid="email-input"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password1"
                className="block text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <input
                id="password1"
                name="password1"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full appearance-none rounded-lg border border-slate-600 bg-slate-700 px-3 py-3 text-white placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                placeholder="••••••••"
                data-testid="password-input"
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="password2"
                className="block text-sm font-medium text-slate-300"
              >
                Confirm Password
              </label>
              <input
                id="password2"
                name="password2"
                type="password"
                autoComplete="new-password"
                required
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="mt-1 block w-full appearance-none rounded-lg border border-slate-600 bg-slate-700 px-3 py-3 text-white placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                placeholder="••••••••"
                data-testid="password-confirm-input"
              />
            </div>

            {displayError && (
              <div className="rounded-md bg-red-500/20 p-3">
                <p className="text-sm text-red-400" data-testid="error-message">
                  {displayError}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSignupLoading}
              className="flex w-full justify-center rounded-lg bg-sky-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-60 disabled:cursor-not-allowed"
              data-testid="submit-button"
            >
              {isSignupLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-sky-400 hover:text-sky-300"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
          Loading...
        </div>
      }
    >
      <SignupPageContent />
    </Suspense>
  );
}
