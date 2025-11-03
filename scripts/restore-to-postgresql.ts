/**
 * Script para restaurar dados do backup no PostgreSQL
 * Execute com: npx tsx scripts/restore-to-postgresql.ts [caminho-do-backup.json]
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function restoreData(backupFilePath: string) {
  console.log('🔄 Iniciando restauração dos dados no PostgreSQL...\n');

  try {
    // Ler arquivo de backup
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Arquivo de backup não encontrado: ${backupFilePath}`);
    }

    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf-8'));

    // Restaurar na ordem correta (respeitando relações)
    
    // 1. Usuários (sem relações)
    console.log('📥 Restaurando usuários...');
    for (const user of backupData.users) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          password: user.password,
          role: user.role,
          resetToken: user.resetToken,
          resetTokenExpiry: user.resetTokenExpiry ? new Date(user.resetTokenExpiry) : null,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        },
      });
    }

    // 2. Projetos (sem datasets e presets por enquanto)
    console.log('📥 Restaurando projetos...');
    for (const project of backupData.projects) {
      await prisma.project.create({
        data: {
          id: project.id,
          name: project.name,
          description: project.description,
          ownerId: project.ownerId,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
        },
      });

      // Upload Presets
      if (project.uploadPresets) {
        for (const preset of project.uploadPresets) {
          await prisma.projectUploadPreset.create({
            data: {
              id: preset.id,
              projectId: preset.projectId,
              intervals: preset.intervals,
              defaultFieldMappings: preset.defaultFieldMappings,
              reviewRequired: preset.reviewRequired,
              createdAt: new Date(preset.createdAt),
              updatedAt: new Date(preset.updatedAt),
            },
          });
        }
      }

      // Validation Settings
      if (project.validationSettings) {
        for (const setting of project.validationSettings) {
          await prisma.validationSetting.create({
            data: {
              id: setting.id,
              projectId: setting.projectId,
              field: setting.field,
              rule: setting.rule,
              value: setting.value,
              enabled: setting.enabled,
              createdAt: new Date(setting.createdAt),
              updatedAt: new Date(setting.updatedAt),
            },
          });
        }
      }

      // Project Settings
      if (project.projectSettings) {
        for (const setting of project.projectSettings) {
          await prisma.projectSetting.create({
            data: {
              id: setting.id,
              projectId: setting.projectId,
              key: setting.key,
              value: setting.value,
              createdAt: new Date(setting.createdAt),
              updatedAt: new Date(setting.updatedAt),
            },
          });
        }
      }
    }

    // 3. Datasets
    console.log('📥 Restaurando datasets...');
    for (const dataset of backupData.datasets) {
      await prisma.dataset.create({
        data: {
          id: dataset.id,
          projectId: dataset.projectId,
          name: dataset.name,
          filename: dataset.filename,
          status: dataset.status,
          data: dataset.data,
          metadata: dataset.metadata,
          createdAt: new Date(dataset.createdAt),
          updatedAt: new Date(dataset.updatedAt),
        },
      });

      // Data Mappings
      if (dataset.mappings) {
        for (const mapping of dataset.mappings) {
          await prisma.dataMapping.create({
            data: {
              id: mapping.id,
              datasetId: mapping.datasetId,
              sourceField: mapping.sourceField,
              targetField: mapping.targetField,
              unitFrom: mapping.unitFrom,
              unitTo: mapping.unitTo,
              createdAt: new Date(mapping.createdAt),
            },
          });
        }
      }

      // Data Validations
      if (dataset.validations) {
        for (const validation of dataset.validations) {
          await prisma.dataValidation.create({
            data: {
              id: validation.id,
              datasetId: validation.datasetId,
              field: validation.field,
              rule: validation.rule,
              value: validation.value,
              status: validation.status,
              message: validation.message,
              createdAt: new Date(validation.createdAt),
              updatedAt: new Date(validation.updatedAt),
            },
          });
        }
      }
    }

    // 4. Referências Salvas
    console.log('📥 Restaurando referências...');
    for (const ref of backupData.savedReferences) {
      await prisma.savedReference.create({
        data: {
          id: ref.id,
          userId: ref.userId,
          title: ref.title,
          url: ref.url,
          doi: ref.doi,
          abstract: ref.abstract,
          authors: ref.authors,
          year: ref.year,
          publishedDate: ref.publishedDate ? new Date(ref.publishedDate) : null,
          language: ref.language,
          journal: ref.journal,
          issn: ref.issn,
          volume: ref.volume,
          issue: ref.issue,
          pages: ref.pages,
          keywords: ref.keywords,
          tags: ref.tags,
          source: ref.source,
          pdfUrl: ref.pdfUrl,
          citationsCount: ref.citationsCount,
          lastSyncedAt: ref.lastSyncedAt ? new Date(ref.lastSyncedAt) : null,
          content: ref.content,
          createdAt: new Date(ref.createdAt),
          updatedAt: new Date(ref.updatedAt),
        },
      });
    }

    // 5. Audit Logs
    console.log('📥 Restaurando logs de auditoria...');
    for (const log of backupData.auditLogs) {
      await prisma.auditLog.create({
        data: {
          id: log.id,
          userId: log.userId,
          action: log.action,
          resource: log.resource,
          resourceId: log.resourceId,
          changes: log.changes,
          createdAt: new Date(log.createdAt),
        },
      });
    }

    console.log('\n✅ Restauração concluída com sucesso!');
    console.log('\nEstatísticas restauradas:');
    console.log(`- Usuários: ${backupData.users.length}`);
    console.log(`- Projetos: ${backupData.projects.length}`);
    console.log(`- Datasets: ${backupData.datasets.length}`);
    console.log(`- Referências: ${backupData.savedReferences.length}`);
    console.log(`- Logs de Auditoria: ${backupData.auditLogs.length}`);

  } catch (error) {
    console.error('❌ Erro ao restaurar dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const backupFile = process.argv[2];
if (!backupFile) {
  console.error('❌ Por favor, forneça o caminho do arquivo de backup');
  console.log('Uso: npx tsx scripts/restore-to-postgresql.ts <caminho-do-backup.json>');
  process.exit(1);
}

restoreData(backupFile);
