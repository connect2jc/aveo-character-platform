import Link from 'next/link';

const socialProof = [
  { value: '15K+', label: 'Creators' },
  { value: '2M+', label: 'Videos' },
  { value: '4.9/5', label: 'Rating' },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side: branding panel (hidden on mobile) */}
      <div className="relative hidden w-1/2 overflow-hidden bg-[#0A0118] lg:flex lg:flex-col lg:justify-between">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-indigo-600/15 blur-[100px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative flex flex-1 flex-col justify-center px-12 xl:px-16">
          {/* Logo */}
          <Link href="/" className="mb-12 inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <span className="text-2xl font-bold text-white">Aveo</span>
          </Link>

          {/* Tagline */}
          <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
            AI characters that create
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              {' '}videos for you
            </span>
          </h2>
          <p className="mt-4 max-w-md text-lg text-gray-400">
            Build your AI content brand. Scripts, voiceover, lip sync, and publishing. All on autopilot.
          </p>

          {/* Testimonial */}
          <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-gray-300">
              &ldquo;Aveo helped us produce 90 videos a month without hiring a single content creator. The quality is incredible.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-xs font-semibold text-white">
                SC
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Sarah Chen</p>
                <p className="text-xs text-gray-500">Marketing Director</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom metrics */}
        <div className="relative border-t border-white/10 px-12 py-6 xl:px-16">
          <div className="flex items-center gap-8">
            {socialProof.map((item) => (
              <div key={item.label}>
                <p className="text-lg font-bold text-white">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-12 sm:px-8">
        {/* Mobile logo */}
        <div className="mb-8 text-center lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Aveo</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>

        {/* Mobile social proof */}
        <div className="mt-8 flex items-center gap-6 lg:hidden">
          {socialProof.map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-sm font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
