import { NextRequest, NextResponse } from 'next/server';
import { devinService } from '@/services/devin.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    if (!devinService.isConfigured()) {
      return NextResponse.json(
        { error: 'Devin API is not configured' },
        { status: 500 }
      );
    }

    const { sessionId } = params;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await devinService.getSession(sessionId);
    
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error getting Devin session:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
