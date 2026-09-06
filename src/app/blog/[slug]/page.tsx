
// src/app/blog/[slug]/page.tsx

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import BlogPostClient from './BlogPostClient';

import {
  getAllRawPosts,
  getPostBySlug,
  getCanonicalUrl,
  getAbsoluteImageUrl,
} from '@/lib/blog';

const SITE_URL =
  'https://www.kritikasalonpatna.com';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getAllRawPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { slug } = await params;

  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Blog Article Not Found | Kritika Salon Patna',
      description:
        'The requested beauty article could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const seoTitle =
    post.seo?.metaTitle ||
    post.title;

  const seoDescription =
    post.seo?.metaDescription ||
    post.excerpt;

  const canonical =
    post.seo?.canonicalUrl ||
    getCanonicalUrl(post.slug);

  const image = getAbsoluteImageUrl(
    post.seo?.openGraph?.image ||
      post.coverImage
  );

  return {
    title: seoTitle,
    description: seoDescription,

    keywords:
      post.seo?.keywords ||
      post.tags,

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview':
          'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },

    openGraph: {
      title:
        post.seo?.openGraph?.title ||
        seoTitle,
      description:
        post.seo?.openGraph?.description ||
        seoDescription,
      url: canonical,
      siteName:
        'Kritika Ladies Beauty Parlour',
      locale: 'hi_IN',
      type: 'article',
      publishedTime:
        post.publishedAt,
      modifiedTime:
        post.publishedAt,
      authors: [
        post.author.name,
      ],
      section:
        post.category.name,
      tags: post.tags,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title:
        post.seo?.twitter?.title ||
        seoTitle,
      description:
        post.seo?.twitter?.description ||
        seoDescription,
      images: [image],
    },

    metadataBase:
      new URL(SITE_URL),
  };
}

function JsonLd({
  post,
}: {
  post: Awaited<
    ReturnType<typeof getPostBySlug>
  >;
}) {
  if (!post) return null;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: [
      getAbsoluteImageUrl(
        post.coverImage
      ),
    ],
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: `${SITE_URL}/blog/author/${post.author.id}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Kritika Ladies Beauty Parlour',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/assets/logo.png`,
      },
    },
    datePublished:
      post.publishedAt,
    dateModified:
      post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': getCanonicalUrl(
        post.slug
      ),
    },
    articleSection:
      post.category.name,
    keywords:
      post.tags.join(', '),
  };

  const faqSchema =
    post.faq.length > 0
      ? {
          '@context':
            'https://schema.org',
          '@type': 'FAQPage',
          mainEntity:
            post.faq.map((faq) => ({
              '@type':
                'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type':
                  'Answer',
                text: faq.answer,
              },
            })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              articleSchema
            ),
        }}
      />

      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                faqSchema
              ),
          }}
        />
      )}
    </>
  );
}

export default async function BlogPostPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const post =
    await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <JsonLd post={post} />

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="container mx-auto max-w-7xl px-4 py-8">

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 text-sm text-gray-600"
          >
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link
                  href="/"
                  className="hover:text-pink-600"
                >
                  Home
                </Link>
              </li>

              <li aria-hidden="true">
                /
              </li>

              <li>
                <Link
                  href="/blog"
                  className="hover:text-pink-600"
                >
                  Blog
                </Link>
              </li>

              <li aria-hidden="true">
                /
              </li>

              <li
                className="line-clamp-1 text-gray-900"
                aria-current="page"
              >
                {post.title}
              </li>
            </ol>
          </nav>

          <BlogPostClient
            post={{
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt,
              coverImage:
                post.coverImage,
              category:
                post.category,
              author: {
                id:
                  post.author.id,
                name:
                  post.author.name,
                avatar:
                  post.author.avatar,
                bio:
                  post.author.bio,
              },
              tags: post.tags,
              contentHtml:
                post.contentHtml,
              readTime:
                post.readTime,
              views:
                post.views,
              likes:
                post.likes,
              publishedAt:
                post.publishedAt,
              featured:
                post.featured,
              internalLinks:
                post.internalLinks,
              faq:
                post.faq,
            }}
          />
        </div>
      </div>
    </>
  );
}