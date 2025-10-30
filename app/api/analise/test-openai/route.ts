import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  try {
    // Verificar se a API key existe
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'OPENAI_API_KEY não configurada no .env'
      }, { status: 500 })
    }

    // Testar conexão
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    console.log('🧪 Testando OpenAI...')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: "Responda apenas com a palavra: OK"
        }
      ],
      max_tokens: 10
    })

    const response = completion.choices[0]?.message?.content || ''
    
    console.log('✅ OpenAI funcionando!')

    return NextResponse.json({
      success: true,
      message: 'OpenAI API está funcionando!',
      model: completion.model,
      response: response,
      apiKeyConfigured: true,
      tokensUsed: completion.usage
    })

  } catch (error) {
    const err = error as Error & { type?: string; code?: string }
    console.error('❌ Erro ao testar OpenAI:', err.message)
    
    return NextResponse.json({
      success: false,
      error: err.message,
      type: err.type || 'unknown',
      code: err.code || 'unknown'
    }, { status: 500 })
  }
}
