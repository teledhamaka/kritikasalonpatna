// ========================================
// app/rss.xml/route.ts - RSS FEED
// ========================================
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  const baseUrl = 'https://kritikasalonpatna.com'; // Replace with your domain
  const supabase = await createServerClient();

  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      slug, title, excerpt, published_at, updated_at,
      author:authors!inner(name),
      category:categories!inner(name)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Beauty & You Blog - Patna's Best Beauty Salon</title>
    <link>${baseUrl}/blog</link>
    <description>Latest beauty tips, makeup tutorials, hair care advice, and wellness guides from Patna's trusted salon</description>
    <language>hi-IN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${(posts || [])
      .map((post: any) => {
        const author = Array.isArray(post.author) ? post.author[0] : post.author;
        const category = Array.isArray(post.category) ? post.category[0] : post.category;
        
        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
      <author>${author?.name || 'Beauty Expert'}</author>
      <category>${category?.name || 'Beauty'}</category>
    </item>`;
      })
      .join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
