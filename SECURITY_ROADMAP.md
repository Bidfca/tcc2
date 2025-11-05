# 🛡️ SECURITY & OPTIMIZATION ROADMAP - AGROINSIGHT

## 📅 Última Atualização: 05/11/2024

## ✅ TAREFAS CONCLUÍDAS

### ✔️ 2.1 - Implementação de CORS
- **Arquivo criado**: `lib/cors.ts`
- **Middleware atualizado**: `middleware.ts`
- **Status**: ✅ COMPLETO
- **Detalhes**:
  - Headers CORS configurados para desenvolvimento e produção
  - Preflight requests implementados
  - Origens permitidas configuráveis

### ✔️ 2.2 - Rate Limiting com Upstash
- **Arquivo criado**: `lib/rate-limit.ts`
- **Rotas protegidas**:
  - `/api/auth/signup` - 5 req/min
  - `/api/auth/forgot-password` - 5 req/min
  - `/api/auth/reset-password` - 5 req/min
  - `/api/analise/upload` - 10 req/5min
- **Status**: ✅ COMPLETO
- **Detalhes**:
  - Diferentes limites por tipo de endpoint
  - Headers de retry configurados
  - Fallback seguro se Redis não estiver disponível

### ✔️ 2.3 - Configuração de Banco de Dados (PARCIAL)
- **Arquivo atualizado**: `.env.example`
- **Status**: ⚠️ PARCIALMENTE COMPLETO
- **Detalhes**:
  - Configuração para suportar SQLite e PostgreSQL
  - Variável DB_PROVIDER adicionada
- **Pendente**:
  - Atualizar `prisma/schema.prisma` para usar env("DB_PROVIDER")
  - Criar scripts de migração separados

---

## 🔧 TAREFAS PENDENTES - ALTA PRIORIDADE

### 🚨 3.1 - Segurança de Upload de Arquivos
**Status**: ❌ NÃO INICIADO  
**Prioridade**: CRÍTICA  
**Arquivos a modificar**:
- `lib/file-validation.ts`
- `lib/upload-validation.ts`
- `app/api/analise/upload/route.ts`
- `app/api/analysis/multi-species/route.ts`

**Implementação necessária**:
```typescript
// lib/upload-security.ts
import crypto from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'

// 1. Verificação de tipo MIME real
export async function verifyMimeType(buffer: Buffer): Promise<string> {
  const fileTypeModule = await import('file-type')
  const result = await fileTypeModule.fileTypeFromBuffer(buffer)
  return result?.mime || 'application/octet-stream'
}

// 2. Scan de conteúdo malicioso
export function scanForMaliciousPatterns(content: string): boolean {
  const maliciousPatterns = [
    /<script[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\(/gi,
    /document\./gi,
    /window\./gi
  ]
  
  return maliciousPatterns.some(pattern => pattern.test(content))
}

// 3. Sanitização de nome de arquivo
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '_')
    .substring(0, 255)
}

// 4. Limite de tamanho por tipo
export const FILE_SIZE_LIMITS = {
  csv: 10 * 1024 * 1024,  // 10MB para CSV
  image: 5 * 1024 * 1024,  // 5MB para imagens
  document: 20 * 1024 * 1024 // 20MB para documentos
}

// 5. Processamento assíncrono
export async function processFileAsync(file: File) {
  const jobId = crypto.randomUUID()
  // Implementar queue com Bull ou similar
  await addToQueue('file-processing', {
    jobId,
    file,
    timestamp: Date.now()
  })
  return { jobId, status: 'processing' }
}
```

**Tarefas**:
- [ ] Instalar `file-type` para verificação MIME real
- [ ] Implementar verificação de padrões maliciosos
- [ ] Adicionar sanitização de nomes de arquivo
- [ ] Configurar processamento assíncrono com Bull
- [ ] Adicionar limite de tamanho diferenciado por tipo

---

### 📊 3.2 - Otimização de Queries com Paginação
**Status**: ❌ NÃO INICIADO  
**Prioridade**: ALTA  
**Arquivos a modificar**:
- Todas as rotas API com `findMany()`

**Implementação necessária**:
```typescript
// lib/pagination.ts
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export async function paginate<T>(
  model: any,
  params: PaginationParams,
  where?: any,
  include?: any
): Promise<PaginatedResponse<T>> {
  const page = Math.max(1, params.page || 1)
  const limit = Math.min(100, Math.max(1, params.limit || 20))
  const skip = (page - 1) * limit
  
  const [data, total] = await Promise.all([
    model.findMany({
      where,
      include,
      skip,
      take: limit,
      orderBy: params.sortBy ? {
        [params.sortBy]: params.sortOrder || 'desc'
      } : undefined
    }),
    model.count({ where })
  ])
  
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  }
}
```

**Rotas a atualizar**:
- [ ] `/api/referencias/search` - Adicionar paginação
- [ ] `/api/reference/species` - Limitar resultados
- [ ] `/api/analysis/multi-species` - Paginar histórico
- [ ] `/api/auth/users` (se existir) - Paginar lista de usuários

---

### 💾 3.3 - Implementação Adequada de Cache
**Status**: ❌ NÃO INICIADO  
**Prioridade**: MÉDIA  
**Arquivos a modificar**:
- `lib/cache.ts`
- Todas as rotas GET públicas

**Implementação necessária**:
```typescript
// lib/cache-manager.ts
import { Redis } from '@upstash/redis'

interface CacheConfig {
  ttl?: number // Time to live in seconds
  tags?: string[] // Cache tags for invalidation
  version?: string // Cache version
}

class CacheManager {
  private redis: Redis | null
  private version: string
  
  constructor() {
    this.version = process.env.CACHE_VERSION || '1'
    this.redis = this.initRedis()
  }
  
  private initRedis() {
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      return null
    }
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!
    })
  }
  
  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null
    
    const versionedKey = `${this.version}:${key}`
    try {
      const data = await this.redis.get(versionedKey)
      return data as T
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }
  
  async set(
    key: string, 
    value: any, 
    config: CacheConfig = {}
  ): Promise<void> {
    if (!this.redis) return
    
    const versionedKey = `${this.version}:${key}`
    const ttl = config.ttl || 3600 // Default 1 hour
    
    try {
      await this.redis.setex(versionedKey, ttl, JSON.stringify(value))
      
      // Store tags for invalidation
      if (config.tags) {
        for (const tag of config.tags) {
          await this.redis.sadd(`tag:${tag}`, versionedKey)
          await this.redis.expire(`tag:${tag}`, ttl)
        }
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }
  
  async invalidate(key: string): Promise<void> {
    if (!this.redis) return
    
    const versionedKey = `${this.version}:${key}`
    try {
      await this.redis.del(versionedKey)
    } catch (error) {
      console.error('Cache invalidate error:', error)
    }
  }
  
  async invalidateTag(tag: string): Promise<void> {
    if (!this.redis) return
    
    try {
      const keys = await this.redis.smembers(`tag:${tag}`)
      if (keys.length > 0) {
        await this.redis.del(...keys)
        await this.redis.del(`tag:${tag}`)
      }
    } catch (error) {
      console.error('Cache tag invalidate error:', error)
    }
  }
}

export const cacheManager = new CacheManager()
```

**Implementar cache em**:
- [ ] `/api/reference/[species]/data` - Cache de dados de referência
- [ ] `/api/referencias/search` - Cache de buscas frequentes
- [ ] Dados estáticos que raramente mudam

---

## 📝 TAREFAS PENDENTES - MÉDIA PRIORIDADE

### 🧪 4.2 - Testes Automatizados
**Status**: ❌ NÃO INICIADO  
**Prioridade**: MÉDIA

**Setup necessário**:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom
npm install --save-dev @types/jest supertest msw
```

**Configuração Jest** (`jest.config.js`):
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
}

module.exports = createJestConfig(customJestConfig)
```

**Testes prioritários a criar**:
```typescript
// __tests__/api/auth/signup.test.ts
import { POST } from '@/app/api/auth/signup/route'
import { prisma } from '@/lib/prisma'

describe('/api/auth/signup', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany()
  })
  
  test('should create user with valid data', async () => {
    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@test.com',
        password: '123456'
      })
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.user.email).toBe('test@test.com')
  })
  
  test('should reject duplicate email', async () => {
    // Create first user
    await prisma.user.create({
      data: {
        name: 'Existing',
        email: 'test@test.com',
        password: 'hashed'
      }
    })
    
    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@test.com',
        password: '123456'
      })
    })
    
    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
```

**Testes a implementar**:
- [ ] Auth: signup, login, forgot-password, reset-password
- [ ] Upload: validação de arquivo, limites de tamanho
- [ ] Rate Limiting: verificar se limites funcionam
- [ ] CORS: verificar headers corretos
- [ ] Paginação: testar limites e offsets

---

### 📚 4.3 - Documentação API OpenAPI
**Status**: ❌ NÃO INICIADO  
**Prioridade**: BAIXA

**Setup**:
```bash
npm install --save-dev @apidevtools/swagger-cli swagger-ui-react
```

**Criar** `openapi.yaml`:
```yaml
openapi: 3.0.0
info:
  title: AgroInsight API
  version: 1.0.0
  description: API for agricultural data analysis

servers:
  - url: http://localhost:3000/api
    description: Development
  - url: https://agroinsight.com/api
    description: Production

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      
  schemas:
    Error:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
        details:
          type: object
          
    User:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        email:
          type: string
          format: email
        role:
          type: string
          enum: [USER, ADMIN]

paths:
  /auth/signup:
    post:
      summary: Create new user account
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - name
                - email
                - password
              properties:
                name:
                  type: string
                  minLength: 2
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 6
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  user:
                    $ref: '#/components/schemas/User'
        '400':
          description: Validation error or user exists
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '429':
          description: Rate limit exceeded
```

**Criar rota para Swagger UI**:
```typescript
// app/api/docs/route.ts
import { NextResponse } from 'next/server'
import swaggerUi from 'swagger-ui-react'
import yaml from 'js-yaml'
import fs from 'fs'

export async function GET() {
  const spec = yaml.load(
    fs.readFileSync('./openapi.yaml', 'utf8')
  )
  
  return NextResponse.json(spec)
}
```

---

## 🎯 TAREFAS PENDENTES - BAIXA PRIORIDADE

### 🔄 5.1 - Migração de Dados Estruturados
**Status**: ❌ NÃO INICIADO  
**Detalhes**: Migrar campos JSON para colunas estruturadas no banco de dados

### 📊 5.2 - Monitoring & Observability
**Status**: ❌ NÃO INICIADO  
**Ferramentas sugeridas**:
- Sentry para error tracking
- Datadog ou New Relic para APM
- Grafana + Prometheus para métricas

### 🚀 5.3 - CI/CD Pipeline
**Status**: ❌ NÃO INICIADO  
**GitHub Actions** (`.github/workflows/ci.yml`):
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
      - name: Type check
        run: npm run type-check
        
      - name: Run tests
        run: npm test -- --coverage
        
      - name: Build application
        run: npm run build
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run security audit
        run: npm audit --audit-level=high
        
      - name: Check for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          
  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🔥 PRÓXIMOS PASSOS IMEDIATOS

1. **Completar configuração do banco de dados** (2.3):
   - Atualizar `prisma/schema.prisma` para usar DB_PROVIDER
   - Criar scripts separados para dev e prod

2. **Implementar segurança de upload** (3.1):
   - Validação MIME real
   - Scan de conteúdo malicioso
   - Limites apropriados

3. **Adicionar paginação** (3.2):
   - Criar helper de paginação
   - Aplicar em todas as rotas com `findMany()`

4. **Melhorar sistema de cache** (3.3):
   - Implementar CacheManager
   - Adicionar cache em rotas GET públicas

5. **Criar testes básicos** (4.2):
   - Pelo menos para rotas de autenticação
   - Testar rate limiting

---

## 📌 NOTAS IMPORTANTES

### Segurança
- Rate limiting implementado mas precisa de Redis configurado
- CORS implementado mas origens permitidas devem ser revisadas em produção
- Console.logs ainda presentes - substituir por logger condicional

### Performance
- Queries sem paginação podem causar problemas com datasets grandes
- Cache básico implementado mas precisa melhorias

### Manutenibilidade
- Testes ausentes tornam refatoração arriscada
- Documentação API incompleta dificulta integração

### Para a Próxima Iteração
1. Focar primeiro em completar tarefas de alta prioridade (3.1, 3.2, 3.3)
2. Implementar testes básicos antes de fazer grandes mudanças
3. Revisar todas as variáveis de ambiente antes do deploy
4. Configurar monitoring antes de ir para produção

---

## 🛠️ Comandos Úteis

```bash
# Verificar configuração do banco
npx prisma db push

# Gerar cliente Prisma
npx prisma generate

# Rodar migrations
npx prisma migrate dev

# Verificar vulnerabilidades
npm audit

# Rodar linter
npm run lint

# Type checking
npm run type-check

# Build para produção
npm run build
```

---

*Este roadmap deve ser atualizado conforme as tarefas são completadas. Última atualização: 05/11/2024*
