"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const publicPaths = ['/login', '/register'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !publicPaths.includes(pathname)) {
        router.push('/login');
      } else if (isAuthenticated && publicPaths.includes(pathname)) {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
