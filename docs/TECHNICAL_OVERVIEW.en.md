# AgroInsight - Technical Overview (English)

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Directory Structure](#directory-structure)
5. [Core Systems](#core-systems)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Data Flow](#data-flow)
9. [Environment Configuration](#environment-configuration)
10. [Development Setup](#development-setup)
11. [Testing and Linting](#testing-and-linting)
12. [Deployment](#deployment)
13. [Key Features](#key-features)

---

## System Overview

**AgroInsight** is a full-stack web application for zootechnical (livestock) data management and analysis. The platform serves researchers, farmers, veterinarians, and animal production professionals who need to analyze agricultural data against established scientific standards.

### Primary Purpose

The system enables users to:
- Upload and analyze livestock production data (CSV/Excel files)
- Compare measurements against scientific reference values from NRC (National Research Council) and EMBRAPA (Brazilian Agricultural Research Corporation)
- Generate both technical statistical reports and simplified "layman" interpretations with visual representations
- Perform species-specific analysis for multiple animal types (cattle, swine, poultry, sheep, goats, fish) and forage
- Calculate zootechnical performance indicators (IEP, GPD, FCR, FCM, BCS)
- Search and save scientific references from academic databases

### Key Differentiator

The **multi-species analysis system** is the core feature, providing context-aware validation by comparing uploaded data against species-specific and subtype-specific reference ranges. For example, dairy cattle data is validated against different standards than beef cattle, and broiler chicken metrics differ from layer chicken metrics.

---

## Architecture

AgroInsight follows a modern full-stack architecture:

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Components**: React with TypeScript
- **Styling**: TailwindCSS with Radix UI components
- **State Management**: React hooks and context
- **Theme**: Dark/light mode support via next-themes

### Backend
- **API**: Next.js API Routes (serverless functions)
- **ORM**: Prisma for database access
- **Authentication**: NextAuth.js with credentials provider
- **Caching**: Upstash Redis for performance optimization

### Database
- **Development**: SQLite
- **Production**: PostgreSQL
- **Schema Management**: Prisma migrations

### External Services
- **AI Integration**: Google Generative AI, OpenAI (for diagnostic generation)
- **Academic Search**: SerpAPI (Google Scholar), PubMed, Crossref
- **Data Processing**: PapaParse (CSV), xml2js (XML), jsPDF (reports)

---

## Technology Stack

### Core Dependencies

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

### Key Libraries

- **Data Analysis**: PapaParse for CSV parsing, custom statistical analysis
- **AI/ML**: Google Generative AI, OpenAI
- **PDF Generation**: jsPDF with autotable
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **UI**: Radix UI primitives, Lucide icons

---

## Directory Structure

```
agroinsight/
├── app/                          # Next.js 14 App Router
│   ├── auth/                     # Authentication pages
│   │   ├── signin/               # Login page
│   │   ├── signup/               # Registration page
│   │   ├── forgot-password/      # Password recovery
│   │   └── reset-password/       # Password reset
│   ├── dashboard/                # Protected user dashboards
│   │   ├── analise/             # Data upload page
│   │   ├── resultados/          # Analysis results viewer
│   │   └── referencias/         # Scientific references library
│   └── api/                      # API routes
│       ├── auth/                 # Authentication endpoints
│       ├── analise/              # Standard analysis endpoints
│       ├── analysis/             # Multi-species analysis endpoints
│       ├── reference/            # Reference data endpoints
│       ├── layman/               # Layman interpretation endpoints
│       └── referencias/          # Academic search endpoints
│
├── components/                   # React components
│   ├── analysis/                 # Analysis-related components
│   │   ├── MultiSpeciesTabs.tsx # Species selection interface
│   │   └── SpeciesUploadForm.tsx# Species-aware upload form
│   ├── layman/                   # Layman visualization components
│   │   ├── LaymanTab.tsx        # Main layman view container
│   │   ├── MetricCard.tsx       # Individual metric display
│   │   ├── AnimalSilhouette.tsx # Visual animal representations
│   │   ├── ForagePanel.tsx      # Forage/pasture visualization
│   │   └── ColorLegend.tsx      # Status color key
│   └── providers/                # React context providers
│       └── theme-provider.tsx   # Theme management
│
├── services/                     # Business logic layer
│   ├── analysis.service.ts      # Dataset analysis operations
│   ├── layman.service.ts        # Layman interpretation API client
│   └── references/              # Academic reference services
│       └── providers/           # Search provider implementations
│           └── scholar.provider.ts
│
├── lib/                          # Utility libraries and helpers
│   ├── auth.ts                  # NextAuth.js configuration
│   ├── prisma.ts                # Prisma client singleton
│   ├── diagnostico-local.ts     # Rule-based diagnostic generator
│   ├── dataAnalysis.ts          # Statistical analysis functions
│   ├── generate-test-data.ts    # Test data generator
│   ├── references/              # Reference data management
│   │   ├── nrc-data.ts          # NRC reference values
│   │   ├── embrapa-data.ts      # EMBRAPA reference values
│   │   └── species-references.ts# ReferenceDataService
│   └── layman/                  # Layman system utilities
│       ├── types.ts             # Type definitions
│       └── colors.ts            # Color-coding utilities
│
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma            # Prisma data model
│   ├── migrations/              # Database migration files
│   ├── seed.ts                  # Standard database seeding
│   └── seed-multi-species.ts    # Multi-species reference seeding
│
├── types/                        # TypeScript type definitions
│   └── api.ts                   # API response/request types
│
├── public/                       # Static assets
├── package.json                  # Dependencies and scripts
├── vercel.json                  # Vercel deployment config
└── README.md                    # Project documentation
```

---

## Core Systems

### 1. Multi-Species Analysis System

**Purpose**: Species-aware data validation and analysis

**Key Components**:
- `components/analysis/MultiSpeciesTabs.tsx` - Species selection UI
- `components/analysis/SpeciesUploadForm.tsx` - Upload handler
- `app/api/analysis/multi-species/route.ts` - Analysis endpoint
- `lib/references/species-references.ts` - `ReferenceDataService` class
- `prisma/seed-multi-species.ts` - Reference data seeding

**Supported Species**:
- **Bovine**: dairy, beef, dual-purpose
- **Swine**: nursery, growing, finishing, breeding
- **Poultry**: broiler, layer, breeder
- **Sheep**: meat, wool, milk
- **Goat**: meat, milk, skin
- **Aquaculture**: tilapia, tambaqui, pintado, pacu
- **Forage**: brachiaria, panicum, cynodon, mixed

**Workflow**:
1. User selects species and subtype
2. System loads species-specific reference data from NRC/EMBRAPA
3. User uploads CSV data
4. System validates data against reference ranges
5. System generates statistical analysis and diagnostics
6. Results displayed with color-coded status indicators

### 2. Authentication & User Management

**Purpose**: Secure user access and session management

**Key Components**:
- `app/auth/signin/page.tsx` - Login interface
- `app/auth/signup/page.tsx` - Registration interface
- `app/api/auth/signup/route.ts` - User creation endpoint
- `lib/auth.ts` - NextAuth.js configuration

**Features**:
- Credentials-based authentication (email/password)
- Password hashing with bcrypt
- Password reset functionality
- Role-based access (User/Admin)
- Session management with JWT

### 3. Layman Interpretation System

**Purpose**: Simplified, visual representation of analysis results

**Key Components**:
- `components/layman/LaymanTab.tsx` - Main container
- `components/layman/LaymanToggle.tsx` - View mode switcher
- `services/layman.service.ts` - API client
- `app/api/layman/evaluate/route.ts` - Metric evaluation endpoint

**Features**:
- Color-coded status (green/yellow/red)
- Animal silhouettes representing health status
- Practical analogies for technical metrics
- Threshold customization per farm
- Toggle between layman and technical views

### 4. Data Analysis Pipeline

**Purpose**: Process uploaded data and generate insights

**Key Components**:
- `app/dashboard/analise/page.tsx` - Upload interface
- `app/api/analise/upload/route.ts` - Standard upload endpoint
- `services/analysis.service.ts` - `AnalysisService` class
- `lib/dataAnalysis.ts` - Statistical calculations
- `lib/diagnostico-local.ts` - Rule-based diagnostics

**Workflow**:
1. **Upload**: User uploads CSV file
2. **Parse**: PapaParse converts CSV to JSON
3. **Validate**: Security checks and data validation
4. **Analyze**: Statistical analysis (mean, median, std dev, CV, outliers)
5. **Compare**: Metrics compared against reference ranges
6. **Generate**: Diagnostics and recommendations created
7. **Store**: Results saved to database
8. **Display**: Results shown with charts and tables

### 5. Results Visualization

**Purpose**: Display analysis results with charts and reports

**Key Components**:
- `app/dashboard/resultados/page.tsx` - Results dashboard
- `components/AdvancedCharts.tsx` - Chart components
- `app/api/analise/diagnostico/[id]/route.ts` - AI diagnostic generator

**Features**:
- Technical/layman view toggle
- Statistical tables with descriptive statistics
- Correlation analysis and heatmaps
- PDF/CSV export functionality
- AI-generated diagnostic reports

### 6. Scientific References

**Purpose**: Search and manage academic literature

**Key Components**:
- `app/dashboard/referencias/page.tsx` - Reference library UI
- `app/api/referencias/search/route.ts` - Multi-source search
- `services/references/providers/scholar.provider.ts` - Google Scholar integration

**Integrations**:
- Google Scholar (via SerpAPI)
- PubMed
- Crossref

---

## Database Schema

### User Domain

**User**
- Stores user accounts with authentication credentials
- Fields: id, email, name, password (hashed), role, resetToken, resetTokenExpiry
- Relations: projects, auditLogs, savedReferences

**Project**
- Organizational unit for grouping datasets
- Fields: id, name, description, ownerId
- Relations: owner (User), datasets, validationSettings, uploadPresets

**Dataset**
- Uploaded data files with analysis results
- Fields: id, projectId, name, filename, status, data (JSON), metadata (JSON)
- Temporal fields: measurementDate, startDate, endDate
- Contextual fields: farmLocation, environmentData, productionSystem
- Quality fields: dataQualityScore, hasTemporalData, hasEnvironmental

### Multi-Species Domain

**AnimalSpecies**
- Top-level species categories
- Fields: id, code, name, hasSubtypes
- Codes: bovine, swine, poultry, sheep, goat, aquaculture, forage

**AnimalSubtype**
- Species subcategories for specific analysis
- Fields: id, speciesId, code, name, description
- Examples: dairy/beef for bovine, broiler/layer for poultry

**ReferenceData**
- Scientific benchmark values per species/subtype/metric
- Fields: id, speciesId, subtypeId, metric, minValue, idealMinValue, idealMaxValue, maxValue, unit, source
- Sources: NRC 2016, EMBRAPA 2023

**ForageReference**
- Forage-specific data with seasonal variations
- Fields: id, forageType, variety, metric, minValue, idealValue, maxValue, unit, season, source
- Seasons: aguas (rainy), seca (dry), transicao (transition)

### References Domain

**SavedReference**
- User's saved scientific articles
- Fields: id, userId, title, authors, year, abstract, journal, doi, url, keywords, source

---

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login (NextAuth)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Analysis

- `POST /api/analise/upload` - Upload and analyze CSV data
- `GET /api/analise/resultados` - Get user's analyses
- `GET /api/analise/diagnostico/[id]` - Generate AI diagnostic
- `DELETE /api/analise/delete/[id]` - Delete analysis
- `GET /api/analise/download/[id]` - Download analysis results

### Multi-Species Analysis

- `POST /api/analysis/multi-species` - Species-aware analysis
- `GET /api/reference/[species]/data` - Get reference data for species
- `GET /api/analysis/correlations` - Analyze correlations

### Layman Interpretation

- `POST /api/layman/evaluate` - Evaluate metrics for layman view
- `GET /api/layman/annotations/[entityId]` - Get annotations

### Scientific References

- `POST /api/referencias/search` - Search academic databases
- `GET /api/referencias/saved` - Get user's saved references
- `POST /api/referencias/save` - Save a reference
- `DELETE /api/referencias/unsave` - Remove saved reference
- `POST /api/referencias/add-by-url` - Add reference by URL

---

## Data Flow

### Upload and Analysis Flow

```
1. User uploads CSV file
   ↓
2. Frontend validates file (size, type)
   ↓
3. POST /api/analysis/multi-species
   ↓
4. Backend security validation
   ↓
5. Parse CSV with PapaParse
   ↓
6. Statistical analysis (lib/dataAnalysis.ts)
   ↓
7. Compare with references (lib/references/species-references.ts)
   ↓
8. Generate interpretation
   ↓
9. Analyze correlations
   ↓
10. Save to database (Prisma)
    ↓
11. Return results to frontend
    ↓
12. Display in results dashboard
```

### Reference Data Flow

```
1. User selects species/subtype
   ↓
2. GET /api/reference/[species]/data?subtype=X
   ↓
3. ReferenceDataService.getReference()
   ↓
4. Combine NRC and EMBRAPA data (prioritize EMBRAPA)
   ↓
5. Return reference metrics
   ↓
6. Display in UI with available metrics
```

---

## Environment Configuration

### Required Environment Variables

```bash
# Database
DB_PROVIDER="sqlite"  # or "postgresql"
DATABASE_URL="file:./dev.db"  # or PostgreSQL connection string
DIRECT_URL="postgresql://..."  # For migrations (PostgreSQL only)

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Upstash Redis (Cache)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# AI Services (Optional)
GOOGLE_GEMINI_API_KEY="your-gemini-key"
OPENAI_API_KEY="your-openai-key"

# Academic Search (Optional)
SERPAPI_API_KEY="your-serpapi-key"

# Devin AI (Optional)
DEVIN_API_KEY="your-devin-key"
```

### Configuration Files

- `.env.local` - Local development environment variables
- `.env.example` - Template for environment variables
- `vercel.json` - Vercel deployment configuration
- `next.config.js` - Next.js configuration

---

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/SilvaGabriel011/tcc2.git
cd tcc2

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Generate Prisma client
npm run db:generate

# 5. Run database migrations
npm run db:migrate

# 6. Seed database with reference data
npm run db:seed
npx tsx prisma/seed-multi-species.ts

# 7. Start development server
npm run dev

# 8. Open browser
# Navigate to http://localhost:3000
```

### Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

---

## Testing and Linting

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- `__tests__/lib/` - Unit tests for library functions
- `__tests__/services/` - Service layer tests
- `__tests__/api/` - API endpoint tests

---

## Deployment

### Vercel Deployment (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Build Command

```bash
npm run build
# or
vercel-build  # Includes prisma generate and migrate
```

### Environment Setup

- Set all required environment variables in Vercel dashboard
- Use PostgreSQL database (not SQLite) for production
- Configure DIRECT_URL for migrations
- Set up Upstash Redis for caching

---

## Key Features

### 1. Multi-Species Analysis

- Species-specific validation against NRC/EMBRAPA standards
- Subtype-specific reference ranges
- Automatic metric detection and classification
- Color-coded status indicators

### 2. Statistical Analysis

- Descriptive statistics (mean, median, std dev, CV)
- Quartiles and outlier detection
- Correlation analysis with biological relevance scoring
- Variable type detection (quantitative, qualitative, temporal)

### 3. Layman Interpretation

- Simplified language for non-technical users
- Color-coded visualizations (red/yellow/green)
- Animal silhouettes representing health status
- Practical analogies and recommendations

### 4. Zootechnical Calculations

- **IEP** (Índice de Eficiência Produtiva) - Poultry performance index
- **GPD** (Ganho de Peso Diário) - Daily weight gain
- **FCR** (Feed Conversion Ratio) - Feed efficiency
- **FCM** (Fat-Corrected Milk) - Standardized milk production
- **BCS** (Body Condition Score) - Body fat assessment

### 5. Scientific References

- Multi-source academic search (Google Scholar, PubMed, Crossref)
- Reference management and organization
- DOI-based article validation
- Citation tracking

### 6. Security Features

- File upload validation (size, type, content)
- Rate limiting per endpoint
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF protection (NextAuth)
- Password hashing (bcrypt)

### 7. Performance Optimization

- Redis caching with graduated TTLs
- Database query optimization with indexes
- Lazy loading and code splitting
- Image optimization
- API response caching

---

## Caching Strategy

### Cache TTLs

- **Diagnostics**: 24 hours
- **Searches**: 1 hour
- **Results**: 5 minutes
- **Saved articles**: 10 minutes

### Rate Limiting

- **Uploads**: 5 per hour per user
- **Diagnostics**: 20 per hour per user
- **Searches**: 100 per hour per user

---

## Contributing

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Add JSDoc comments for exported functions
- Write tests for new features

### Git Workflow

1. Create feature branch from main
2. Make changes and commit
3. Run lint and tests
4. Push to remote
5. Create pull request
6. Wait for CI checks
7. Merge after approval

---

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/SilvaGabriel011/tcc2/issues
- Documentation: See README.md and inline code comments

---

**Last Updated**: November 2025
**Version**: 2.0
