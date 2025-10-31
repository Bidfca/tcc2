import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Tentar conectar ao banco de dados
    await prisma.$connect()
    
    // Tentar uma query simples
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      success: true,
      message: 'Conexão com banco de dados OK!',
      userCount,
      databaseUrl: process.env.DATABASE_URL
    })
  } catch (error) {
    console.error('Erro de conexão com banco:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      message: (error as Error).message,
      databaseUrl: process.env.DATABASE_URL
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
