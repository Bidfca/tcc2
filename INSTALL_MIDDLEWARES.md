# 🚀 Guia de Instalação Rápida - Middlewares e Segurança

Este guia irá instalar e configurar todos os novos middlewares e funcionalidades de segurança.

## ⚡ Instalação Rápida (1 comando)

```bash
npm install @upstash/ratelimit
```

## ✅ Verificação

Após a instalação, o erro de TypeScript `Cannot find module '@upstash/ratelimit'` deve desaparecer.

## 🔧 Configuração

### 1. Variáveis de ambiente já estão configuradas

As mesmas credenciais do Upstash Redis são usadas:

```env
UPSTASH_REDIS_REST_URL="https://seu-banco.upstash.io"
UPSTASH_REDIS_REST_TOKEN="seu-token-aqui"
```

### 2. Todos os módulos já foram criados

- ✅ `lib/logger.ts` - Sistema de logger
- ✅ `lib/auth-middleware.ts` - Middleware de autenticação
- ✅ `lib/ratelimit.ts` - Rate limiting
- ✅ `lib/file-validation.ts` - Validação de arquivos

## 📝 Uso Imediato

### Logger

Substitua `console.log` por logger em qualquer arquivo:

```typescript
import { logger } from '@/lib/logger'

// Antes
console.log('Mensagem')
console.error('Erro:', error)

// Depois
logger.info('Mensagem')
logger.error('Erro', error)
logger.success('Operação concluída')
```

### Autenticação

Em endpoints API, use `withAuth`:

```typescript
import { withAuth } from '@/lib/auth-middleware'

// Antes
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  // ... lógica ...
}

// Depois
export const GET = withAuth(async (request, { user }) => {
  // user já está disponível e autenticado
  // ... lógica ...
})
```

### Rate Limiting

Adicione proteção em endpoints críticos:

```typescript
import { applyRateLimit } from '@/lib/ratelimit'

export const POST = withAuth(async (request, { user }) => {
  // Aplicar rate limit
  const rateLimitResponse = await applyRateLimit(user.id, 'upload')
  if (rateLimitResponse) return rateLimitResponse
  
  // ... lógica ...
})
```

### Validação de Arquivos

Para uploads de arquivo:

```typescript
import { validateUploadedFile, validateCSVFile } from '@/lib/file-validation'

export const POST = withAuth(async (request, { user }) => {
  // Validar arquivo automaticamente
  const result = await validateUploadedFile(request, 'file', validateCSVFile)
  if (result instanceof Response) return result
  
  const { file } = result
  // ... lógica com arquivo validado ...
})
```

## 🎯 Próximos Passos

### 1. Migrar Endpoints Prioritários

**Alta Prioridade:**
- `/api/analise/upload` - Upload crítico
- `/api/auth/*` - Segurança
- `/api/analise/diagnostico` - Processamento pesado

**Média Prioridade:**
- `/api/referencias/search`
- `/api/analise/delete`
- `/api/referencias/save`

### 2. Substituir console.log

Execute para encontrar todos os console.log:
```bash
grep -r "console.log" app/api/
```

Substitua por logger apropriado.

### 3. Testar Rate Limiting

```bash
# Testar endpoint com rate limit
for i in {1..10}; do curl http://localhost:3000/api/test; done
```

Deve retornar 429 após exceder o limite.

## 📚 Documentação Completa

- **Guia completo**: [`docs/MIDDLEWARE_SYSTEM.md`](docs/MIDDLEWARE_SYSTEM.md)
- **Resumo técnico**: [`MIDDLEWARE_IMPLEMENTATION_SUMMARY.md`](MIDDLEWARE_IMPLEMENTATION_SUMMARY.md)

## ❓ Problemas?

### Erro: Cannot find module '@upstash/ratelimit'

```bash
npm install @upstash/ratelimit
```

### Tipos TypeScript não encontrados

```bash
npm install --save-dev @types/node
```

### Rate limit não funciona

Verifique se as variáveis do Upstash estão configuradas:
```bash
echo $UPSTASH_REDIS_REST_URL
```

## ✅ Checklist

- [ ] Executei `npm install @upstash/ratelimit`
- [ ] Erro de TypeScript desapareceu
- [ ] Li a documentação em `docs/MIDDLEWARE_SYSTEM.md`
- [ ] Testei logger em desenvolvimento
- [ ] Comecei a migrar endpoints prioritários

---

**Tempo estimado de instalação**: 2 minutos  
**Tempo estimado para migração completa**: 1-2 horas
