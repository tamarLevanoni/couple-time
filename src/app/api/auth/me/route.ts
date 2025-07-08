import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';

async function handler(req: NextRequest, session: any) {
  return NextResponse.json({
    user: session.user,
  });
}

export const GET = withAuth(handler);