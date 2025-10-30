# 🔌 API REFERENCE - AgroInsight

**Documentação completa de todos os endpoints da API**

Versão: 1.0.0  
Base URL: `http://localhost:3000/api`  
Produção: `https://seu-dominio.com/api`

---

## 📚 Integração SciELO ArticleMeta API

### Visão Geral

O AgroInsight integra a **API oficial do SciELO ArticleMeta** para busca de artigos científicos brasileiros e latino-americanos. A integração utiliza uma estratégia de API-first com fallback automático para web scraping.

### API SciELO Base URL

```
http://articlemeta.scielo.org/api/v1/
```

### Estratégia de Busca

1. **Primeira tentativa**: API ArticleMeta oficial (metadados completos)
2. **Fallback**: Web scraping do portal de busca SciELO
3. **Combinação com Crossref**: 60% SciELO + 40% Crossref quando `source='all'`

### Coleções Disponíveis

| Código | País/Região |
|--------|-------------|
| `scl` | Todas as coleções |
| `bra` | Brasil |
| `arg` | Argentina |
| `chl` | Chile |
| `col` | Colômbia |
| `esp` | Espanha |
| `mex` | México |
| `prt` | Portugal |

### Características

- ✅ Metadados completos em múltiplos idiomas (PT, EN, ES)
- ✅ Suporte a DOI e PID oficiais
- ✅ Tratamento robusto de erros com fallback
- ✅ Timeout configurado (15s para listagem, 10s por artigo)
- ✅ Filtragem client-side por relevância

### Recursos Adicionais

- **Documentação:** https://scielo.readthedocs.io/projects/articlemeta/
- **GitHub:** https://github.com/scieloorg/articles_meta
- **Download em lote:** http://static.scielo.org/articlemeta/articles.json.zip  

---

## 📑 ÍNDICE

1. [Autenticação](#autenticação)
2. [Análise de Dados](#análise-de-dados)
3. [Referências Científicas](#referências-científicas)
4. [Projetos](#projetos)
5. [Códigos de Erro](#códigos-de-erro)
6. [Rate Limiting](#rate-limiting)

---

## 🔐 AUTENTICAÇÃO

Todos os endpoints (exceto login/signup) requerem autenticação via NextAuth session.

### Headers Necessários
```http
Cookie: next-auth.session-token=<token>
Content-Type: application/json
```

---

## 📊 ANÁLISE DE DADOS

### 1. Upload de CSV

**Endpoint:** `POST /api/analise/upload`

**Descrição:** Faz upload e análise automática de arquivo CSV com dados zootécnicos.

**Autenticação:** ✅ Requerida

**Request:**
```http
POST /api/analise/upload
Content-Type: multipart/form-data

file: <arquivo.csv>
projectName: "Lote Janeiro 2024"
```

**Request Body (FormData):**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `file` | File | Sim | Arquivo CSV (max 50MB) |
| `projectName` | string | Não | Nome da análise (padrão: nome do arquivo) |

**Response Success (200):**
```json
{
  "success": true,
  "message": "Análise concluída com sucesso",
  "analysis": {
    "id": "clxxx...",
    "name": "dados_lote_jan.csv",
    "projectId": "clyyy...",
    "createdAt": "2024-10-30T12:00:00Z",
    "rowCount": 150,
    "columnCount": 8,
    "variablesInfo": [
      {
        "name": "peso_kg",
        "type": "Quantitativa Contínua",
        "detectedType": "number",
        "hasDecimals": true,
        "uniqueValues": 145,
        "nullCount": 0,
        "isZootechnical": true,
        "category": "peso"
      }
    ],
    "numericStats": {
      "peso_kg": {
        "mean": 382.5,
        "median": 380.0,
        "mode": 375.0,
        "stdDev": 45.2,
        "min": 250.0,
        "max": 520.0,
        "q1": 350.0,
        "q3": 415.0,
        "iqr": 65.0,
        "cv": 11.8,
        "skewness": 0.15,
        "outliers": [520.0, 525.0]
      }
    },
    "categoricalStats": {
      "raca": {
        "count": 150,
        "unique": 3,
        "distribution": {
          "Nelore": 85,
          "Angus": 45,
          "Brahman": 20
        },
        "frequencies": {
          "Nelore": 56.7,
          "Angus": 30.0,
          "Brahman": 13.3
        },
        "entropy": 1.25,
        "mode": "Nelore"
      }
    }
  }
}
```

**Response Error (400):**
```json
{
  "error": "Arquivo CSV inválido",
  "details": "O arquivo deve ter extensão .csv"
}
```

**Response Error (413):**
```json
{
  "error": "Arquivo muito grande",
  "details": "Tamanho máximo: 50MB"
}
```

**Limites:**
- Tamanho máximo: 50MB
- Linhas máximas: 100.000
- Colunas máximas: 100
- Timeout: 60 segundos

---

### 2. Listar Análises

**Endpoint:** `GET /api/analise/resultados`

**Descrição:** Lista todas as análises do usuário autenticado.

**Autenticação:** ✅ Requerida

**Request:**
```http
GET /api/analise/resultados
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `projectId` | string | Não | Filtrar por projeto específico |
| `limit` | number | Não | Limitar resultados (padrão: 50) |
| `offset` | number | Não | Offset para paginação |

**Response Success (200):**
```json
{
  "success": true,
  "analyses": [
    {
      "id": "clxxx...",
      "name": "Lote_Jan_2024.csv",
      "createdAt": "2024-10-30T12:00:00Z",
      "rowCount": 150,
      "columnCount": 8,
      "projectName": "Fazenda XYZ"
    },
    {
      "id": "clyyy...",
      "name": "Lote_Fev_2024.csv",
      "createdAt": "2024-10-29T10:30:00Z",
      "rowCount": 200,
      "columnCount": 10,
      "projectName": "Fazenda XYZ"
    }
  ],
  "total": 2
}
```

---

### 3. Download de Análise (CSV)

**Endpoint:** `GET /api/analise/download/[analysisId]`

**Descrição:** Faz download dos dados originais em formato CSV.

**Autenticação:** ✅ Requerida

**Request:**
```http
GET /api/analise/download/clxxx123
```

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `analysisId` | string | ID da análise |

**Response Success (200):**
```csv
Content-Type: text/csv
Content-Disposition: attachment; filename="analise_clxxx123.csv"

animal_id,peso_inicial,peso_final,idade,raca
1,250,380,180,Nelore
2,240,370,185,Angus
...
```

**Response Error (404):**
```json
{
  "error": "Análise não encontrada ou você não tem permissão para acessá-la"
}
```

---

### 4. Gerar Diagnóstico com IA

**Endpoint:** `GET /api/analise/diagnostico/[analysisId]`

**Descrição:** Gera diagnóstico zootécnico completo usando Google Gemini AI.

**Autenticação:** ✅ Requerida

**Request:**
```http
GET /api/analise/diagnostico/clxxx123
```

**Response Success (200):**
```json
{
  "success": true,
  "diagnostico": {
    "resumo": "Análise de 150 animais mostra performance adequada...",
    "analises": [
      {
        "variavel": "peso_kg",
        "valor": "382.5 kg (média)",
        "status": "Bom",
        "interpretacao": "Peso médio dentro do esperado para a idade..."
      }
    ],
    "pontosFortes": [
      "Uniformidade do lote (CV 11.8%)",
      "Ausência de outliers significativos"
    ],
    "pontosAtencao": [
      "Alguns animais abaixo de 300kg necessitam atenção"
    ],
    "recomendacoes": [
      "Manter protocolo nutricional atual",
      "Avaliar animais com peso < 300kg individualmente"
    ],
    "conclusao": "Lote apresenta desempenho satisfatório...",
    "fontes": [
      "EMBRAPA Gado de Corte (2023)",
      "Beef Cattle Production Guidelines"
    ]
  },
  "generatedAt": "2024-10-30T12:05:00Z",
  "model": "gemini-pro"
}
```

**Response Error (500):**
```json
{
  "error": "Erro ao gerar diagnóstico",
  "details": "API Gemini temporariamente indisponível"
}
```

**Tempo de Processamento:**
- Pequeno (< 1000 linhas): 10-20 segundos
- Médio (1000-10000): 20-40 segundos
- Grande (> 10000): 40-60 segundos

---

### 5. Deletar Análise

**Endpoint:** `DELETE /api/analise/delete/[analysisId]`

**Descrição:** Remove uma análise do sistema.

**Autenticação:** ✅ Requerida

**Request:**
```http
DELETE /api/analise/delete/clxxx123
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Análise deletada com sucesso"
}
```

**Response Error (404):**
```json
{
  "error": "Análise não encontrada ou você não tem permissão para deletá-la"
}
```

⚠️ **Atenção:** Esta ação é irreversível!

---

## 📚 REFERÊNCIAS CIENTÍFICAS

### 1. Buscar Artigos

**Endpoint:** `POST /api/referencias/search`

**Descrição:** Busca artigos científicos em SciELO e/ou Crossref.

**Autenticação:** ✅ Requerida

**Request:**
```http
POST /api/referencias/search
Content-Type: application/json

{
  "query": "nutrição bovinos confinamento",
  "source": "all",
  "page": 1,
  "pageSize": 10
}
```

**Request Body:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `query` | string | Sim | Termo de busca (min 3 caracteres) |
| `source` | string | Não | "all", "scielo", "crossref" (padrão: "all") |
| `page` | number | Não | Número da página (padrão: 1) |
| `pageSize` | number | Não | Itens por página (max: 20, padrão: 10) |

**Response Success (200):**
```json
{
  "success": true,
  "articles": [
    {
      "id": "scielo-123",
      "title": "Efeito da suplementação proteica em bovinos",
      "authors": ["Silva, J.", "Santos, M.", "Oliveira, P."],
      "abstract": "Este estudo avaliou...",
      "year": 2023,
      "journal": "Revista Brasileira de Zootecnia",
      "url": "https://www.scielo.br/...",
      "source": "scielo",
      "doi": "10.1590/rbz...",
      "saved": false
    },
    {
      "id": "crossref-456",
      "title": "Beef cattle nutrition strategies",
      "authors": ["Smith, A.", "Johnson, B."],
      "abstract": "This research investigated...",
      "year": 2024,
      "journal": "Journal of Animal Science",
      "url": "https://doi.org/10.2527/jas...",
      "source": "crossref",
      "doi": "10.2527/jas.2024.123",
      "saved": false
    }
  ],
  "page": 1,
  "pageSize": 10,
  "hasMore": true,
  "total": 2,
  "query": "nutrição bovinos confinamento",
  "source": "all",
  "message": "2 artigo(s) encontrado(s)"
}
```

**Response Error (400):**
```json
{
  "error": "Termo de pesquisa deve ter pelo menos 3 caracteres"
}
```

**Timeout:** 15 segundos

---

### 2. Salvar Artigo

**Endpoint:** `POST /api/referencias/save`

**Descrição:** Salva um artigo na biblioteca pessoal do usuário.

**Autenticação:** ✅ Requerida

**Request:**
```http
POST /api/referencias/save
Content-Type: application/json

{
  "id": "scielo-123",
  "title": "Título do artigo",
  "authors": ["Autor 1", "Autor 2"],
  "abstract": "Resumo...",
  "year": 2023,
  "journal": "Revista",
  "url": "https://...",
  "source": "scielo",
  "doi": "10.1590/..."
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Artigo salvo com sucesso!",
  "articleId": "clzzz..."
}
```

**Response Error (400):**
```json
{
  "error": "Artigo já foi salvo anteriormente"
}
```

---

### 3. Listar Artigos Salvos

**Endpoint:** `GET /api/referencias/saved`

**Descrição:** Lista todos os artigos salvos pelo usuário.

**Autenticação:** ✅ Requerida

**Request:**
```http
GET /api/referencias/saved
```

**Response Success (200):**
```json
{
  "success": true,
  "articles": [
    {
      "id": "clzzz...",
      "title": "Título do artigo",
      "authors": ["Autor 1", "Autor 2"],
      "abstract": "Resumo...",
      "year": 2023,
      "journal": "Revista",
      "url": "https://...",
      "source": "scielo",
      "saved": true
    }
  ],
  "total": 1
}
```

---

### 4. Remover Artigo

**Endpoint:** `DELETE /api/referencias/unsave`

**Descrição:** Remove um artigo da biblioteca pessoal.

**Autenticação:** ✅ Requerida

**Request:**
```http
DELETE /api/referencias/unsave
Content-Type: application/json

{
  "url": "https://www.scielo.br/..."
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Artigo removido da biblioteca com sucesso!"
}
```

**Response Error (404):**
```json
{
  "error": "Artigo não encontrado ou não pertence ao usuário"
}
```

---

### 5. Adicionar por URL/DOI

**Endpoint:** `POST /api/referencias/add-by-url`

**Descrição:** Adiciona artigo diretamente via URL ou DOI.

**Autenticação:** ✅ Requerida

**Request:**
```http
POST /api/referencias/add-by-url
Content-Type: application/json

{
  "url": "https://doi.org/10.1234/example"
}
```

**Formatos aceitos:**
- `https://doi.org/10.1234/example`
- `10.1234/example`
- Qualquer URL contendo DOI

**Response Success (200):**
```json
{
  "success": true,
  "article": {
    "id": "clzzz...",
    "title": "Título extraído",
    "authors": "Autores",
    "abstract": "Resumo",
    "year": 2023,
    "journal": "Journal",
    "url": "https://doi.org/10.1234/example",
    "doi": "10.1234/example"
  },
  "message": "Artigo adicionado à biblioteca com sucesso"
}
```

**Response Error (400):**
```json
{
  "error": "Não foi possível detectar um DOI válido na URL fornecida"
}
```

**Response Error (409):**
```json
{
  "error": "Este artigo já está na sua biblioteca"
}
```

---

## 🏗️ PROJETOS

### 1. Obter Configurações de Upload

**Endpoint:** `GET /api/project/[projectId]/upload-presets`

**Descrição:** Obtém configurações de upload de um projeto.

**Autenticação:** ✅ Requerida

**Request:**
```http
GET /api/project/clyyy123/upload-presets
```

**Response Success (200):**
```json
{
  "success": true,
  "presets": {
    "maxFileSize": 52428800,
    "maxRows": 100000,
    "allowedFormats": ["csv"],
    "autoAnalysis": true
  }
}
```

---

### 2. Atualizar Configurações

**Endpoint:** `PUT /api/project/[projectId]/upload-presets`

**Descrição:** Atualiza configurações de upload (apenas owner ou admin).

**Autenticação:** ✅ Requerida (owner ou admin)

**Request:**
```http
PUT /api/project/clyyy123/upload-presets
Content-Type: application/json

{
  "maxFileSize": 104857600,
  "maxRows": 200000,
  "autoAnalysis": true
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Configurações atualizadas com sucesso"
}
```

**Response Error (403):**
```json
{
  "error": "Apenas o proprietário ou administradores podem alterar configurações"
}
```

---

## ⚠️ CÓDIGOS DE ERRO

### HTTP Status Codes

| Código | Significado | Descrição |
|--------|-------------|-----------|
| `200` | OK | Requisição bem-sucedida |
| `201` | Created | Recurso criado com sucesso |
| `400` | Bad Request | Dados inválidos na requisição |
| `401` | Unauthorized | Autenticação necessária |
| `403` | Forbidden | Sem permissão para acessar |
| `404` | Not Found | Recurso não encontrado |
| `409` | Conflict | Conflito (ex: duplicado) |
| `413` | Payload Too Large | Arquivo muito grande |
| `429` | Too Many Requests | Rate limit excedido |
| `500` | Internal Server Error | Erro no servidor |
| `503` | Service Unavailable | Serviço temporariamente indisponível |

### Estrutura de Erro Padrão

```json
{
  "error": "Mensagem de erro legível",
  "details": "Detalhes técnicos (apenas em dev)",
  "code": "ERROR_CODE",
  "timestamp": "2024-10-30T12:00:00Z"
}
```

---

## ⏱️ RATE LIMITING

### Limites por Endpoint

| Endpoint | Limite | Janela |
|----------|--------|--------|
| `/api/analise/upload` | 10 req | 1 hora |
| `/api/analise/diagnostico/*` | 20 req | 1 hora |
| `/api/referencias/search` | 100 req | 1 hora |
| Outros endpoints | 200 req | 1 hora |

### Headers de Rate Limit

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635600000
```

### Response ao Exceder Limite

```json
{
  "error": "Rate limit excedido",
  "retryAfter": 3600,
  "message": "Tente novamente em 1 hora"
}
```

---

## 🔧 EXEMPLOS DE USO

### JavaScript/Fetch

```javascript
// Upload de CSV
const formData = new FormData()
formData.append('file', file)
formData.append('projectName', 'Minha Análise')

const response = await fetch('/api/analise/upload', {
  method: 'POST',
  body: formData
})

const data = await response.json()
console.log(data.analysis.id)
```

### cURL

```bash
# Buscar artigos
curl -X POST https://seu-dominio.com/api/referencias/search \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "query": "bovinos",
    "source": "all",
    "page": 1
  }'
```

### Python

```python
import requests

# Listar análises
response = requests.get(
    'https://seu-dominio.com/api/analise/resultados',
    cookies={'next-auth.session-token': 'seu-token'}
)

analyses = response.json()['analyses']
```

---

## 📞 SUPORTE

### Documentação Relacionada
- [Documentação Técnica](DOCUMENTACAO_TECNICA.md)
- [Guia de Uso Rápido](GUIA_USO_RAPIDO.md)

### Reportar Problemas
- GitHub Issues
- Email: pedrogabriieell@gmail.com

---

**Versão da API:** 1.0.0  
**Última atualização:** 30/10/2025  
**Mantenedor:** Gabriel Pedro
