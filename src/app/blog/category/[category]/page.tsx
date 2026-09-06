// src/app/blog/category/[category]/page.tsx

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import {
  getAllPosts,
  getAllRawPosts,
} from '@/lib/blog';

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

const SITE_NAME =
  'Kritika Ladies Beauty Parlour';

export const dynamicParams = true;

export async function generateStaticParams() {
  const posts =
    await getAllRawPosts();

  const categories =
    Array.from(
      new Set(
        posts
          .map(
            (post) =>
              post.metadata.category
          )
          .filter(Boolean)
      )
    );

  return categories.map(
    (category) => ({
      category,
    })
  );
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { category: categoryId } =
    await params;

  const posts =
    await getAllPosts();

  const categoryPost =
    posts.find(
      (post) =>
        post.category.id ===
        categoryId
    );

  if (!categoryPost) {
    return {
      title:
        'Category Not Found | Beauty Blog',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${categoryPost.category.name} | Beauty Blog | ${SITE_NAME}`,

    description:
      categoryPost.category.description,

    alternates: {
      canonical: `https://www.kritikasalonpatna.com/blog/category/${categoryId}`,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title:
        `${categoryPost.category.name} | Beauty Blog`,
      description:
        categoryPost.category.description,
      type: 'website',
    },
  };
}

export default async function CategoryPage({
  params,
}: PageProps) {
  const { category: categoryId } =
    await params;

  const posts =
    await getAllPosts();

  const categoryPosts =
    posts.filter(
      (post) =>
        post.category.id ===
        categoryId
    );

  if (
    categoryPosts.length === 0
  ) {
    notFound();
  }

  const category =
    categoryPosts[0].category;

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

            <span className="font-medium text-gray-900">
              {category.name}
            </span>
          </div>
        </nav>

        {/* Header */}
        <section className="mb-12 overflow-hidden rounded-3xl bg-white shadow-xl">
          <div
            className={`bg-gradient-to-r ${category.gradient} px-6 py-12 text-center text-white sm:px-10`}
          >
            <div className="mb-3 text-5xl">
              {category.icon}
            </div>

            <h1 className="text-3xl font-bold sm:text-4xl">
              {category.name}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base opacity-95 sm:text-lg">
              {category.description}
            </p>

            <p className="mt-4 text-sm font-medium opacity-90">
              {categoryPosts.length}{' '}
              {categoryPosts.length ===
              1
                ? 'Article'
                : 'Articles'}
            </p>
          </div>
        </section>

        {/* Posts */}
        <section>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">

            {categoryPosts.map(
              (post) => (
                <article
                  key={post.slug}
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

                      <h2 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition group-hover:text-pink-600">
                        {post.title}
                      </h2>

                      <p className="line-clamp-3 text-sm leading-6 text-gray-600">
                        {post.excerpt}
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
        </section>

        {/* Back */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="font-semibold text-pink-600 hover:text-pink-700"
          >
            ← View All Beauty Articles
          </Link>
        </div>

      </div>
    </main>
  );
}