// lib/blog.ts (create this file if it doesn't exist, or add to blogUtils.ts)

export async function incrementViewCount(slug: string) {
  try {
    // This POST request increments the view count
    // The fetch request to `/api/views/${slug}` triggers the API route defined above.
    await fetch(`/api/views/${slug}`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}