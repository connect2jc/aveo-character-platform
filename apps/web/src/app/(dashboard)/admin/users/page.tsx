'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserTable } from '@/components/admin/user-table';
import { SkeletonTable } from '@/components/ui/skeleton';
import { useRequireAdmin } from '@/hooks/use-auth';
import { User } from '@/types';
import { cn } from '@/lib/utils';

type PlanFilter = 'all' | 'starter' | 'growth' | 'pro';
type StatusFilter = 'all' | 'active' | 'cancelled' | 'past_due' | 'trialing';

const ITEMS_PER_PAGE = 10;

export default function AdminUsersPage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const [users] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'full_name' | 'created_at' | 'monthly_video_count'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const filteredUsers = useMemo(() => {
    let result = users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (planFilter !== 'all') {
      result = result.filter((u) => u.subscription_tier === planFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter((u) => u.subscription_status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });

    return result;
  }, [users, search, planFilter, statusFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, planFilter, statusFilter]);

  if (authLoading) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage platform users.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Plan Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <div className="flex rounded-lg border border-gray-200 p-0.5">
            {(['all', 'starter', 'growth', 'pro'] as PlanFilter[]).map((plan) => (
              <button
                key={plan}
                onClick={() => setPlanFilter(plan)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                  planFilter === plan
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {plan === 'all' ? 'All Plans' : plan.charAt(0).toUpperCase() + plan.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past Due</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Sort by:</span>
          <select
            value={`${sortField}-${sortDir}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split('-') as [typeof sortField, typeof sortDir];
              setSortField(field);
              setSortDir(dir);
            }}
            className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="full_name-asc">Name A to Z</option>
            <option value="full_name-desc">Name Z to A</option>
            <option value="monthly_video_count-desc">Most Videos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable rows={8} />
      ) : paginatedUsers.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
          <Search className="mx-auto h-10 w-10 text-gray-300" />
          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            {search || planFilter !== 'all' || statusFilter !== 'all'
              ? 'No users match your filters'
              : 'No users found'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {search ? 'Try adjusting your search or filters.' : 'Users will appear here as they sign up.'}
          </p>
          {(search || planFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearch('');
                setPlanFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <UserTable users={paginatedUsers} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of{' '}
                {filteredUsers.length} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-9"
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
