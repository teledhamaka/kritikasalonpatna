'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  motion,
  useScroll,
  useSpring,
} from 'framer-motion';

import {
  Heart,
  Bookmark,
  Clock,
  Eye,
  Calendar,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  Check,
  ChevronUp,
  ArrowLeft,
  MessageCircle,
  Tag,
} from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';

interface BlogPostClientProps {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string;

    category: {
      id?: string;
      name: string;
      color?: string;
      icon?: string;
    };

    author: {
      id?: string;
      name: string;
      avatar: string;
      bio: string;
    };

    tags: string[];

    contentHtml: string;

    readTime: number;
    views: number;
    likes: number;
    publishedAt: string;
    featured?: boolean;

    internalLinks?: Array<{
      text: string;
      url: string;
      anchor?: string;
    }>;

    faq?: Array<{
      question: string;
      answer: string;
    }>;
  };
}

export default function BlogPostClient({
  post,
}: BlogPostClientProps) {
  const safePost = useMemo(
    () => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || '',
      coverImage:
        post.coverImage ||
        '/images/all-services.webp',

      category:
        post.category || {
          id: 'general',
          name: 'Beauty',
          color: 'pink',
        },

      author:
        post.author || {
          id: 'team',
          name: 'Kritika Salon Team',
          avatar:
            '/images/default-avatar.jpg',
          bio: '',
        },

      tags: post.tags || [],

      /*
       * IMPORTANT:
       * Do not replace real Markdown content
       * with "Content coming soon".
       *
       * The server has already loaded the .md file.
       */
      contentHtml: post.contentHtml,

      readTime:
        post.readTime || 5,

      views:
        post.views || 0,

      likes:
        post.likes || 0,

      publishedAt:
        post.publishedAt,

      featured:
        post.featured || false,

      internalLinks:
        post.internalLinks || [],

      faq:
        post.faq || [],
    }),
    [post]
  );

  const [liked, setLiked] =
    useState(false);

  const [bookmarked, setBookmarked] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [showScrollTop, setShowScrollTop] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState('');

  const [toc, setToc] = useState<
    Array<{
      id: string;
      text: string;
    }>
  >([]);

  const contentRef =
    useRef<HTMLDivElement>(null);

  const {
    scrollYProgress,
  } = useScroll();

  const scaleX = useSpring(
    scrollYProgress,
    {
      stiffness: 100,
      damping: 30,
      restDelta: 0.001,
    }
  );

  /*
   * Generate TOC from the actual rendered
   * Markdown headings.
   */
  useEffect(() => {
    const container =
      contentRef.current;

    if (!container) return;

    const headings =
      container.querySelectorAll(
        'h2, h3'
      );

    const items: Array<{
      id: string;
      text: string;
    }> = [];

    headings.forEach(
      (heading, index) => {
        let id =
          heading.id;

        if (!id) {
          id = `section-${index + 1}`;
          heading.id = id;
        }

        const text =
          heading.textContent?.trim() ||
          '';

        if (text) {
          items.push({
            id,
            text,
          });
        }
      }
    );

    setToc(items);

    const handleScroll =
      () => {
        setShowScrollTop(
          window.scrollY > 500
        );

        let current = '';

        headings.forEach(
          (heading) => {
            const rect =
              heading.getBoundingClientRect();

            if (
              rect.top <= 130
            ) {
              current =
                heading.id;
            }
          }
        );

        setActiveSection(
          current
        );
      };

    handleScroll();

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );
    };
  }, [
    safePost.contentHtml,
  ]);

  /*
   * Increment views once per browser session
   * for this article.
   */
  useEffect(() => {
    const storageKey =
      `blog-viewed:${safePost.slug}`;

    try {
      if (
        sessionStorage.getItem(
          storageKey
        )
      ) {
        return;
      }

      sessionStorage.setItem(
        storageKey,
        '1'
      );
    } catch {
      // Ignore storage errors.
    }

    fetch(
      `/api/views/${encodeURIComponent(
        safePost.slug
      )}`,
      {
        method: 'POST',
      }
    ).catch(() => {});
  }, [
    safePost.slug,
  ]);

  const handleLike =
    async () => {
      const next =
        !liked;

      setLiked(next);

      try {
        await fetch(
          `/api/blog/${encodeURIComponent(
            safePost.slug
          )}/like`,
          {
            method: 'POST',
          }
        );
      } catch {
        // Keep optimistic UI.
      }
    };

  const shareUrl =
    typeof window !==
    'undefined'
      ? window.location.href
      : '';

  const shareOnFacebook =
    () => {
      if (!shareUrl) return;

      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`,
        '_blank',
        'noopener,noreferrer'
      );
    };

  const shareOnTwitter =
    () => {
      if (!shareUrl) return;

      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          safePost.title
        )}&url=${encodeURIComponent(
          shareUrl
        )}`,
        '_blank',
        'noopener,noreferrer'
      );
    };

  const shareOnLinkedIn =
    () => {
      if (!shareUrl) return;

      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl
        )}`,
        '_blank',
        'noopener,noreferrer'
      );
    };

  const copyLink =
    async () => {
      try {
        await navigator.clipboard.writeText(
          shareUrl
        );

        setCopied(true);

        window.setTimeout(
          () => {
            setCopied(false);
          },
          2000
        );
      } catch {
        // Clipboard may be unavailable.
      }
    };

  const scrollToTop =
    () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    };

  const formattedDate =
    new Date(
      safePost.publishedAt
    ).toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    );

  return (
    <div className="relative">

      {/* Reading Progress */}
      <motion.div
        className="fixed left-0 right-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
        style={{
          scaleX,
        }}
      />

      <motion.a
        href="/blog"
        initial={{
          opacity: 0,
          x: -20,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        className="mb-8 inline-flex items-center gap-2 font-semibold text-pink-600 transition-colors hover:text-pink-700"
      >
        <ArrowLeft
          size={20}
        />
        Back to Blog
      </motion.a>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

        {/* MAIN ARTICLE */}
        <main className="lg:col-span-8">

          <motion.article
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-8 overflow-hidden rounded-3xl bg-white shadow-xl"
          >

            {/* Cover */}
            <div className="relative h-64 bg-gradient-to-br from-pink-100 to-purple-100 sm:h-80 lg:h-96">

              <Image
                src={
                  safePost.coverImage
                }
                alt={
                  safePost.title
                }
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                <Link
                  href={`/blog/category/${safePost.category.id || 'hair-care'}`}
                  className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 shadow backdrop-blur hover:bg-white"
                >
                  {safePost.category.icon
                    ? `${safePost.category.icon} `
                    : ''}
                  {safePost.category.name}
                </Link>

                {safePost.featured && (
                  <span className="rounded-full bg-pink-500 px-4 py-2 text-sm font-bold text-white shadow">
                    ⭐ Featured
                  </span>
                )}
              </div>
            </div>

            {/* Header */}
            <div className="p-6 sm:p-8">

              {/* Author + date */}
              <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">

                <Link
                  href={`/blog/author/${safePost.author.id || 'parvatikumari'}`}
                  className="flex items-center gap-3"
                >
                  <Image
                    src={
                      safePost.author.avatar ||
                      '/images/default-avatar.jpg'
                    }
                    alt={
                      safePost.author.name
                    }
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full border-2 border-pink-200 object-cover"
                  />

                  <div>
                    <p className="font-semibold text-gray-900">
                      {
                        safePost.author.name
                      }
                    </p>

                    <p className="text-xs text-gray-500">
                      Beauty & Hair Care Expert
                    </p>
                  </div>
                </Link>

                <span className="hidden text-gray-300 sm:inline">
                  •
                </span>

                <div className="flex items-center gap-1">
                  <Calendar
                    size={16}
                    className="text-pink-500"
                  />

                  <time dateTime={safePost.publishedAt}>
                    {formattedDate}
                  </time>
                </div>

                <span className="hidden text-gray-300 sm:inline">
                  •
                </span>

                <div className="flex items-center gap-1">
                  <Clock
                    size={16}
                    className="text-purple-500"
                  />

                  <span>
                    {safePost.readTime} min read
                  </span>
                </div>

                <span className="hidden text-gray-300 sm:inline">
                  •
                </span>

                <div className="flex items-center gap-1">
                  <Eye
                    size={16}
                    className="text-blue-500"
                  />

                  <span>
                    {safePost.views.toLocaleString(
                      'en-IN'
                    )}{' '}
                    views
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
                {safePost.title}
              </h1>

              {/* Excerpt */}
              {safePost.excerpt && (
                <p className="mb-6 text-lg leading-relaxed text-gray-600 sm:text-xl">
                  {safePost.excerpt}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-6">

                <motion.button
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={
                    handleLike
                  }
                  aria-label={
                    liked
                      ? 'Unlike article'
                      : 'Like article'
                  }
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold transition-all ${
                    liked
                      ? 'bg-pink-500 text-white'
                      : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                  }`}
                >
                  <Heart
                    size={18}
                    fill={
                      liked
                        ? 'currentColor'
                        : 'none'
                    }
                  />

                  {safePost.likes +
                    (liked
                      ? 1
                      : 0)}
                </motion.button>

                <motion.button
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={() =>
                    setBookmarked(
                      !bookmarked
                    )
                  }
                  aria-label={
                    bookmarked
                      ? 'Remove bookmark'
                      : 'Bookmark article'
                  }
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold transition-all ${
                    bookmarked
                      ? 'bg-purple-500 text-white'
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  }`}
                >
                  <Bookmark
                    size={18}
                    fill={
                      bookmarked
                        ? 'currentColor'
                        : 'none'
                    }
                  />
                  Save
                </motion.button>

                <div className="ml-auto flex gap-2">

                  <button
                    onClick={
                      shareOnFacebook
                    }
                    aria-label="Share on Facebook"
                    className="rounded-full bg-blue-50 p-2.5 text-blue-600 transition-colors hover:bg-blue-100"
                  >
                    <Facebook
                      size={18}
                    />
                  </button>

                  <button
                    onClick={
                      shareOnTwitter
                    }
                    aria-label="Share on X"
                    className="rounded-full bg-sky-50 p-2.5 text-sky-600 transition-colors hover:bg-sky-100"
                  >
                    <Twitter
                      size={18}
                    />
                  </button>

                  <button
                    onClick={
                      shareOnLinkedIn
                    }
                    aria-label="Share on LinkedIn"
                    className="rounded-full bg-blue-50 p-2.5 text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    <Linkedin
                      size={18}
                    />
                  </button>

                  <button
                    onClick={
                      copyLink
                    }
                    aria-label="Copy article link"
                    className={`rounded-full p-2.5 transition-all ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {copied ? (
                      <Check
                        size={18}
                      />
                    ) : (
                      <Link2
                        size={18}
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.article>

          {/* ACTUAL MARKDOWN CONTENT */}
          <motion.article
            ref={contentRef}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
            }}
            className="blog-content mb-8 scroll-mt-28 rounded-3xl bg-white p-6 shadow-xl sm:p-8 lg:p-12"
            dangerouslySetInnerHTML={{
              __html:
                safePost.contentHtml,
            }}
          />

          {/* INTERNAL SERVICE LINKS */}
          {safePost.internalLinks.length >
            0 && (
            <section className="mb-8 rounded-3xl bg-white p-6 shadow-xl sm:p-8">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-gray-900">
                <Tag
                  size={20}
                  className="text-pink-500"
                />
                Related Services
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                {safePost.internalLinks.map(
                  (link) => (
                    <Link
                      key={`${link.url}-${link.text}`}
                      href={link.url}
                      className="rounded-xl border border-pink-100 bg-pink-50 p-4 transition hover:border-pink-300 hover:bg-pink-100"
                    >
                      <span className="font-semibold text-pink-700">
                        {link.text}
                      </span>

                      {link.anchor && (
                        <span className="mt-1 block text-sm text-gray-600">
                          {link.anchor}
                        </span>
                      )}
                    </Link>
                  )
                )}
              </div>
            </section>
          )}

          {/* TAGS */}
          {safePost.tags.length >
            0 && (
            <section className="mb-8 rounded-3xl bg-white p-6 shadow-xl sm:p-8">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Related Topics
              </h2>

              <div className="flex flex-wrap gap-2">
                {safePost.tags.map(
                  (tag) => (
                    <Link
                      key={tag}
                      href={`/blog?search=${encodeURIComponent(
                        tag
                      )}`}
                      className="rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-100"
                    >
                      #{tag}
                    </Link>
                  )
                )}
              </div>
            </section>
          )}

          {/* FAQ */}
          {safePost.faq.length >
            0 && (
            <section
              className="mb-8 rounded-3xl bg-white p-6 shadow-xl sm:p-8"
              aria-labelledby="faq-heading"
            >
              <h2
                id="faq-heading"
                className="mb-6 text-2xl font-bold text-gray-900"
              >
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                {safePost.faq.map(
                  (faq) => (
                    <details
                      key={
                        faq.question
                      }
                      className="group rounded-2xl border border-gray-200 bg-gray-50 p-5"
                    >
                      <summary className="cursor-pointer font-semibold text-gray-900 marker:text-pink-500">
                        {faq.question}
                      </summary>

                      <p className="mt-4 leading-7 text-gray-700">
                        {faq.answer}
                      </p>
                    </details>
                  )
                )}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="mb-8 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-8 text-center text-white shadow-xl">
            <h2 className="mb-3 text-2xl font-bold">
              Need Personalised Hair Care Help? 💖
            </h2>

            <p className="mx-auto mb-6 max-w-2xl opacity-95">
              Explore our professional hair care services or book an appointment at Kritika Ladies Beauty Parlour, Patna.
            </p>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                href="/booking"
                className="rounded-full bg-white px-6 py-3 font-bold text-pink-600 transition hover:shadow-xl"
              >
                💖 Book Appointment
              </Link>

              <Link
                href="/services/hair-care"
                className="rounded-full border-2 border-white px-6 py-3 font-bold text-white transition hover:bg-white hover:text-pink-600"
              >
                💇‍♀️ Hair Care Services
              </Link>

              <Link
                href="/blog"
                className="rounded-full border-2 border-white/70 px-6 py-3 font-bold text-white transition hover:bg-white hover:text-pink-600"
              >
                📚 More Articles
              </Link>
            </div>
          </section>

        </main>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4">

          {toc.length > 0 && (
            <div className="sticky top-24 rounded-3xl bg-white p-6 shadow-xl">

              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <MessageCircle
                  size={20}
                  className="text-pink-500"
                />
                Table of Contents
              </h2>

              <nav
                aria-label="Article sections"
                className="space-y-1"
              >
                {toc.map(
                  (item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block rounded-lg px-3 py-2 text-sm transition ${
                        activeSection ===
                        item.id
                          ? 'bg-pink-100 font-semibold text-pink-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-pink-600'
                      }`}
                    >
                      {item.text}
                    </a>
                  )
                )}
              </nav>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <Link
                  href={`/blog/category/${
                    safePost.category.id ||
                    'hair-care'
                  }`}
                  className="text-sm font-semibold text-pink-600 hover:text-pink-700"
                >
                  View more{' '}
                  {
                    safePost.category.name
                  } articles →
                </Link>
              </div>
            </div>
          )}

        </aside>
      </div>

      {/* Scroll Top */}
      {showScrollTop && (
        <motion.button
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          onClick={
            scrollToTop
          }
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 p-4 text-white shadow-2xl transition hover:scale-105 sm:bottom-8 sm:right-8"
        >
          <ChevronUp
            size={24}
          />
        </motion.button>
      )}
    </div>
  );
}