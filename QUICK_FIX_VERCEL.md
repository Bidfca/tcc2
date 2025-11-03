# ⚡ Correção Rápida - Erros no Vercel

## 🔴 Problemas

1. ❌ **API_005** ao tentar cadastrar usuário
2. ❌ **Erro de autenticação** ao tentar logar com demo@agroinsight.com

## ✅ Solução em 3 Passos

### PASSO 1: Configurar Variáveis de Ambiente no Vercel

1. Acesse: https://vercel.com/[seu-usuario]/tcc2/settings/environment-variables

2. Verifique se TODAS estas variáveis existem:

| Variável | Valor |
|----------|-------|
| `NEXTAUTH_SECRET` | `rPzwnruatfYJSDcTzzNLRvfy0T0N89vC0i4bc11LlaM=` |
| `NEXTAUTH_URL` | `https://[seu-app].vercel.app` (URL real do seu app) |
| `DATABASE_URL` | `postgresql://...` (da Vercel Postgres ou Supabase) |
| `DIRECT_URL` | `postgresql://...` (mesmo que DATABASE_URL) |

**Se DATABASE_URL não existir:**

- Opção A (Vercel): Storage → Create Database → Postgres
- Opção B (Supabase): Criar em https://supabase.com → Copiar DATABASE_URL

3. Clique em **Save** após adicionar cada variável

---

### PASSO 2: Fazer Redeploy

1. Deployments (menu superior)
2. Clique nos **⋯** do último deployment
3. Clique em **Redeploy**
4. Aguarde o build completar

---

### PASSO 3: Popular o Banco (Criar Usuários Demo)

O banco está vazio! Você precisa criar os usuários.

**Método Mais Simples:**

1. Copie a `DATABASE_URL` de produção do Vercel

2. Cole temporariamente no arquivo `.env` local:
   ```env
   DATABASE_URL="sua-database-url-de-producao"
   ```

3. Execute o script:
   ```bash
   npx tsx scripts/seed-production.ts
   ```

4. **IMPORTANTE**: Delete a DATABASE_URL do .env local após rodar!

5. Teste o login com:
   - Email: `demo@agroinsight.com`
   - Senha: `demo123`

---

## 🎯 Resultado Esperado

Após seguir todos os passos:

✅ Cadastro de novos usuários funciona  
✅ Login com credenciais demo funciona  
✅ Dashboard carrega normalmente  

---

## 🆘 Se ainda não funcionar

Verifique os logs de erro:

1. Vercel Dashboard → Seu Projeto
2. Deployments → Clique no deployment
3. **Runtime Logs** → Procure por erros

Me mostre a mensagem de erro exata que aparece!

---

## 📝 Credenciais de Teste

Após popular o banco:

- **Demo**: demo@agroinsight.com / demo123
- **Admin**: admin@agroinsight.com / admin123
- **Pesquisador**: researcher@agroinsight.com / user123
