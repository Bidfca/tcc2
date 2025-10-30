# AgroInsight - Plataforma de Gestão de Dados Zootécnicos

AgroInsight é uma plataforma abrangente de gestão e análise de dados agropecuários desenvolvida para pesquisadores, produtores rurais e zootecnistas. Construída com tecnologias web modernas, oferece validação inteligente de dados, conversão automática de unidades e fluxos de trabalho colaborativos.

## Funcionalidades

### 🌱 Funcionalidades Principais
- **Análise de Dados**: Upload de arquivos CSV com análise estatística automática de dados zootécnicos
- **Calculadora Zootécnica**: Conversão de unidades e cálculo de índices (@ para kg, taxa de nascimento, etc.)
- **Resultados e Relatórios**: Visualização de dados com gráficos e exportação em PDF/Excel
- **Referências Científicas**: Pesquisa integrada com a **API oficial do SciELO ArticleMeta** e Crossref para busca de artigos acadêmicos com biblioteca pessoal

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
- **Componentes UI**: Primitivos Radix UI com estilização personalizada
- **Integrações Externas**: 
  - SciELO ArticleMeta API para busca de artigos científicos
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

2. **Configurar o banco de dados**:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

3. **Iniciar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Abrir o navegador** e navegar para `http://localhost:3000`

### Contas Padrão

Após popular o banco de dados, você pode usar estas contas:

- **Admin**: `admin@agroinsight.com` / `admin123`
- **Pesquisador**: `researcher@agroinsight.com` / `user123`

## API Endpoints

### Referencias API

#### POST `/api/referencias/search`
Busca artigos científicos no SciELO e Crossref.

**Request Body**:
```json
{
  "query": "zootecnia bovinos",
  "source": "all",
  "page": 1,
  "pageSize": 10
}
```

**Parâmetros**:
- `query`: Termo de pesquisa (mínimo 3 caracteres)
- `source`: Fonte da busca (`all`, `scielo`, `crossref`)
  - `all`: 60% SciELO + 40% Crossref (padrão)
  - `scielo`: Apenas artigos do SciELO (API oficial ArticleMeta)
  - `crossref`: Apenas artigos do Crossref
- `page`: Página atual (padrão: 1)
- `pageSize`: Artigos por página (padrão: 10, máximo: 20)

**Response**:
```json
{
  "success": true,
  "articles": [
    {
      "id": "scielo-api-S0034-89102014000200001",
      "title": "Título do artigo",
      "authors": ["Silva, J.", "Santos, M."],
      "abstract": "Resumo do artigo...",
      "year": 2014,
      "journal": "Revista Brasileira de Zootecnia",
      "url": "https://doi.org/10.1590/S0034-89102014000200001",
      "source": "scielo",
      "doi": "10.1590/S0034-89102014000200001"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "hasMore": true,
  "total": 10
}
```

**Integração SciELO**:
- Usa a API oficial ArticleMeta (`http://articlemeta.scielo.org/api/v1/`)
- Suporte a múltiplos idiomas (PT, EN, ES)
- Metadados completos incluindo DOI, PID, autores e resumos
- Fallback automático para web scraping se a API falhar
- Coleções disponíveis: Brasil, Argentina, Chile, Espanha, México, etc.

### Upload Presets API

#### GET `/api/project/{projectId}/upload-presets`
Retrieve upload presets for a project.

**Response Example**:
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
Update upload presets for a project (Admin/Owner only).

**Request Example**:
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

## Database Schema

The application uses the following main entities:

- **Users**: Authentication and role management
- **Projects**: Research project organization
- **ProjectUploadPresets**: Validation rules and field mappings
- **Datasets**: Uploaded data files and processing status
- **DataValidation**: Validation results and curator reviews
- **AuditLog**: Complete audit trail

## Development

### Database Operations

- **Generate Prisma client**: `npm run db:generate`
- **Push schema changes**: `npm run db:push`
- **Run migrations**: `npm run db:migrate`
- **Seed database**: `npm run db:seed`

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
└── types/                # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.
