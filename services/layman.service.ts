/**
 * Layman Service - API calls for Layman Visualization
 * 
 * Handles all API interactions for the layman visualization feature:
 * - Evaluate metrics and get annotations
 * - Fetch and update thresholds
 * - Refresh annotations
 * - Get threshold history
 */

import type {
  EvaluationRequest,
  EvaluationResponse,
  LaymanViewResponse,
  TechnicalViewResponse,
  FarmThresholds,
  ThresholdConfig,
  ThresholdHistoryResponse,
  EntityType
} from '@/lib/layman/types'

export class LaymanService {
  /**
   * Evaluate metrics for an entity and get annotation
   */
  async evaluateMetrics(request: EvaluationRequest): Promise<EvaluationResponse> {
    const response = await fetch('/api/layman/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to evaluate metrics' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get annotation for an entity (layman view)
   */
  async getLaymanAnnotation(entityId: string): Promise<LaymanViewResponse> {
    const response = await fetch(`/api/layman/annotations/${entityId}?view=layman`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get annotation' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get annotation for an entity (technical view)
   */
  async getTechnicalAnnotation(entityId: string): Promise<TechnicalViewResponse> {
    const response = await fetch(`/api/layman/annotations/${entityId}?view=technical`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get annotation' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Refresh annotation for an entity
   */
  async refreshAnnotation(entityId: string, force: boolean = false): Promise<{ task_id: string; status: string }> {
    const response = await fetch(`/api/layman/annotations/${entityId}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ force }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to refresh annotation' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get thresholds for a farm
   */
  async getFarmThresholds(farmId: string): Promise<FarmThresholds> {
    const response = await fetch(`/api/layman/thresholds?farmId=${farmId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get thresholds' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Update thresholds for a farm
   */
  async updateFarmThresholds(
    farmId: string,
    thresholds: ThresholdConfig[],
    preview: boolean = false
  ): Promise<{ farm_id: string; version: string; applied: boolean; preview: boolean; errors: string[] }> {
    const response = await fetch(`/api/layman/thresholds?farmId=${farmId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ thresholds, preview }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update thresholds' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get threshold history for a farm
   */
  async getThresholdHistory(farmId: string): Promise<ThresholdHistoryResponse> {
    const response = await fetch(`/api/layman/thresholds/history?farmId=${farmId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get threshold history' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Convert analysis data to evaluation request
   * Helper to integrate with existing analysis data
   */
  convertAnalysisToEvaluation(
    analysisData: Record<string, unknown>,
    entityType: EntityType,
    farmId: string = 'default_farm'
  ): EvaluationRequest {
    // Safely extract metrics from analysis data
    const numericStats = analysisData.numericStats
    const metrics = (numericStats && typeof numericStats === 'object') 
      ? numericStats as Record<string, { mean?: number }>
      : {}
    
    // Helper function to safely get mean value with multiple possible field names
    const getMeanValue = (...keys: string[]): number | undefined => {
      for (const key of keys) {
        const value = metrics[key]?.mean
        if (typeof value === 'number' && !isNaN(value)) {
          return value
        }
      }
      return undefined
    }
    
    return {
      entity_id: `analysis_${Date.now()}`,
      farm_id: farmId,
      entity_type: entityType,
      metric_values: {
        peso_kg: getMeanValue('PESO_ATUAL_KG', 'peso_atual_kg', 'peso', 'peso_kg'),
        gmd_7d_kg_per_day: getMeanValue('GPD', 'gmd_7d', 'gmd_30d'),
        gmd_30d_kg_per_day: getMeanValue('GPD', 'gmd_30d', 'gmd_7d'),
        bcs: getMeanValue('ESCORE_CORPORAL', 'escore_corporal', 'bcs'),
        biomassa_kg_ha: getMeanValue('BIOMASSA_KG_HA', 'biomassa_kg_ha', 'biomassa'),
        cobertura_pct: getMeanValue('COBERTURA_PCT', 'cobertura_pct', 'cobertura'),
        indice_visual: getMeanValue('INDICE_VISUAL', 'indice_visual', 'indice'),
      }
    }
  }
}

// Export singleton instance
export const laymanService = new LaymanService()
