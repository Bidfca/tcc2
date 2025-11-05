import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ErrorHandler, ErrorCodes } from '@/lib/errors'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { withRateLimit } from '@/lib/rate-limit'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

export async function POST(request: NextRequest) {
  // Apply rate limiting - more restrictive for password reset
  const rateLimitResponse = await withRateLimit(request, 'AUTH')
  if (rateLimitResponse) return rateLimitResponse
  
  try {
    console.log('🔐 Iniciando processo de recuperação de senha...')
    
    const body = await request.json()
    console.log('📝 Dados recebidos:', { email: body.email })
    
    // Validar dados de entrada
    try {
      const validatedData = forgotPasswordSchema.parse(body)

      // Buscar usuário no banco
      const user = await prisma.user.findUnique({
        where: {
          email: validatedData.email
        }
      })

      // Por segurança, sempre retornar sucesso mesmo se usuário não existir
      // Isso evita que atacantes descubram emails válidos
      if (!user) {
        console.log('⚠️ Usuário não encontrado, mas retornando sucesso por segurança')
        return NextResponse.json({
          success: true,
          message: 'Se o email existir, você receberá um link de recuperação.'
        }, { status: 200 })
      }

      // Gerar token único
      const resetToken = randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora

      console.log('🔑 Gerando token de reset...')
      
      // Salvar token no banco
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry
        }
      })

      // TODO: Aqui você deve enviar um email com o link
      // Por enquanto, vamos apenas logar no console
      const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`
      console.log('📧 Link de recuperação gerado:')
      console.log('═'.repeat(60))
      console.log(`Para: ${user.email}`)
      console.log(`Link: ${resetLink}`)
      console.log('═'.repeat(60))

      console.log('✅ Token salvo com sucesso')
      return NextResponse.json({
        success: true,
        message: 'Se o email existir, você receberá um link de recuperação.',
        // Apenas em desenvolvimento
        ...(process.env.NODE_ENV === 'development' && { resetLink })
      }, { status: 200 })

    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const error = ErrorHandler.createError(
          ErrorCodes.VAL_002,
          { errors: validationError.errors },
          'forgot-password-validation'
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
    console.error('❌ Erro na recuperação de senha:', error)
    
    const genericError = ErrorHandler.createError(
      ErrorCodes.API_005,
      { originalError: error instanceof Error ? error.message : 'Unknown error' },
      'forgot-password-generic'
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
