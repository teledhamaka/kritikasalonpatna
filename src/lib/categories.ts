// src/lib/categories.ts
import { BlogPost } from '../types/types';

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
}

export const categories: Category[] = [
  {
    id: 'hair-care',
    name: 'Hair Care',
    description: 'Expert hair care tips, treatments, and styling guides for beautiful, healthy hair',
    icon: '💇‍♀️',
    color: 'pink',
    gradient: 'from-pink-400 to-rose-500'
  },
  {
    id: 'makeup',
    name: 'Makeup & Beauty',
    description: 'Trending makeup looks, beauty tutorials, and product reviews',
    icon: '💄',
    color: 'purple',
    gradient: 'from-purple-400 to-pink-500'
  },
  {
    id: 'skin-care',
    name: 'Skin Care',
    description: 'Glowing skin secrets, facial treatments, and skincare routines',
    icon: '✨',
    color: 'blue',
    gradient: 'from-blue-400 to-purple-500'
  },
  {
    id: 'bridal',
    name: 'Bridal Services',
    description: 'Complete bridal packages, makeup tips, and wedding beauty guides',
    icon: '👰',
    color: 'rose',
    gradient: 'from-rose-400 to-pink-500'
  },
  {
    id: 'nail-art',
    name: 'Nail Art',
    description: 'Latest nail trends, designs, and manicure/pedicure tips',
    icon: '💅',
    color: 'red',
    gradient: 'from-red-400 to-pink-500'
  },
  {
    id: 'spa-wellness',
    name: 'Spa & Wellness',
    description: 'Relaxing spa treatments, wellness tips, and self-care routines',
    icon: '🧖‍♀️',
    color: 'teal',
    gradient: 'from-teal-400 to-blue-500'
  },
  {
    id: 'fashion-trends',
    name: 'Fashion & Trends',
    description: 'Latest fashion trends, styling tips, and seasonal looks',
    icon: '👗',
    color: 'indigo',
    gradient: 'from-indigo-400 to-purple-500'
  },
  {
    id: 'health-tips',
    name: 'Health & Wellness',
    description: 'Health tips, nutrition advice, and wellness guidance',
    icon: '🏥',
    color: 'green',
    gradient: 'from-green-400 to-teal-500'
  }
];

// SEO Keywords for each category
export const categoryKeywords: Record<string, string[]> = {
  'hair-care': [
    'hair fall control',
    'hair spa patna',
    'hair treatment bhootnath road',
    'best hair salon patna',
    'hair styling tips',
    'hair growth treatment'
  ],
  'makeup': [
    'bridal makeup patna',
    'party makeup',
    'makeup artist bhootnath road',
    'makeup tips in hindi',
    'best makeup salon patna'
  ],
  'skin-care': [
    'facial treatment patna',
    'skin whitening',
    'anti aging treatment',
    'acne treatment',
    'glowing skin tips'
  ],
  'bridal': [
    'bridal makeup patna',
    'bridal package bhootnath road',
    'wedding makeup artist',
    'bridal hair styling',
    'pre wedding beauty'
  ],
  'nail-art': [
    'nail art patna',
    'manicure pedicure',
    'nail extension',
    'gel nails',
    'nail design ideas'
  ],
  'spa-wellness': [
    'spa in patna',
    'body massage',
    'wellness center bhootnath road',
    'relaxation therapy',
    'spa packages'
  ],
  'fashion-trends': [
    'latest fashion trends',
    'styling tips',
    'party looks',
    'seasonal fashion',
    'outfit ideas'
  ],
  'health-tips': [
    'beauty tips',
    'health advice',
    'wellness tips',
    'nutrition for skin',
    'healthy lifestyle'
  ]
};

// Get category by ID
export function getCategoryById(id: string): Category | undefined {
  return categories.find(cat => cat.id === id);
}

// Get category keywords
export function getCategoryKeywords(categoryId: string): string[] {
  return categoryKeywords[categoryId] || [];
}

/**
 * Get all categories with post counts
 * @param posts - Array of blog posts
 * @returns Array of categories with post counts
 */
export function getCategoriesWithCounts(posts: BlogPost[]): (Category & { count: number })[] {
  return categories.map(category => {
    const count = posts.filter(post => post.category === category.id).length;
    return { ...category, count };
  });
}

/**
 * Get posts for a specific category
 * @param categoryId - Category ID to filter by
 * @param posts - Array of blog posts
 * @returns Filtered array of posts in the specified category
 */
export function getPostsByCategory(categoryId: string, posts: BlogPost[]): BlogPost[] {
  return posts.filter(post => post.category === categoryId);
}

/**
 * Get the most popular categories
 * @param posts - Array of blog posts
 * @param limit - Number of categories to return (default: 3)
 * @returns Array of popular categories with post counts
 */
export function getPopularCategories(posts: BlogPost[], limit = 3): (Category & { count: number })[] {
  const withCounts = getCategoriesWithCounts(posts);
  return withCounts
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Optional: Get category name by ID
export function getCategoryName(id: string): string {
  return getCategoryById(id)?.name || 'Uncategorized';
}

export interface CategoryWithCount extends Category {
  count: number;
}