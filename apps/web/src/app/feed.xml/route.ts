const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://aveo.ai';

const blogPosts = [
  {
    slug: 'getting-started-with-ai-characters',
    title: 'Getting Started with AI Characters for Short Form Video',
    excerpt: 'Learn how to create your first AI character and start producing engaging content at scale.',
    date: '2026-03-15',
    category: 'Tutorial',
  },
  {
    slug: 'best-hooks-for-tiktok',
    title: 'The 10 Best Hook Formulas for TikTok Videos',
    excerpt: 'Discover the hook patterns that drive the highest engagement on TikTok and other short form platforms.',
    date: '2026-03-10',
    category: 'Strategy',
  },
  {
    slug: 'scaling-content-production',
    title: 'How to Scale From 10 to 100 Videos Per Month',
    excerpt: 'A step by step guide to ramping up your content production using AI automation.',
    date: '2026-03-05',
    category: 'Growth',
  },
  {
    slug: 'ai-voice-synthesis-guide',
    title: 'AI Voice Synthesis: A Complete Guide for Content Creators',
    excerpt: 'Everything you need to know about AI voice technology and how to choose the right voice for your brand.',
    date: '2026-02-28',
    category: 'Technology',
  },
];

export async function GET() {
  const items = blogPosts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${BASE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category>${post.category}</category>
    </item>`
    )
    .join('\n');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Aveo Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Tips, tutorials, and insights for AI powered content creation</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
