# 📚 DOCUMENTAÇÃO TÉCNICA - AgroInsight

**Sistema de Análise de Dados Zootécnicos**  
Versão: 1.0.0  
Data: 30/10/2025  
Autor: Gabriel Pedro

---

## 📑 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Estrutura de Diretórios](#estrutura-de-diretórios)
5. [Funcionalidades](#funcionalidades)
6. [Banco de Dados](#banco-de-dados)
7. [APIs e Endpoints](#apis-e-endpoints)
8. [Autenticação e Segurança](#autenticação-e-segurança)
9. [Componentes Principais](#componentes-principais)
10. [Guia de Instalação](#guia-de-instalação)
11. [Guia de Desenvolvimento](#guia-de-desenvolvimento)
12. [Testes](#testes)
13. [Deploy](#deploy)
14. [Troubleshooting](#troubleshooting)

---

## 🎯 VISÃO GERAL

### Objetivo
Sistema web para análise estatística de dados zootécnicos com geração de diagnósticos por IA, visualizações interativas, calculadoras específicas e gestão de referências científicas.

### Público-Alvo
- Pesquisadores em Zootecnia
- Produtores rurais
- Estudantes de Ciências Agrárias
- Consultores técnicos

### Diferenciais
- Análise automática de dados com detecção de tipos
- Diagnóstico inteligente via IA (Gemini)
- 12 calculadoras zootécnicas especializadas
- Integração com SciELO e Crossref
- Interface moderna com dark/light mode

---

## 🏗️ ARQUITETURA DO SISTEMA

### Padrão Arquitetural
**Arquitetura em Camadas (Layered Architecture)**

```
┌─────────────────────────────────────┐
│        CAMADA DE APRESENTAÇÃO       │
│   (Next.js App Router + React)      │
├─────────────────────────────────────┤
│        CAMADA DE APLICAÇÃO          │
│    (API Routes + Server Actions)    │
├─────────────────────────────────────┤
│        CAMADA DE NEGÓCIO            │
│  (Análise de Dados + IA + Cálculos) │
├─────────────────────────────────────┤
│        CAMADA DE DADOS              │
│      (Prisma ORM + SQLite)          │
└─────────────────────────────────────┘
```

### Fluxo de Dados

```
Usuario → Frontend (React) → API Route → Business Logic → Database
                                  ↓
                            External APIs
                          (Gemini, Crossref, SciELO)
```

---

## 💻 TECNOLOGIAS UTILIZADAS

### Frontend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Next.js** | 14.x | Framework React com SSR e App Router |
| **React** | 18.x | Biblioteca de interface |
| **TypeScript** | 5.x | Tipagem estática |
| **TailwindCSS** | 3.x | Estilização utilitária |
| **next-themes** | Latest | Dark/Light mode |
| **Lucide React** | Latest | Ícones |
| **Recharts** | 2.x | Gráficos interativos |

### Backend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Next.js API Routes** | 14.x | Endpoints REST |
| **NextAuth.js** | 4.x | Autenticação |
| **Prisma ORM** | 5.x | ORM para banco de dados |
| **SQLite** | 3.x | Banco de dados |

### Integrações
| Serviço | Propósito |
|---------|-----------|
| **Google Gemini AI** | Diagnósticos e análises inteligentes |
| **Crossref API** | Busca de artigos científicos |
| **SciELO** | Web scraping de artigos brasileiros |

### Ferramentas de Desenvolvimento
- **ESLint** - Linting
- **Prettier** - Formatação
- **Git** - Controle de versão

---

## 📁 ESTRUTURA DE DIRETÓRIOS

```
TCC2/
├── app/                          # App Router do Next.js
│   ├── api/                      # API Routes
│   │   ├── analise/              # APIs de análise de dados
│   │   │   ├── delete/[id]/      # Deletar análise
│   │   │   ├── diagnostico/[id]/ # Gerar diagnóstico IA
│   │   │   ├── download/[id]/    # Download CSV/PDF
│   │   │   ├── resultados/       # Listar análises
│   │   │   └── upload/           # Upload de CSV
│   │   ├── auth/[...nextauth]/   # Autenticação NextAuth
│   │   ├── project/              # Gestão de projetos
│   │   └── referencias/          # APIs de referências
│   │       ├── add-by-url/       # Adicionar por DOI
│   │       ├── save/             # Salvar artigo
│   │       ├── saved/            # Listar salvos
│   │       ├── search/           # Buscar artigos
│   │       └── unsave/           # Remover artigo
│   ├── auth/                     # Páginas de autenticação
│   │   ├── signin/               # Login
│   │   └── signup/               # Cadastro
│   ├── dashboard/                # Páginas do dashboard
│   │   ├── analise/              # Upload e análise
│   │   ├── calculadora/          # Calculadoras
│   │   ├── referencias/          # Referências científicas
│   │   ├── resultados/           # Resultados das análises
│   │   └── page.tsx              # Home do dashboard
│   ├── globals.css               # Estilos globais
│   ├── layout.tsx                # Layout raiz
│   └── page.tsx                  # Landing page
├── components/                   # Componentes React
│   ├── AdvancedCharts.tsx        # Gráficos avançados
│   ├── skeleton.tsx              # Loading skeletons
│   ├── tabs.tsx                  # Sistema de abas
│   ├── theme-provider.tsx        # Provider do tema
│   └── theme-toggle.tsx          # Toggle dark/light
├── lib/                          # Bibliotecas e utilitários
│   ├── auth.ts                   # Configuração NextAuth
│   ├── dataAnalysis.ts           # Análise estatística
│   ├── generate-test-data.ts     # Gerador de dados teste
│   └── prisma.ts                 # Cliente Prisma
├── prisma/                       # Configuração Prisma
│   ├── schema.prisma             # Schema do banco
│   └── dev.db                    # Banco SQLite
├── public/                       # Arquivos públicos
├── .env.local                    # Variáveis de ambiente
├── next.config.js                # Configuração Next.js
├── package.json                  # Dependências
├── tailwind.config.ts            # Configuração Tailwind
└── tsconfig.json                 # Configuração TypeScript
```

---

## ⚙️ FUNCIONALIDADES

### 1. Autenticação e Autorização
- ✅ Login/Logout com NextAuth.js
- ✅ Cadastro de usuários
- ✅ Sessões persistentes
- ✅ Proteção de rotas
- ✅ Isolamento de dados por usuário

### 2. Análise de Dados
- ✅ Upload de arquivos CSV (até 50MB)
- ✅ Detecção automática de tipos de variáveis
- ✅ Cálculo de estatísticas descritivas
- ✅ Identificação de outliers
- ✅ Análise de correlações
- ✅ Reconhecimento de termos zootécnicos

**Tipos de Variáveis Detectados:**
- Quantitativa Contínua
- Quantitativa Discreta
- Qualitativa Nominal
- Qualitativa Ordinal
- Temporal
- Identificador

### 3. Visualizações
- ✅ Box Plot (quartis e outliers)
- ✅ Histograma (distribuição)
- ✅ Gráfico de Pizza (proporções)
- ✅ Scatter Plot (correlações)
- ✅ Tabelas estatísticas
- ✅ Todos com dark mode

### 4. Diagnóstico com IA
- ✅ Análise completa por Gemini AI
- ✅ Comparação com literatura
- ✅ Recomendações prioritárias
- ✅ Identificação de pontos fortes/fracos
- ✅ Export para PDF via impressão

### 5. Calculadoras Zootécnicas (12 total)

**Conversões:**
- Arroba ↔ Quilograma

**Reprodução:**
- Taxa de Nascimento
- Taxa de Desmame
- Intervalo de Partos

**Performance:**
- Ganho de Peso Diário (GPD)
- Conversão Alimentar (CA)
- Rendimento de Carcaça

**Manejo:**
- Lotação Animal (UA/ha)
- Consumo de Matéria Seca
- Peso Ajustado 205 dias

**Econômico:**
- Custo por Arroba
- Análise de Custos (COE, COT, CTP)
- Margem e Lucratividade
- Ponto de Equilíbrio
- ROI e Payback

### 6. Referências Científicas
- ✅ Busca em SciELO (web scraping)
- ✅ Busca em Crossref (140M+ artigos)
- ✅ Adicionar por URL/DOI
- ✅ Biblioteca pessoal
- ✅ Salvar/remover artigos
- ✅ Paginação infinita

### 7. Gestão de Análises
- ✅ Histórico de análises
- ✅ Deletar análises anteriores
- ✅ Download CSV/PDF
- ✅ Comparação entre análises

---

## 🗄️ BANCO DE DADOS

### Schema Prisma

```prisma
// Usuários
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  password      String
  emailVerified DateTime?
  image         String?
  role          String    @default("user")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  projects          Project[]
  savedReferences   SavedReference[]
}

// Projetos (isolamento de dados)
model Project {
  id          String    @id @default(cuid())
  name        String
  description String?
  ownerId     String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  owner       User      @relation(fields: [ownerId], references: [id])
  datasets    Dataset[]
}

// Datasets (análises)
model Dataset {
  id              String    @id @default(cuid())
  name            String
  projectId       String
  metadata        String    // JSON
  data            String    // JSON (dados do CSV)
  analysisResults String?   // JSON (estatísticas)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  project         Project   @relation(fields: [projectId], references: [id])
}

// Referências salvas
model SavedReference {
  id        String   @id @default(cuid())
  userId    String
  title     String
  url       String
  content   String   // JSON
  tags      String?
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
}
```

### Relacionamentos
```
User 1---* Project 1---* Dataset
User 1---* SavedReference
```

---

## 🔌 APIs E ENDPOINTS

### Autenticação
```
POST   /api/auth/signin      # Login
POST   /api/auth/signup      # Cadastro
GET    /api/auth/signout     # Logout
GET    /api/auth/session     # Sessão atual
```

### Análise de Dados
```
POST   /api/analise/upload                      # Upload CSV
GET    /api/analise/resultados                  # Listar análises
GET    /api/analise/download/[analysisId]       # Download CSV
GET    /api/analise/diagnostico/[analysisId]    # Gerar diagnóstico IA
DELETE /api/analise/delete/[analysisId]         # Deletar análise
```

### Referências Científicas
```
POST   /api/referencias/search       # Buscar artigos
POST   /api/referencias/save         # Salvar artigo
GET    /api/referencias/saved        # Listar salvos
DELETE /api/referencias/unsave       # Remover artigo
POST   /api/referencias/add-by-url   # Adicionar por DOI
```

### Projetos
```
GET    /api/project/[projectId]/upload-presets   # Configurações
PUT    /api/project/[projectId]/upload-presets   # Atualizar config
```

---

## 🔐 AUTENTICAÇÃO E SEGURANÇA

### NextAuth.js
```typescript
// Configuração em lib/auth.ts
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validação de credenciais
        // Hash de senha com bcrypt
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 dias
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error'
  }
}
```

### Proteção de Rotas
```typescript
// Middleware de autenticação
const session = await getServerSession(authOptions)
if (!session?.user) {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
}
```

### Isolamento de Dados
```typescript
// Todos os dados filtrados por userId ou project.ownerId
const analysis = await prisma.dataset.findFirst({
  where: {
    id: analysisId,
    project: {
      ownerId: session.user.id  // Garante isolamento
    }
  }
})
```

### Segurança de Senhas
- Hash com **bcrypt**
- Salt rounds: 10
- Nunca armazenadas em plain text

---

## 🧩 COMPONENTES PRINCIPAIS

### 1. Tabs Component
```typescript
// components/tabs.tsx
interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
}

<Tabs
  defaultTab="conversoes"
  tabs={[
    { id: 'tab1', label: 'Label', icon: <Icon />, content: <Content /> }
  ]}
/>
```

### 2. AdvancedCharts
```typescript
// components/AdvancedCharts.tsx
<BoxPlotChart data={numericStats} />
<HistogramChart data={distribution} />
<PieChart data={categories} />
<ScatterPlot xData={[]} yData={[]} />
```

### 3. Theme System
```typescript
// Dark/Light mode automático
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'

// Tokens semânticos CSS
--background, --foreground, --card, --primary, --muted
```

---

## 🚀 GUIA DE INSTALAÇÃO

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Git

### Passo a Passo

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/agroinsight.git
cd agroinsight

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
```

### Variáveis de Ambiente (.env.local)
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# Google Gemini AI
GEMINI_API_KEY="sua-chave-gemini-aqui"
```

```bash
# 4. Configurar banco de dados
npx prisma generate
npx prisma db push

# 5. Popular banco (opcional)
npx prisma db seed

# 6. Iniciar servidor de desenvolvimento
npm run dev
```

### Acessar
```
http://localhost:3000
```

### Contas Demo (após seed)
```
Admin:
Email: admin@agroinsight.com
Senha: admin123

Usuário:
Email: researcher@agroinsight.com
Senha: user123
```

---

## 🛠️ GUIA DE DESENVOLVIMENTO

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run build            # Build de produção
npm run start            # Servidor de produção
npm run lint             # Linting

# Prisma
npx prisma studio        # Interface visual do DB
npx prisma generate      # Gerar cliente
npx prisma db push       # Sincronizar schema
npx prisma migrate dev   # Criar migração
npx prisma db seed       # Popular dados
```

### Estrutura de uma Nova Funcionalidade

#### 1. Criar API Route
```typescript
// app/api/nova-feature/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()
    
    // Lógica aqui
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}
```

#### 2. Criar Página
```typescript
// app/dashboard/nova-feature/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function NovaFeaturePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState(null)

  useEffect(() => {
    if (session) {
      // Carregar dados
    }
  }, [session])

  if (status === 'loading') {
    return <div>Carregando...</div>
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Conteúdo */}
    </div>
  )
}
```

### Padrões de Código

#### TypeScript
```typescript
// Sempre tipar interfaces
interface Article {
  id: string
  title: string
  authors: string[]
  year: number
}

// Usar tipos do Prisma
import type { User, Project } from '@prisma/client'
```

#### Tailwind CSS
```typescript
// Usar tokens semânticos
className="bg-background text-foreground"  // ✅
className="bg-white text-black"            // ❌

// Dark mode automático
className="bg-card dark:bg-card"           // Redundante
className="bg-card"                        // ✅ Já suporta dark
```

#### Nomenclatura
```typescript
// Componentes: PascalCase
function MyComponent() {}

// Funções: camelCase
function handleClick() {}

// Constantes: UPPER_SNAKE_CASE
const API_URL = 'https://...'

// Arquivos: kebab-case ou camelCase
data-analysis.ts
dataAnalysis.ts
```

---

## 🧪 TESTES

### Testes Manuais Recomendados

#### Autenticação
- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas
- [ ] Cadastro de novo usuário
- [ ] Logout
- [ ] Persistência de sessão

#### Análise de Dados
- [ ] Upload CSV pequeno (< 1MB)
- [ ] Upload CSV grande (10-50MB)
- [ ] Upload arquivo inválido
- [ ] Análise com dados numéricos
- [ ] Análise com dados categóricos
- [ ] Análise mista
- [ ] Detecção de outliers
- [ ] Gráficos renderizando

#### Calculadoras
- [ ] Todas as 12 calculadoras
- [ ] Validação de inputs
- [ ] Cálculos corretos
- [ ] Dark mode

#### Referências
- [ ] Busca SciELO
- [ ] Busca Crossref
- [ ] Paginação "Ver mais"
- [ ] Salvar artigo
- [ ] Remover artigo (com confirmação)
- [ ] Adicionar por DOI

---

## 🌐 DEPLOY

### Opções de Deploy

#### 1. Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Produção
vercel --prod
```

**Configurações Vercel:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Environment Variables: Adicionar no dashboard

#### 2. Railway
```bash
# Via Railway CLI
railway login
railway init
railway up
```

#### 3. Docker
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build e Run
docker build -t agroinsight .
docker run -p 3000:3000 agroinsight
```

### Variáveis de Ambiente (Produção)
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://seu-dominio.com"
NEXTAUTH_SECRET="chave-forte-producao"
GEMINI_API_KEY="..."
NODE_ENV="production"
```

---

## 🔧 TROUBLESHOOTING

### Problema: Erro ao instalar dependências
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problema: Prisma não gera cliente
```bash
npx prisma generate --force
npx prisma db push --force-reset
```

### Problema: Sessão não persiste
- Verificar `NEXTAUTH_SECRET` no .env
- Limpar cookies do browser
- Verificar se `NEXTAUTH_URL` está correto

### Problema: Upload de CSV falha
- Verificar tamanho do arquivo (max 50MB)
- Verificar encoding (deve ser UTF-8)
- Verificar formato (CSV válido)
- Verificar logs do servidor

### Problema: Gemini API retorna erro
- Verificar `GEMINI_API_KEY`
- Verificar quota da API
- Verificar se modelo está disponível
- Ver logs detalhados no console

### Problema: Dark mode não funciona
- Verificar `ThemeProvider` no layout
- Verificar `suppressHydrationWarning` no HTML
- Limpar localStorage
- Usar tokens semânticos CSS

---

## 📊 MÉTRICAS E PERFORMANCE

### Limites do Sistema
- **Upload CSV:** Até 50MB
- **Linhas CSV:** Até 100.000 linhas
- **Colunas CSV:** Até 100 colunas
- **Sessão:** 30 dias
- **Timeout API:** 15 segundos (Crossref), 10s (SciELO)

### Performance
- **First Load:** < 3s
- **Time to Interactive:** < 5s
- **Lighthouse Score:** 90+

---

## 📝 CHANGELOG

### v1.0.0 (30/10/2025)
- ✅ Sistema de autenticação completo
- ✅ Análise de dados com detecção automática
- ✅ 12 calculadoras zootécnicas
- ✅ Diagnóstico com IA
- ✅ Referências científicas (SciELO + Crossref)
- ✅ Dark/Light mode
- ✅ Dashboard completo
- ✅ Isolamento de dados por usuário

---

## 👥 CONTRIBUINDO

### Como Contribuir
1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

### Padrões de Commit
```
feat: Nova funcionalidade
fix: Correção de bug
docs: Documentação
style: Formatação
refactor: Refatoração
test: Testes
chore: Manutenção
```

---

## 📞 SUPORTE

### Documentação Adicional
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

### Contato
- Email: pedrogabriieell@gmail.com
- GitHub: [Seu GitHub]

---

## 📄 LICENÇA

Este projeto está sob a licença MIT.

---

**Desenvolvido com ❤️ para a Zootecnia Brasileira**

_Última atualização: 30/10/2025_
