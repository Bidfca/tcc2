const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyDatabase() {
  try {
    console.log('🔍 Verificando banco de dados...\n')

    // 1. Testar conexão
    await prisma.$connect()
    console.log('✅ Conexão estabelecida com sucesso')

    // 2. Contar usuários
    const userCount = await prisma.user.count()
    console.log(`\n👥 Usuários no banco: ${userCount}`)
    
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    })
    console.log('Usuários:')
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - Criado em: ${user.createdAt}`)
    })

    // 3. Contar projetos
    const projectCount = await prisma.project.count()
    console.log(`\n📁 Projetos no banco: ${projectCount}`)
    
    const projects = await prisma.project.findMany({
      include: {
        owner: { select: { email: true } },
        _count: {
          select: { datasets: true, validationSettings: true }
        }
      }
    })
    console.log('Projetos:')
    projects.forEach(proj => {
      console.log(`  - ${proj.name} (Owner: ${proj.owner.email})`)
      console.log(`    Datasets: ${proj._count.datasets}, Validações: ${proj._count.validationSettings}`)
    })

    // 4. Contar referências salvas
    const referencesCount = await prisma.savedReference.count()
    console.log(`\n📚 Referências salvas: ${referencesCount}`)
    
    if (referencesCount > 0) {
      const references = await prisma.savedReference.findMany({
        take: 5,
        select: { title: true, year: true, source: true, createdAt: true }
      })
      console.log('Últimas 5 referências:')
      references.forEach(ref => {
        console.log(`  - ${ref.title} (${ref.year}) - ${ref.source}`)
      })
    }

    // 5. Contar datasets
    const datasetCount = await prisma.dataset.count()
    console.log(`\n📊 Datasets: ${datasetCount}`)

    // 6. Verificar audit logs
    const auditCount = await prisma.auditLog.count()
    console.log(`\n📝 Audit Logs: ${auditCount}`)

    console.log('\n✅ Verificação completa! Banco de dados está operacional.')

  } catch (error) {
    console.error('\n❌ ERRO na verificação:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyDatabase()
