import { Redis } from '@upstash/redis'

/**
 * Cliente Redis do Upstash para cache de consultas
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

/**
 * Busca dados do cache
 * @param key Chave do cache
 * @returns Dados cacheados ou null se não existir
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key)
    if (!cached) return null
    
    // Se for string, parsear como JSON
    if (typeof cached === 'string') {
      return JSON.parse(cached) as T
    }
    
    return cached as T
  } catch (error) {
    console.error('Erro ao buscar cache:', error)
    return null
  }
}

/**
 * Salva dados no cache
 * @param key Chave do cache
 * @param data Dados a serem cacheados
 * @param ttl Tempo de vida em segundos (padrão: 1 hora)
 */
export async function setCachedData<T>(
  key: string, 
  data: T, 
  ttl: number = 3600
): Promise<void> {
  try {
    const serialized = JSON.stringify(data)
    await redis.setex(key, ttl, serialized)
  } catch (error) {
    console.error('Erro ao salvar cache:', error)
    // Não lançar erro - falha de cache não deve quebrar a aplicação
  }
}

/**
 * Invalida (deleta) uma chave do cache
 * @param key Chave do cache
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Erro ao invalidar cache:', error)
  }
}

/**
 * Invalida múltiplas chaves do cache que correspondam a um padrão
 * @param pattern Padrão de busca (ex: 'articles:*')
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Erro ao invalidar cache por padrão:', error)
  }
}

/**
 * Gera chave única para cache de artigos
 * @param query Termo de pesquisa
 * @param source Fonte da busca
 * @param page Página atual
 * @param filters Filtros aplicados
 * @returns Chave única para o cache
 */
export function generateArticlesCacheKey(
  query: string, 
  source: string, 
  page: number, 
  filters: any
): string {
  // Normalizar query (lowercase, trim)
  const normalizedQuery = query.toLowerCase().trim()
  
  // Criar hash simples dos filtros
  const filtersHash = JSON.stringify(filters || {})
  
  return `articles:${source}:${normalizedQuery}:p${page}:${filtersHash}`
}

/**
 * Estatísticas do cache (útil para debug)
 */
export async function getCacheStats(): Promise<{
  keys: number
}> {
  try {
    const keys = await redis.dbsize()
    
    return {
      keys: keys || 0
    }
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return { keys: 0 }
  }
}

/**
 * Limpa todo o cache (usar com cuidado!)
 */
export async function clearAllCache(): Promise<void> {
  try {
    await redis.flushdb()
    console.log('Cache limpo com sucesso')
  } catch (error) {
    console.error('Erro ao limpar cache:', error)
  }
}
