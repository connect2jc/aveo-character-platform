'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { UserTable } from '@/components/admin/user-table';
import { SkeletonTable } from '@/components/ui/skeleton';
import { useRequireAdmin } from '@/hooks/use-auth';
import { User } from '@/types';

export default function AdminUsersPage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const [users] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // In production, this would fetch from the API
    setIsLoading(false);
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage platform users.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {isLoading ? (
        <SkeletonTable rows={8} />
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
          <p className="text-sm text-gray-500">
            {search ? 'No users match your search.' : 'No users found.'}
          </p>
        </div>
      ) : (
        <UserTable users={filteredUsers} />
      )}
    </div>
  );
}
