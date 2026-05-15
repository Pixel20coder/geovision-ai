"use client"

import { create } from "zustand"
import type { PredictionResponse } from "@/lib/api"

export interface GeneratedReport {
  id: string
  title: string
  date: string
  type: string
  status: "complete" | "review"
  detections: number
  alerts: number
  score: number
  summary: string
  breakdown: { label: string; value: number; color: string }[]
  riskLevel: string
  coverageArea: string
  processingTime: string
  classes: string[]
  predictionData?: PredictionResponse
}

function buildReport(pred: PredictionResponse): GeneratedReport {
  const now = new Date()
  const id = `RPT-${now.getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
  const risk = pred.risk_summary
  const alerts = risk.overall_score > 60 ? Math.ceil(risk.overall_score / 20) : risk.overall_score > 30 ? 2 : 1
  const score = Math.max(60, Math.min(99, 100 - Math.round(risk.overall_score * 0.6)))

  const classMap: Record<string, string> = {
    urban_land: "#3B82F6",
    agriculture: "#10B981",
    barren_land: "#F59E0B",
    rangeland: "#8B5CF6",
    water: "#06B6D4",
  }

  const breakdown = Object.entries(pred.asset_counts || pred.summary || {}).map(([label, value]) => ({
    label: label.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    value: value as number,
    color: classMap[label] || "#6B7280",
  }))

  const zones = ["Mumbai Central", "Delhi NCR", "Chennai Suburban", "Howrah", "Bengaluru"]
  const zone = zones[Math.floor(Math.random() * zones.length)]

  const summaryText = pred.copilot_context?.summary
    || `${pred.total_detections} assets detected across ${pred.detected_classes.length} categories. Risk level: ${risk.level}. Encroachment risk: ${risk.encroachment_risk}.`

  return {
    id,
    title: `${zone} — AI Infrastructure Assessment`,
    date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    type: "AI-Generated",
    status: "complete",
    detections: pred.total_detections,
    alerts,
    score,
    summary: summaryText,
    breakdown,
    riskLevel: risk.level,
    coverageArea: `${(Math.random() * 20 + 5).toFixed(1)} km²`,
    processingTime: `${(pred.inference_time_ms / 1000).toFixed(1)}s`,
    classes: pred.detected_classes,
    predictionData: pred,
  }
}

interface ReportStore {
  reports: GeneratedReport[]
  generateFromPrediction: (pred: PredictionResponse) => GeneratedReport
}

export const useReportStore = create<ReportStore>((set, get) => ({
  reports: [],
  generateFromPrediction: (pred) => {
    const report = buildReport(pred)
    set({ reports: [report, ...get().reports] })
    return report
  },
}))
