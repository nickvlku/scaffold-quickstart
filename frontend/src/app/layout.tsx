// frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import ClientLayout from '../components/layout/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Scaffold App',
  description: 'A reusable web application scaffold',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read auth state from middleware headers (Server Component)
  const headersList = await headers();
  const authUserHeader = headersList.get('X-Auth-User');
  const isAuthenticated = headersList.get('X-Auth-Authenticated') === 'true';
  
  // Parse user data if available
  let initialUser = null;
  if (authUserHeader) {
    try {
      initialUser = JSON.parse(authUserHeader);
      console.log('[Layout] Server-side auth state loaded for user:', initialUser.email);
    } catch (error) {
      console.error('[Layout] Failed to parse auth user header:', error);
    }
  }
  
  const initialAuthState = {
    user: initialUser,
    isAuthenticated,
    isLoading: false, // No loading needed - we have server state!
  };
  
  console.log('[Layout] Initial auth state:', { isAuthenticated, hasUser: !!initialUser });

  return (
    <html lang="en" className="bg-slate-900 text-slate-100">
      <body className={inter.className}>
        <ClientLayout initialAuthState={initialAuthState}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
