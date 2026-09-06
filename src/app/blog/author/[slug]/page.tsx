// src/app/blog/author/[slug]/page.tsx

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import {
  Award,
  Calendar,
  ArrowLeft,
} from 'lucide-react';

import {
  getAllPosts,
} from '@/lib/blog';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const posts =
    await getAllPosts();

  const authors =
    Array.from(
      new Set(
        posts.map(
          (post) =>
            post.author.id
        )
      )
    );

  return authors.map(
    (slug) => ({
      slug,
    })
  );
}

async function getAuthorPageData(
  slug: string
) {
  const posts =
    await getAllPosts();

  const authorPosts =
    posts.filter(
      (post) =>
        post.author.id ===
        slug
    );

  if (
    authorPosts.length === 0
  ) {
    return null;
  }

  const author =
    authorPosts[0].author;

  const totalViews =
    authorPosts.reduce(
      (sum, post) =>
        sum + (post.views || 0),
      0
    );

  const totalLikes =
    authorPosts.reduce(
      (sum, post) =>
        sum + (post.likes || 0),
      0
    );

  return {
    author,
    posts: authorPosts,
    stats: {
      totalPosts:
        authorPosts.length,
      totalViews,
      totalLikes,
    },
  };
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { slug } =
    await params;

  const data =
    await getAuthorPageData(
      slug
    );

  if (!data) {
    return {
      title:
        'Author Not Found | Beauty Blog',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${data.author.name} | Beauty Expert | Kritika Salon Patna`,

    description:
      data.author.bio,

    alternates: {
      canonical: `https://www.kritikasalonpatna.com/blog/author/${slug}`,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title:
        `${data.author.name} | Beauty Expert`,
      description:
        data.author.bio,
      type: 'profile',
      images: [
        {
          url:
            data.author.avatar,
          alt:
            data.author.name,
        },
      ],
    },
  };
}

export default async function AuthorPage({
  params,
}: PageProps) {
  const { slug } =
    await params;

  const data =
    await getAuthorPageData(
      slug
    );

  if (!data) {
    notFound();
  }

  const {
    author,
    posts,
    stats,
  } = data;

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12">
      <div className="container mx-auto max-w-7xl px-4">

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 text-sm text-gray-600"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="hover:text-pink-600"
            >
              Home
            </Link>

            <span>/</span>

            <Link
              href="/blog"
              className="hover:text-pink-600"
            >
              Blog
            </Link>

            <span>/</span>

            <span className="text-gray-900">
              {author.name}
            </span>
          </div>
        </nav>

        {/* Author Profile */}
        <section className="mb-12 overflow-hidden rounded-3xl bg-white shadow-2xl">

          <div className="h-32 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />

          <div className="px-6 pb-8 sm:px-8">

            <div className="-mt-16 flex flex-col gap-6 md:flex-row md:items-end">

              <Image
                src={
                  author.avatar ||
                  '/images/default-avatar.jpg'
                }
                alt={
                  author.name
                }
                width={128}
                height={128}
                className="h-32 w-32 rounded-full border-8 border-white object-cover shadow-xl"
              />

              <div className="flex-1">

                <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
                  {author.name}
                </h1>

                <p className="max-w-3xl text-base leading-7 text-gray-600 sm:text-lg">
                  {author.bio}
                </p>

                {author.expertise &&
                  author.expertise.length >
                    0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {author.expertise.map(
                        (skill) => (
                          <span
                            key={
                              skill
                            }
                            className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  )}

              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap gap-6 border-t border-gray-200 pt-6">

              <div className="flex items-center gap-2">
                <Award
                  size={20}
                  className="text-pink-500"
                />

                <span className="font-bold text-gray-900">
                  {stats.totalPosts}
                </span>

                <span className="text-gray-600">
                  Articles
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar
                  size={20}
                  className="text-purple-500"
                />

                <span className="font-bold text-gray-900">
                  {stats.totalViews.toLocaleString(
                    'en-IN'
                  )}
                </span>

                <span className="text-gray-600">
                  Views
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xl">
                  ❤️
                </span>

                <span className="font-bold text-gray-900">
                  {stats.totalLikes.toLocaleString(
                    'en-IN'
                  )}
                </span>

                <span className="text-gray-600">
                  Likes
                </span>
              </div>

            </div>

            {/* Social Links */}
            {author.socialLinks &&
              Object.keys(
                author.socialLinks
              ).length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {author.socialLinks.twitter && (
                    <a
                      href={
                        author.socialLinks.twitter
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                    >
                      Twitter
                    </a>
                  )}

                  {author.socialLinks.linkedin && (
                    <a
                      href={
                        author.socialLinks.linkedin
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      LinkedIn
                    </a>
                  )}

                  {author.socialLinks.instagram && (
                    <a
                      href={
                        author.socialLinks.instagram
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-700 hover:bg-pink-100"
                    >
                      Instagram
                    </a>
                  )}
                </div>
              )}

          </div>
        </section>

        {/* Articles */}
        <section>

          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Latest Articles by{' '}
              {
                author.name.split(
                  ' '
                )[0]
              }
            </h2>
          </div>

          {posts.length >
          0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">

              {posts.map(
                (post) => (
                  <article
                    key={
                      post.slug
                    }
                    className="group overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                    >
                      <div className="relative h-56 overflow-hidden bg-gray-100">

                        <img
                          src={
                            post.coverImage
                          }
                          alt={
                            post.title
                          }
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        {post.featured && (
                          <span className="absolute left-4 top-4 rounded-full bg-pink-500 px-3 py-1 text-xs font-bold text-white">
                            ⭐ Featured
                          </span>
                        )}

                      </div>

                      <div className="p-6">

                        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                          <span>
                            {new Date(
                              post.publishedAt
                            ).toLocaleDateString(
                              'en-IN',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }
                            )}
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            {post.readTime}{' '}
                            min read
                          </span>
                        </div>

                        <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 group-hover:text-pink-600">
                          {
                            post.title
                          }
                        </h3>

                        <p className="line-clamp-3 text-sm leading-6 text-gray-600">
                          {
                            post.excerpt
                          }
                        </p>

                        <div className="mt-5 font-semibold text-pink-600">
                          Read Article →
                        </div>

                      </div>
                    </Link>
                  </article>
                )
              )}

            </div>
          ) : (
            <div className="rounded-3xl bg-white py-20 text-center shadow-lg">
              <div className="mb-4 text-6xl">
                ✍️
              </div>

              <h3 className="mb-2 text-2xl font-bold text-gray-700">
                No posts yet
              </h3>

              <p className="text-gray-500">
                Stay tuned for upcoming articles!
              </p>
            </div>
          )}

        </section>

        {/* Back */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-semibold text-pink-600 hover:text-pink-700"
          >
            <ArrowLeft
              size={18}
            />
            Back to Blog
          </Link>
        </div>

      </div>
    </main>
  );
}