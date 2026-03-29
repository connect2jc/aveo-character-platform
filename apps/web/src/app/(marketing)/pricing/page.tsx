'use client';

import { useState } from 'react';
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
  { feature: 'A/B testing', starter: false, growth: true, pro: true },
  { feature: 'Custom branding', starter: false, growth: false, pro: true },
  { feature: 'API access', starter: false, growth: false, pro: true },
  { feature: 'Support', starter: 'Email', growth: 'Priority', pro: 'Dedicated' },
  { feature: 'Analytics', starter: 'Basic', growth: 'Advanced', pro: 'Advanced + Export' },
];

const faqs = [
  {
    question: 'What happens after my free trial ends?',
    answer:
      'Your 14 day free trial gives you full access to the Growth plan. When it ends, you can choose any plan to continue, or your account will be paused with no charges. You keep all your characters and content.',
  },
  {
    question: 'Can I change plans later?',
    answer:
      'Yes, you can upgrade or downgrade at any time. When upgrading, you get immediate access to new features. When downgrading, changes take effect at the next billing cycle. Your content is never deleted.',
  },
  {
    question: 'What counts as a "video"?',
    answer:
      'Each completed video that goes through our production pipeline counts as one video. Draft scripts and failed renders do not count toward your limit. Re renders of the same script also do not count extra.',
  },
  {
    question: 'Do you offer annual pricing?',
    answer:
      'Yes. Annual plans come with a 20% discount, saving you between $190 and $1,190 per year depending on your plan. Contact our sales team for custom enterprise pricing with volume discounts.',
  },
  {
    question: 'Can I use my own voice?',
    answer:
      'Pro plan users can clone their own voice or any voice they have rights to use. Growth plan users can choose from our library of 20+ professional voices. All voices support emotion and pacing control.',
  },
  {
    question: 'What platforms do you publish to?',
    answer:
      'We support TikTok, YouTube Shorts, and Instagram Reels. Starter users publish manually via download, Growth gets 2 platforms with auto publish, and Pro gets unlimited auto publishing to all platforms.',
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const getPrice = (price: number) => {
    if (isAnnual) {
      return formatCurrency(Math.round(price * 0.8));
    }
    return formatCurrency(price);
  };

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden bg-[#0A0118] pb-4 pt-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[128px]" />
          <div className="absolute right-1/4 top-1/4 h-[300px] w-[300px] rounded-full bg-indigo-600/15 blur-[100px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">Pricing</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Plans for every stage of growth
            </h1>
            <p className="mt-6 text-lg text-gray-400">
              Choose the plan that fits your content needs. All plans include a 14 day free trial.
            </p>

            {/* Billing toggle */}
            <div className="mt-10 inline-flex items-center gap-4 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-sm">
              <button
                onClick={() => setIsAnnual(false)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                  !isAnnual
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                  isAnnual
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Annual
                <span className="ml-2 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-400">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'border-purple-500/50 bg-gradient-to-b from-purple-500/10 to-transparent shadow-lg shadow-purple-500/10 scale-[1.02]'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-1 text-sm font-semibold text-white shadow-lg shadow-purple-500/25">
                      Most Popular
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-bold text-white">
                      {getPrice(plan.price)}
                    </span>
                    <span className="ml-2 text-gray-500">/month</span>
                  </div>
                  {isAnnual && (
                    <p className="mt-1 text-sm text-green-400">
                      {formatCurrency(plan.price * 12 * 0.2)} saved per year
                    </p>
                  )}
                  <p className="mt-3 text-sm text-gray-500">
                    {plan.characters} character{plan.characters > 1 ? 's' : ''},{' '}
                    {plan.videos} videos/mo, {plan.distribution}
                  </p>
                </div>

                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-400">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400"
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
                  className={`mt-8 block rounded-lg py-3 text-center text-sm font-semibold transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-indigo-500'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Money-back guarantee */}
          <div className="mx-auto mt-12 max-w-md text-center">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/5 px-6 py-4">
              <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <div className="text-left">
                <p className="text-sm font-semibold text-green-400">30 Day Money Back Guarantee</p>
                <p className="text-xs text-gray-500">Not happy? Get a full refund, no questions asked.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="relative bg-[#0A0118] py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-purple-600/5 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-2xl font-bold text-white">
            Feature Comparison
          </h2>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                      Starter
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-purple-400">
                      Growth
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                      Pro
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {comparisonFeatures.map((row) => (
                    <tr key={row.feature} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-6 py-4 text-sm text-gray-400">{row.feature}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">
                        {typeof row.starter === 'boolean' ? (
                          row.starter ? (
                            <svg className="mx-auto h-5 w-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="mx-auto h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )
                        ) : (
                          row.starter
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-medium text-white">
                        {typeof row.growth === 'boolean' ? (
                          row.growth ? (
                            <svg className="mx-auto h-5 w-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="mx-auto h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )
                        ) : (
                          row.growth
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">
                        {typeof row.pro === 'boolean' ? (
                          row.pro ? (
                            <svg className="mx-auto h-5 w-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="mx-auto h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )
                        ) : (
                          row.pro
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative bg-[#0A0118] py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-indigo-600/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-center text-2xl font-bold text-white">
            Frequently Asked Questions
          </h2>
          <p className="mb-12 text-center text-gray-400">
            Everything you need to know about Aveo. Can&apos;t find what you&apos;re looking for? Reach out to our team.
          </p>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/20"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <h3 className="pr-4 text-base font-semibold text-white">{faq.question}</h3>
                  <svg
                    className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-300 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? 'max-h-96 pb-5' : 'max-h-0'
                  }`}
                >
                  <p className="px-6 leading-relaxed text-gray-400">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[#0A0118] py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/20 blur-[128px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Start your 14 day free trial today
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            No credit card required. Cancel anytime. Full access to the Growth plan.
          </p>
          <Link
            href="/register"
            className="group relative mt-10 inline-flex h-14 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-10 text-base font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-600/40"
          >
            <span className="relative z-10">Get Started Free</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Link>
        </div>
      </section>
    </>
  );
}
