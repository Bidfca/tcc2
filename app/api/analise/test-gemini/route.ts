import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET() {
  try {
    // Verificar se a API key existe
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY não configurada no .env'
      }, { status: 500 })
    }

    // Testar com diferentes modelos disponíveis
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    // Lista de modelos para tentar (em ordem de preferência)
    const modelsToTry = [
      'gemini-1.5-flash',
      'models/gemini-1.5-flash',
      'gemini-1.0-pro',
      'models/gemini-1.0-pro',
    ]
    
    const errors: Record<string, string> = {}
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`🔍 Tentando modelo: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent('Diga apenas "OK"')
        const response = await result.response
        const text = response.text()
        
        console.log(`✅ Sucesso com modelo: ${modelName}`)
        return NextResponse.json({
          success: true,
          message: 'Gemini API está funcionando!',
          model: modelName,
          response: text,
          apiKeyConfigured: true
        })
      } catch (error) {
        console.log(`❌ Falhou com modelo ${modelName}: ${(error as Error).message}`)
        errors[modelName] = (error as Error).message
        continue
      }
    }
    
    // Se todos falharem
    return NextResponse.json({
      success: false,
      error: 'Nenhum modelo Gemini disponível',
      attemptedModels: modelsToTry,
      errors: errors,
      suggestion: 'Tente gerar uma nova API key em https://aistudio.google.com/app/apikey'
    }, { status: 500 })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      details: (error as Error).toString(),
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 })
  }
}
