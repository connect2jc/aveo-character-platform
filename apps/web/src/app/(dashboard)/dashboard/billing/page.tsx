'use client';

import { CreditCard, ArrowUpRight, Download, Receipt, ExternalLink, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UsageMeter } from '@/components/dashboard/usage-meter';
import { useAuthStore } from '@/stores/auth-store';
import { PLANS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
// import { cn } from '@/lib/utils';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
}

export default function BillingPage() {
  const { user } = useAuthStore();
  const currentPlan = user?.subscription_tier
    ? PLANS[user.subscription_tier]
    : PLANS.starter;

  // Mock invoices for demo
  const invoices: Invoice[] = [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Usage</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your subscription and view usage details.
        </p>
      </div>

      {/* Current Plan */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </div>
            <Badge
              variant={user?.subscription_status === 'active' ? 'success' : 'warning'}
              className="text-xs"
            >
              {user?.subscription_status === 'active' ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Active
                </span>
              ) : (
                user?.subscription_status || 'active'
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
            <span className="text-4xl font-bold text-gray-900">
              {currentPlan?.name || 'Starter'}
            </span>
            <span className="text-lg text-gray-500">
              {formatCurrency(currentPlan?.price || 79)}/month
            </span>
          </div>

          {/* Plan Features Summary */}
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              `${currentPlan?.characters || 1} character${(currentPlan?.characters || 0) > 1 ? 's' : ''}`,
              `${currentPlan?.videos || 30} videos/month`,
              currentPlan?.distribution || 'Manual publishing',
            ].map((feature) => (
              <span
                key={feature}
                className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
              >
                <CheckCircle className="h-3 w-3" />
                {feature}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="sm" className="shadow-sm shadow-indigo-200">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500">
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage This Month */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Usage This Month</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UsageMeter
            title="Videos"
            used={user?.monthly_video_count || 0}
            limit={user?.monthly_video_limit || 30}
            unit="videos"
            planName={currentPlan?.name}
          />
          <UsageMeter
            title="Characters"
            used={0}
            limit={currentPlan?.characters || 1}
            unit="characters"
            planName={currentPlan?.name}
          />
          <UsageMeter
            title="Scripts Generated"
            used={0}
            limit={currentPlan?.videos || 30}
            unit="scripts"
            planName={currentPlan?.name}
          />
        </div>
      </section>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-200">
                <CreditCard className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">No payment method on file</p>
                <p className="mt-0.5 text-xs text-gray-500">Add a card to continue after your trial</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Add Card
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-gray-500" />
              Invoice History
            </CardTitle>
            {invoices.length > 0 && (
              <Button variant="ghost" size="sm" className="text-xs">
                Download All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{invoice.date}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(invoice.amount)}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            invoice.status === 'paid' ? 'success' :
                            invoice.status === 'failed' ? 'error' :
                            'warning'
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={invoice.downloadUrl}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <Receipt className="h-7 w-7 text-gray-300" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-gray-900">No invoices yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your billing history will appear here after your first payment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
