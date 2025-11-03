# 🌱 Popular Banco de Produção

Este guia mostra como criar os usuários demo no banco de produção da Vercel.

## ⚠️ Problema

Após o deploy, você pode ter esses erros:
- ❌ **API_005** ao tentar cadastrar
- ❌ **Erro de autenticação** ao tentar logar com credenciais demo

**Causa**: O banco de produção está **vazio**. O seed não roda automaticamente no deploy.

## ✅ Soluções

### Opção 1: Via Script Local (Recomendado)

**1. Configure o DATABASE_URL de produção temporariamente**

Crie um arquivo `.env.production.local`:

```env
DATABASE_URL="sua-database-url-de-producao-aqui"
```

**2. Execute o script de seed**

```bash
# Usando a DATABASE_URL de produção
npx tsx scripts/seed-production.ts
```

**3. Verifique os logs**

Você deve ver:
```
✅ Admin criado: admin@agroinsight.com
✅ Demo criado: demo@agroinsight.com
✅ Pesquisador criado: researcher@agroinsight.com
```

**4. Teste o login**

Acesse seu app e tente logar com:
- Email: `demo@agroinsight.com`
- Senha: `demo123`

---

### Opção 2: Via Vercel CLI

**1. Instale Vercel CLI**

```bash
npm i -g vercel
```

**2. Faça login**

```bash
vercel login
```

**3. Execute o seed em produção**

```bash
# Isso roda o seed no ambiente de produção
vercel env pull .env.production
npx prisma db seed
```

---

### Opção 3: Manualmente via Prisma Studio

**1. Abra o Prisma Studio apontando para produção**

```bash
# Configure DATABASE_URL de produção no .env
npx prisma studio
```

**2. Crie os usuários manualmente**

Na tabela `User`, clique em **Add record**:

#### Usuário Demo
- **email**: demo@agroinsight.com
- **name**: Demo User
- **password**: (hash bcrypt de "demo123")
- **role**: USER

**Como gerar o hash da senha:**
```bash
node -e "console.log(require('bcryptjs').hashSync('demo123', 12))"
```

---

## 🔑 Credenciais Criadas

Após popular o banco, você terá:

| Email | Senha | Função |
|-------|-------|--------|
| demo@agroinsight.com | demo123 | USER |
| admin@agroinsight.com | admin123 | ADMIN |
| researcher@agroinsight.com | user123 | USER |

---

## 🐛 Troubleshooting

### Erro: "Environment variable not found: DATABASE_URL"

**Solução**: Configure o DATABASE_URL antes de rodar o seed:

```bash
# Windows PowerShell
$env:DATABASE_URL="sua-url-aqui"
npx tsx scripts/seed-production.ts

# Linux/Mac
DATABASE_URL="sua-url-aqui" npx tsx scripts/seed-production.ts
```

### Erro: "unique constraint failed"

**Solução**: Os usuários já existem. Você pode:
1. Deletar os usuários existentes
2. Ou simplesmente usar as credenciais atuais

### Como obter DATABASE_URL de produção?

**Via Vercel Dashboard:**
1. https://vercel.com → Seu projeto
2. Settings → Environment Variables
3. Copie o valor de `DATABASE_URL`

**Via Vercel CLI:**
```bash
vercel env pull .env.production
```

---

## 🔒 Segurança

⚠️ **IMPORTANTE**: 

1. **Nunca commite** `.env.production.local` no Git
2. Após popular o banco, **delete** `.env.production.local`
3. Em produção real, **altere as senhas** das contas demo
4. Considere **desabilitar cadastro público** se for um app privado

---

## 📝 Alternativa: Endpoint de Seed via API

Se você preferir, pode criar um endpoint protegido para fazer seed:

```typescript
// app/api/admin/seed/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  // Verificar autenticação ADMIN
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Popular banco
  // ... (código do seed aqui)
  
  return NextResponse.json({ success: true })
}
```

⚠️ **Cuidado**: Proteja este endpoint adequadamente!
