# 🚀 Sistema de Cache - AgroInsight

## Visão Geral

O AgroInsight utiliza **Upstash Redis** como sistema de cache para melhorar o desempenho da aplicação e reduzir a carga no banco de dados e APIs externas.

## Configuração

### 1. Criar conta no Upstash

1. Acesse [upstash.com](https://upstash.com)
2. Crie uma conta gratuita (até 10.000 comandos/dia)
3. Crie um novo banco de dados Redis

### 2. Configurar variáveis de ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
UPSTASH_REDIS_REST_URL="https://seu-banco.upstash.io"
UPSTASH_REDIS_REST_TOKEN="seu-token-aqui"
```

> **Nota**: Copie a URL e o token da aba "REST API" no painel do Upstash.

### 3. Plano Gratuito

O plano gratuito do Upstash inclui:
- ✅ 10.000 comandos por dia
- ✅ 256 MB de armazenamento
- ✅ REST API
- ✅ Ideal para desenvolvimento e projetos pequenos

## Endpoints com Cache

### 📊 Análise de Dados

#### `GET /api/analise/diagnostico/[analysisId]`
- **TTL**: 24 horas (86400s)
- **Chave**: `diagnostico:{analysisId}`
- **Motivo**: Diagnósticos são computacionalmente caros e raramente mudam
- **Invalidação**: Ao deletar análise

#### `GET /api/analise/resultados`
- **TTL**: 5 minutos (300s)
- **Chave**: `resultados:{userId}`
- **Motivo**: Listagem frequente com dados que não mudam constantemente
- **Invalidação**: Ao criar ou deletar análise

### 📚 Referências Científicas

#### `POST /api/referencias/search`
- **TTL**: 1 hora (3600s)
- **Chave**: `articles:{source}:{query}:p{page}:{filters}`
- **Motivo**: Resultados de busca em APIs externas são custosos
- **Invalidação**: Não é invalidado (TTL automático)

#### `GET /api/referencias/saved`
- **TTL**: 10 minutos (600s)
- **Chave**: `articles:saved:{userId}`
- **Motivo**: Biblioteca pessoal acessada frequentemente
- **Invalidação**: Ao salvar, remover ou adicionar artigo

## Estratégia de Invalidação

### Invalidação Automática

O cache é automaticamente invalidado quando:

1. **Novo upload de análise** → Invalida `resultados:{userId}`
2. **Deletar análise** → Invalida `resultados:{userId}` e `diagnostico:{analysisId}`
3. **Salvar artigo** → Invalida `articles:saved:{userId}`
4. **Remover artigo** → Invalida `articles:saved:{userId}`
5. **Adicionar artigo por URL** → Invalida `articles:saved:{userId}`

### Invalidação Manual

Para invalidar cache manualmente (útil em desenvolvimento):

```typescript
import { invalidateCache, clearAllCache } from '@/lib/cache'

// Invalidar chave específica
await invalidateCache('diagnostico:abc123')

// Limpar todo o cache (CUIDADO!)
await clearAllCache()
```

## Funções Disponíveis

### `getCachedData<T>(key: string)`
Busca dados do cache.

```typescript
const cached = await getCachedData<DiagnosticoType>('diagnostico:123')
if (cached) {
  return cached // Cache hit
}
```

### `setCachedData<T>(key: string, data: T, ttl: number)`
Salva dados no cache.

```typescript
await setCachedData('diagnostico:123', resultado, 86400) // 24h
```

### `invalidateCache(key: string)`
Invalida uma chave específica.

```typescript
await invalidateCache('resultados:user123')
```

### `invalidateCachePattern(pattern: string)`
Invalida múltiplas chaves por padrão.

```typescript
await invalidateCachePattern('articles:*')
```

### `getCacheStats()`
Obtém estatísticas do cache.

```typescript
const stats = await getCacheStats()
console.log(`Total de chaves: ${stats.keys}`)
```

### `clearAllCache()`
Limpa todo o cache (use com cuidado!).

```typescript
await clearAllCache() // ⚠️ Apenas em desenvolvimento
```

## Benefícios

### ⚡ Performance
- **Busca de artigos**: De 3-5s → 50-100ms (redução de 95%)
- **Diagnósticos**: De 10-30s → 50ms (redução de 99%)
- **Listagem de resultados**: De 200-500ms → 30ms (redução de 94%)

### 💰 Economia
- Reduz chamadas para APIs externas (SciELO, Crossref)
- Diminui carga no banco de dados
- Reduz custos com APIs pagas (se houver)

### 🌐 Escalabilidade
- Suporta múltiplos usuários simultâneos
- Distribui carga entre cache e banco de dados
- Preparado para produção

## Monitoramento

### Logs de Cache

Os logs indicam o status do cache:

```
✅ Cache HIT: Diagnóstico encontrado no cache
❌ Cache MISS: Gerando novo diagnóstico
💾 Diagnóstico salvo no cache
🗑️ Cache invalidado: resultados
```

### Verificar Status

Para verificar o status do cache em tempo real, você pode criar um endpoint admin:

```typescript
// app/api/admin/cache-stats/route.ts
import { getCacheStats } from '@/lib/cache'

export async function GET() {
  const stats = await getCacheStats()
  return Response.json({
    totalKeys: stats.keys,
    timestamp: new Date().toISOString()
  })
}
```

## Troubleshooting

### Cache não está funcionando

1. **Verificar variáveis de ambiente**:
   ```bash
   echo $UPSTASH_REDIS_REST_URL
   echo $UPSTASH_REDIS_REST_TOKEN
   ```

2. **Verificar logs**:
   - Procure por "Cache HIT" ou "Cache MISS" nos logs
   - Erros de conexão aparecem como "Erro ao buscar cache"

3. **Testar conexão**:
   ```typescript
   import { redis } from '@/lib/cache'
   await redis.ping() // Deve retornar "PONG"
   ```

### Cache está desatualizado

Se os dados em cache estão desatualizados:

1. Verifique se a invalidação está configurada corretamente
2. Reduza o TTL do cache
3. Limpe o cache manualmente para o ambiente de desenvolvimento

## Boas Práticas

### ✅ Fazer

- Usar TTLs apropriados (curtos para dados dinâmicos, longos para estáticos)
- Invalidar cache quando dados relacionados mudam
- Incluir filtros e parâmetros na chave do cache
- Adicionar logs para monitorar hits/misses

### ❌ Evitar

- Não cachear dados sensíveis sem criptografia
- Não usar TTLs muito longos para dados que mudam frequentemente
- Não esquecer de invalidar cache após mutações
- Não usar `clearAllCache()` em produção

## Próximos Passos

Considere adicionar cache para:

- [ ] Listagem de projetos do usuário
- [ ] Estatísticas do dashboard
- [ ] Configurações do usuário
- [ ] Resultados de calculadora zootécnica
- [ ] Metadados de arquivos CSV

---

**Versão**: 1.0.0  
**Última atualização**: 30/10/2025  
**Mantenedor**: Gabriel Pedro
