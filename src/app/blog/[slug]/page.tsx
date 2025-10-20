// app/blog/[slug]/page.tsx - SERVER COMPONENT
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import { notFound } from 'next/navigation';
import BlogPostClient from './BlogPostClient';
import blogData from '../blogData.json';

interface BlogPostMetadata {
  title: string;
  excerpt: string;
  date: string;
  coverImage: string;
  category: string;
  author: string;
  tags: string[];
  featured?: boolean;
  readTime?: number;
  seo?: {
    keywords?: string[];
  };
}

interface RawPost {
  slug: string;
  metadata: BlogPostMetadata;
  filePath: string;
}

interface Author {
  name: string;
  avatar: string;
  bio?: string;
}

interface ProcessedPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  coverImage?: string;
  category?: string;
  author: Author;
  tags?: string[];
  metaTitle: string;
  metaDescription: string;
  seo?: {
    keywords?: string[];
  };
  contentHtml: string;
  rawContent: string;
  featured?: boolean;
  readTime: number;
}

// This is a SERVER component - no 'use client'

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = await getPostDataBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.seo?.keywords?.join(', ') || post.tags?.join(', ') || '',
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export async function generateStaticParams() {
  return (blogData.posts as RawPost[]).map((post: RawPost) => ({
    slug: post.slug,
  }));
}

// Server-side data fetching function
async function getPostDataBySlug(slug: string): Promise<ProcessedPost | null> {
  const postEntry = (blogData.posts as RawPost[]).find((post: RawPost) => post.slug === slug);

  if (!postEntry) {
    return null;
  }

  const filePath = path.join(process.cwd(), postEntry.filePath);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { content } = matter(fileContents);

  const processedContent = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(content);

  const authorKey = postEntry.metadata.author as keyof typeof blogData.authors;
  const authorDetails = blogData.authors[authorKey];

  return {
    slug: postEntry.slug,
    title: postEntry.metadata.title,
    excerpt: postEntry.metadata.excerpt,
    date: postEntry.metadata.date,
    coverImage: postEntry.metadata.coverImage,
    category: postEntry.metadata.category,
    author: authorDetails,
    tags: postEntry.metadata.tags,
    metaTitle: postEntry.metadata.title,
    metaDescription: postEntry.metadata.excerpt,
    seo: postEntry.metadata.seo, // Include seo object
    contentHtml: processedContent.toString(),
    rawContent: content,
    featured: postEntry.metadata.featured,
    readTime: postEntry.metadata.readTime || Math.ceil(content.split(/\s+/).length / 200),
  };
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = await getPostDataBySlug(slug);

  if (!post) {
    notFound();
  }

  // Pass data to client component
  return <BlogPostClient post={post} />;
}