# 🚀 Guia de Deploy - AgroInsight na Vercel

Este guia contém o passo a passo completo para fazer deploy da aplicação AgroInsight na Vercel usando PostgreSQL.

## 📋 Pré-requisitos

- [ ] Conta no [GitHub](https://github.com)
- [ ] Conta na [Vercel](https://vercel.com) (pode usar login com GitHub)
- [ ] Git instalado e configurado
- [ ] Node.js 18+ instalado

## 🗂️ Índice

1. [Backup dos Dados SQLite](#1-backup-dos-dados-sqlite)
2. [Preparar Repositório GitHub](#2-preparar-repositório-github)
3. [Configurar PostgreSQL](#3-configurar-postgresql)
4. [Deploy na Vercel](#4-deploy-na-vercel)
5. [Configurar Variáveis de Ambiente](#5-configurar-variáveis-de-ambiente)
6. [Executar Migrations](#6-executar-migrations)
7. [Restaurar Dados (Opcional)](#7-restaurar-dados-opcional)
8. [Verificação e Testes](#8-verificação-e-testes)

---

## 1. Backup dos Dados SQLite

Antes de migrar para PostgreSQL, faça backup dos dados existentes (se houver):

```bash
npm run backup:sqlite
```

Isso criará um arquivo JSON em `backup/sqlite-backup-[timestamp].json` com todos os dados.

---

## 2. Preparar Repositório GitHub

### 2.1 Criar repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Nome do repositório: `agroinsight` (ou escolha outro)
3. Deixe como **Private** ou **Public**
4. **NÃO** marque "Initialize with README"
5. Clique em **Create repository**

### 2.2 Enviar código para GitHub

```bash
# Inicializar Git (se ainda não foi feito)
git init

# Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/agroinsight.git

# Adicionar arquivos
git add .

# Commit
git commit -m "Preparação para deploy na Vercel"

# Push
git push -u origin main
```

> **Nota**: Certifique-se de que o arquivo `.env` está no `.gitignore` e NÃO foi enviado!

---

## 3. Configurar PostgreSQL

Você tem duas opções para PostgreSQL:

### Opção A: Vercel Postgres (Recomendado) ⭐

**Vantagens**: Integração nativa, configuração automática, grátis até 256 MB

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Vá em **Storage** → **Create Database**
3. Selecione **Postgres**
4. Escolha a região: **São Paulo (gru1)** para melhor performance no Brasil
5. Nome do banco: `agroinsight-db`
6. Clique em **Create**

> A Vercel vai configurar automaticamente as variáveis `DATABASE_URL` e `DIRECT_URL`

### Opção B: Supabase (Alternativa)

**Vantagens**: Mais recursos, interface visual, grátis até 500 MB

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta (pode usar GitHub)
3. Clique em **New Project**
4. Preencha:
   - **Name**: `agroinsight`
   - **Database Password**: Crie uma senha forte e **SALVE**
   - **Region**: South America (São Paulo)
5. Aguarde a criação (~2 minutos)
6. Vá em **Settings** → **Database**
7. Copie a **Connection String** (formato URI)

---

## 4. Deploy na Vercel

### 4.1 Importar projeto

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **Import Git Repository**
3. Selecione o repositório `agroinsight`
4. Configure:
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: `./` (raiz)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `.next` (padrão)
5. **NÃO clique em Deploy ainda!** Vamos configurar as variáveis primeiro

---

## 5. Configurar Variáveis de Ambiente

Na página de deploy da Vercel, expanda **Environment Variables** e adicione:

### 5.1 Variáveis Obrigatórias

| Nome | Valor | Onde conseguir |
|------|-------|----------------|
| `DATABASE_URL` | `postgresql://...` | Vercel Postgres ou Supabase |
| `DIRECT_URL` | `postgresql://...` | Igual ao DATABASE_URL |
| `NEXTAUTH_URL` | `https://seu-app.vercel.app` | Será fornecido após deploy |
| `NEXTAUTH_SECRET` | String aleatória de 32+ caracteres | Gerar: `openssl rand -base64 32` |
| `UPSTASH_REDIS_REST_URL` | `https://...` | [upstash.com](https://upstash.com) |
| `UPSTASH_REDIS_REST_TOKEN` | `A...` | [upstash.com](https://upstash.com) |

### 5.2 Variáveis Opcionais (APIs)

| Nome | Valor | Onde conseguir |
|------|-------|----------------|
| `GOOGLE_GEMINI_API_KEY` | `AI...` | [aistudio.google.com](https://aistudio.google.com) |
| `OPENAI_API_KEY` | `sk-...` | [platform.openai.com](https://platform.openai.com) |
| `SERPAPI_API_KEY` | `...` | [serpapi.com](https://serpapi.com) (100 buscas grátis/mês) |

### 5.3 Como conseguir cada serviço

#### Upstash Redis (Obrigatório - Cache)

1. Acesse [console.upstash.com](https://console.upstash.com)
2. Clique em **Create Database**
3. Nome: `agroinsight-cache`
4. Região: **São Paulo (sa-east-1)**
5. Tipo: **Regional** (grátis)
6. Após criar, copie:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

#### Google Gemini (Opcional - IA para diagnósticos)

1. Acesse [aistudio.google.com](https://aistudio.google.com)
2. Clique em **Get API Key**
3. Crie uma chave gratuita
4. Copie a `GOOGLE_GEMINI_API_KEY`

#### SerpAPI (Opcional - Google Scholar)

1. Acesse [serpapi.com](https://serpapi.com)
2. Crie conta gratuita (100 buscas/mês)
3. Dashboard → API Key
4. Copie a `SERPAPI_API_KEY`

### 5.4 Gerar NEXTAUTH_SECRET

No terminal (Git Bash ou WSL):

```bash
openssl rand -base64 32
```

Ou use um gerador online: [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

### 5.5 Aplicar variáveis

Após adicionar todas as variáveis:
1. Certifique-se de marcar **Production**, **Preview**, e **Development**
2. Clique em **Deploy**

---

## 6. Executar Migrations

Após o primeiro deploy:

### 6.1 Via Vercel CLI (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Vincular projeto
vercel link

# Executar migration
vercel env pull .env.production
npx prisma migrate deploy
```

### 6.2 Via Vercel Dashboard

O script `vercel-build` já executa `prisma migrate deploy` automaticamente durante o build.

Verifique os logs do deploy para confirmar que as migrations foram executadas:
- Vercel Dashboard → Seu Projeto → Deployments → Último deploy → Logs

Procure por:
```
✓ prisma migrate deploy completed
```

---

## 7. Restaurar Dados (Opcional)

Se você fez backup dos dados SQLite e quer migrar para PostgreSQL:

### 7.1 Configurar conexão local com PostgreSQL de produção

Crie arquivo `.env.production.local`:

```env
DATABASE_URL="sua-url-postgresql-de-producao"
DIRECT_URL="sua-url-postgresql-de-producao"
```

### 7.2 Executar script de restore

```bash
npm run restore:postgresql backup/sqlite-backup-[timestamp].json
```

> **Importante**: Execute isso apenas UMA vez, logo após o primeiro deploy!

---

## 8. Verificação e Testes

### 8.1 Verificar deploy

1. Acesse a URL fornecida pela Vercel (ex: `https://agroinsight.vercel.app`)
2. Tente fazer login ou criar uma conta
3. Teste as funcionalidades principais:
   - Criação de projeto
   - Upload de dataset
   - Busca de referências

### 8.2 Atualizar NEXTAUTH_URL

1. Na Vercel Dashboard → Seu Projeto → Settings → Environment Variables
2. Edite `NEXTAUTH_URL`
3. Altere para a URL real: `https://seu-app.vercel.app`
4. Clique em **Save**
5. Faça um **Redeploy** (Deployments → ⋯ → Redeploy)

### 8.3 Configurar domínio customizado (Opcional)

1. Vercel Dashboard → Seu Projeto → Settings → Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Atualize `NEXTAUTH_URL` para seu domínio

---

## 🔧 Solução de Problemas

### Erro: "PrismaClient is unable to be run in the browser"

**Causa**: Prisma sendo importado no lado do cliente

**Solução**: Certifique-se de usar Prisma apenas em Server Components ou API routes

### Erro: "Can't reach database server"

**Causa**: DATABASE_URL incorreta ou banco não acessível

**Solução**: 
1. Verifique se DATABASE_URL está correta nas env vars
2. Teste conexão localmente: `npx prisma db pull`

### Erro: "Table does not exist"

**Causa**: Migrations não foram executadas

**Solução**:
```bash
# Via Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy
```

### Build falha com erro de timeout

**Causa**: Build muito longo

**Solução**: 
1. Verifique se `.vercelignore` está excluindo testes e docs
2. Aumente timeout em vercel.json (Pro plan apenas)

---

## 📱 Próximos Passos

- [ ] Configurar domínio customizado
- [ ] Configurar monitoramento (Vercel Analytics)
- [ ] Configurar backups automáticos do PostgreSQL
- [ ] Configurar CI/CD para testes antes do deploy
- [ ] Adicionar variáveis de ambiente de staging

---

## 📚 Recursos Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma com Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js no Vercel](https://vercel.com/docs/frameworks/nextjs)

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs no Vercel Dashboard
2. Consulte a documentação oficial
3. Abra uma issue no repositório

---

**Deploy preparado com sucesso! 🎉**
