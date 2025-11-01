# AgroInsight - Plataforma de Gestão de Dados Zootécnicos

**[English](README.md)** | **[Português (Brasil)](README.pt-BR.md)**

AgroInsight é uma plataforma abrangente de gestão e análise de dados zootécnicos desenvolvida para pesquisadores, produtores rurais e zootecnistas. Construída com tecnologias web modernas, oferece validação inteligente de dados, conversão automática de unidades e fluxos de trabalho colaborativos.

## Funcionalidades

### 🌱 Funcionalidades Principais
- **Análise de Dados**: Upload de arquivos CSV com análise estatística automática de dados zootécnicos
- **Calculadora Zootécnica**: Conversão de unidades e cálculo de índices (@ para kg, taxa de nascimento, etc.)
- **Resultados e Relatórios**: Visualização de dados com gráficos e exportação em PDF/Excel
- **Referências Científicas**: Pesquisa integrada com **Google Scholar** (via SerpAPI), PubMed e Crossref para busca de artigos acadêmicos com biblioteca pessoal

### 🔧 Recursos Técnicos
- **Validação Inteligente**: Identificação automática de colunas zootécnicas e validação de dados
- **Log de Auditoria**: Rastreamento completo de todas as modificações de dados
- **Controle de Acesso**: Papéis de Usuário e Administrador com permissões apropriadas
- **API RESTful**: API completa para integração com ferramentas externas

## Arquitetura

A aplicação segue uma arquitetura full-stack moderna:

- **Frontend**: Next.js 14 com React, TypeScript e TailwindCSS
- **Backend**: Rotas de API Next.js com Prisma ORM
- **Banco de Dados**: SQLite (desenvolvimento) / PostgreSQL (produção)
- **Autenticação**: NextAuth.js com autenticação baseada em credenciais
- **Cache**: Upstash Redis para cache distribuído de alto desempenho
- **Componentes UI**: Primitivos Radix UI com estilização personalizada
- **Integrações Externas**: 
  - Google Scholar API (via SerpAPI) para busca acadêmica abrangente
  - PubMed API para literatura médica e ciências da vida
  - Crossref API para referências internacionais

## Como Começar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   
   Crie um arquivo `.env.local` na raiz do projeto (copie de `.env.example`):
   ```bash
   cp .env.example .env.local
   ```
   
   Configure as seguintes variáveis:
   ```env
   # Banco de dados
   DATABASE_URL="file:./dev.db"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="seu-secret-aqui"
   
   # Upstash Redis (Cache) - Obrigatório
   UPSTASH_REDIS_REST_URL="https://seu-banco.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="seu-token-aqui"
   
   # SerpAPI (Para Google Scholar) - Opcional
   SERPAPI_API_KEY="sua-chave-serpapi-aqui"
   ```
   
   **Para obter credenciais do Upstash:**
   - Crie uma conta gratuita em [upstash.com](https://upstash.com)
   - Crie um novo banco Redis
   - Copie a URL e o token da aba "REST API"
   - Plano gratuito: 10.000 comandos/dia (suficiente para desenvolvimento)

3. **Configurar o banco de dados**:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Iniciar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

5. **Abrir o navegador** e navegar para `http://localhost:3000`

### Contas Padrão

Após popular o banco de dados, você pode usar estas contas:

- **Admin**: `admin@agroinsight.com` / `admin123`
- **Pesquisador**: `researcher@agroinsight.com` / `user123`

## Endpoints da API

### API de Referências

#### POST `/api/referencias/search`
Busca artigos científicos no Google Scholar, PubMed e Crossref.

**Corpo da Requisição**:
```json
{
  "query": "zootecnia bovinos",
  "source": "all",
  "page": 1,
  "pageSize": 10
}
```

**Parâmetros**:
- `query`: Termo de pesquisa (mínimo 2 caracteres)
- `source`: Fonte da busca (`all`, `scholar`, `pubmed`, `crossref`)
  - `all`: Todas as fontes combinadas (padrão)
  - `scholar`: Apenas Google Scholar (requer chave SerpAPI)
  - `pubmed`: Apenas PubMed
  - `crossref`: Apenas Crossref
- `page`: Página atual (padrão: 1)
- `pageSize`: Artigos por página (padrão: 10, máximo: 20)

**Resposta**:
```json
{
  "success": true,
  "articles": [
    {
      "id": "scholar-abc123",
      "title": "Título do artigo",
      "authors": ["Silva, J.", "Santos, M."],
      "abstract": "Resumo do artigo...",
      "year": 2014,
      "journal": "Revista de Ciências Agrárias",
      "url": "https://doi.org/10.1234/exemplo",
      "source": "scholar",
      "doi": "10.1234/exemplo",
      "citationsCount": 45,
      "pdfUrl": "https://exemplo.com/artigo.pdf"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "hasMore": true,
  "total": 10
}
```

**Detalhes dos Provedores**:

**Google Scholar** (via SerpAPI):
- Cobertura abrangente de bases acadêmicas
- Rastreamento de contagem de citações
- Detecção de disponibilidade de PDF
- Plano gratuito: 100 pesquisas/mês
- Cadastre-se em: https://serpapi.com/

**PubMed**:
- Foco em medicina e ciências da vida
- Suporte a termos MeSH
- Acesso gratuito à API
- Não requer chave API

**Crossref**:
- Registro DOI com metadados abrangentes
- Cobertura de periódicos internacionais
- Acesso gratuito à API
- Não requer chave API

### API de Upload Presets

#### GET `/api/project/{projectId}/upload-presets`
Recupera os presets de upload para um projeto.

**Exemplo de Resposta**:
```json
{
  "projectId": "sample-project-1",
  "presets": [{
    "id": "preset-1",
    "intervals": {
      "Peso_nascimento_kg": { "min": 1, "max": 60 },
      "Peso_desmame_kg": { "min": 80, "max": 300 }
    },
    "defaultFieldMappings": {
      "weight_birth": "Peso_nascimento_kg"
    },
    "reviewRequired": true
  }]
}
```

#### PUT `/api/project/{projectId}/upload-presets`
Atualiza os presets de upload para um projeto (apenas Admin/Proprietário).

**Exemplo de Requisição**:
```json
{
  "intervals": {
    "Peso_nascimento_kg": { "min": 1, "max": 60 }
  },
  "defaultFieldMappings": {
    "weight_birth": "Peso_nascimento_kg"
  },
  "reviewRequired": true
}
```

## Schema do Banco de Dados

A aplicação utiliza as seguintes entidades principais:

- **Users**: Autenticação e gerenciamento de papéis
- **Projects**: Organização de projetos de pesquisa
- **ProjectUploadPresets**: Regras de validação e mapeamento de campos
- **Datasets**: Arquivos de dados enviados e status de processamento
- **DataValidation**: Resultados de validação e revisões do curador
- **AuditLog**: Trilha de auditoria completa

## Desenvolvimento

### Operações do Banco de Dados

- **Gerar cliente Prisma**: `npm run db:generate`
- **Aplicar mudanças no schema**: `npm run db:push`
- **Executar migrações**: `npm run db:migrate`
- **Popular banco de dados**: `npm run db:seed`

### Estrutura do Projeto

```
├── app/                    # Diretório do Next.js app
│   ├── api/               # Rotas de API
│   ├── auth/              # Páginas de autenticação
│   ├── dashboard/         # Páginas do dashboard
│   └── globals.css        # Estilos globais
├── components/            # Componentes UI reutilizáveis
├── lib/                   # Funções utilitárias e configurações
├── prisma/               # Schema e migrações do banco
│   ├── schema.prisma     # Schema do banco de dados
│   └── seed.ts           # Populando o banco
└── types/                # Definições de tipos TypeScript
```

## 🚀 Sistema de Cache

O AgroInsight utiliza **Upstash Redis** para cache distribuído de alto desempenho. O cache é implementado nos seguintes endpoints:

- **Diagnósticos** (24h TTL) - Reduz tempo de 10-30s → 50ms
- **Busca de artigos** (1h TTL) - Reduz tempo de 3-5s → 100ms  
- **Listagem de resultados** (5min TTL) - Reduz carga no banco
- **Artigos salvos** (10min TTL) - Melhora experiência do usuário

**Benefícios:**
- ⚡ Redução de 95%+ no tempo de resposta
- 💰 Economia em chamadas de API externas
- 🌐 Escalabilidade para múltiplos usuários

Para detalhes completos, consulte: [`docs/CACHE_SYSTEM.md`](docs/CACHE_SYSTEM.md)

## 🛡️ Sistema de Segurança e Middlewares

O AgroInsight implementa um sistema robusto de segurança:

### Componentes
- **Logger Condicional** - Logs estruturados apenas em desenvolvimento
- **Auth Middleware** - Autenticação reutilizável e type-safe
- **Rate Limiting** - Proteção contra abuso (Upstash Ratelimit)
- **Validação de Arquivos** - Validação robusta de uploads

### Limites de Rate Limiting
| Endpoint | Limite | Janela |
|----------|--------|--------|
| Upload | 5 req | 1 hora |
| Diagnóstico | 20 req | 1 hora |
| Busca | 100 req | 1 hora |
| Auth | 5 req | 15 min |

### Validação de Arquivos
- CSV: Até 50 MB
- PDF: Até 10 MB
- Imagens: Até 5 MB

Para detalhes completos, consulte: [`docs/MIDDLEWARE_SYSTEM.md`](docs/MIDDLEWARE_SYSTEM.md)

## 📚 Documentação Adicional

- **[API Reference](docs/API_REFERENCE.md)** - Documentação completa de todos os endpoints
- **[Cache System](docs/CACHE_SYSTEM.md)** - Sistema de cache com Upstash Redis
- **[Middleware System](docs/MIDDLEWARE_SYSTEM.md)** - Segurança, logger e rate limiting
- **[Documentação Técnica](docs/DOCUMENTACAO_TECNICA.md)** - Arquitetura e detalhes técnicos
- **[Guia de Uso Rápido](docs/GUIA_USO_RAPIDO.md)** - Tutorial para usuários finais

## Contribuindo

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Faça suas alterações
4. Adicione testes se aplicável
5. Submeta um pull request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

## Suporte

Para suporte e dúvidas, por favor abra uma issue no repositório do GitHub.
