'use client';

import Link from 'next/link';
import { User } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Plan
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Videos
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Joined
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3">
                  <Avatar name={user.full_name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </Link>
              </td>
              <td className="px-6 py-4">
                <Badge>{user.subscription_tier}</Badge>
              </td>
              <td className="px-6 py-4">
                <Badge
                  variant={
                    user.subscription_status === 'active'
                      ? 'success'
                      : user.subscription_status === 'past_due'
                      ? 'error'
                      : 'warning'
                  }
                >
                  {user.subscription_status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {user.monthly_video_count} / {user.monthly_video_limit}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {formatDate(user.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
