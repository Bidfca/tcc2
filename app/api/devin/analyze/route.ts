import { NextRequest, NextResponse } from 'next/server';
import { devinService } from '@/services/devin.service';

export async function POST(request: NextRequest) {
  try {
    if (!devinService.isConfigured()) {
      return NextResponse.json(
        { error: 'Devin API is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { type, content, context } = body;
    
    if (!type || !content) {
      return NextResponse.json(
        { error: 'Type and content are required' },
        { status: 400 }
      );
    }

    let result;
    
    switch (type) {
      case 'pull-request':
        if (!content.url) {
          return NextResponse.json(
            { error: 'Pull request URL is required' },
            { status: 400 }
          );
        }
        result = await devinService.analyzePullRequest(content.url);
        break;
        
      case 'code':
        if (!content.code) {
          return NextResponse.json(
            { error: 'Code is required' },
            { status: 400 }
          );
        }
        result = await devinService.analyzeCode(content.code, context);
        break;
        
      case 'generate':
        if (!content.description) {
          return NextResponse.json(
            { error: 'Description is required' },
            { status: 400 }
          );
        }
        result = await devinService.generateCode(content.description, content.language);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid analysis type. Supported types: pull-request, code, generate' },
          { status: 400 }
        );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing with Devin:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
