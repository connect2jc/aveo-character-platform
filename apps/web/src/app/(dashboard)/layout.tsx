'use client';

import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardHeader } from '@/components/layout/header';
import { ToastProvider } from '@/components/ui/toast';
import { useAuthStore } from '@/stores/auth-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
      <ToastProvider />
    </div>
  );
}
