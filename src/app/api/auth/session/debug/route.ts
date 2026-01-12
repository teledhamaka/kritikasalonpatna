// app/api/auth/debug/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cookies = request.cookies.getAll();
  
  return NextResponse.json({
    cookies: cookies.map(cookie => ({
      name: cookie.name,
      value: cookie.value.substring(0, 20) + '...',
    })),
    headers: {
      'user-agent': request.headers.get('user-agent'),
    },
    url: request.url,
  });
}