/**
 * Prisma Client Singleton Instance
 * 
 * This file ensures only one instance of PrismaClient exists throughout the application.
 * This is important because:
 * 
 * 1. In development, Next.js hot-reloads modules, which would create multiple instances
 * 2. Each PrismaClient instance maintains a connection pool (default: 5 connections)
 * 3. Multiple instances can exhaust database connections
 * 
 * Solution: Store the client in globalThis (not affected by hot reload)
 * 
 * Usage:
 * ```ts
 * import { prisma } from '@/lib/prisma'
 * const users = await prisma.user.findMany()
 * ```
 */

import { PrismaClient } from '@prisma/client'

// Type augmentation for global object to include prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Build the database URL with connection pooling parameters for serverless
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL || ''
  
  if (!baseUrl || baseUrl === '') {
    return baseUrl
  }
  
  // In Vercel or production, add pgbouncer mode to prevent prepared statement conflicts
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    try {
      const url = new URL(baseUrl)
      url.searchParams.set('pgbouncer', 'true')
      url.searchParams.set('connection_limit', '1')
      return url.toString()
    } catch {
      return baseUrl
    }
  }
  
  return baseUrl
}

// Use existing instance if available, otherwise create new one
// Configure with optimizations for serverless and build environments
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
})

// In development, store instance in global to survive hot reloads
// In production, this is skipped since there's no hot reload
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
