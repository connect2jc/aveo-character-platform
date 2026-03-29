import Link from 'next/link';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const title = params.slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <article className="bg-white py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/blog"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            &larr; Back to Blog
          </Link>
        </div>

        <header className="mb-12">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
              Tutorial
            </span>
            <span className="text-sm text-gray-400">5 min read</span>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="mt-4 text-gray-500">March 15, 2026</p>
        </header>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed">
            This is a placeholder for the blog post content. In a production environment,
            this would be fetched from a CMS or markdown files.
          </p>
          <p className="mt-4 text-gray-700 leading-relaxed">
            The content would include rich text, images, code examples, and other media
            relevant to the topic of AI characters and video content creation.
          </p>

          <div className="my-8 rounded-xl bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900">Key Takeaways</h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start gap-2 text-gray-700">
                <svg className="mt-1 h-5 w-5 flex-shrink-0 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                AI characters enable consistent content production at scale
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <svg className="mt-1 h-5 w-5 flex-shrink-0 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                The content calendar helps plan and organize production workflows
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <svg className="mt-1 h-5 w-5 flex-shrink-0 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Multi platform publishing maximizes content reach and engagement
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Try Aveo Free
          </Link>
        </div>
      </div>
    </article>
  );
}
