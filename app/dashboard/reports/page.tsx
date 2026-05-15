"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, Download, Calendar, Filter, Search, ChevronRight,
  TrendingUp, TrendingDown, Clock, CheckCircle2, AlertTriangle,
  BarChart3, Eye, Sparkles, CloudUpload, Play, Loader2, Shield, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { predictImage } from "@/lib/api"
import { useReportStore, type GeneratedReport } from "@/lib/report-store"

// Seed reports (static demo data)
const seedReports: GeneratedReport[] = [
  {
    id: "RPT-2025-0142",
    title: "Mumbai Central — Q2 Infrastructure Assessment",
    date: "May 12, 2025",
    type: "Quarterly",
    status: "complete",
    detections: 847,
    alerts: 3,
    score: 94,
    summary: "847 infrastructure assets catalogued across the Mumbai Central zone. 3 encroachment zones flagged near Track Section A-12. Vegetation cover stable at 72%. Drainage systems operating within nominal parameters.",
    breakdown: [
      { label: "Buildings", value: 234, color: "#3B82F6" },
      { label: "Tracks", value: 156, color: "#F59E0B" },
      { label: "Vegetation", value: 312, color: "#10B981" },
      { label: "Water Bodies", value: 45, color: "#06B6D4" },
      { label: "Other", value: 100, color: "#8B5CF6" },
    ],
    riskLevel: "Low",
    coverageArea: "12.4 km²",
    processingTime: "4.2s",
    classes: ["urban_land", "agriculture", "barren_land"],
  },
  {
    id: "RPT-2025-0138",
    title: "Delhi NCR — Rail Corridor Analysis",
    date: "May 8, 2025",
    type: "Ad-hoc",
    status: "complete",
    detections: 1203,
    alerts: 7,
    score: 89,
    summary: "High-density analysis of Delhi NCR corridor. 7 risk alerts raised. Encroachment detected in sectors D-4 and D-7. Vegetation cover reduced by 8.2% along eastern railway corridor. Urgent review recommended.",
    breakdown: [
      { label: "Urban Land", value: 520, color: "#3B82F6" },
      { label: "Agriculture", value: 280, color: "#10B981" },
      { label: "Barren Land", value: 203, color: "#F59E0B" },
      { label: "Water", value: 100, color: "#06B6D4" },
      { label: "Rangeland", value: 100, color: "#8B5CF6" },
    ],
    riskLevel: "Medium",
    coverageArea: "18.7 km²",
    processingTime: "6.1s",
    classes: ["urban_land", "agriculture", "barren_land"],
  },
  {
    id: "RPT-2025-0135",
    title: "Chennai Suburban — Track Monitoring",
    date: "May 5, 2025",
    type: "Weekly",
    status: "complete",
    detections: 423,
    alerts: 1,
    score: 97,
    summary: "Routine weekly monitoring. All track segments operational. 1 minor vegetation encroachment flagged for scheduled maintenance. Drainage congestion risk identified in low elevation zone near Tambaram.",
    breakdown: [
      { label: "Tracks", value: 198, color: "#F59E0B" },
      { label: "Vegetation", value: 145, color: "#10B981" },
      { label: "Structures", value: 80, color: "#3B82F6" },
    ],
    riskLevel: "Low",
    coverageArea: "8.2 km²",
    processingTime: "2.8s",
    classes: ["urban_land", "agriculture"],
  },
]

const summaryStats = [
  { label: "Total Reports", value: "156", change: "+12%", trend: "up" },
  { label: "Assets Catalogued", value: "24.8K", change: "+8%", trend: "up" },
  { label: "Risk Alerts", value: "89", change: "-15%", trend: "down" },
  { label: "Avg. Score", value: "93.2", change: "+2.1", trend: "up" }
]

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { reports: generatedReports, generateFromPrediction } = useReportStore()
  const allReports = [...generatedReports, ...seedReports]
  const [selectedReport, setSelectedReport] = useState<GeneratedReport>(allReports[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState(0)
  const [isPdfExporting, setIsPdfExporting] = useState(false)
  const [showDigitModal, setShowDigitModal] = useState(false)
  const [digitSyncing, setDigitSyncing] = useState(false)
  const [digitDone, setDigitDone] = useState(false)
  const [digitRegistryId, setDigitRegistryId] = useState("")

  const filteredReports = searchQuery
    ? allReports.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase()))
    : allReports

  const handleGenerateReport = useCallback(async () => {
    // Try to use a demo image for inference
    setIsGenerating(true)
    setGenProgress(0)

    const interval = setInterval(() => {
      setGenProgress(p => p >= 90 ? 90 : p + 3)
    }, 80)

    try {
      const resp = await fetch("/images/3.png")
      const blob = await resp.blob()
      const file = new File([blob], "report-scan.png", { type: "image/png" })
      const result = await predictImage(file)
      clearInterval(interval)
      setGenProgress(100)
      const report = generateFromPrediction(result)
      setTimeout(() => {
        setSelectedReport(report)
        setIsGenerating(false)
        setGenProgress(0)
      }, 500)
    } catch {
      clearInterval(interval)
      // Fallback: generate a mock report from simulated data
      const mockReport: GeneratedReport = {
        id: `RPT-2025-${Math.floor(Math.random() * 9000) + 1000}`,
        title: `Live Scan — Infrastructure Assessment`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        type: "AI-Generated",
        status: "complete",
        detections: Math.floor(Math.random() * 500) + 200,
        alerts: Math.floor(Math.random() * 5) + 1,
        score: Math.floor(Math.random() * 15) + 85,
        summary: `Live inference completed. ${Math.floor(Math.random() * 500) + 200} assets detected across railway corridor. Encroachment risk assessed as moderate. Vegetation cover within operational thresholds. Drainage systems require seasonal review.`,
        breakdown: [
          { label: "Urban Land", value: Math.floor(Math.random() * 200) + 100, color: "#3B82F6" },
          { label: "Agriculture", value: Math.floor(Math.random() * 150) + 50, color: "#10B981" },
          { label: "Barren Land", value: Math.floor(Math.random() * 100) + 30, color: "#F59E0B" },
          { label: "Water", value: Math.floor(Math.random() * 50) + 10, color: "#06B6D4" },
        ],
        riskLevel: "Medium",
        coverageArea: `${(Math.random() * 15 + 5).toFixed(1)} km²`,
        processingTime: `${(Math.random() * 3 + 1).toFixed(1)}s`,
        classes: ["urban_land", "agriculture", "barren_land"],
      }
      useReportStore.setState(s => ({ reports: [mockReport, ...s.reports] }))
      setSelectedReport(mockReport)
      setIsGenerating(false)
      setGenProgress(0)
    }
  }, [generateFromPrediction])

  return (
    <div className="flex h-[calc(100vh-72px)]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 border-b border-white/[0.04] bg-[#080808] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-[15px] font-semibold text-white">Reports</h1>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-[11px] text-white/40">
              <Calendar className="w-3 h-3" />
              Last 30 days
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 px-3 text-[12px] text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg">
              <Filter className="w-3.5 h-3.5 mr-2" />
              Filter
            </Button>
            <Button
              className="h-9 px-4 bg-white text-black hover:bg-white/90 rounded-xl text-[12px] font-medium shadow-lg shadow-white/10 disabled:opacity-50"
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                  </motion.div>
                  Generating... {genProgress}%
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-premium p-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            {summaryStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="p-4 rounded-xl bg-[#0c0c0c] border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-white/35 font-medium">{stat.label}</span>
                    <span className={cn(
                      "text-[10px] font-semibold flex items-center gap-0.5",
                      stat.trend === "up" ? "text-emerald-400" : "text-red-400"
                    )}>
                      {stat.change}
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                    </span>
                  </div>
                  <div className="text-[22px] font-semibold text-white">{stat.value}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-11 bg-white/[0.02] border-white/[0.04] text-[13px] text-white placeholder:text-white/25 rounded-xl focus:border-white/[0.08] focus:bg-white/[0.03]"
            />
          </div>

          {/* Reports List */}
          <div className="rounded-2xl bg-[#0c0c0c] border border-white/[0.04] overflow-hidden">
            <div className="flex items-center justify-between px-5 h-12 border-b border-white/[0.04]">
              <h3 className="text-[13px] font-semibold text-white">Recent Reports</h3>
              <span className="text-[11px] text-white/30">{filteredReports.length} reports</span>
            </div>
            <div className="divide-y divide-white/[0.03]">
              <AnimatePresence>
                {filteredReports.map((report, i) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.03, duration: 0.4 }}
                    layout
                    onClick={() => setSelectedReport(report)}
                    className={cn(
                      "flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors",
                      selectedReport?.id === report.id 
                        ? "bg-white/[0.03]" 
                        : "hover:bg-white/[0.015]"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      report.type === "AI-Generated" ? "bg-blue-500/10" :
                      report.status === "complete" ? "bg-emerald-500/10" : "bg-amber-500/10"
                    )}>
                      {report.type === "AI-Generated" ? (
                        <Sparkles className="w-[18px] h-[18px] text-blue-400" />
                      ) : report.status === "complete" ? (
                        <CheckCircle2 className="w-[18px] h-[18px] text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-[18px] h-[18px] text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-white truncate">{report.title}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[9px] font-medium flex-shrink-0",
                          report.type === "AI-Generated" ? "bg-blue-500/15 text-blue-400" : "bg-white/[0.04] text-white/40"
                        )}>
                          {report.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-[11px] text-white/30">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {report.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {report.detections} detections
                        </span>
                        {report.alerts > 0 && (
                          <span className="flex items-center gap-1 text-amber-400">
                            <AlertTriangle className="w-3 h-3" />
                            {report.alerts} alerts
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right mr-2">
                      <div className={cn(
                        "text-[17px] font-semibold",
                        report.score >= 95 ? "text-emerald-400" : 
                        report.score >= 90 ? "text-blue-400" : "text-amber-400"
                      )}>
                        {report.score}
                      </div>
                      <div className="text-[10px] text-white/25 font-medium">Score</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Report Preview Panel */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="w-[380px] border-l border-white/[0.04] bg-[#080808] flex flex-col"
      >
        <div className="h-14 border-b border-white/[0.04] flex items-center justify-between px-5">
          <span className="text-[13px] font-semibold text-white">Preview</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/30 hover:text-white/60 hover:bg-white/[0.04] rounded-lg">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/30 hover:text-white/60 hover:bg-white/[0.04] rounded-lg">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {selectedReport && (
          <div key={selectedReport.id} className="flex-1 overflow-y-auto scrollbar-premium p-5 space-y-5">
            {/* Report Header */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] text-white/30 font-mono">{selectedReport.id}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-md text-[9px] font-semibold",
                  selectedReport.status === "complete" 
                    ? "bg-emerald-500/15 text-emerald-400" 
                    : "bg-amber-500/15 text-amber-400"
                )}>
                  {selectedReport.status === "complete" ? "Complete" : "In Review"}
                </span>
              </div>
              <h3 className="text-[14px] font-medium text-white mb-2">{selectedReport.title}</h3>
              <div className="flex items-center gap-3 text-[11px] text-white/35">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {selectedReport.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedReport.type}
                </span>
              </div>
            </motion.div>

            {/* Score */}
            <div>
              <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 px-1">Infrastructure Score</h4>
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center justify-center py-3">
                  <div className="relative">
                    <svg className="w-28 h-28 -rotate-90">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                      <motion.circle
                        cx="56" cy="56" r="48" fill="none"
                        stroke={selectedReport.score >= 95 ? "#10B981" : selectedReport.score >= 90 ? "#3B82F6" : "#F59E0B"}
                        strokeWidth="10" strokeLinecap="round"
                        key={selectedReport.id}
                        initial={{ strokeDasharray: "0 302" }}
                        animate={{ strokeDasharray: `${(selectedReport.score / 100) * 302} 302` }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-[26px] font-semibold text-white">{selectedReport.score}</div>
                        <div className="text-[9px] text-white/30 font-medium">out of 100</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div>
              <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 px-1">AI Summary</h4>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/[0.06] to-transparent border border-emerald-500/10">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[12px] text-white/60 leading-relaxed">{selectedReport.summary}</p>
                </div>
              </motion.div>
            </div>

            {/* Key Metrics */}
            <div>
              <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 px-1">Key Metrics</h4>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
                {[
                  { label: "Total Detections", value: selectedReport.detections.toString() },
                  { label: "Risk Alerts", value: selectedReport.alerts.toString(), color: selectedReport.alerts > 5 ? "text-red-400" : selectedReport.alerts > 0 ? "text-amber-400" : "text-emerald-400" },
                  { label: "Risk Level", value: selectedReport.riskLevel, color: selectedReport.riskLevel === "High" ? "text-red-400" : selectedReport.riskLevel === "Medium" ? "text-amber-400" : "text-emerald-400" },
                  { label: "Coverage Area", value: selectedReport.coverageArea },
                  { label: "Processing Time", value: selectedReport.processingTime },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[12px] text-white/35">{item.label}</span>
                    <span className={cn("text-[13px] font-medium", item.color || "text-white")}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detection Breakdown */}
            <div>
              <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 px-1">Breakdown</h4>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2.5">
                {selectedReport.breakdown.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: item.color }} />
                    <span className="flex-1 text-[12px] text-white/40">{item.label}</span>
                    <span className="text-[12px] font-medium text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Button
                className="w-full h-10 bg-white text-black hover:bg-white/90 rounded-xl text-[12px] font-medium shadow-lg shadow-white/10 disabled:opacity-50"
                onClick={() => {
                  setIsPdfExporting(true)
                  const r = selectedReport
                  const pdfWindow = window.open('', '_blank')
                  if (pdfWindow) {
                    pdfWindow.document.write(`<!DOCTYPE html><html><head><title>${r.id} — GeoVision AI Report</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;background:#fff;color:#111;padding:48px 56px;max-width:800px;margin:0 auto}h1{font-size:22px;margin-bottom:4px}h2{font-size:14px;color:#666;margin-bottom:24px;font-weight:400}.meta{display:flex;gap:24px;margin-bottom:24px;font-size:12px;color:#888}.score-ring{width:100px;height:100px;border-radius:50%;border:8px solid ${r.score>=95?'#10B981':r.score>=90?'#3B82F6':'#F59E0B'};display:flex;align-items:center;justify-content:center;margin:16px auto}.score-val{font-size:32px;font-weight:700}.section{margin-top:28px;border-top:1px solid #eee;padding-top:16px}h3{font-size:13px;text-transform:uppercase;letter-spacing:1.5px;color:#999;margin-bottom:12px}.summary{background:#f8f8f8;padding:16px;border-radius:8px;font-size:13px;line-height:1.7;color:#444}.metric-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px}.metric-label{color:#888}.metric-val{font-weight:600}.breakdown-item{display:flex;align-items:center;gap:10px;padding:6px 0;font-size:13px}.dot{width:10px;height:10px;border-radius:3px}.footer{margin-top:40px;text-align:center;font-size:10px;color:#bbb}</style></head><body><h1>${r.title}</h1><h2>${r.id}</h2><div class="meta"><span>Date: ${r.date}</span><span>Type: ${r.type}</span><span>Status: ${r.status === 'complete' ? 'Complete' : 'In Review'}</span></div><div class="score-ring"><span class="score-val">${r.score}</span></div><div style="text-align:center;font-size:12px;color:#888;margin-bottom:8px">Infrastructure Score</div><div class="section"><h3>AI Summary</h3><div class="summary">${r.summary}</div></div><div class="section"><h3>Key Metrics</h3><div class="metric-row"><span class="metric-label">Total Detections</span><span class="metric-val">${r.detections}</span></div><div class="metric-row"><span class="metric-label">Risk Alerts</span><span class="metric-val">${r.alerts}</span></div><div class="metric-row"><span class="metric-label">Risk Level</span><span class="metric-val">${r.riskLevel}</span></div><div class="metric-row"><span class="metric-label">Coverage Area</span><span class="metric-val">${r.coverageArea}</span></div><div class="metric-row"><span class="metric-label">Processing Time</span><span class="metric-val">${r.processingTime}</span></div></div><div class="section"><h3>Detection Breakdown</h3>${r.breakdown.map(b=>`<div class="breakdown-item"><div class="dot" style="background:${b.color}"></div><span style="flex:1">${b.label}</span><strong>${b.value}</strong></div>`).join('')}</div><div class="footer">Generated by GeoVision AI — Geospatial Intelligence Platform • ${new Date().toISOString()}</div></body></html>`)
                    pdfWindow.document.close()
                    setTimeout(() => { pdfWindow.print(); setIsPdfExporting(false) }, 600)
                  } else { setIsPdfExporting(false) }
                }}
                disabled={isPdfExporting}
              >
                {isPdfExporting ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-2" />}
                {isPdfExporting ? 'Preparing...' : 'Download PDF'}
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 border-white/[0.08] text-white/70 hover:bg-white/[0.04] hover:text-white rounded-xl text-[12px] font-medium"
                onClick={() => { setShowDigitModal(true); setDigitDone(false); setDigitSyncing(false) }}
              >
                <Shield className="w-3.5 h-3.5 mr-2" />
                Push to DIGIT Registry
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* DIGIT Registry Sync Modal */}
      <AnimatePresence>
        {showDigitModal && selectedReport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-[420px] bg-[#0c0c0c] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-[14px] font-semibold text-white">DIGIT Registry Sync</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-white/30 hover:text-white/60" onClick={() => setShowDigitModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-5 space-y-4">
                {!digitDone ? (
                  <>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                      <div className="flex justify-between text-[12px]"><span className="text-white/40">Report</span><span className="text-white font-medium">{selectedReport.id}</span></div>
                      <div className="flex justify-between text-[12px]"><span className="text-white/40">Detections</span><span className="text-white font-medium">{selectedReport.detections}</span></div>
                      <div className="flex justify-between text-[12px]"><span className="text-white/40">Risk Level</span><span className="text-white font-medium">{selectedReport.riskLevel}</span></div>
                      <div className="flex justify-between text-[12px]"><span className="text-white/40">Zone</span><span className="text-white font-medium">NDLS-SECTOR-01</span></div>
                    </div>
                    <Button className="w-full h-10 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-[12px] font-medium disabled:opacity-50" disabled={digitSyncing}
                      onClick={() => {
                        setDigitSyncing(true)
                        setTimeout(() => {
                          setDigitRegistryId(`DIGIT-${Date.now().toString(36).toUpperCase()}`)
                          setDigitSyncing(false)
                          setDigitDone(true)
                        }, 2500)
                      }}
                    >
                      {digitSyncing ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Syncing to DIGIT...</> : <>Push to Registry</>}
                    </Button>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div className="text-[15px] font-semibold text-white mb-1">Registry Sync Complete</div>
                    <div className="text-[12px] text-white/40 mb-4">Assets pushed to DIGIT Urban Governance Platform</div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2 text-left">
                      <div className="flex justify-between text-[12px]"><span className="text-white/40">Registry ID</span><span className="text-emerald-400 font-mono font-medium">{digitRegistryId}</span></div>
                      <div className="flex justify-between text-[12px]"><span className="text-white/40">Assets Indexed</span><span className="text-white font-medium">{selectedReport.detections}</span></div>
                      <div className="flex justify-between text-[12px]"><span className="text-white/40">Compliance</span><span className="text-emerald-400 font-medium">COMPLIANT</span></div>
                      <div className="flex justify-between text-[12px]"><span className="text-white/40">Timestamp</span><span className="text-white/60 font-mono">{new Date().toISOString().slice(0, 19)}</span></div>
                    </div>
                    <Button className="w-full h-10 mt-4 bg-white/[0.06] hover:bg-white/[0.1] text-white/80 rounded-xl text-[12px]" onClick={() => setShowDigitModal(false)}>Done</Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
