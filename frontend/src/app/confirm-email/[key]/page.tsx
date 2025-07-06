'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import apiClient from '../../../services/apiClient';

interface ConfirmationState {
  status: 'loading' | 'success' | 'error' | 'already_confirmed';
  message?: string;
}

function EmailConfirmationContent() {
  const router = useRouter();
  const params = useParams();
  const { fetchUser, isAuthenticated, user } = useAuth();
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>(
    {
      status: 'loading',
    }
  );

  const confirmationKey = decodeURIComponent(params.key as string);

  useEffect(() => {
    const confirmEmail = async () => {
      if (!confirmationKey) {
        setConfirmationState({
          status: 'error',
          message:
            'Invalid confirmation link. Please check your email and try again.',
        });
        return;
      }

      try {
        // Debug: Log the key being sent
        console.log('Original key from URL:', params.key);
        console.log('Decoded key being sent:', confirmationKey);
        
        // Make API call to confirm email using the key
        // This hits the dj-rest-auth email verification endpoint
        const response = await apiClient.post(
          '/api/auth/registration/verify-email/',
          {
            key: confirmationKey,
          }
        );
        
        console.log('Verification response:', response);

        if (response.status === 200) {
          setConfirmationState({
            status: 'success',
            message: 'Your email has been successfully verified!',
          });

          // Refresh user state as they might now be logged in
          await fetchUser();
        }
      } catch (error: unknown) {
        console.error('Email confirmation failed:', error);

        // Handle different error scenarios
        const axiosError = error as {
          response?: { status?: number; data?: { detail?: string } };
        };

        if (axiosError.response?.status === 404) {
          setConfirmationState({
            status: 'error',
            message:
              'Invalid or expired confirmation link. Please request a new verification email.',
          });
        } else if (
          axiosError.response?.data?.detail?.includes('already confirmed')
        ) {
          setConfirmationState({
            status: 'already_confirmed',
            message: 'This email address has already been verified.',
          });
        } else {
          setConfirmationState({
            status: 'error',
            message:
              'Failed to verify email. Please try again or contact support.',
          });
        }
      }
    };

    confirmEmail();
  }, [confirmationKey, fetchUser]);

  const handleContinue = () => {
    if (isAuthenticated && user) {
      // User is logged in, redirect to protected area
      router.push('/protected');
    } else {
      // User needs to log in
      router.push('/login?message=email_verified');
    }
  };

  const handleResendEmail = () => {
    router.push('/verify-email');
  };

  if (confirmationState.status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-center text-white">
        <div className="w-full max-w-md space-y-6 bg-slate-800/70 backdrop-blur-md p-8 shadow-2xl rounded-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto"></div>
          <h1 className="text-2xl font-bold">Verifying your email...</h1>
          <p className="text-slate-300">
            Please wait while we confirm your email address.
          </p>
        </div>
      </div>
    );
  }

  if (confirmationState.status === 'success') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-center text-white">
        <div className="w-full max-w-md space-y-6 bg-slate-800/70 backdrop-blur-md p-8 shadow-2xl rounded-xl">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-400">
            Email Verified Successfully!
          </h1>
          <p className="text-slate-300">{confirmationState.message}</p>
          {isAuthenticated && user ? (
            <p className="text-sky-400">
              Welcome, {user.email}! You are now logged in.
            </p>
          ) : (
            <p className="text-slate-300">
              You can now log in to your account.
            </p>
          )}
          <button
            onClick={handleContinue}
            className="w-full rounded-md bg-sky-600 px-4 py-3 text-sm font-medium text-white hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            {isAuthenticated && user
              ? 'Continue to Dashboard'
              : 'Continue to Login'}
          </button>
        </div>
      </div>
    );
  }

  if (confirmationState.status === 'already_confirmed') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-center text-white">
        <div className="w-full max-w-md space-y-6 bg-slate-800/70 backdrop-blur-md p-8 shadow-2xl rounded-xl">
          <div className="text-6xl mb-4">ℹ️</div>
          <h1 className="text-2xl font-bold text-blue-400">
            Email Already Verified
          </h1>
          <p className="text-slate-300">{confirmationState.message}</p>
          <button
            onClick={handleContinue}
            className="w-full rounded-md bg-sky-600 px-4 py-3 text-sm font-medium text-white hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Continue to Login
          </button>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-center text-white">
      <div className="w-full max-w-md space-y-6 bg-slate-800/70 backdrop-blur-md p-8 shadow-2xl rounded-xl">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-400">Verification Failed</h1>
        <p className="text-slate-300">{confirmationState.message}</p>
        <div className="space-y-3">
          <button
            onClick={handleResendEmail}
            className="w-full rounded-md bg-sky-600 px-4 py-3 text-sm font-medium text-white hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Request New Verification Email
          </button>
          <button
            onClick={() => router.push('/login')}
            className="w-full rounded-md bg-slate-600 px-4 py-3 text-sm font-medium text-white hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmailConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
          Loading...
        </div>
      }
    >
      <EmailConfirmationContent />
    </Suspense>
  );
}
