# AgroInsight - Livestock Data Management Platform

**[English](README.md)** | **[Português (Brasil)](README.pt-BR.md)**

AgroInsight is a comprehensive livestock data management and analysis platform designed for researchers, farmers, and animal scientists. Built with modern web technologies, it offers intelligent data validation, automatic unit conversion, and collaborative workflows. 

## Features

### 🌱 Core Features
- **Data Analysis**: CSV file upload with automatic statistical analysis of livestock data
- **Livestock Calculator**: Unit conversion and index calculations (@ to kg, birth rate, etc.)
- **Results & Reports**: Data visualization with charts and PDF/Excel export
- **Scientific References**: Integrated search with **Google Scholar** (via SerpAPI), PubMed, and Crossref for academic articles with personal library

### 🔧 Technical Features
- **Smart Validation**: Automatic identification of livestock columns and data validation
- **Audit Log**: Complete tracking of all data modifications
- **Access Control**: User and Admin roles with appropriate permissions
- **RESTful API**: Complete API for integration with external tools

## Architecture

The application follows a modern full-stack architecture:

- **Frontend**: Next.js 14 with React, TypeScript, and TailwindCSS
- **Backend**: Next.js API routes with Prisma ORM
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: NextAuth.js with credentials-based authentication
- **Cache**: Upstash Redis for high-performance distributed caching
- **UI Components**: Radix UI primitives with custom styling
- **External Integrations**: 
  - Google Scholar API (via SerpAPI) for comprehensive academic search
  - PubMed API for medical and life sciences literature
  - Crossref API for international references

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   
   Create a `.env.local` file in the project root (copy from `.env.example`):
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-here"
   
   # Upstash Redis (Cache) - Required
   UPSTASH_REDIS_REST_URL="https://your-database.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="your-token-here"
   
   # SerpAPI (For Google Scholar) - Optional
   SERPAPI_API_KEY="your-serpapi-key-here"
   ```
   
   **To get Upstash credentials:**
   - Create a free account at [upstash.com](https://upstash.com)
   - Create a new Redis database
   - Copy the URL and token from the "REST API" tab
   - Free tier: 10,000 commands/day (sufficient for development)

3. **Set up the database**:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

### Default Accounts

After seeding the database, you can use these accounts:

- **Admin**: `admin@agroinsight.com` / `admin123`
- **Researcher**: `researcher@agroinsight.com` / `user123`

## API Endpoints

### References API

#### POST `/api/referencias/search`
Search for scientific articles on Google Scholar, PubMed, and Crossref.

**Request Body**:
```json
{
  "query": "livestock cattle",
  "source": "all",
  "page": 1,
  "pageSize": 10
}
```

**Parameters**:
- `query`: Search term (minimum 2 characters)
- `source`: Search source (`all`, `scholar`, `pubmed`, `crossref`)
  - `all`: All sources combined (default)
  - `scholar`: Google Scholar only (requires SerpAPI key)
  - `pubmed`: PubMed only
  - `crossref`: Crossref only
- `page`: Current page (default: 1)
- `pageSize`: Articles per page (default: 10, maximum: 20)

**Response**:
```json
{
  "success": true,
  "articles": [
    {
      "id": "scholar-abc123",
      "title": "Article title",
      "authors": ["Silva, J.", "Santos, M."],
      "abstract": "Article abstract...",
      "year": 2014,
      "journal": "Journal of Agricultural Science",
      "url": "https://doi.org/10.1234/example",
      "source": "scholar",
      "doi": "10.1234/example",
      "citationsCount": 45,
      "pdfUrl": "https://example.com/paper.pdf"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "hasMore": true,
  "total": 10
}
```

**Provider Details**:

**Google Scholar** (via SerpAPI):
- Broad academic database coverage
- Citation count tracking
- PDF availability detection
- Free tier: 100 searches/month
- Sign up at: https://serpapi.com/

**PubMed**:
- Medical and life sciences focus
- MeSH terms support
- Free API access
- No API key required

**Crossref**:
- DOI registry with comprehensive metadata
- International journal coverage
- Free API access
- No API key required

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

## 🚀 Cache System

AgroInsight uses **Upstash Redis** for high-performance distributed caching. Cache is implemented in the following endpoints:

- **Diagnostics** (24h TTL) - Reduces time from 10-30s → 50ms
- **Article search** (1h TTL) - Reduces time from 3-5s → 100ms  
- **Results listing** (5min TTL) - Reduces database load
- **Saved articles** (10min TTL) - Improves user experience

**Benefits:**
- ⚡ 95%+ reduction in response time
- 💰 Savings on external API calls
- 🌐 Scalability for multiple users

For complete details, see: [`docs/CACHE_SYSTEM.md`](docs/CACHE_SYSTEM.md)

## 🛡️ Security and Middleware System

AgroInsight implements a robust security system:

### Components
- **Conditional Logger** - Structured logs only in development
- **Auth Middleware** - Reusable and type-safe authentication
- **Rate Limiting** - Protection against abuse (Upstash Ratelimit)
- **File Validation** - Robust upload validation

### Rate Limiting Rules
| Endpoint | Limit | Window |
|----------|--------|--------|
| Upload | 5 req | 1 hour |
| Diagnostics | 20 req | 1 hour |
| Search | 100 req | 1 hour |
| Auth | 5 req | 15 min |

### File Validation
- CSV: Up to 50 MB
- PDF: Up to 10 MB
- Images: Up to 5 MB

For complete details, see: [`docs/MIDDLEWARE_SYSTEM.md`](docs/MIDDLEWARE_SYSTEM.md)

## 📚 Additional Documentation

- **[API Reference](docs/API_REFERENCE.md)** - Complete documentation of all endpoints
- **[Cache System](docs/CACHE_SYSTEM.md)** - Cache system with Upstash Redis
- **[Middleware System](docs/MIDDLEWARE_SYSTEM.md)** - Security, logger, and rate limiting
- **[Technical Documentation](docs/DOCUMENTACAO_TECNICA.md)** - Architecture and technical details
- **[Quick Start Guide](docs/GUIA_USO_RAPIDO.md)** - Tutorial for end users

## 🚀 Production Deployment

AgroInsight is ready to deploy on **Vercel** with **PostgreSQL**. The project includes:

- **Migration scripts** from SQLite to PostgreSQL
- **Automatic configuration** for Vercel
- **Complete deployment guide** with step-by-step instructions

### Quick Deploy

1. **Backup your data** (if migrating from SQLite):
   ```bash
   npm run backup:sqlite
   ```

2. **Push to GitHub**:
   ```bash
   git push origin main
   ```

3. **Deploy to Vercel**:
   - Import repository at [vercel.com/new](https://vercel.com/new)
   - Configure environment variables
   - Deploy automatically

### Required Services

- **PostgreSQL**: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (recommended) or [Supabase](https://supabase.com)
- **Redis**: [Upstash Redis](https://upstash.com) (required for cache)
- **APIs** (optional): Google Gemini, OpenAI, SerpAPI

### Documentation

- **[Complete Deploy Guide](DEPLOY_GUIDE.md)** - Step-by-step deployment instructions
- **[Migration Guide](docs/MIGRATION_POSTGRESQL.md)** - SQLite to PostgreSQL migration
- **[Deploy Checklist](DEPLOY_CHECKLIST.md)** - Deployment task checklist

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
