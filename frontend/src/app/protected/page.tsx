'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../services/apiClient';

interface ProtectedUserData {
  message: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    date_joined: string;
    last_login: string | null;
    email_verified_at: string | null;
  };
  authenticated: boolean;
  timestamp: string;
}

export default function ProtectedPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [protectedData, setProtectedData] = useState<ProtectedUserData | null>(
    null
  );
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      showToast('Please log in to access the protected page.', 'warning');
      router.push('/login?redirect=/protected');
    }
  }, [isAuthenticated, isLoading, router, showToast]);

  // Fetch protected data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProtectedData();
    }
  }, [isAuthenticated, user]);

  const fetchProtectedData = async () => {
    setDataLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/api/users/protected/');
      setProtectedData(response.data);
      showToast('Protected data loaded successfully!', 'success');
    } catch (err) {
      setError('Failed to load protected data. Please try again.');
      showToast('Failed to load protected data.', 'error');
      console.error('Protected data fetch error:', err);
    } finally {
      setDataLoading(false);
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔒 Protected Page
          </h1>
          <p className="text-slate-300 text-lg">
            This page requires authentication to access. Only logged-in users
            can see this content.
          </p>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        {/* Protected Data Display */}
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">
            Your Protected User Data
          </h2>

          {dataLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400 mx-auto mb-4"></div>
              <p className="text-slate-300">Loading protected data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
              <button
                onClick={fetchProtectedData}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {protectedData && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                <p className="text-green-400 font-medium">
                  ✅ {protectedData.message}
                </p>
              </div>

              {/* User Data Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-sky-400">
                    Basic Information
                  </h3>

                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <span className="text-slate-400 text-sm">User ID</span>
                    <p className="text-white font-mono">
                      {protectedData.user.id}
                    </p>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <span className="text-slate-400 text-sm">Email</span>
                    <p className="text-white">{protectedData.user.email}</p>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <span className="text-slate-400 text-sm">First Name</span>
                    <p className="text-white">
                      {protectedData.user.first_name || 'Not provided'}
                    </p>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <span className="text-slate-400 text-sm">Last Name</span>
                    <p className="text-white">
                      {protectedData.user.last_name || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-sky-400">
                    Account Status
                  </h3>

                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <span className="text-slate-400 text-sm">Active</span>
                    <p className="text-white">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          protectedData.user.is_active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {protectedData.user.is_active
                          ? '✅ Active'
                          : '❌ Inactive'}
                      </span>
                    </p>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <span className="text-slate-400 text-sm">Staff Member</span>
                    <p className="text-white">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          protectedData.user.is_staff
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {protectedData.user.is_staff ? '👔 Yes' : '👤 No'}
                      </span>
                    </p>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <span className="text-slate-400 text-sm">Superuser</span>
                    <p className="text-white">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          protectedData.user.is_superuser
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {protectedData.user.is_superuser ? '👑 Yes' : '👤 No'}
                      </span>
                    </p>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <span className="text-slate-400 text-sm">Date Joined</span>
                    <p className="text-white">
                      {new Date(
                        protectedData.user.date_joined
                      ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <span className="text-slate-400 text-sm">Last Login</span>
                    <p className="text-white">
                      {protectedData.user.last_login
                        ? new Date(
                            protectedData.user.last_login
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Never'}
                    </p>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <span className="text-slate-400 text-sm">Email Verified</span>
                    <p className="text-white">
                      {protectedData.user.email_verified_at ? (
                        <span className="flex items-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 mr-2">
                            ✅ Verified
                          </span>
                          <span className="text-sm text-slate-300">
                            {new Date(
                              protectedData.user.email_verified_at
                            ).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                          ⚠️ Not Verified
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Authentication Status */}
              <div className="bg-sky-500/20 border border-sky-500 rounded-lg p-4">
                <h3 className="text-sky-400 font-medium mb-2">
                  Authentication Status
                </h3>
                <p className="text-white">
                  ✅ Authenticated: {protectedData.authenticated ? 'Yes' : 'No'}
                </p>
                <p className="text-slate-300 text-sm mt-1">
                  This data was fetched securely using your JWT authentication
                  token.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
