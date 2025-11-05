import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

// Use DIRECT_URL for seeding to avoid connection pooling issues
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
})

async function main() {
  console.log('🌱 Seeding database...')
  
  // Ensure clean connection
  await prisma.$connect()

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@agroinsight.com' },
    update: {},
    create: {
      email: 'admin@agroinsight.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 12)
  await prisma.user.upsert({
    where: { email: 'demo@agroinsight.com' },
    update: {},
    create: {
      email: 'demo@agroinsight.com',
      name: 'Demo User',
      password: demoPassword,
      role: 'USER',
    },
  })

  // Create regular user
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

  // Create sample project
  const project = await prisma.project.upsert({
    where: { id: 'sample-project-1' },
    update: {},
    create: {
      id: 'sample-project-1',
      name: 'Bovine Weight Analysis',
      description: 'Analysis of bovine weight data with automated validation',
      ownerId: user.id,
    },
  })

  // Create upload presets for the project
  await prisma.projectUploadPreset.upsert({
    where: { id: 'preset-1' },
    update: {},
    create: {
      id: 'preset-1',
      projectId: project.id,
      reviewRequired: true,
      intervals: JSON.stringify({
        "Peso_nascimento_kg": { min: 1, max: 60 },
        "Peso_desmame_kg": { min: 80, max: 300 },
        "Peso_sobreano_kg": { min: 200, max: 600 }
      }),
      defaultFieldMappings: JSON.stringify({
        "weight_birth": "Peso_nascimento_kg",
        "weight_weaning": "Peso_desmame_kg",
        "weight_yearling": "Peso_sobreano_kg"
      })
    },
  })

  // Create validation settings (delete existing first to avoid duplicates)
  await prisma.validationSetting.deleteMany({
    where: { projectId: project.id },
  })
  
  await prisma.validationSetting.createMany({
    data: [
      {
        projectId: project.id,
        field: 'Peso_nascimento_kg',
        rule: 'RANGE',
        value: '1-60',
        enabled: true,
      },
      {
        projectId: project.id,
        field: 'Peso_desmame_kg',
        rule: 'RANGE',
        value: '80-300',
        enabled: true,
      },
      {
        projectId: project.id,
        field: 'Peso_sobreano_kg',
        rule: 'RANGE',
        value: '200-600',
        enabled: true,
      },
    ],
  })

  // Create project settings (upsert to handle existing)
  await prisma.projectSetting.upsert({
    where: {
      projectId_key: {
        projectId: project.id,
        key: 'mandatory_review',
      },
    },
    update: {},
    create: {
      projectId: project.id,
      key: 'mandatory_review',
      value: 'true',
    },
  })
  
  await prisma.projectSetting.upsert({
    where: {
      projectId_key: {
        projectId: project.id,
        key: 'auto_normalize_units',
      },
    },
    update: {},
    create: {
      projectId: project.id,
      key: 'auto_normalize_units',
      value: 'true',
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Demo: demo@agroinsight.com / demo123`)
  console.log(`👤 Admin: admin@agroinsight.com / admin123`)
  console.log(`👤 User: researcher@agroinsight.com / user123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
