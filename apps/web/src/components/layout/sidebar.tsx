'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Video,
  Share2,
  CreditCard,
  Settings,
  Shield,
  BarChart3,
  ListChecks,
  DollarSign,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';

const mainNav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Characters', href: '/dashboard/characters', icon: Users },
  { label: 'Videos', href: '/dashboard/videos', icon: Video },
  { label: 'Publishing', href: '/dashboard/publishing', icon: Share2 },
];

const accountNav = [
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const adminNav = [
  { label: 'Admin', href: '/admin', icon: Shield },
  { label: 'Users', href: '/admin/users', icon: BarChart3 },
  { label: 'Queue', href: '/admin/queue', icon: ListChecks },
  { label: 'Financials', href: '/admin/financials', icon: DollarSign },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useUIStore();
  const { user } = useAuthStore();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: typeof LayoutDashboard; label: string }) => (
    <Link
      href={href}
      onClick={() => setSidebarOpen(false)}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive(href)
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!sidebarCollapsed && <span>{label}</span>}
    </Link>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          {!sidebarCollapsed && (
            <span className="text-xl font-bold text-gray-900">Aveo</span>
          )}
        </Link>
        <button
          className="rounded-lg p-1 hover:bg-gray-100 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {!sidebarCollapsed && 'Main'}
        </p>
        {mainNav.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {!sidebarCollapsed && 'Account'}
        </p>
        {accountNav.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        {user?.is_admin && (
          <>
            <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {!sidebarCollapsed && 'Admin'}
            </p>
            {adminNav.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-gray-100 p-4">
        <div className="rounded-lg bg-indigo-50 p-3">
          <p className="text-xs font-medium text-indigo-900">
            {user?.subscription_tier === 'starter' ? 'Starter Plan' :
             user?.subscription_tier === 'growth' ? 'Growth Plan' : 'Pro Plan'}
          </p>
          <p className="mt-1 text-xs text-indigo-600">
            {user?.monthly_video_count || 0} / {user?.monthly_video_limit || 30} videos
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden border-r border-gray-200 bg-white lg:block',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
