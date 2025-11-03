# 🔄 Migração SQLite → PostgreSQL

## Resumo Rápido

Este projeto foi preparado para migrar de SQLite para PostgreSQL e fazer deploy na Vercel.

## ✅ O que foi feito

1. **Schema atualizado** - `prisma/schema.prisma` agora usa PostgreSQL
2. **Scripts de migração** criados:
   - `scripts/backup-sqlite-data.ts` - Exporta dados do SQLite
   - `scripts/restore-to-postgresql.ts` - Importa dados no PostgreSQL
3. **Variáveis de ambiente** atualizadas no `.env.example`
4. **Configuração Vercel** criada (`vercel.json` e `.vercelignore`)
5. **Package.json** atualizado com novos scripts

## 📦 Novos Scripts NPM

```bash
# Fazer backup dos dados SQLite
npm run backup:sqlite

# Restaurar dados no PostgreSQL (após configurar DATABASE_URL)
npm run restore:postgresql backup/sqlite-backup-[timestamp].json

# Build para produção (inclui prisma generate)
npm run build

# Deploy na Vercel (com migrations)
npm run vercel-build

# Executar migrations em produção
npm run db:migrate:deploy
```

## 🔐 Variáveis de Ambiente Necessárias

### Obrigatórias

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_URL="https://seu-app.vercel.app"
NEXTAUTH_SECRET="string-aleatoria-32-caracteres"
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### Opcionais

```env
GOOGLE_GEMINI_API_KEY="..."
OPENAI_API_KEY="..."
SERPAPI_API_KEY="..."
```

## 🚀 Deploy Rápido

1. **Fazer backup dos dados atuais**:
   ```bash
   npm run backup:sqlite
   ```

2. **Commit e push para GitHub**:
   ```bash
   git add .
   git commit -m "Preparação para deploy"
   git push origin main
   ```

3. **Criar banco PostgreSQL**:
   - Opção 1: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - Opção 2: [Supabase](https://supabase.com)

4. **Deploy na Vercel**:
   - Importar repositório em [vercel.com/new](https://vercel.com/new)
   - Configurar variáveis de ambiente
   - Deploy automático

5. **Restaurar dados (se necessário)**:
   ```bash
   npm run restore:postgresql backup/sqlite-backup-[timestamp].json
   ```

## 📖 Documentação Completa

Veja `DEPLOY_GUIDE.md` na raiz do projeto para instruções detalhadas passo a passo.

## ⚠️ Importante

- **Não commite** o arquivo `.env` com credenciais reais
- **Faça backup** antes de migrar dados
- **Teste localmente** com PostgreSQL antes do deploy
- As **migrations** são executadas automaticamente no build da Vercel

## 🔧 Desenvolvimento Local com PostgreSQL

### Opção 1: Docker

```bash
docker run --name agroinsight-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=agroinsight \
  -p 5432:5432 \
  -d postgres:15-alpine
```

Então use:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agroinsight"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/agroinsight"
```

### Opção 2: Supabase (desenvolvimento)

1. Crie projeto no Supabase
2. Copie a connection string
3. Use no `.env.local`

### Executar migrations

```bash
npx prisma migrate dev --name init
```

## 🆘 Problemas Comuns

### "Cannot find module @prisma/client"

```bash
npm install
npx prisma generate
```

### "Table does not exist"

```bash
npx prisma migrate deploy
# ou
npx prisma db push
```

### "Connection timeout" no PostgreSQL

Verifique:
- Firewall/segurança do banco
- URL de conexão está correta
- Banco está rodando

## 📊 Diferenças SQLite vs PostgreSQL

| Aspecto | SQLite | PostgreSQL |
|---------|--------|------------|
| Armazenamento | Arquivo local | Servidor |
| Concorrência | Limitada | Excelente |
| Produção | ❌ Não recomendado | ✅ Recomendado |
| Vercel | ❌ Não funciona | ✅ Funciona |
| Performance | Boa (local) | Excelente (rede) |
| Funcionalidades | Básicas | Avançadas |

## 🎯 Próximos Passos

- [ ] Testar localmente com PostgreSQL
- [ ] Fazer backup dos dados
- [ ] Configurar Vercel Postgres ou Supabase
- [ ] Deploy na Vercel
- [ ] Restaurar dados
- [ ] Configurar domínio customizado
- [ ] Configurar monitoramento

---

**Migração preparada! Consulte DEPLOY_GUIDE.md para mais detalhes.**
