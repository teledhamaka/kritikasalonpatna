// ========================================
// app/api/revalidate/route.ts - ON-DEMAND REVALIDATION
// ========================================
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();

    // Revalidate blog listing
    revalidatePath('/blog');

    // Revalidate specific post if provided
    if (path) {
      revalidatePath(path);
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { revalidated: false, error: errorMessage },
      { status: 500 }
    );
  }
}