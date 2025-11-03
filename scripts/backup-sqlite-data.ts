/**
 * Script para exportar dados do SQLite antes da migração para PostgreSQL
 * Execute com: npx tsx scripts/backup-sqlite-data.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function backupData() {
  console.log('🔄 Iniciando backup dos dados SQLite...\n');

  try {
    // Criar diretório de backup se não existir
    const backupDir = path.join(process.cwd(), 'backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `sqlite-backup-${timestamp}.json`);

    // Exportar todos os dados
    const data = {
      users: await prisma.user.findMany({
        include: {
          projects: true,
          savedReferences: true,
        },
      }),
      projects: await prisma.project.findMany({
        include: {
          uploadPresets: true,
          datasets: true,
          validationSettings: true,
          projectSettings: true,
        },
      }),
      datasets: await prisma.dataset.findMany({
        include: {
          validations: true,
          mappings: true,
        },
      }),
      savedReferences: await prisma.savedReference.findMany(),
      auditLogs: await prisma.auditLog.findMany(),
    };

    // Salvar no arquivo
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));

    console.log('✅ Backup concluído com sucesso!');
    console.log(`📁 Arquivo: ${backupFile}`);
    console.log('\nEstatísticas:');
    console.log(`- Usuários: ${data.users.length}`);
    console.log(`- Projetos: ${data.projects.length}`);
    console.log(`- Datasets: ${data.datasets.length}`);
    console.log(`- Referências: ${data.savedReferences.length}`);
    console.log(`- Logs de Auditoria: ${data.auditLogs.length}`);

  } catch (error) {
    console.error('❌ Erro ao fazer backup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backupData();
