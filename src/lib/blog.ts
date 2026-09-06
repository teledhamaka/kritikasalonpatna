// src/lib/blog.ts
//
// JSON + Markdown blog loader
// ---------------------------------------------
// blogData.json = SINGLE SOURCE OF TRUTH for all metadata/SEO/FAQ/links
// *.md          = article body content ONLY (no frontmatter, no HTML, no CSS)
//
// This file deliberately does NOT use Supabase.
// The public blog is driven by local JSON + Markdown.
//
// ─── ARCHITECTURE CONTRACT (read before editing) ───────────────────────────
// 1. Metadata (title, excerpt, SEO, FAQ, internalLinks, schema) lives ONLY in
//    blogData.json. Markdown files must NOT contain YAML frontmatter — any
//    frontmatter block found is stripped and silently discarded, so keeping
//    it around only invites the metadata to drift out of sync with the JSON
//    (this already happened once — see CONTENT-GUIDE.md).
// 2. Markdown files must NOT contain <style> tags or raw layout <div>s. The
//    renderer HTML-escapes anything it doesn't recognise as markdown syntax,
//    so embedded HTML does not "work" — it prints as literal escaped text.
//    All visual design lives in blog.css via the `.blog-content` namespace.
// 3. Never write a literal `#` (H1) for the article's own title inside the
//    markdown body — the real, single H1 is rendered separately from
//    metadata.title. Any `#` you do use for a major section is automatically
//    shifted down one level (see headingToTag below) so the page never ends
//    up with more than one H1.
// 4. A "## FAQ" / "## Frequently Asked Questions" heading followed by `###`
//    question headings is automatically wrapped into styled `.faq-item`
//    cards — no per-post CSS hacks needed for that pattern.

import fs from 'node:fs/promises';
import path from 'node:path';

// ─── Types ────────────────────────────────────────────────────────────────

export interface BlogPostMetadata {
  title: string;
  excerpt: string;
  date: string;
  coverImage: string;
  category: string;
  author: string;
  tags: string[];
  featured?: boolean;
  readTime?: number;
}

export interface BlogPostSeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  focusKeyword?: string;
  canonicalUrl?: string;
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
  };
}

export interface InternalLink {
  text: string;
  url: string;
  anchor?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RawBlogPost {
  slug: string;
  filePath: string;
  metadata: BlogPostMetadata;
  seo?: BlogPostSeo;
  internalLinks?: InternalLink[];
  faq?: FaqItem[];
  schema?: Record<string, unknown>;
  // Pre-authored content not yet consumed by any page/component
  // (packagePricing, viralHooks, checklists, etc). Kept so nothing
  // written by the content team is lost; safe to ignore until a
  // feature is built to use it.
  extra?: Record<string, unknown>;
}

export interface BlogAuthor {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  expertise?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface BlogCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: BlogCategory;
  author: BlogAuthor;
  tags: string[];
  contentHtml: string;
  contentMarkdown: string;
  readTime: number;
  views: number;
  likes: number;
  publishedAt: string;
  featured: boolean;
  seo?: BlogPostSeo;
  internalLinks: InternalLink[];
  faq: FaqItem[];
  schema?: Record<string, unknown>;
}

// ─── Constants ────────────────────────────────────────────────────────────

const PROJECT_ROOT = process.cwd();
const BLOG_DATA_PATH = path.join(
  PROJECT_ROOT,
  'src',
  'app',
  'blog',
  'blogData.json'
);
const CONTENT_ROOT = path.join(
  PROJECT_ROOT,
  'src',
  'content',
  'posts'
);
const SITE_URL = 'https://www.kritikasalonpatna.com';

// ─── Utilities ────────────────────────────────────────────────────────────

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

/**
 * Removes YAML frontmatter (between --- ... ---) from markdown content.
 * blogData.json is the single source of truth for metadata, so any
 * frontmatter present in a .md file is legacy/unused and is discarded here.
 * Assumes the first line is '---' and the block ends with another '---'.
 */
function stripFrontmatter(markdown: string): string {
  const lines = markdown.split('\n');
  if (lines.length > 0 && lines[0].trim() === '---') {
    let endIndex = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        endIndex = i;
        break;
      }
    }
    if (endIndex !== -1) {
      // Remove lines 0..endIndex (inclusive)
      return lines.slice(endIndex + 1).join('\n');
    }
  }
  return markdown;
}

function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Converts inline Markdown (bold, italic, links, images, code) to HTML.
 */
function inlineMarkdown(value: string): string {
  let text = escapeHtml(value);

  // Images: ![alt](/image.jpg)
  text = text.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_match, alt, url, title) => {
      const titleAttr = title
        ? ` title="${escapeAttribute(title)}"`
        : '';
      return `<img src="${escapeAttribute(
        url
      )}" alt="${escapeAttribute(alt)}"${titleAttr} loading="lazy" />`;
    }
  );

  // Links: [text](/url)
  text = text.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_match, label, url, title) => {
      const titleAttr = title
        ? ` title="${escapeAttribute(title)}"`
        : '';
      return `<a href="${escapeAttribute(
        url
      )}"${titleAttr}>${label}</a>`;
    }
  );

  // Bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Strikethrough
  text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  return text;
}

/**
 * Table row helpers (GFM-style pipe tables). Supports rows with or
 * without leading/trailing pipes.
 */
function looksLikeTableRow(line: string): boolean {
  const t = line.trim();
  return t.length > 0 && t.includes('|');
}

function splitTableRow(line: string): string[] {
  let t = line.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|')) t = t.slice(0, -1);
  return t.split('|').map((cell) => cell.trim());
}

function isTableSeparatorRow(line: string): boolean {
  if (!looksLikeTableRow(line)) return false;
  const cells = splitTableRow(line);
  return (
    cells.length > 0 &&
    cells.every((cell) => /^:?-{1,}:?$/.test(cell))
  );
}

/**
 * Wraps a "## FAQ" / "## Frequently Asked Questions" section's `### `
 * question headings into `.faq-item` cards so blog.css can style FAQs
 * generically, without per-post/per-word CSS selectors.
 */
function wrapFaqSections(blocks: string[]): string[] {
  const output: string[] = [];
  // Level of the current "## FAQ" heading, or null when not inside one.
  // Tracked by actual level rather than a fixed tag name, since heading
  // levels are shifted (see markdownToHtml) and a FAQ heading could end
  // up as h2 or h3 depending on how the author wrote it.
  let faqSectionLevel: number | null = null;
  let inFaqItem = false;

  const textOf = (block: string) => block.replace(/<[^>]+>/g, '');
  const headingLevel = (block: string): number | null => {
    const match = block.match(/^<h([1-6])\b/);
    return match ? parseInt(match[1], 10) : null;
  };

  for (const block of blocks) {
    const level = headingLevel(block);

    if (level !== null) {
      // Leaving the FAQ section once we hit a heading at or above its level
      if (faqSectionLevel !== null && level <= faqSectionLevel) {
        if (inFaqItem) {
          output.push('</div>');
          inFaqItem = false;
        }
        faqSectionLevel = null;
      }

      // Entering a FAQ section
      if (
        faqSectionLevel === null &&
        /faq|frequently asked questions/i.test(textOf(block))
      ) {
        faqSectionLevel = level;
        output.push(block);
        continue;
      }

      // A question heading one level below the FAQ section heading
      if (
        faqSectionLevel !== null &&
        level === faqSectionLevel + 1
      ) {
        if (inFaqItem) output.push('</div>');
        output.push('<div class="faq-item">');
        inFaqItem = true;
        output.push(block);
        continue;
      }
    }

    output.push(block);
  }

  if (inFaqItem) output.push('</div>');
  return output;
}

/**
 * Converts the project's Markdown into HTML.
 * Supports headings, lists, blockquotes, code blocks, HR, tables, and
 * paragraphs. Generates stable heading IDs for the TOC.
 *
 * Heading levels are shifted down by one (min h2, max h4): the page's
 * single H1 always comes from metadata.title, rendered separately, so a
 * literal `#` in the body becomes `<h2>` and so on. This guarantees a
 * post can never accidentally emit a second H1.
 */
export function markdownToHtml(markdown: string): string {
  const normalized = markdown
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  const html: string[] = [];
  let paragraph: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeLines: string[] = [];
  let inBlockquote = false;
  let quoteLines: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(' ').trim();
    if (text) {
      html.push(`<p>${inlineMarkdown(text)}</p>`);
    }
    paragraph = [];
  };

  const flushList = () => {
    if (!listType || !listItems.length) return;
    html.push(`<${listType}>${listItems.join('')}</${listType}>`);
    listType = null;
    listItems = [];
  };

  const flushBlockquote = () => {
    if (!inBlockquote || !quoteLines.length) return;
    const quoteHtml = markdownToHtml(quoteLines.join('\n'));
    html.push(`<blockquote>${quoteHtml}</blockquote>`);
    inBlockquote = false;
    quoteLines = [];
  };

  const flushCode = () => {
    if (!inCodeBlock) return;
    const code = escapeHtml(codeLines.join('\n'));
    const className = codeLanguage
      ? ` class="language-${escapeAttribute(codeLanguage)}"`
      : '';
    html.push(`<pre><code${className}>${code}</code></pre>`);
    inCodeBlock = false;
    codeLanguage = '';
    codeLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced code block
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCode();
      } else {
        flushParagraph();
        flushList();
        flushBlockquote();
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Blank line
    if (!line.trim()) {
      flushParagraph();
      flushList();
      flushBlockquote();
      continue;
    }

    // Horizontal rule
    if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(line)) {
      flushParagraph();
      flushList();
      flushBlockquote();
      html.push('<hr />');
      continue;
    }

    // Blockquote
    if (/^\s*>\s?/.test(line)) {
      flushParagraph();
      flushList();
      if (!inBlockquote) {
        inBlockquote = true;
        quoteLines = [];
      }
      quoteLines.push(line.replace(/^\s*>\s?/, ''));
      continue;
    }

    if (inBlockquote) {
      flushBlockquote();
    }

    // Table (GFM pipe tables): a row immediately followed by a
    // separator row (e.g. |---|---|)
    if (
      looksLikeTableRow(line) &&
      i + 1 < lines.length &&
      isTableSeparatorRow(lines[i + 1])
    ) {
      flushParagraph();
      flushList();

      const headerCells = splitTableRow(line);
      let cursor = i + 2; // skip header + separator
      const bodyRows: string[][] = [];

      while (
        cursor < lines.length &&
        looksLikeTableRow(lines[cursor]) &&
        !isTableSeparatorRow(lines[cursor])
      ) {
        bodyRows.push(splitTableRow(lines[cursor]));
        cursor++;
      }

      const theadHtml = `<thead><tr>${headerCells
        .map((cell) => `<th>${inlineMarkdown(cell)}</th>`)
        .join('')}</tr></thead>`;

      const tbodyHtml = `<tbody>${bodyRows
        .map(
          (row) =>
            `<tr>${row
              .map((cell) => `<td>${inlineMarkdown(cell)}</td>`)
              .join('')}</tr>`
        )
        .join('')}</tbody>`;

      html.push(`<table>${theadHtml}${tbodyHtml}</table>`);
      i = cursor - 1; // for-loop will advance past the last consumed row
      continue;
    }

    // Headings H1-H4 (source) -> shifted down one level, capped at H4
    const headingMatch = line.match(/^(#{1,4})\s+(.+?)\s*#*\s*$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const sourceLevel = headingMatch[1].length;
      const level = Math.min(sourceLevel + 1, 4);
      const text = headingMatch[2].trim();

      const explicitIdMatch = text.match(
        /\s*\{#([A-Za-z0-9_-]+)\}\s*$/
      );
      const cleanText = explicitIdMatch
        ? text.replace(/\s*\{#[A-Za-z0-9_-]+\}\s*$/, '')
        : text;
      const id = explicitIdMatch
        ? explicitIdMatch[1]
        : slugifyHeading(cleanText);

      const tag = `h${level}`;
      html.push(
        `<${tag} id="${escapeAttribute(id)}">${inlineMarkdown(
          cleanText
        )}</${tag}>`
      );
      continue;
    }

    // Unordered list
    const unorderedMatch = line.match(/^\s*[-*+]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (listType === 'ol') flushList();
      if (!listType) listType = 'ul';
      listItems.push(`<li>${inlineMarkdown(unorderedMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const orderedMatch = line.match(/^\s*\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType === 'ul') flushList();
      if (!listType) listType = 'ol';
      listItems.push(`<li>${inlineMarkdown(orderedMatch[1])}</li>`);
      continue;
    }

    // Normal paragraph line
    flushList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  flushBlockquote();
  flushCode();

  return wrapFaqSections(html).join('\n');
}

// ─── Data Loading ──────────────────────────────────────────────────────────

function resolveMarkdownPath(filePath: string): string {
  if (!filePath) {
    throw new Error('Blog post has no filePath in blogData.json.');
  }

  const normalized = filePath
    .replace(/^\.\/+/, '')
    .replace(/^\/+/, '');
  const absolutePath = path.resolve(PROJECT_ROOT, normalized);

  // Security: prevent escaping the project directory
  const relativeToRoot = path.relative(PROJECT_ROOT, absolutePath);
  if (
    relativeToRoot.startsWith('..') ||
    path.isAbsolute(relativeToRoot)
  ) {
    throw new Error(`Invalid blog Markdown path: ${filePath}`);
  }

  return absolutePath;
}

async function readBlogData(): Promise<{
  posts: RawBlogPost[];
  authors?: Record<string, BlogAuthor>;
  categories?: BlogCategory[];
}> {
  const raw = await fs.readFile(BLOG_DATA_PATH, 'utf8');
  const data = JSON.parse(raw);

  return {
    posts: Array.isArray(data.posts) ? data.posts : [],
    authors: data.authors || {},
    categories: Array.isArray(data.categories) ? data.categories : [],
  };
}

export async function getAllRawPosts(): Promise<RawBlogPost[]> {
  const data = await readBlogData();
  return data.posts;
}

export async function getRawPostBySlug(
  slug: string
): Promise<RawBlogPost | null> {
  const posts = await getAllRawPosts();
  return posts.find((post) => post.slug === slug) || null;
}

// ─── Author & Category Resolution ────────────────────────────────────────

async function getAuthorById(
  authorId: string
): Promise<BlogAuthor> {
  const data = await readBlogData();
  const author = data.authors?.[authorId];
  if (author) {
    return author;
  }

  // Fallback for legacy or missing author
  if (authorId === 'parvatikumari') {
    return {
      id: 'parvatikumari',
      name: 'Parvati Kumari',
      avatar: '/images/authors/default-avatar.jpg',
      bio: 'Lakme Delhi Trained Cosmetologist, BSc Chemistry with 5+ years experience in hair care and trichology.',
      expertise: ['Hair Fall Treatment', 'Hair Care', 'Trichology'],
      socialLinks: {
        twitter: 'https://twitter.com/salonic',
        linkedin: 'https://linkedin.com/in/salonic',
      },
    };
  }

  return {
    id: authorId,
    name: 'Kritika Salon Team',
    avatar: '/images/default-avatar.jpg',
    bio: 'Beauty and hair care experts at Kritika Ladies Beauty Parlour, Patna.',
    expertise: [],
    socialLinks: {},
  };
}

async function getCategoryById(
  categoryId: string
): Promise<BlogCategory> {
  const data = await readBlogData();
  const category = data.categories?.find(
    (cat) => cat.id === categoryId
  );
  if (category) return category;

  // Fallback categories
  const fallbackCategories: Record<string, BlogCategory> = {
    'hair-care': {
      id: 'hair-care',
      name: 'Hair Care',
      description: 'Expert hair care tips, treatments, and styling guides for beautiful, healthy hair',
      icon: '💇‍♀️',
      color: 'pink',
      gradient: 'from-pink-400 to-rose-500',
    },
    makeup: {
      id: 'makeup',
      name: 'Makeup & Beauty',
      description: 'Trending makeup looks, beauty tutorials, and product reviews',
      icon: '💄',
      color: 'purple',
      gradient: 'from-purple-400 to-pink-500',
    },
    'skin-care': {
      id: 'skin-care',
      name: 'Skin Care',
      description: 'Glowing skin secrets, facial treatments, and skincare routines',
      icon: '✨',
      color: 'blue',
      gradient: 'from-blue-400 to-purple-500',
    },
    bridal: {
      id: 'bridal',
      name: 'Bridal Services',
      description: 'Complete bridal packages, makeup tips, and wedding beauty guides',
      icon: '👰',
      color: 'rose',
      gradient: 'from-rose-400 to-pink-500',
    },
    'nail-art': {
      id: 'nail-art',
      name: 'Nail Art',
      description: 'Latest nail trends, designs, and manicure/pedicure tips',
      icon: '💅',
      color: 'red',
      gradient: 'from-red-400 to-pink-500',
    },
    'spa-wellness': {
      id: 'spa-wellness',
      name: 'Spa & Wellness',
      description: 'Relaxing spa treatments, wellness tips, and self-care routines',
      icon: '🧖‍♀️',
      color: 'teal',
      gradient: 'from-teal-400 to-blue-500',
    },
    'fashion-trends': {
      id: 'fashion-trends',
      name: 'Fashion & Trends',
      description: 'Latest fashion trends, styling tips, and seasonal looks',
      icon: '👗',
      color: 'indigo',
      gradient: 'from-indigo-400 to-purple-500',
    },
    'health-tips': {
      id: 'health-tips',
      name: 'Health & Wellness',
      description: 'Health tips, nutrition advice, and wellness guidance',
      icon: '🏥',
      color: 'green',
      gradient: 'from-green-400 to-teal-500',
    },
  };

  return (
    fallbackCategories[categoryId] || {
      id: categoryId,
      name: 'Beauty',
      description: 'Beauty, hair and wellness articles.',
      icon: '✨',
      color: 'pink',
      gradient: 'from-pink-400 to-purple-500',
    }
  );
}

// ─── Build Full Post ──────────────────────────────────────────────────────

async function buildBlogPost(rawPost: RawBlogPost): Promise<BlogPost> {
  const markdownPath = resolveMarkdownPath(rawPost.filePath);

  let markdown: string;
  try {
    markdown = await fs.readFile(markdownPath, 'utf8');
  } catch (error) {
    throw new Error(
      `Markdown file not found for blog "${rawPost.slug}". Expected: ${markdownPath}. Original filePath: ${rawPost.filePath}`
    );
  }

  if (!markdown.trim()) {
    throw new Error(
      `Markdown file is empty for blog "${rawPost.slug}": ${markdownPath}`
    );
  }

  // Metadata lives only in blogData.json — strip any legacy frontmatter
  // before converting to HTML rather than parsing it.
  const markdownBody = stripFrontmatter(markdown);
  const contentHtml = markdownToHtml(markdownBody);

  const author = await getAuthorById(rawPost.metadata.author);
  const category = await getCategoryById(rawPost.metadata.category);

  return {
    slug: rawPost.slug,
    title: rawPost.metadata.title,
    excerpt: rawPost.metadata.excerpt || '',
    coverImage: rawPost.metadata.coverImage || '/images/all-services.webp',
    category,
    author,
    tags: rawPost.metadata.tags || [],
    contentHtml,
    contentMarkdown: markdownBody, // store cleaned markdown
    readTime: rawPost.metadata.readTime || 5,
    views: 0,
    likes: 0,
    publishedAt: rawPost.metadata.date,
    featured: rawPost.metadata.featured || false,
    seo: rawPost.seo,
    internalLinks: rawPost.internalLinks || [],
    faq: rawPost.faq || [],
    schema: rawPost.schema,
  };
}

// ─── Public API ────────────────────────────────────────────────────────────

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await getAllRawPosts();
  const results = await Promise.all(
    posts.map(async (post) => {
      try {
        return await buildBlogPost(post);
      } catch (error) {
        console.error(`[blog] Failed to load "${post.slug}":`, error);
        return null;
      }
    })
  );
  return results.filter((post): post is BlogPost => post !== null);
}

export async function getPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  const rawPost = await getRawPostBySlug(slug);
  if (!rawPost) return null;
  return buildBlogPost(rawPost);
}

// Backward-compatible alias
export async function getPostBySlugServer(
  slug: string
): Promise<BlogPost | null> {
  return getPostBySlug(slug);
}

// ─── Helpers ──────────────────────────────────────────────────────────────

export function getCanonicalUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}

export function getAbsoluteImageUrl(imagePath: string): string {
  if (!imagePath) {
    return `${SITE_URL}/images/all-services.webp`;
  }
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://')
  ) {
    return imagePath;
  }
  return `${SITE_URL}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
}

// ─── View Count (API call) ────────────────────────────────────────────────

export async function incrementViewCount(slug: string): Promise<void> {
  try {
    await fetch(
      `/api/views/${encodeURIComponent(slug)}`,
      {
        method: 'POST',
        cache: 'no-store',
      }
    );
  } catch (error) {
    console.error('[blog] Error incrementing view count:', error);
  }
}
