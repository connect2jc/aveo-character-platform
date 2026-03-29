'use client';

import { CreditCard, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UsageMeter } from '@/components/dashboard/usage-meter';
import { useAuthStore } from '@/stores/auth-store';
import { PLANS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export default function BillingPage() {
  const { user } = useAuthStore();
  const currentPlan = user?.subscription_tier
    ? PLANS[user.subscription_tier]
    : PLANS.starter;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Usage</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your subscription and view usage details.
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </div>
            <Badge variant={user?.subscription_status === 'active' ? 'success' : 'warning'}>
              {user?.subscription_status || 'active'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {currentPlan?.name || 'Starter'}
            </span>
            <span className="text-lg text-gray-500">
              {formatCurrency(currentPlan?.price || 79)}/month
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {currentPlan?.characters} character{(currentPlan?.characters || 0) > 1 ? 's' : ''},{' '}
            {currentPlan?.videos} videos/month, {currentPlan?.distribution}
          </p>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" size="sm">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
            <Button variant="ghost" size="sm">
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UsageMeter
          title="Videos This Month"
          used={user?.monthly_video_count || 0}
          limit={user?.monthly_video_limit || 30}
          unit="videos"
        />
        <UsageMeter
          title="Characters"
          used={0}
          limit={currentPlan?.characters || 1}
          unit="characters"
        />
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">No payment method on file</p>
                <p className="text-xs text-gray-500">Add a card to continue after your trial</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Add Card
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-sm text-gray-500">No billing history yet.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
