/*
  Warnings:

  - A unique constraint covering the columns `[resetToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "users" ADD COLUMN "resetTokenExpiry" DATETIME;

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("resource");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_resource_resourceId_idx" ON "audit_logs"("resource", "resourceId");

-- CreateIndex
CREATE INDEX "data_mappings_datasetId_idx" ON "data_mappings"("datasetId");

-- CreateIndex
CREATE INDEX "data_mappings_sourceField_idx" ON "data_mappings"("sourceField");

-- CreateIndex
CREATE INDEX "data_validations_datasetId_idx" ON "data_validations"("datasetId");

-- CreateIndex
CREATE INDEX "data_validations_status_idx" ON "data_validations"("status");

-- CreateIndex
CREATE INDEX "data_validations_datasetId_status_idx" ON "data_validations"("datasetId", "status");

-- CreateIndex
CREATE INDEX "datasets_projectId_idx" ON "datasets"("projectId");

-- CreateIndex
CREATE INDEX "datasets_status_idx" ON "datasets"("status");

-- CreateIndex
CREATE INDEX "datasets_createdAt_idx" ON "datasets"("createdAt");

-- CreateIndex
CREATE INDEX "datasets_projectId_status_idx" ON "datasets"("projectId", "status");

-- CreateIndex
CREATE INDEX "datasets_projectId_createdAt_idx" ON "datasets"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "project_upload_presets_projectId_idx" ON "project_upload_presets"("projectId");

-- CreateIndex
CREATE INDEX "projects_ownerId_idx" ON "projects"("ownerId");

-- CreateIndex
CREATE INDEX "projects_createdAt_idx" ON "projects"("createdAt");

-- CreateIndex
CREATE INDEX "projects_ownerId_createdAt_idx" ON "projects"("ownerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetToken_key" ON "users"("resetToken");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "validation_settings_projectId_idx" ON "validation_settings"("projectId");

-- CreateIndex
CREATE INDEX "validation_settings_enabled_idx" ON "validation_settings"("enabled");
