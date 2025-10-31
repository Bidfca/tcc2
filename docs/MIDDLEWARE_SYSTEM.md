# 🛡️ Sistema de Middleware e Segurança - AgroInsight

## Visão Geral

O AgroInsight implementa um sistema robusto de middlewares para:
- 📝 **Logger condicional** - Logs apenas em desenvolvimento
- 🔐 **Autenticação reutilizável** - Middleware de auth simplificado
- ⏱️ **Rate Limiting** - Proteção contra abuso e DDoS
- 📁 **Validação de arquivos** - Validação robusta de uploads

## 🔧 Instalação

### 1. Instalar dependências

O pacote `@upstash/ratelimit` já foi adicionado ao `package.json`. Instale as dependências:

```bash
npm install
```

### 2. Configurar variáveis de ambiente

As mesmas credenciais do Upstash Redis são usadas para rate limiting:

```env
UPSTASH_REDIS_REST_URL="https://seu-banco.upstash.io"
UPSTASH_REDIS_REST_TOKEN="seu-token-aqui"
```

## 📝 Sistema de Logger

### Uso Básico

```typescript
import { logger } from '@/lib/logger'

// Logs básicos (apenas em desenvolvimento)
logger.info('Informação importante')
logger.warn('Aviso')
logger.error('Erro ocorreu', error)
logger.debug('Debug detalhado')
logger.success('Operação bem-sucedida')

// Logs com dados adicionais
logger.info('Usuário criado', { userId: '123', email: 'user@example.com' })
```

### Logs Especializados

#### Cache
```typescript
logger.cache.hit('diagnostico:123')      // ✅ Cache HIT: diagnostico:123
logger.cache.miss('diagnostico:456')     // ℹ️ Cache MISS: diagnostico:456
logger.cache.set('resultados:user1')     // 🔍 Cache SET: resultados:user1
logger.cache.invalidate('articles:*')    // ℹ️ Cache invalidado: articles:*
```

#### API
```typescript
logger.api.request('POST', '/api/upload')
logger.api.response('POST', '/api/upload', 200, 1234) // com duração
logger.api.error('POST', '/api/upload', error)
```

#### Banco de Dados
```typescript
logger.db.query('INSERT', 'users')
logger.db.error('UPDATE', error)
```

#### Autenticação
```typescript
logger.auth.login('user@example.com')
logger.auth.logout('user@example.com')
logger.auth.failed('user@example.com')
```

### Comportamento

- **Desenvolvimento**: Todos os logs são exibidos
- **Produção**: Apenas erros são exibidos
- **Formato**: `emoji [timestamp] mensagem`

## 🔐 Middleware de Autenticação

### Uso Básico

#### Verificar autenticação

```typescript
import { requireAuth } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  
  // Usar auth.user.id, auth.user.email
}
```

#### Higher-Order Function (Recomendado)

```typescript
import { withAuth } from '@/lib/auth-middleware'

export const GET = withAuth(async (request, { user }) => {
  // user já está autenticado e disponível
  console.log(user.id, user.email)
  
  return NextResponse.json({ success: true })
})

// Com parâmetros de rota
export const GET = withAuth<{ id: string }>(async (request, { user, params }) => {
  const analysisId = params?.id
  
  return NextResponse.json({ 
    userId: user.id,
    analysisId 
  })
})
```

#### Verificações Simples

```typescript
import { getAuthUser, isAuthenticated } from '@/lib/auth-middleware'

// Obter usuário ou null
const user = await getAuthUser()

// Verificar se está autenticado (boolean)
if (await isAuthenticated()) {
  // ...
}
```

### Vantagens

- ✅ Código mais limpo e reutilizável
- ✅ Tratamento de erros centralizado
- ✅ TypeScript type-safe
- ✅ Logs automáticos

## ⏱️ Rate Limiting

### Configuração

Diferentes limites por tipo de endpoint:

| Tipo | Limite | Janela | Uso |
|------|--------|--------|-----|
| `upload` | 5 req | 1 hora | Upload de arquivos |
| `analysis` | 10 req | 1 hora | Análise de dados |
| `diagnostic` | 20 req | 1 hora | Geração de diagnósticos |
| `search` | 100 req | 1 hora | Busca de artigos |
| `general` | 200 req | 1 hora | Endpoints gerais |
| `auth` | 5 req | 15 min | Login/signup (anti brute-force) |

### Uso Básico

#### Verificar rate limit

```typescript
import { checkRateLimit } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  const userId = 'user123' // ou IP
  const result = await checkRateLimit(userId, 'upload')
  
  if (!result.success) {
    return NextResponse.json(
      { 
        error: 'Rate limit excedido',
        retryAfter: result.retryAfter 
      },
      { status: 429 }
    )
  }
  
  // Continuar com a requisição
}
```

#### Aplicar rate limit (com resposta automática)

```typescript
import { applyRateLimit } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  const userId = 'user123'
  const rateLimitResponse = await applyRateLimit(userId, 'upload')
  
  if (rateLimitResponse) {
    return rateLimitResponse // Retorna erro 429 automaticamente
  }
  
  // Continuar com a requisição
}
```

#### Higher-Order Function (Recomendado)

```typescript
import { withRateLimit } from '@/lib/ratelimit'

export const POST = withRateLimit('upload', async (request, { rateLimit }) => {
  console.log(`Requisições restantes: ${rateLimit.remaining}/${rateLimit.limit}`)
  
  return NextResponse.json({ success: true })
})
```

### Headers de Rate Limit

Todas as respostas incluem:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698765432000
```

Em caso de exceder o limite:

```
Retry-After: 3600
```

### Resposta de Erro (429)

```json
{
  "error": "Rate limit excedido",
  "message": "Você excedeu o limite de 10 requisições. Tente novamente em 3245 segundos.",
  "limit": 10,
  "retryAfter": 3245
}
```

## 📁 Validação de Arquivos

### Limites Configurados

| Tipo | Tamanho Máximo | Extensões | MIME Types |
|------|----------------|-----------|------------|
| CSV | 50 MB | .csv, .txt | text/csv, application/csv |
| PDF | 10 MB | .pdf | application/pdf |
| Imagem | 5 MB | .jpg, .png, .gif, .webp | image/jpeg, image/png, etc |
| Geral | 100 MB | - | - |

### Uso Básico

#### Validar CSV

```typescript
import { validateCSVFile } from '@/lib/file-validation'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  const validation = validateCSVFile(file)
  
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    )
  }
  
  // Continuar com o upload
}
```

#### Validar outros tipos

```typescript
import { 
  validateImageFile,
  validatePDFFile,
  validateFile 
} from '@/lib/file-validation'

// Imagem
const imageValidation = validateImageFile(file)

// PDF
const pdfValidation = validatePDFFile(file)

// Validação customizada
const customValidation = validateFile(file, {
  maxSize: 20 * 1024 * 1024, // 20 MB
  allowedTypes: ['application/json'],
  allowedExtensions: ['.json']
})
```

#### Middleware de validação

```typescript
import { validateUploadedFile, validateCSVFile } from '@/lib/file-validation'

export async function POST(request: NextRequest) {
  const result = await validateUploadedFile(request, 'file', validateCSVFile)
  
  // Se retornar Response, é um erro
  if (result instanceof Response) {
    return result
  }
  
  // Caso contrário, temos o arquivo validado
  const { file, validation } = result
  console.log('Arquivo válido:', validation.details)
}
```

### Funções Utilitárias

```typescript
import { formatBytes } from '@/lib/file-validation'

console.log(formatBytes(1024))        // "1 KB"
console.log(formatBytes(1048576))     // "1 MB"
console.log(formatBytes(52428800))    // "50 MB"
```

## 🎯 Exemplo Completo: Endpoint Refatorado

### Antes (sem middlewares)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Auth manual
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Validação manual
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return NextResponse.json({ error: 'Sem arquivo' }, { status: 400 })
  }
  
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'Arquivo muito grande' }, { status: 400 })
  }

  // Sem rate limiting
  // Sem logs estruturados
  console.log('Upload iniciado')
  
  // ... lógica ...
  
  return NextResponse.json({ success: true })
}
```

### Depois (com middlewares)

```typescript
import { withAuth } from '@/lib/auth-middleware'
import { withRateLimit } from '@/lib/ratelimit'
import { validateUploadedFile, validateCSVFile } from '@/lib/file-validation'
import { logger } from '@/lib/logger'

export const POST = withAuth(async (request, { user }) => {
  logger.info('Upload iniciado', { userId: user.id })
  
  // Rate limiting
  const rateLimitResponse = await applyRateLimit(user.id, 'upload')
  if (rateLimitResponse) return rateLimitResponse
  
  // Validação automática
  const result = await validateUploadedFile(request, 'file', validateCSVFile)
  if (result instanceof Response) return result
  
  const { file } = result
  
  logger.success('Arquivo validado', { 
    name: file.name,
    size: formatBytes(file.size)
  })
  
  // ... lógica ...
  
  return NextResponse.json({ success: true })
})
```

## 📊 Benefícios

### Código mais limpo
- **Antes**: 30-40 linhas de boilerplate por endpoint
- **Depois**: 10-15 linhas de lógica de negócio
- **Redução**: ~60% menos código

### Segurança aprimorada
- ✅ Rate limiting automático
- ✅ Validação robusta de arquivos
- ✅ Logs de segurança estruturados
- ✅ Proteção contra brute-force

### Manutenibilidade
- ✅ Código DRY (Don't Repeat Yourself)
- ✅ Fácil de testar
- ✅ Centralização de lógica comum
- ✅ TypeScript type-safe

## 🚀 Checklist de Migração

Para migrar um endpoint existente:

- [ ] Substituir `getServerSession` por `withAuth`
- [ ] Adicionar `logger` no lugar de `console.log`
- [ ] Implementar rate limiting com `withRateLimit` ou `applyRateLimit`
- [ ] Usar `validateUploadedFile` para uploads
- [ ] Remover tratamento de erro duplicado
- [ ] Testar o endpoint refatorado

## 🔍 Troubleshooting

### Erro: Cannot find module '@upstash/ratelimit'

```bash
npm install @upstash/ratelimit
```

### Logs não aparecem em desenvolvimento

Verifique a variável `NODE_ENV`:
```bash
echo $NODE_ENV  # deve ser 'development'
```

### Rate limit muito restritivo

Ajuste os limites em `lib/ratelimit.ts`:

```typescript
analysis: new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'), // Aumentar de 10 para 20
  // ...
})
```

### Validação de arquivo falhando

Verifique os logs para ver detalhes:
```typescript
const validation = validateCSVFile(file)
console.log(validation.details) // tamanho, tipo, extensão
```

## 📚 Referências

- **Upstash Ratelimit**: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
- **NextAuth**: https://next-auth.js.org
- **File API**: https://developer.mozilla.org/en-US/docs/Web/API/File

---

**Versão**: 1.0.0  
**Última atualização**: 30/10/2025  
**Mantenedor**: Gabriel Pedro
