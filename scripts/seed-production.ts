/**
 * Script para popular banco de produção
 * 
 * Este script cria os usuários demo no banco de produção da Vercel
 * 
 * Como usar:
 * 1. Configure DATABASE_URL no .env apontando para produção
 * 2. Execute: npx tsx scripts/seed-production.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Populando banco de produção...')
  console.log('⚠️  Certifique-se de que DATABASE_URL aponta para PRODUÇÃO!')

  try {
    // Criar usuário admin
    const adminPassword = await bcrypt.hash('admin123', 12)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@agroinsight.com' },
      update: {},
      create: {
        email: 'admin@agroinsight.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
      },
    })
    console.log('✅ Admin criado:', admin.email)

    // Criar usuário demo
    const demoPassword = await bcrypt.hash('demo123', 12)
    const demo = await prisma.user.upsert({
      where: { email: 'demo@agroinsight.com' },
      update: {},
      create: {
        email: 'demo@agroinsight.com',
        name: 'Demo User',
        password: demoPassword,
        role: 'USER',
      },
    })
    console.log('✅ Demo criado:', demo.email)

    // Criar usuário pesquisador
    const userPassword = await bcrypt.hash('user123', 12)
    const user = await prisma.user.upsert({
      where: { email: 'researcher@agroinsight.com' },
      update: {},
      create: {
        email: 'researcher@agroinsight.com',
        name: 'Research User',
        password: userPassword,
        role: 'USER',
      },
    })
    console.log('✅ Pesquisador criado:', user.email)

    console.log('\n✅ Banco populado com sucesso!')
    console.log('\n📝 Credenciais criadas:')
    console.log('   Demo: demo@agroinsight.com / demo123')
    console.log('   Admin: admin@agroinsight.com / admin123')
    console.log('   Pesquisador: researcher@agroinsight.com / user123')
  } catch (error) {
    console.error('❌ Erro ao popular banco:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
