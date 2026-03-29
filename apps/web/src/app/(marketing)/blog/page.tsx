import Link from 'next/link';

const posts = [
  {
    slug: 'getting-started-with-ai-characters',
    title: 'Getting Started with AI Characters for Short Form Video',
    excerpt: 'Learn how to create your first AI character and start producing engaging content at scale.',
    date: 'March 15, 2026',
    category: 'Tutorial',
    readTime: '5 min read',
  },
  {
    slug: 'best-hooks-for-tiktok',
    title: 'The 10 Best Hook Formulas for TikTok Videos',
    excerpt: 'Discover the hook patterns that drive the highest engagement on TikTok and other short form platforms.',
    date: 'March 10, 2026',
    category: 'Strategy',
    readTime: '7 min read',
  },
  {
    slug: 'scaling-content-production',
    title: 'How to Scale From 10 to 100 Videos Per Month',
    excerpt: 'A step by step guide to ramping up your content production using AI automation.',
    date: 'March 5, 2026',
    category: 'Growth',
    readTime: '6 min read',
  },
  {
    slug: 'ai-voice-synthesis-guide',
    title: 'AI Voice Synthesis: A Complete Guide for Content Creators',
    excerpt: 'Everything you need to know about AI voice technology and how to choose the right voice for your brand.',
    date: 'February 28, 2026',
    category: 'Technology',
    readTime: '8 min read',
  },
];

export default function BlogPage() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Blog</h1>
          <p className="mt-4 text-lg text-gray-600">
            Tips, tutorials, and insights for AI powered content creation
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-gray-200 p-6 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                  {post.category}
                </span>
                <span className="text-xs text-gray-400">{post.readTime}</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600">
                {post.title}
              </h2>
              <p className="mt-2 text-gray-600">{post.excerpt}</p>
              <p className="mt-4 text-sm text-gray-400">{post.date}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
