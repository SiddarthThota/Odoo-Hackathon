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
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-[#2F5FDB] animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading application...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
