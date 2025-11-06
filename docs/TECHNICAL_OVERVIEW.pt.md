# AgroInsight - Visão Geral Técnica (Português)

## Índice

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Arquitetura](#arquitetura)
3. [Stack Tecnológica](#stack-tecnológica)
4. [Estrutura de Diretórios](#estrutura-de-diretórios)
5. [Sistemas Principais](#sistemas-principais)
6. [Esquema do Banco de Dados](#esquema-do-banco-de-dados)
7. [Endpoints da API](#endpoints-da-api)
8. [Fluxo de Dados](#fluxo-de-dados)
9. [Configuração de Ambiente](#configuração-de-ambiente)
10. [Configuração de Desenvolvimento](#configuração-de-desenvolvimento)
11. [Testes e Linting](#testes-e-linting)
12. [Implantação](#implantação)
13. [Funcionalidades Principais](#funcionalidades-principais)

---

## Visão Geral do Sistema

**AgroInsight** é uma aplicação web full-stack para gerenciamento e análise de dados zootécnicos (pecuária). A plataforma atende pesquisadores, produtores rurais, veterinários e profissionais de produção animal que precisam analisar dados agrícolas em relação a padrões científicos estabelecidos.

### Propósito Principal

O sistema permite aos usuários:
- Fazer upload e analisar dados de produção animal (arquivos CSV/Excel)
- Comparar medições com valores de referência científicos do NRC (National Research Council) e EMBRAPA (Empresa Brasileira de Pesquisa Agropecuária)
- Gerar relatórios estatísticos técnicos e interpretações simplificadas "leiga" com representações visuais
- Realizar análises específicas por espécie para múltiplos tipos de animais (bovinos, suínos, aves, ovinos, caprinos, peixes) e forragem
- Calcular indicadores de desempenho zootécnico (IEP, GPD, CA, PLC, ECC)
- Buscar e salvar referências científicas de bases de dados acadêmicas

### Diferencial Principal

O **sistema de análise multi-espécie** é a funcionalidade central, fornecendo validação consciente do contexto ao comparar dados carregados com faixas de referência específicas de espécie e subtipo. Por exemplo, dados de gado leiteiro são validados contra padrões diferentes do gado de corte, e métricas de frango de corte diferem das de poedeiras.

---

## Arquitetura

AgroInsight segue uma arquitetura full-stack moderna:

### Frontend
- **Framework**: Next.js 14 com App Router
- **Componentes UI**: React com TypeScript
- **Estilização**: TailwindCSS com componentes Radix UI
- **Gerenciamento de Estado**: React hooks e context
- **Tema**: Suporte a modo escuro/claro via next-themes

### Backend
- **API**: Next.js API Routes (funções serverless)
- **ORM**: Prisma para acesso ao banco de dados
- **Autenticação**: NextAuth.js com provedor de credenciais
- **Cache**: Upstash Redis para otimização de desempenho

### Banco de Dados
- **Desenvolvimento**: SQLite
- **Produção**: PostgreSQL
- **Gerenciamento de Schema**: Migrações Prisma

### Serviços Externos
- **Integração IA**: Google Generative AI, OpenAI (para geração de diagnósticos)
- **Busca Acadêmica**: SerpAPI (Google Scholar), PubMed, Crossref
- **Processamento de Dados**: PapaParse (CSV), xml2js (XML), jsPDF (relatórios)

---

## Stack Tecnológica

### Dependências Principais

```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "prisma": "^6.18.0",
  "@prisma/client": "^6.18.0",
  "next-auth": "^4.24.13",
  "@upstash/redis": "^1.35.6",
  "@upstash/ratelimit": "^2.0.3",
  "typescript": "^5.2.2"
}
```

### Bibliotecas Principais

- **Análise de Dados**: PapaParse para parsing CSV, análise estatística customizada
- **IA/ML**: Google Generative AI, OpenAI
- **Geração de PDF**: jsPDF com autotable
- **Gráficos**: Recharts para visualização de dados
- **Formulários**: React Hook Form com validação Zod
- **UI**: Primitivos Radix UI, ícones Lucide

---

## Estrutura de Diretórios

```
agroinsight/
├── app/                          # Next.js 14 App Router
│   ├── auth/                     # Páginas de autenticação
│   │   ├── signin/               # Página de login
│   │   ├── signup/               # Página de registro
│   │   ├── forgot-password/      # Recuperação de senha
│   │   └── reset-password/       # Redefinição de senha
│   ├── dashboard/                # Dashboards protegidos do usuário
│   │   ├── analise/             # Página de upload de dados
│   │   ├── resultados/          # Visualizador de resultados de análise
│   │   └── referencias/         # Biblioteca de referências científicas
│   └── api/                      # Rotas da API
│       ├── auth/                 # Endpoints de autenticação
│       ├── analise/              # Endpoints de análise padrão
│       ├── analysis/             # Endpoints de análise multi-espécie
│       ├── reference/            # Endpoints de dados de referência
│       ├── layman/               # Endpoints de interpretação leiga
│       └── referencias/          # Endpoints de busca acadêmica
│
├── components/                   # Componentes React
│   ├── analysis/                 # Componentes relacionados à análise
│   │   ├── MultiSpeciesTabs.tsx # Interface de seleção de espécies
│   │   └── SpeciesUploadForm.tsx# Formulário de upload consciente de espécie
│   ├── layman/                   # Componentes de visualização leiga
│   │   ├── LaymanTab.tsx        # Container principal da visualização leiga
│   │   ├── MetricCard.tsx       # Exibição de métrica individual
│   │   ├── AnimalSilhouette.tsx # Representações visuais de animais
│   │   ├── ForagePanel.tsx      # Visualização de forragem/pastagem
│   │   └── ColorLegend.tsx      # Legenda de cores de status
│   └── providers/                # Provedores de contexto React
│       └── theme-provider.tsx   # Gerenciamento de tema
│
├── services/                     # Camada de lógica de negócio
│   ├── analysis.service.ts      # Operações de análise de conjuntos de dados
│   ├── layman.service.ts        # Cliente API de interpretação leiga
│   └── references/              # Serviços de referência acadêmica
│       └── providers/           # Implementações de provedores de busca
│           └── scholar.provider.ts
│
├── lib/                          # Bibliotecas utilitárias e helpers
│   ├── auth.ts                  # Configuração NextAuth.js
│   ├── prisma.ts                # Singleton do cliente Prisma
│   ├── diagnostico-local.ts     # Gerador de diagnóstico baseado em regras
│   ├── dataAnalysis.ts          # Funções de análise estatística
│   ├── generate-test-data.ts    # Gerador de dados de teste
│   ├── references/              # Gerenciamento de dados de referência
│   │   ├── nrc-data.ts          # Valores de referência NRC
│   │   ├── embrapa-data.ts      # Valores de referência EMBRAPA
│   │   └── species-references.ts# ReferenceDataService
│   └── layman/                  # Utilitários do sistema leigo
│       ├── types.ts             # Definições de tipos
│       └── colors.ts            # Utilitários de codificação por cores
│
├── prisma/                       # Schema e migrações do banco de dados
│   ├── schema.prisma            # Modelo de dados Prisma
│   ├── migrations/              # Arquivos de migração do banco de dados
│   ├── seed.ts                  # Seeding padrão do banco de dados
│   └── seed-multi-species.ts    # Seeding de referências multi-espécie
│
├── types/                        # Definições de tipos TypeScript
│   └── api.ts                   # Tipos de resposta/requisição da API
│
├── public/                       # Assets estáticos
├── package.json                  # Dependências e scripts
├── vercel.json                  # Configuração de deploy Vercel
└── README.md                    # Documentação do projeto
```

---

## Sistemas Principais

### 1. Sistema de Análise Multi-Espécie

**Propósito**: Validação e análise de dados consciente de espécie

**Componentes Principais**:
- `components/analysis/MultiSpeciesTabs.tsx` - UI de seleção de espécies
- `components/analysis/SpeciesUploadForm.tsx` - Manipulador de upload
- `app/api/analysis/multi-species/route.ts` - Endpoint de análise
- `lib/references/species-references.ts` - Classe `ReferenceDataService`
- `prisma/seed-multi-species.ts` - Seeding de dados de referência

**Espécies Suportadas**:
- **Bovinos**: leite, corte, dupla aptidão
- **Suínos**: creche, crescimento, terminação, reprodução
- **Aves**: corte, poedeiras, matrizes
- **Ovinos**: corte, lã, leite
- **Caprinos**: corte, leite, pele
- **Piscicultura**: tilápia, tambaqui, pintado, pacu
- **Forragem**: brachiaria, panicum, cynodon, misto

**Fluxo de Trabalho**:
1. Usuário seleciona espécie e subtipo
2. Sistema carrega dados de referência específicos da espécie do NRC/EMBRAPA
3. Usuário faz upload de dados CSV
4. Sistema valida dados contra faixas de referência
5. Sistema gera análise estatística e diagnósticos
6. Resultados exibidos com indicadores de status codificados por cores

### 2. Autenticação e Gerenciamento de Usuários

**Propósito**: Acesso seguro de usuários e gerenciamento de sessão

**Componentes Principais**:
- `app/auth/signin/page.tsx` - Interface de login
- `app/auth/signup/page.tsx` - Interface de registro
- `app/api/auth/signup/route.ts` - Endpoint de criação de usuário
- `lib/auth.ts` - Configuração NextAuth.js

**Funcionalidades**:
- Autenticação baseada em credenciais (email/senha)
- Hash de senha com bcrypt
- Funcionalidade de redefinição de senha
- Acesso baseado em função (Usuário/Admin)
- Gerenciamento de sessão com JWT

### 3. Sistema de Interpretação Leiga

**Propósito**: Representação simplificada e visual dos resultados de análise

**Componentes Principais**:
- `components/layman/LaymanTab.tsx` - Container principal
- `components/layman/LaymanToggle.tsx` - Alternador de modo de visualização
- `services/layman.service.ts` - Cliente API
- `app/api/layman/evaluate/route.ts` - Endpoint de avaliação de métricas

**Funcionalidades**:
- Status codificado por cores (verde/amarelo/vermelho)
- Silhuetas de animais representando status de saúde
- Analogias práticas para métricas técnicas
- Personalização de limites por fazenda
- Alternância entre visualizações leiga e técnica

### 4. Pipeline de Análise de Dados

**Propósito**: Processar dados carregados e gerar insights

**Componentes Principais**:
- `app/dashboard/analise/page.tsx` - Interface de upload
- `app/api/analise/upload/route.ts` - Endpoint de upload padrão
- `services/analysis.service.ts` - Classe `AnalysisService`
- `lib/dataAnalysis.ts` - Cálculos estatísticos
- `lib/diagnostico-local.ts` - Diagnósticos baseados em regras

**Fluxo de Trabalho**:
1. **Upload**: Usuário faz upload de arquivo CSV
2. **Parse**: PapaParse converte CSV para JSON
3. **Validação**: Verificações de segurança e validação de dados
4. **Análise**: Análise estatística (média, mediana, desvio padrão, CV, outliers)
5. **Comparação**: Métricas comparadas com faixas de referência
6. **Geração**: Diagnósticos e recomendações criados
7. **Armazenamento**: Resultados salvos no banco de dados
8. **Exibição**: Resultados mostrados com gráficos e tabelas

### 5. Visualização de Resultados

**Propósito**: Exibir resultados de análise com gráficos e relatórios

**Componentes Principais**:
- `app/dashboard/resultados/page.tsx` - Dashboard de resultados
- `components/AdvancedCharts.tsx` - Componentes de gráficos
- `app/api/analise/diagnostico/[id]/route.ts` - Gerador de diagnóstico IA

**Funcionalidades**:
- Alternância de visualização técnica/leiga
- Tabelas estatísticas com estatísticas descritivas
- Análise de correlação e mapas de calor
- Funcionalidade de exportação PDF/CSV
- Relatórios de diagnóstico gerados por IA

### 6. Referências Científicas

**Propósito**: Buscar e gerenciar literatura acadêmica

**Componentes Principais**:
- `app/dashboard/referencias/page.tsx` - UI da biblioteca de referências
- `app/api/referencias/search/route.ts` - Busca multi-fonte
- `services/references/providers/scholar.provider.ts` - Integração Google Scholar

**Integrações**:
- Google Scholar (via SerpAPI)
- PubMed
- Crossref

---

## Esquema do Banco de Dados

### Domínio de Usuário

**User**
- Armazena contas de usuário com credenciais de autenticação
- Campos: id, email, name, password (hash), role, resetToken, resetTokenExpiry
- Relações: projects, auditLogs, savedReferences

**Project**
- Unidade organizacional para agrupar conjuntos de dados
- Campos: id, name, description, ownerId
- Relações: owner (User), datasets, validationSettings, uploadPresets

**Dataset**
- Arquivos de dados carregados com resultados de análise
- Campos: id, projectId, name, filename, status, data (JSON), metadata (JSON)
- Campos temporais: measurementDate, startDate, endDate
- Campos contextuais: farmLocation, environmentData, productionSystem
- Campos de qualidade: dataQualityScore, hasTemporalData, hasEnvironmental

### Domínio Multi-Espécie

**AnimalSpecies**
- Categorias de espécies de nível superior
- Campos: id, code, name, hasSubtypes
- Códigos: bovine, swine, poultry, sheep, goat, aquaculture, forage

**AnimalSubtype**
- Subcategorias de espécies para análise específica
- Campos: id, speciesId, code, name, description
- Exemplos: dairy/beef para bovinos, broiler/layer para aves

**ReferenceData**
- Valores de referência científicos por espécie/subtipo/métrica
- Campos: id, speciesId, subtypeId, metric, minValue, idealMinValue, idealMaxValue, maxValue, unit, source
- Fontes: NRC 2016, EMBRAPA 2023

**ForageReference**
- Dados específicos de forragem com variações sazonais
- Campos: id, forageType, variety, metric, minValue, idealValue, maxValue, unit, season, source
- Estações: aguas (chuvosa), seca, transicao

### Domínio de Referências

**SavedReference**
- Artigos científicos salvos pelo usuário
- Campos: id, userId, title, authors, year, abstract, journal, doi, url, keywords, source

---

## Endpoints da API

### Autenticação

- `POST /api/auth/signup` - Registro de usuário
- `POST /api/auth/signin` - Login de usuário (NextAuth)
- `POST /api/auth/forgot-password` - Solicitar redefinição de senha
- `POST /api/auth/reset-password` - Redefinir senha com token

### Análise

- `POST /api/analise/upload` - Upload e análise de dados CSV
- `GET /api/analise/resultados` - Obter análises do usuário
- `GET /api/analise/diagnostico/[id]` - Gerar diagnóstico IA
- `DELETE /api/analise/delete/[id]` - Excluir análise
- `GET /api/analise/download/[id]` - Baixar resultados de análise

### Análise Multi-Espécie

- `POST /api/analysis/multi-species` - Análise consciente de espécie
- `GET /api/reference/[species]/data` - Obter dados de referência para espécie
- `GET /api/analysis/correlations` - Analisar correlações

### Interpretação Leiga

- `POST /api/layman/evaluate` - Avaliar métricas para visualização leiga
- `GET /api/layman/annotations/[entityId]` - Obter anotações

### Referências Científicas

- `POST /api/referencias/search` - Buscar bases de dados acadêmicas
- `GET /api/referencias/saved` - Obter referências salvas do usuário
- `POST /api/referencias/save` - Salvar uma referência
- `DELETE /api/referencias/unsave` - Remover referência salva
- `POST /api/referencias/add-by-url` - Adicionar referência por URL

---

## Fluxo de Dados

### Fluxo de Upload e Análise

```
1. Usuário faz upload de arquivo CSV
   ↓
2. Frontend valida arquivo (tamanho, tipo)
   ↓
3. POST /api/analysis/multi-species
   ↓
4. Validação de segurança do backend
   ↓
5. Parse CSV com PapaParse
   ↓
6. Análise estatística (lib/dataAnalysis.ts)
   ↓
7. Comparar com referências (lib/references/species-references.ts)
   ↓
8. Gerar interpretação
   ↓
9. Analisar correlações
   ↓
10. Salvar no banco de dados (Prisma)
    ↓
11. Retornar resultados para frontend
    ↓
12. Exibir no dashboard de resultados
```

### Fluxo de Dados de Referência

```
1. Usuário seleciona espécie/subtipo
   ↓
2. GET /api/reference/[species]/data?subtype=X
   ↓
3. ReferenceDataService.getReference()
   ↓
4. Combinar dados NRC e EMBRAPA (priorizar EMBRAPA)
   ↓
5. Retornar métricas de referência
   ↓
6. Exibir na UI com métricas disponíveis
```

---

## Configuração de Ambiente

### Variáveis de Ambiente Necessárias

```bash
# Banco de Dados
DB_PROVIDER="sqlite"  # ou "postgresql"
DATABASE_URL="file:./dev.db"  # ou string de conexão PostgreSQL
DIRECT_URL="postgresql://..."  # Para migrações (somente PostgreSQL)

# Autenticação
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-segredo-aqui"

# Upstash Redis (Cache)
UPSTASH_REDIS_REST_URL="https://seu-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="seu-token"

# Serviços de IA (Opcional)
GOOGLE_GEMINI_API_KEY="sua-chave-gemini"
OPENAI_API_KEY="sua-chave-openai"

# Busca Acadêmica (Opcional)
SERPAPI_API_KEY="sua-chave-serpapi"

# Devin AI (Opcional)
DEVIN_API_KEY="sua-chave-devin"
```

### Arquivos de Configuração

- `.env.local` - Variáveis de ambiente de desenvolvimento local
- `.env.example` - Template para variáveis de ambiente
- `vercel.json` - Configuração de deploy Vercel
- `next.config.js` - Configuração Next.js

---

## Configuração de Desenvolvimento

### Pré-requisitos

- Node.js 18+ e npm
- Git

### Passos de Instalação

```bash
# 1. Clonar repositório
git clone https://github.com/SilvaGabriel011/tcc2.git
cd tcc2

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com sua configuração

# 4. Gerar cliente Prisma
npm run db:generate

# 5. Executar migrações do banco de dados
npm run db:migrate

# 6. Popular banco de dados com dados de referência
npm run db:seed
npx tsx prisma/seed-multi-species.ts

# 7. Iniciar servidor de desenvolvimento
npm run dev

# 8. Abrir navegador
# Navegar para http://localhost:3000
```

### Scripts de Desenvolvimento

```bash
npm run dev          # Iniciar servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Iniciar servidor de produção
npm run lint         # Executar ESLint
npm run test         # Executar testes Jest
npm run test:watch   # Executar testes em modo watch
npm run test:coverage # Executar testes com cobertura
```

---

## Testes e Linting

### Linting

```bash
# Executar ESLint
npm run lint

# Corrigir problemas auto-corrigíveis
npm run lint -- --fix
```

### Testes

```bash
# Executar todos os testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

### Estrutura de Testes

- `__tests__/lib/` - Testes unitários para funções de biblioteca
- `__tests__/services/` - Testes da camada de serviço
- `__tests__/api/` - Testes de endpoints da API

---

## Implantação

### Implantação Vercel (Recomendado)

1. Fazer push do código para GitHub
2. Conectar repositório ao Vercel
3. Configurar variáveis de ambiente no dashboard Vercel
4. Deploy automático ao fazer push para branch main

### Comando de Build

```bash
npm run build
# ou
vercel-build  # Inclui prisma generate e migrate
```

### Configuração de Ambiente

- Definir todas as variáveis de ambiente necessárias no dashboard Vercel
- Usar banco de dados PostgreSQL (não SQLite) para produção
- Configurar DIRECT_URL para migrações
- Configurar Upstash Redis para cache

---

## Funcionalidades Principais

### 1. Análise Multi-Espécie

- Validação específica por espécie contra padrões NRC/EMBRAPA
- Faixas de referência específicas por subtipo
- Detecção e classificação automática de métricas
- Indicadores de status codificados por cores

### 2. Análise Estatística

- Estatísticas descritivas (média, mediana, desvio padrão, CV)
- Quartis e detecção de outliers
- Análise de correlação com pontuação de relevância biológica
- Detecção de tipo de variável (quantitativa, qualitativa, temporal)

### 3. Interpretação Leiga

- Linguagem simplificada para usuários não técnicos
- Visualizações codificadas por cores (vermelho/amarelo/verde)
- Silhuetas de animais representando status de saúde
- Analogias práticas e recomendações

### 4. Cálculos Zootécnicos

- **IEP** (Índice de Eficiência Produtiva) - Índice de desempenho avícola
- **GPD** (Ganho de Peso Diário) - Ganho de peso diário
- **CA** (Conversão Alimentar) - Eficiência alimentar
- **PLC** (Produção de Leite Corrigida) - Produção de leite padronizada
- **ECC** (Escore de Condição Corporal) - Avaliação de gordura corporal

### 5. Referências Científicas

- Busca acadêmica multi-fonte (Google Scholar, PubMed, Crossref)
- Gerenciamento e organização de referências
- Validação de artigos baseada em DOI
- Rastreamento de citações

### 6. Recursos de Segurança

- Validação de upload de arquivo (tamanho, tipo, conteúdo)
- Limitação de taxa por endpoint
- Prevenção de injeção SQL (Prisma ORM)
- Proteção XSS
- Proteção CSRF (NextAuth)
- Hash de senha (bcrypt)

### 7. Otimização de Desempenho

- Cache Redis com TTLs graduados
- Otimização de consultas de banco de dados com índices
- Lazy loading e code splitting
- Otimização de imagens
- Cache de resposta da API

---

## Estratégia de Cache

### TTLs de Cache

- **Diagnósticos**: 24 horas
- **Buscas**: 1 hora
- **Resultados**: 5 minutos
- **Artigos salvos**: 10 minutos

### Limitação de Taxa

- **Uploads**: 5 por hora por usuário
- **Diagnósticos**: 20 por hora por usuário
- **Buscas**: 100 por hora por usuário

---

## Contribuindo

### Estilo de Código

- Use TypeScript para segurança de tipos
- Siga a configuração ESLint
- Use Prettier para formatação de código
- Adicione comentários JSDoc para funções exportadas
- Escreva testes para novas funcionalidades

### Fluxo de Trabalho Git

1. Criar branch de feature a partir de main
2. Fazer alterações e commit
3. Executar lint e testes
4. Fazer push para remoto
5. Criar pull request
6. Aguardar verificações de CI
7. Fazer merge após aprovação

---

## Suporte

Para problemas, questões ou contribuições:
- GitHub Issues: https://github.com/SilvaGabriel011/tcc2/issues
- Documentação: Veja README.md e comentários inline no código

---

**Última Atualização**: Novembro 2025
**Versão**: 2.0
