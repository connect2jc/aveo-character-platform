import Link from 'next/link';
import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://aveo.ai';

const posts: Record<string, { title: string; excerpt: string; date: string; category: string; readTime: string }> = {
  'getting-started-with-ai-characters': {
    title: 'Getting Started with AI Characters for Short Form Video',
    excerpt: 'Learn how to create your first AI character and start producing engaging content at scale.',
    date: '2026-03-15',
    category: 'Tutorial',
    readTime: '5 min read',
  },
  'best-hooks-for-tiktok': {
    title: 'The 10 Best Hook Formulas for TikTok Videos',
    excerpt: 'Discover the hook patterns that drive the highest engagement on TikTok and other short form platforms.',
    date: '2026-03-10',
    category: 'Strategy',
    readTime: '7 min read',
  },
  'scaling-content-production': {
    title: 'How to Scale From 10 to 100 Videos Per Month',
    excerpt: 'A step by step guide to ramping up your content production using AI automation.',
    date: '2026-03-05',
    category: 'Growth',
    readTime: '6 min read',
  },
  'ai-voice-synthesis-guide': {
    title: 'AI Voice Synthesis: A Complete Guide for Content Creators',
    excerpt: 'Everything you need to know about AI voice technology and how to choose the right voice for your brand.',
    date: '2026-02-28',
    category: 'Technology',
    readTime: '8 min read',
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = posts[params.slug];
  const title = post?.title || params.slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const description = post?.excerpt || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post?.date,
      url: `${BASE_URL}/blog/${params.slug}`,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts[params.slug];
  const title = post?.title || params.slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: post?.excerpt,
    datePublished: post?.date,
    author: { '@type': 'Organization', name: 'Aveo' },
    publisher: {
      '@type': 'Organization',
      name: 'Aveo',
      url: BASE_URL,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/blog/${params.slug}` },
  };

  return (
    <article className="bg-white py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/blog"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Back to Blog
          </Link>
        </div>

        <header className="mb-12">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
              {post?.category || 'Tutorial'}
            </span>
            <span className="text-sm text-gray-400">{post?.readTime || '5 min read'}</span>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="mt-4 text-gray-500">{post?.date || 'March 15, 2026'}</p>
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
