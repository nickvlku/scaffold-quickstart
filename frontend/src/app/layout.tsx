// frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext'; // Adjust path
import { ToastProvider } from '../contexts/ToastContext';
import Navbar from '../components/layout/Navbar'; // Import Navbar

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Scaffold App',
  description: 'A reusable web application scaffold',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-slate-900 text-slate-100">
      {/* Added default bg/text */}
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <Navbar /> {/* Add Navbar here */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
