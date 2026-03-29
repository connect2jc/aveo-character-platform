import Link from 'next/link';
import { PLANS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

const steps = [
  {
    number: '01',
    title: 'Describe Your Character',
    description:
      'Pick a niche, define your audience, and shape your character with a personality that resonates. Our wizard walks you through it in minutes.',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'AI Builds Everything',
    description:
      'Scripts, voiceover, lip sync, visuals. The entire production pipeline runs automatically. No prompts to write, no editing software required.',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Videos Published Automatically',
    description:
      'Set your schedule and walk away. Videos go out to TikTok, YouTube Shorts, and Instagram Reels on autopilot while you focus on your business.',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

const features = [
  {
    title: 'Character Creation',
    description: 'Design unique AI characters with custom look, personality, and backstory. Choose from niche templates or build entirely from scratch.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    title: 'Voice Design',
    description: 'Pick from dozens of natural voices or clone your own. Fine tune emotion, pace, and tone to match your character perfectly.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    title: 'Content Calendar',
    description: 'Plan weeks of content in advance with AI suggested topics. Drag and drop scheduling makes it effortless to stay consistent.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    title: 'Video Pipeline',
    description: 'Scripts, voiceover, lip sync, and compositing all happen automatically. Go from topic to finished video without lifting a finger.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V7.875c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v9.375m0 1.125c0 .621-.504 1.125-1.125 1.125m0 0h-1.5c-.621 0-1.125-.504-1.125-1.125M21 18.375V7.875m0 0H3.375m0 0h17.25M6 18.375v-1.5c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125v1.5m-12 0h12" />
      </svg>
    ),
  },
  {
    title: 'Auto Publishing',
    description: 'Connect TikTok, YouTube Shorts, and Instagram Reels once. Every video gets published on schedule, no manual uploads needed.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    ),
  },
  {
    title: 'Analytics',
    description: 'Track views, engagement, and follower growth across all platforms. Get AI powered suggestions to improve your content strategy.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

const testimonials = [
  {
    quote:
      'Aveo helped us produce 90 videos a month without hiring a single content creator. The quality is incredible.',
    name: 'Sarah Chen',
    role: 'Marketing Director, FinTech Startup',
    avatar: 'SC',
  },
  {
    quote:
      'We went from 0 to 50K followers in 3 months using Aveo characters. The consistency is what makes it work.',
    name: 'Marcus Johnson',
    role: 'Founder, FitLife Academy',
    avatar: 'MJ',
  },
  {
    quote:
      'The AI scripts are surprisingly good. They nail the hooks and our engagement rate is 3x what we had before.',
    name: 'Priya Patel',
    role: 'Content Strategist',
    avatar: 'PP',
  },
];

const metrics = [
  { value: '2M+', label: 'Videos Produced' },
  { value: '15K+', label: 'Creators' },
  { value: '98%', label: 'Uptime' },
  { value: '4.9/5', label: 'User Rating' },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0A0118]">
        {/* Background gradient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[128px]" />
          <div className="absolute right-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-indigo-600/20 blur-[128px]" />
          <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[128px]" />
        </div>
        {/* Grid pattern overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pb-32 sm:pt-28 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
              </span>
              Now in public beta
            </div>

            <h1 className="text-balance text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Create AI Character Brands That Produce Videos
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                {' '}While You Sleep
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-400 sm:text-xl">
              No tool juggling. No prompts. No editing. Just define your character once and
              watch a full video brand come to life, scripted, produced, and published automatically.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-600/40"
              >
                <span className="relative z-10">Start Free Trial</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-700 bg-white/5 px-8 text-base font-semibold text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-gray-600 hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                </svg>
                See How It Works
              </Link>
            </div>
            <p className="mt-5 text-sm text-gray-500">
              No credit card required. 14 day free trial.
            </p>
          </div>

          {/* Hero visual */}
          <div className="mx-auto mt-20 max-w-5xl">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-purple-900/20 backdrop-blur-sm">
              <div className="border-b border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/70" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <div className="h-3 w-3 rounded-full bg-green-500/70" />
                  <div className="ml-4 h-5 flex-1 rounded bg-white/5" />
                </div>
              </div>
              <div className="flex h-[420px] items-center justify-center bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/20 p-8">
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 ring-1 ring-purple-500/30">
                    <svg className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V7.875c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v9.375m0 1.125c0 .621-.504 1.125-1.125 1.125m0 0h-1.5c-.621 0-1.125-.504-1.125-1.125M21 18.375V7.875" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-white">Your AI Video Production Studio</p>
                  <p className="mt-2 text-sm text-gray-400">
                    Characters, scripts, videos, analytics. All in one place.
                  </p>
                  <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-4">
                    {['3 Characters', '47 Videos', '12K Views'].map((stat) => (
                      <div key={stat} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                        <p className="text-xs text-gray-400">{stat}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics bar */}
          <div className="mx-auto mt-20 max-w-4xl">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="text-center">
                  <p className="text-3xl font-bold text-white">{metric.value}</p>
                  <p className="mt-1 text-sm text-gray-500">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative bg-[#0A0118] py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-purple-600/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">How It Works</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Three steps to your AI video brand
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Go from zero to published in minutes, not months
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-12 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.number} className="group relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-gradient-to-r from-purple-500/50 to-transparent md:block" />
                )}
                <div className="relative flex flex-col items-center text-center">
                  <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 text-purple-400 transition-all duration-500 group-hover:border-purple-500/40 group-hover:shadow-lg group-hover:shadow-purple-500/10">
                    {step.icon}
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative bg-[#0A0118] py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-purple-600/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">Features</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to scale content
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              A complete platform for AI powered video production and distribution
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30 hover:bg-white/[0.07]"
              >
                <div className="mb-5 inline-flex rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 text-purple-400 transition-colors duration-300 group-hover:border-purple-500/30 group-hover:bg-purple-500/20">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 leading-relaxed text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative bg-[#0A0118] py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">Testimonials</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Loved by content creators
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              See what our customers are saying about Aveo
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.07]"
              >
                <div className="mb-5 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="leading-relaxed text-gray-300">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-sm font-semibold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="relative bg-[#0A0118] py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-1/4 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">Pricing</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`relative rounded-2xl border p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'border-purple-500/50 bg-gradient-to-b from-purple-500/10 to-transparent shadow-lg shadow-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-1 text-sm font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-white">
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
                  className={`mt-6 block rounded-lg py-3 text-center text-sm font-semibold transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                </Link>
                <ul className="mt-6 space-y-3">
                  {plan.features.slice(0, 5).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                      <svg className="h-5 w-5 flex-shrink-0 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
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

          <div className="mt-10 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 text-sm font-semibold text-purple-400 transition-colors hover:text-purple-300"
            >
              View full comparison
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-[#0A0118] py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/20 blur-[128px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to build your AI content brand?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Join thousands of creators using AI characters to produce engaging short form videos.
            Start your free trial today.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-10 text-base font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-600/40"
            >
              <span className="relative z-10">Start Free Trial</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-14 items-center justify-center rounded-lg border border-gray-700 bg-white/5 px-10 text-base font-semibold text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-gray-600 hover:bg-white/10 hover:text-white"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
