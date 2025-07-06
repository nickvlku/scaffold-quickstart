'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import apiClient from '../../../services/apiClient';

function CheckEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const email = searchParams.get('email') || '';

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/protected');
    }
  }, [isAuthenticated, user, router]);

  const handleResendEmail = async () => {
    if (!email) {
      setResendMessage(
        'No email address provided. Please try registering again.'
      );
      return;
    }

    setIsResending(true);
    setResendMessage(null);

    try {
      await apiClient.post('/api/auth/registration/resend-email/', {
        email: email,
      });
      setResendMessage(
        'Verification email resent successfully! Please check your inbox.'
      );
    } catch (error) {
      console.error('Failed to resend email:', error);
      setResendMessage(
        'Failed to resend email. Please try again or contact support.'
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignup = () => {
    router.push('/signup');
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-center text-white">
      <div className="w-full max-w-md space-y-6 bg-slate-800/70 backdrop-blur-md p-8 shadow-2xl rounded-xl">
        <div className="text-6xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-sky-400">Check Your Email</h1>
        <div className="space-y-4">
          <p className="text-slate-300">
            We&apos;ve sent a verification link to:
          </p>
          {email && (
            <p className="text-sky-400 font-medium break-all">{email}</p>
          )}
          <p className="text-slate-300 text-sm">
            Click the link in your email to verify your account and complete the
            registration process.
          </p>
          <div className="bg-slate-700/50 rounded-lg p-4 text-sm text-slate-300">
            <p className="font-medium text-yellow-400 mb-2">
              📋 Didn&apos;t receive the email?
            </p>
            <ul className="text-left space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure the email address is correct</li>
              <li>• Wait a few minutes for delivery</li>
            </ul>
          </div>
          {resendMessage && (
            <div
              className={`rounded-md p-3 ${
                resendMessage.includes('successfully')
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              <p className="text-sm">{resendMessage}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleResendEmail}
            disabled={isResending || !email}
            className="w-full rounded-md bg-sky-600 px-4 py-3 text-sm font-medium text-white hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? 'Resending...' : 'Resend Verification Email'}
          </button>

          <div className="flex space-x-3">
            <button
              onClick={handleBackToSignup}
              className="flex-1 rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Back to Signup
            </button>
            <button
              onClick={handleBackToLogin}
              className="flex-1 rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
          Loading...
        </div>
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
}
