'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  UserCog,
  CreditCard,
  Video,
  FileText,
  Shield,
  Ban,
  Gift,
  LogIn,
  Download,
  Mail,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useRequireAdmin } from '@/hooks/use-auth';
// import { cn } from '@/lib/utils';

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const { isLoading } = useRequireAdmin();
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [bonusDialogOpen, setBonusDialogOpen] = useState(false);
  const [bonusAmount, setBonusAmount] = useState('5');

  if (isLoading) return null;

  // Mock user data
  const userData = {
    id: params.id,
    name: 'Alex Johnson',
    email: 'alex@example.com',
    company: 'CreatorCo',
    plan: 'Growth',
    status: 'active',
    joined: 'Jan 15, 2026',
    lastActive: '2 hours ago',
    videosUsed: 42,
    videoLimit: 90,
    characters: 2,
    characterLimit: 3,
    scriptsGenerated: 67,
    totalSpent: 597,
  };

  const characters = [
    { id: '1', name: 'Marcus Finance', niche: 'Finance', videos: 18, status: 'active' },
    { id: '2', name: 'TechSara', niche: 'Tech & AI', videos: 24, status: 'active' },
  ];

  const recentVideos = [
    { id: '1', title: '5 Investment Tips for 2026', date: 'Mar 28, 2026', status: 'ready' },
    { id: '2', title: 'AI Tools You Need to Know', date: 'Mar 27, 2026', status: 'ready' },
    { id: '3', title: 'Budget Like a Pro', date: 'Mar 26, 2026', status: 'failed' },
  ];

  const invoices = [
    { id: 'inv_001', date: 'Mar 1, 2026', amount: 199, status: 'paid' },
    { id: 'inv_002', date: 'Feb 1, 2026', amount: 199, status: 'paid' },
    { id: 'inv_003', date: 'Jan 1, 2026', amount: 199, status: 'paid' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users" className="rounded-lg p-2 transition-colors hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">User Detail</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User Profile Sidebar */}
        <Card>
          <CardContent className="flex flex-col items-center py-8">
            <Avatar name={userData.name} size="lg" className="h-24 w-24 text-2xl" />
            <h3 className="mt-4 text-lg font-bold text-gray-900">{userData.name}</h3>
            <p className="text-sm text-gray-500">{userData.email}</p>
            {userData.company && (
              <p className="text-xs text-gray-400">{userData.company}</p>
            )}

            <div className="mt-3 flex items-center gap-2">
              <Badge variant="success">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {userData.status}
                </span>
              </Badge>
              <Badge variant="default">{userData.plan}</Badge>
            </div>

            <div className="mt-4 w-full rounded-lg bg-gray-50 p-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Joined</span>
                <span className="font-medium text-gray-700">{userData.joined}</span>
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-gray-500">Last Active</span>
                <span className="font-medium text-gray-700">{userData.lastActive}</span>
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-gray-500">Total Spent</span>
                <span className="font-medium text-gray-700">${userData.totalSpent}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 w-full space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Impersonate User
              </Button>
              <Button variant="outline" className="w-full" size="sm" onClick={() => setBonusDialogOpen(true)}>
                <Gift className="mr-2 h-4 w-4" />
                Add Bonus Videos
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Shield className="mr-2 h-4 w-4" />
                Reset Password
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                size="sm"
                onClick={() => setSuspendDialogOpen(true)}
              >
                <Ban className="mr-2 h-4 w-4" />
                Suspend Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Plan & Usage */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-indigo-500" />
                  Plan & Usage
                </CardTitle>
                <Button variant="outline" size="sm">
                  <UserCog className="mr-2 h-4 w-4" />
                  Change Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Videos Used</p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">{userData.videosUsed}</span>
                    <span className="text-sm text-gray-400">/ {userData.videoLimit}</span>
                  </div>
                  <Progress
                    value={userData.videosUsed}
                    max={userData.videoLimit}
                    className="mt-2"
                    color={userData.videosUsed / userData.videoLimit > 0.8 ? 'red' : 'indigo'}
                  />
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Characters</p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">{userData.characters}</span>
                    <span className="text-sm text-gray-400">/ {userData.characterLimit}</span>
                  </div>
                  <Progress
                    value={userData.characters}
                    max={userData.characterLimit}
                    className="mt-2"
                  />
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Scripts Generated</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{userData.scriptsGenerated}</p>
                  <p className="mt-2 text-xs text-gray-400">This billing period</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Characters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                Characters ({characters.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {characters.map((char) => (
                  <div key={char.id} className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={char.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{char.name}</p>
                        <p className="text-xs text-gray-500">{char.niche}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">{char.videos} videos</span>
                      <Badge variant={char.status === 'active' ? 'success' : 'secondary'}>
                        {char.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Videos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-4 w-4 text-indigo-500" />
                Recent Videos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {recentVideos.map((video) => (
                  <div key={video.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{video.title}</p>
                      <p className="text-xs text-gray-500">{video.date}</p>
                    </div>
                    <Badge variant={video.status === 'ready' ? 'success' : 'error'}>
                      {video.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Invoice History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-500" />
                Invoice History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Invoice</th>
                      <th className="px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                      <th className="px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
                      <th className="px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                      <th className="px-6 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-mono text-gray-600">{inv.id}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{inv.date}</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">${inv.amount}</td>
                        <td className="px-6 py-3">
                          <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>{inv.status}</Badge>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 ml-auto">
                            <Download className="h-3 w-3" />
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onClose={() => setSuspendDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <Ban className="h-5 w-5" />
            Suspend Account
          </DialogTitle>
          <DialogDescription>
            This will suspend the user&apos;s account and prevent them from accessing the platform. Their data will be preserved.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => setSuspendDialogOpen(false)}>
            Suspend Account
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Bonus Videos Dialog */}
      <Dialog open={bonusDialogOpen} onClose={() => setBonusDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-indigo-500" />
            Add Bonus Videos
          </DialogTitle>
          <DialogDescription>
            Grant additional videos to this user&apos;s current billing period.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of bonus videos</label>
          <input
            type="number"
            value={bonusAmount}
            onChange={(e) => setBonusAmount(e.target.value)}
            min="1"
            max="100"
            className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setBonusDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setBonusDialogOpen(false)}>
            Add {bonusAmount} Videos
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
