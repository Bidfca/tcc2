import { NextRequest, NextResponse } from 'next/server';
import { devinService, DevinSessionRequest } from '@/services/devin.service';

export async function POST(request: NextRequest) {
  try {
    if (!devinService.isConfigured()) {
      return NextResponse.json(
        { error: 'Devin API is not configured' },
        { status: 500 }
      );
    }

    const body: DevinSessionRequest = await request.json();
    
    // Validate request body
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    const session = await devinService.createSession(body);
    
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating Devin session:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
