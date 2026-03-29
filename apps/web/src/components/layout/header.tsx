'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu, DropdownItem, DropdownSeparator } from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';

export function DashboardHeader() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>

        <div className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 md:flex">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <DropdownMenu
          trigger={
            <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100">
              <Avatar name={user?.full_name || 'User'} size="sm" />
              <span className="hidden text-sm font-medium text-gray-700 md:block">
                {user?.full_name || 'User'}
              </span>
            </button>
          }
        >
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <DropdownSeparator />
          <DropdownItem onClick={() => window.location.href = '/dashboard/settings'}>
            Settings
          </DropdownItem>
          <DropdownItem onClick={() => window.location.href = '/dashboard/billing'}>
            Billing
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem destructive onClick={() => logout()}>
            Sign out
          </DropdownItem>
        </DropdownMenu>
      </div>
    </header>
  );
}
