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
  const { login, isLoading, user, isAuthenticated, error, clearError } =
    useAuth(); // Added user
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

    try {
      await login({ email, password });
      // Show success toast
      showToast('Welcome back! You have successfully logged in.', 'success');
      // After successful login, the useEffect above will handle the redirect
      // when isAuthenticated and user state update.
    } catch (err) {
      console.error('Login failed:', err);
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
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-500/20 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-sky-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-60 disabled:cursor-not-allowed"
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
