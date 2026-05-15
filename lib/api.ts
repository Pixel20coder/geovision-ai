/**
 * GeoVision AI — API Client
 * ============================
 * Connects the V0 frontend to the FastAPI backend.
 * Backend runs on port 8000.
 */

import axios from "axios"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 min for large images
})

// ──────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────

export interface DetectedObject {
  class_name: string
  geovision_category: string
  confidence: number
  bbox: number[]
  area_px: number
}

export interface AnalyticsData {
  building_density: number
  vegetation_coverage: number
  urban_density: number
  water_presence: number
  environmental_stress: number
  infrastructure_concentration: number
  risk_score: number
  risk_level: string
}

export interface CopilotContext {
  summary: string
  insights: string[]
  recommendations: string[]
}

export interface EnvironmentalSummary {
  vegetation_index: number
  urban_heat_risk: string
  soil_exposure: string
  green_cover_status: string
  environmental_stress_index: number
}

export interface RiskSummary {
  overall_score: number
  level: string
  encroachment_risk: string
  drainage_risk: string
  deforestation_indicator: string
}

export interface ConfidenceScore {
  class_name: string
  count: number
  avg_confidence: number
  max_confidence: number
  min_confidence: number
}

export interface PredictionResponse {
  success: boolean
  request_id: string
  timestamp: string
  model: string
  model_type: string
  image_size: number[]
  inference_time_ms: number
  total_detections: number
  detections: DetectedObject[]
  detected_classes: string[]
  confidence_scores: ConfidenceScore[]
  overlay_url: string
  summary: Record<string, number>
  analytics: AnalyticsData
  asset_counts: Record<string, number>
  copilot_context: CopilotContext
  environmental_summary: EnvironmentalSummary
  risk_summary: RiskSummary
}

// ──────────────────────────────────────────────
// PREDICTION
// ──────────────────────────────────────────────

export async function predictImage(file: File): Promise<PredictionResponse> {
  const formData = new FormData()
  formData.append("image", file)
  const { data } = await api.post<PredictionResponse>("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  // Fix overlay URL to include backend base
  if (data.overlay_url && !data.overlay_url.startsWith("http")) {
    data.overlay_url = `${API_BASE}${data.overlay_url}`
  }
  return data
}

// ──────────────────────────────────────────────
// HEALTH
// ──────────────────────────────────────────────

export interface HealthResponse {
  status: string
  model_name: string
  model_type: string
  gpu_available: boolean
  uptime_seconds: number
}

export async function checkHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>("/health")
  return data
}

// ──────────────────────────────────────────────
// COPILOT
// ──────────────────────────────────────────────

export interface CopilotResponse {
  response: string
  suggestions: string[]
}

export async function queryCopilot(message: string, context?: string): Promise<CopilotResponse> {
  const { data } = await api.post<CopilotResponse>("/copilot/query", {
    message,
    context: context || undefined,
  })
  return data
}

// ──────────────────────────────────────────────
// DIGIT REGISTRY SYNC
// ──────────────────────────────────────────────

export interface IndexedAsset {
  asset_id: string
  asset_type: string
  category: string
  confidence: number
  area_sq_m: number
  zone: string
  status: string
  compliance: string
}

export interface DigitSyncResponse {
  success: boolean
  registry_id: string
  assets_indexed: number
  sync_timestamp: string
  status: string
  zone: string
  registry_url: string
  compliance_status: string
  indexed_assets: IndexedAsset[]
  metadata: Record<string, unknown>
}

export async function syncToDigit(payload: {
  request_id: string
  detections: DetectedObject[]
  analytics: Record<string, unknown>
  environmental_summary: Record<string, unknown>
  risk_summary: Record<string, unknown>
  zone?: string
  scan_timestamp?: string
}): Promise<DigitSyncResponse> {
  const { data } = await api.post<DigitSyncResponse>("/digit/sync", {
    ...payload,
    zone: payload.zone || "NDLS-SECTOR-01",
    scan_timestamp: payload.scan_timestamp || "",
  })
  return data
}

// ──────────────────────────────────────────────
// REPORTS
// ──────────────────────────────────────────────

export async function generateReport(scanData: Record<string, unknown>) {
  const { data } = await api.post("/generate-report", scanData)
  return data
}

export { API_BASE }
export default api
