import { Navbar } from "@/components/layout/Navbar";

import { AuthProvider } from "@/components/providers/AuthProvider";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
