import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ErrorHandler, ErrorCodes } from '@/lib/errors'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Iniciando processo de reset de senha...')
    
    const body = await request.json()
    console.log('📝 Dados recebidos:', { token: body.token?.substring(0, 10) + '...' })
    
    // Validar dados de entrada
    try {
      const validatedData = resetPasswordSchema.parse(body)

      // Buscar usuário com o token válido
      const user = await prisma.user.findFirst({
        where: {
          resetToken: validatedData.token,
          resetTokenExpiry: {
            gt: new Date() // Token não expirado
          }
        }
      })

      if (!user) {
        console.log('❌ Token inválido ou expirado')
        const error = ErrorHandler.createError(
          ErrorCodes.AUTH_011,
          { token: validatedData.token?.substring(0, 10) },
          'reset-password'
        )
        ErrorHandler.logError(error)
        return NextResponse.json(
          { 
            error: error.code,
            message: error.userMessage 
          },
          { status: ErrorHandler.getHttpStatus(error.code) }
        )
      }

      // Hash da nova senha
      console.log('🔐 Gerando hash da nova senha...')
      const hashedPassword = await bcrypt.hash(validatedData.password, 12)

      // Atualizar senha e limpar tokens
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      })

      console.log('✅ Senha atualizada com sucesso para:', user.email)
      return NextResponse.json({
        success: true,
        message: 'Senha redefinida com sucesso. Você já pode fazer login.'
      }, { status: 200 })

    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const error = ErrorHandler.createError(
          ErrorCodes.VAL_002,
          { errors: validationError.errors },
          'reset-password-validation'
        )
        ErrorHandler.logError(error)
        return NextResponse.json({
          error: error.code,
          message: error.userMessage,
          details: validationError.errors
        }, { status: ErrorHandler.getHttpStatus(error.code) })
      }
      throw validationError
    }

  } catch (error) {
    console.error('❌ Erro no reset de senha:', error)
    
    const genericError = ErrorHandler.createError(
      ErrorCodes.API_005,
      { originalError: error instanceof Error ? error.message : 'Unknown error' },
      'reset-password-generic'
    )
    ErrorHandler.logError(genericError)
    return NextResponse.json(
      { 
        error: genericError.code,
        message: genericError.userMessage 
      },
      { status: ErrorHandler.getHttpStatus(genericError.code) }
    )
  }
}
