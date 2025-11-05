/**
 * User Sign Up API Route
 * 
 * Endpoint: POST /api/auth/signup
 * 
 * This route handles new user registration with:
 * - Input validation using Zod schema
 * - Email uniqueness checking
 * - Password hashing with bcrypt
 * - User creation in database
 * - Structured error handling
 * 
 * Request body:
 * ```json
 * {
 *   "name": "João Silva",
 *   "email": "joao@example.com",
 *   "password": "securePassword123"
 * }
 * ```
 * 
 * Success response (201):
 * ```json
 * {
 *   "success": true,
 *   "message": "Usuário criado com sucesso",
 *   "user": { "id": "...", "name": "...", "email": "...", "role": "USER", "createdAt": "..." }
 * }
 * ```
 * 
 * Error responses:
 * - 400: Validation error or user already exists
 * - 500: Database or server error
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ErrorHandler, ErrorCodes } from '@/lib/errors'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { withRateLimit } from '@/lib/rate-limit'

/**
 * Zod validation schema for sign up data
 * Ensures data meets minimum requirements before processing
 */
const signupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

/**
 * POST handler for user registration
 * 
 * Process:
 * 1. Validate request body against schema
 * 2. Check if user with email already exists
 * 3. Hash password with bcrypt (12 rounds)
 * 4. Create user in database with USER role
 * 5. Return user data (excluding password)
 * 
 * @param request - Next.js request object containing user data
 * @returns JSON response with created user or error
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting for authentication endpoints
  const rateLimitResponse = await withRateLimit(request, 'AUTH')
  if (rateLimitResponse) return rateLimitResponse
  
  try {
    console.log('📝 Iniciando processo de cadastro...')
    
    // Parse request body as JSON
    const body = await request.json()
    console.log('📝 Dados recebidos:', { ...body, password: '[HIDDEN]' })  // Log with hidden password
    
    // Step 1: Validate input data against schema
    try {
      const validatedData = signupSchema.parse(body)
      console.log('✅ Dados validados com sucesso')

      // Step 2: Check if user with this email already exists
      // This prevents duplicate accounts and ensures email uniqueness
      const existingUser = await prisma.user.findUnique({
        where: {
          email: validatedData.email
        }
      })

      if (existingUser) {
        // User already exists - return error with appropriate code
        const error = ErrorHandler.createError(
          ErrorCodes.AUTH_006,  // User already exists error
          { email: validatedData.email },
          'signup'
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

      // Step 3: Hash the password using bcrypt
      // Salt rounds: 12 (balance between security and performance)
      console.log('🔐 Gerando hash da senha...')
      const hashedPassword = await bcrypt.hash(validatedData.password, 12)

      // Step 4: Create new user in database
      console.log('👤 Criando usuário no banco de dados...')
      const user = await prisma.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          role: 'USER',  // All new users start with USER role (not ADMIN)
        },
        select: {
          // Select only safe fields to return (exclude password hash)
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        }
      })

      console.log('✅ Usuário criado com sucesso:', user.id)
      
      // Step 5: Return success response with user data
      return NextResponse.json({
        success: true,
        message: 'Usuário criado com sucesso',
        user
      }, { status: 201 })  // 201 = Created

    } catch (validationError) {
      // Handle Zod validation errors specifically
      if (validationError instanceof z.ZodError) {
        const error = ErrorHandler.createError(
          ErrorCodes.VAL_002,  // Invalid data format error
          { errors: validationError.errors },  // Include detailed validation errors
          'signup-validation'
        )
        ErrorHandler.logError(error)
        return NextResponse.json({
          error: error.code,
          message: error.userMessage,
          details: validationError.errors  // Return specific field errors for client
        }, { status: ErrorHandler.getHttpStatus(error.code) })
      }
      // Re-throw if it's not a Zod error (will be caught by outer catch)
      throw validationError
    }

  } catch (error) {
    // Outer catch block for unexpected errors
    console.error('❌ Erro no cadastro:', error)
    
    // Check if it's a database-related error
    if (error instanceof Error && error.message.includes('database')) {
      const dbError = ErrorHandler.createError(
        ErrorCodes.DB_001,  // Database connection failed
        { originalError: error.message },
        'signup-database'
      )
      ErrorHandler.logError(dbError)
      return NextResponse.json(
        { 
          error: dbError.code,
          message: dbError.userMessage 
        },
        { status: ErrorHandler.getHttpStatus(dbError.code) }
      )
    }

    // Generic error for any other unexpected issues
    const genericError = ErrorHandler.createError(
      ErrorCodes.API_005,  // Internal server error
      { originalError: error instanceof Error ? error.message : 'Unknown error' },
      'signup-generic'
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
