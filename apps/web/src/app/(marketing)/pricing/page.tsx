import Link from 'next/link';
import { PLANS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

const comparisonFeatures = [
  { feature: 'AI Characters', starter: '1', growth: '3', pro: '10' },
  { feature: 'Videos per month', starter: '30', growth: '90', pro: '300' },
  { feature: 'Script generation', starter: 'Basic', growth: 'Advanced', pro: 'Premium' },
  { feature: 'Voice options', starter: '5 voices', growth: '20 voices', pro: 'All + custom' },
  { feature: 'Video resolution', starter: '720p', growth: '1080p', pro: '4K' },
  { feature: 'Platform publishing', starter: 'Manual', growth: '2 platforms', pro: 'Unlimited' },
  { feature: 'Content calendar', starter: 'Basic', growth: 'Advanced', pro: 'Advanced + AI' },
  { feature: 'A/B testing', starter: '—', growth: 'Yes', pro: 'Yes' },
  { feature: 'Custom branding', starter: '—', growth: '—', pro: 'Yes' },
  { feature: 'API access', starter: '—', growth: '—', pro: 'Yes' },
  { feature: 'Support', starter: 'Email', growth: 'Priority', pro: 'Dedicated' },
  { feature: 'Analytics', starter: 'Basic', growth: 'Advanced', pro: 'Advanced + Export' },
];

const faqs = [
  {
    question: 'What happens after my free trial ends?',
    answer:
      'Your 14 day free trial gives you full access to the Growth plan. When it ends, you can choose any plan to continue, or your account will be paused. No charges during the trial.',
  },
  {
    question: 'Can I change plans later?',
    answer:
      'Yes, you can upgrade or downgrade at any time. When upgrading, you get immediate access to new features. When downgrading, changes take effect at the next billing cycle.',
  },
  {
    question: 'What counts as a "video"?',
    answer:
      'Each completed video that goes through our production pipeline counts as one video. Draft scripts and failed renders do not count toward your limit.',
  },
  {
    question: 'Do you offer annual pricing?',
    answer:
      'Yes. Annual plans come with a 20% discount. Contact our sales team for custom enterprise pricing with volume discounts.',
  },
  {
    question: 'Can I use my own voice?',
    answer:
      'Pro plan users can clone their own voice or any voice they have rights to use. Growth plan users can choose from our library of 20+ professional voices.',
  },
  {
    question: 'What platforms do you publish to?',
    answer:
      'We support TikTok, YouTube Shorts, and Instagram Reels. Starter users publish manually, Growth gets 2 platforms, and Pro gets unlimited auto publishing.',
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Pricing Plans
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Choose the plan that fits your content needs. All plans include a 14 day free trial.
            </p>
          </div>

          {/* Plan Cards */}
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  plan.highlighted
                    ? 'border-indigo-600 shadow-xl shadow-indigo-600/10'
                    : 'border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-indigo-600 px-4 py-1 text-sm font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="ml-2 text-gray-500">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {plan.characters} character{plan.characters > 1 ? 's' : ''},{' '}
                    {plan.videos} videos/mo, {plan.distribution}
                  </p>
                </div>

                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`mt-8 block rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-900">
            Feature Comparison
          </h2>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Starter
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-indigo-600">
                    Growth
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparisonFeatures.map((row) => (
                  <tr key={row.feature}>
                    <td className="px-6 py-3 text-sm text-gray-700">{row.feature}</td>
                    <td className="px-6 py-3 text-center text-sm text-gray-600">{row.starter}</td>
                    <td className="px-6 py-3 text-center text-sm font-medium text-gray-900">
                      {row.growth}
                    </td>
                    <td className="px-6 py-3 text-center text-sm text-gray-600">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="divide-y divide-gray-200">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-6">
                <h3 className="text-base font-semibold text-gray-900">{faq.question}</h3>
                <p className="mt-3 text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Start your 14 day free trial today
          </h2>
          <p className="mt-3 text-indigo-200">
            No credit card required. Cancel anytime.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-indigo-600 shadow-lg transition-all hover:bg-indigo-50"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </>
  );
}
