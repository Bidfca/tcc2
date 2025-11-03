# ✅ Checklist de Deploy - AgroInsight

Use este checklist para acompanhar o progresso do deploy na Vercel.

## 📦 Preparação (Antes do Deploy)

- [ ] **Backup dos dados SQLite**
  ```bash
  npm run backup:sqlite
  ```
  - Arquivo salvo em: `backup/sqlite-backup-[timestamp].json`

- [ ] **Repositório GitHub criado**
  - URL: `https://github.com/[seu-usuario]/agroinsight`
  - Visibilidade: Private/Public

- [ ] **Código enviado para GitHub**
  ```bash
  git init
  git remote add origin https://github.com/[seu-usuario]/agroinsight.git
  git add .
  git commit -m "Preparação para deploy na Vercel"
  git push -u origin main
  ```

- [ ] **Verificar que `.env` está no `.gitignore`**
  - ⚠️ NUNCA commite credenciais!

## 🗄️ Banco de Dados PostgreSQL

Escolha UMA das opções:

### Opção A: Vercel Postgres ⭐ (Recomendado)

- [ ] Conta criada na Vercel
- [ ] Banco criado: `agroinsight-db`
- [ ] Região: São Paulo (gru1)
- [ ] URLs copiadas (serão configuradas automaticamente)

### Opção B: Supabase

- [ ] Conta criada no Supabase
- [ ] Projeto criado: `agroinsight`
- [ ] Região: South America (São Paulo)
- [ ] Senha do banco salva em local seguro
- [ ] Connection String copiada

## 🔧 Serviços Externos

### Obrigatórios

- [ ] **Upstash Redis** (Cache)
  - Conta: https://console.upstash.com
  - Database criado: `agroinsight-cache`
  - Região: São Paulo (sa-east-1)
  - `UPSTASH_REDIS_REST_URL` copiado
  - `UPSTASH_REDIS_REST_TOKEN` copiado

- [ ] **NEXTAUTH_SECRET** gerado
  ```bash
  openssl rand -base64 32
  ```
  - Secret gerado e salvo

### Opcionais (APIs)

- [ ] **Google Gemini** (Diagnósticos com IA)
  - Chave criada em: https://aistudio.google.com
  - `GOOGLE_GEMINI_API_KEY` copiada

- [ ] **OpenAI** (Alternativa ao Gemini)
  - Chave criada em: https://platform.openai.com
  - `OPENAI_API_KEY` copiada

- [ ] **SerpAPI** (Google Scholar nas Referências)
  - Conta criada em: https://serpapi.com
  - `SERPAPI_API_KEY` copiada

## 🚀 Deploy na Vercel

- [ ] **Importar repositório**
  - Acesso: https://vercel.com/new
  - Repositório selecionado: `agroinsight`

- [ ] **Configurações do projeto**
  - Framework: Next.js (auto-detectado)
  - Build Command: `npm run vercel-build`
  - Root Directory: `./`

- [ ] **Variáveis de ambiente configuradas**

### Essenciais
  - [ ] `DATABASE_URL`
  - [ ] `DIRECT_URL`
  - [ ] `NEXTAUTH_URL` (temporário: `https://seu-app.vercel.app`)
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `UPSTASH_REDIS_REST_URL`
  - [ ] `UPSTASH_REDIS_REST_TOKEN`

### Opcionais
  - [ ] `GOOGLE_GEMINI_API_KEY`
  - [ ] `OPENAI_API_KEY`
  - [ ] `SERPAPI_API_KEY`

- [ ] **Primeira tentativa de deploy**
  - Status: Success/Failed
  - URL: `https://[seu-app].vercel.app`

## 🔍 Verificação Pós-Deploy

- [ ] **Deploy bem-sucedido**
  - Logs verificados sem erros críticos
  - Migrations executadas com sucesso

- [ ] **Aplicação acessível**
  - URL funciona: `https://[seu-app].vercel.app`
  - Página inicial carrega

- [ ] **NEXTAUTH_URL atualizado**
  - Variável atualizada com URL real
  - Redeploy executado

- [ ] **Testes básicos funcionando**
  - [ ] Página de login carrega
  - [ ] Criar conta funciona
  - [ ] Login funciona
  - [ ] Dashboard acessível

## 📊 Migração de Dados (Se aplicável)

- [ ] **Conexão com banco configurada localmente**
  - `.env.production.local` criado com DATABASE_URL de produção

- [ ] **Dados restaurados**
  ```bash
  npm run restore:postgresql backup/sqlite-backup-[timestamp].json
  ```
  - Usuários migrados
  - Projetos migrados
  - Datasets migrados
  - Referências migradas

- [ ] **Validação dos dados**
  - Login com usuários existentes funciona
  - Projetos aparecem corretamente
  - Dados intactos

## 🎨 Personalização (Opcional)

- [ ] **Domínio customizado**
  - Domínio adquirido
  - DNS configurado
  - Domínio verificado na Vercel
  - `NEXTAUTH_URL` atualizado para domínio

- [ ] **Analytics configurado**
  - Vercel Analytics habilitado
  - Speed Insights habilitado

- [ ] **Monitoramento**
  - Alertas de erro configurados
  - Uptime monitoring ativo

## 📚 Documentação

- [ ] **README.md atualizado**
  - URL de produção adicionada
  - Instruções de deploy documentadas

- [ ] **Equipe informada**
  - URL compartilhada
  - Credenciais de teste criadas (se necessário)

## 🔒 Segurança

- [ ] **Variáveis de ambiente seguras**
  - Nenhum secret commitado no Git
  - Secrets diferentes de desenvolvimento e produção

- [ ] **Banco de dados protegido**
  - SSL habilitado
  - IPs permitidos configurados (se aplicável)

- [ ] **Autenticação funcionando**
  - NextAuth configurado corretamente
  - Sessões funcionando

## 🎯 Finalizando

- [ ] **Todas as funcionalidades testadas**
  - Upload de datasets
  - Validação de dados
  - Busca de referências
  - Diagnósticos (se API configurada)
  - Export de dados

- [ ] **Performance verificada**
  - Carregamento rápido (<3s)
  - Sem erros no console
  - Lighthouse score satisfatório

- [ ] **Backup configurado**
  - Backups automáticos do Postgres habilitados
  - Estratégia de backup documentada

---

## ✨ Deploy Concluído!

Parabéns! Sua aplicação AgroInsight está no ar! 🎉

**URL de Produção**: `https://[seu-app].vercel.app`

### Próximos passos sugeridos:

1. Monitorar logs nos primeiros dias
2. Configurar alertas de erro
3. Documentar processos de manutenção
4. Criar ambiente de staging para testes

---

**Data do Deploy**: ___/___/______
**Responsável**: _________________
**Notas**: _______________________
