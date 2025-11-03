import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verificar variáveis de ambiente
    const hasApiKey = !!process.env.GEMINI_API_KEY
    const apiKeyLength = process.env.GEMINI_API_KEY?.length || 0
    const apiKeyPreview = process.env.GEMINI_API_KEY?.substring(0, 10) + '...'
    
    return NextResponse.json({
      success: true,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasGeminiKey: hasApiKey,
        apiKeyLength: apiKeyLength,
        apiKeyPreview: apiKeyPreview,
        nextAuthUrl: process.env.NEXTAUTH_URL
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
