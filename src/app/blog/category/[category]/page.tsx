// app/blog/category/[category]/page.tsx - SERVER COMPONENT
import { notFound } from 'next/navigation';
import { categories } from '@/lib/categories';
import CategoryPageClient from './CategoryPageClient';
import blogData from '../../blogData.json';

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
}

interface RawPost {
  slug: string;
  metadata: BlogPostMetadata;
  filePath: string;
}

// This is a SERVER component - no 'use client'

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const categoryId = resolvedParams.category;
  const category = categories.find(c => c.id === categoryId);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} - Beauty Blog`,
    description: `Explore ${category.name.toLowerCase()} articles and tips from Patna's best beauty salon`,
  };
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    category: category.id,
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const categoryId = resolvedParams.category;
  const category = categories.find(c => c.id === categoryId);

  if (!category) {
    notFound();
  }

  // Filter posts by category
  const categoryPosts = (blogData.posts as RawPost[]).filter(
    (post: RawPost) => post.metadata.category === categoryId
  );

  return <CategoryPageClient category={category} posts={categoryPosts} />;
}