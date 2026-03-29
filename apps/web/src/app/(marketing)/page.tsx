import Link from 'next/link';
import { PLANS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

const steps = [
  {
    number: '01',
    title: 'Create Your Character',
    description:
      'Design a unique AI character with custom appearance, voice, and personality. Choose from templates or build from scratch.',
  },
  {
    number: '02',
    title: 'Generate Content',
    description:
      'Our AI writes scripts, generates speech, and produces lip synced videos automatically. Just set your content calendar.',
  },
  {
    number: '03',
    title: 'Publish Everywhere',
    description:
      'Distribute to TikTok, YouTube Shorts, and Instagram Reels with one click. Track performance across platforms.',
  },
];

const features = [
  {
    title: 'AI Script Writing',
    description: 'Generate engaging scripts tailored to your niche and audience with hook, body, and CTA structure.',
    icon: '📝',
  },
  {
    title: 'Realistic Voice Synthesis',
    description: 'Choose from dozens of natural voices or clone your own. Adjust tone, pace, and emotion.',
    icon: '🎙️',
  },
  {
    title: 'Lip Sync Technology',
    description: 'State of the art lip synchronization makes your character come alive with natural mouth movements.',
    icon: '👄',
  },
  {
    title: 'Content Calendar',
    description: 'Plan weeks of content in advance. Drag and drop scheduling with AI topic suggestions.',
    icon: '📅',
  },
  {
    title: 'Multi Platform Publishing',
    description: 'Publish to TikTok, YouTube Shorts, and Instagram Reels from a single dashboard.',
    icon: '🚀',
  },
  {
    title: 'Analytics Dashboard',
    description: 'Track views, engagement, and growth across all platforms. Get AI powered improvement suggestions.',
    icon: '📊',
  },
];

const testimonials = [
  {
    quote:
      'Aveo helped us produce 90 videos a month without hiring a single content creator. The quality is incredible.',
    name: 'Sarah Chen',
    role: 'Marketing Director, FinTech Startup',
  },
  {
    quote:
      'We went from 0 to 50K followers in 3 months using Aveo characters. The consistency is what makes it work.',
    name: 'Marcus Johnson',
    role: 'Founder, FitLife Academy',
  },
  {
    quote:
      'The AI scripts are surprisingly good. They nail the hooks and our engagement rate is 3x what we had before.',
    name: 'Priya Patel',
    role: 'Content Strategist',
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              AI Characters That Create
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {' '}
                Videos For You
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-600 sm:text-xl">
              Build unique AI characters, generate scripts, produce lip synced videos, and publish to
              TikTok, YouTube Shorts, and Instagram Reels. All on autopilot.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-700 hover:shadow-xl"
              >
                Start Free Trial
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-gray-300 bg-white px-8 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                See How It Works
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              No credit card required. 14 day free trial.
            </p>
          </div>

          {/* Hero visual placeholder */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/50">
              <div className="bg-gray-100 px-4 py-3">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
              </div>
              <div className="flex h-[400px] items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100">
                    <span className="text-3xl">🎬</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-700">Dashboard Preview</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Your AI video production studio
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Go from zero to published in three simple steps
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="mb-4 text-5xl font-bold text-indigo-100">{step.number}</div>
                <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-3 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything You Need to Scale Content
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              A complete platform for AI powered video production and distribution
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-200 bg-white p-8 transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 text-3xl">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`relative rounded-2xl border p-8 ${
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
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="ml-1 text-gray-500">/month</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {plan.characters} character{plan.characters > 1 ? 's' : ''}, {plan.videos}{' '}
                  videos/mo
                </p>
                <Link
                  href="/register"
                  className={`mt-6 block rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
                <ul className="mt-6 space-y-3">
                  {plan.features.slice(0, 5).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
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
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/pricing" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              View full comparison &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Loved by Content Creators
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See what our customers are saying about Aveo
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-gray-200 bg-white p-8"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-600 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Scale Your Content?
          </h2>
          <p className="mt-4 text-lg text-indigo-200">
            Join thousands of creators using AI characters to produce engaging short form videos.
            Start your free trial today.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-indigo-600 shadow-lg transition-all hover:bg-indigo-50"
            >
              Start Free Trial
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-indigo-400 px-8 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
