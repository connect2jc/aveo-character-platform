import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Aveo</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
