'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { User } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
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
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const videoPct = Math.round((user.monthly_video_count / user.monthly_video_limit) * 100);
              return (
                <tr
                  key={user.id}
                  className="group transition-colors hover:bg-gray-50 cursor-pointer"
                  onClick={() => window.location.href = `/admin/users/${user.id}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.full_name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        user.subscription_tier === 'pro' ? 'default' :
                        user.subscription_tier === 'growth' ? 'default' :
                        'secondary'
                      }
                    >
                      {user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        user.subscription_status === 'active'
                          ? 'success'
                          : user.subscription_status === 'past_due'
                          ? 'error'
                          : user.subscription_status === 'trialing'
                          ? 'default'
                          : 'warning'
                      }
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          user.subscription_status === 'active' ? 'bg-green-500' :
                          user.subscription_status === 'past_due' ? 'bg-red-500' :
                          user.subscription_status === 'trialing' ? 'bg-indigo-500' :
                          'bg-yellow-500'
                        )} />
                        {user.subscription_status}
                      </span>
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20">
                        <Progress
                          value={user.monthly_video_count}
                          max={user.monthly_video_limit}
                          color={videoPct > 80 ? 'red' : videoPct > 60 ? 'yellow' : 'indigo'}
                        />
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {user.monthly_video_count}/{user.monthly_video_limit}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
