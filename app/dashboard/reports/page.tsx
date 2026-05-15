"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const reports = [
  {
    id: "RPT-2025-0142",
    title: "Mumbai Central - Q2 Infrastructure Assessment",
    date: "May 12, 2025",
    type: "Quarterly",
    status: "complete",
    detections: 847,
    alerts: 3,
    score: 94
  },
  {
    id: "RPT-2025-0138",
    title: "Delhi NCR Rail Corridor Analysis",
    date: "May 8, 2025",
    type: "Ad-hoc",
    status: "complete",
    detections: 1203,
    alerts: 7,
    score: 89
  },
  {
    id: "RPT-2025-0135",
    title: "Chennai Suburban Track Monitoring",
    date: "May 5, 2025",
    type: "Weekly",
    status: "complete",
    detections: 423,
    alerts: 1,
    score: 97
  },
  {
    id: "RPT-2025-0131",
    title: "Howrah Station Perimeter Survey",
    date: "May 1, 2025",
    type: "Monthly",
    status: "review",
    detections: 956,
    alerts: 5,
    score: 91
  },
  {
    id: "RPT-2025-0128",
    title: "Bengaluru Metro Corridor Expansion",
    date: "Apr 28, 2025",
    type: "Ad-hoc",
    status: "complete",
    detections: 678,
    alerts: 2,
    score: 95
  }
]

const summaryStats = [
  { label: "Total Reports", value: "156", change: "+12%", trend: "up" },
  { label: "Assets Catalogued", value: "24.8K", change: "+8%", trend: "up" },
  { label: "Risk Alerts", value: "89", change: "-15%", trend: "down" },
  { label: "Avg. Score", value: "93.2", change: "+2.1", trend: "up" }
]

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReport, setSelectedReport] = useState(reports[0])

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
            <Button className="h-9 px-4 bg-white text-black hover:bg-white/90 rounded-xl text-[12px] font-medium shadow-lg shadow-white/10">
              <FileText className="w-3.5 h-3.5 mr-2" />
              Generate Report
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
              <Button variant="ghost" size="sm" className="h-7 px-3 text-[11px] text-white/35 hover:text-white/60 rounded-md">
                View All
              </Button>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {reports.map((report, i) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
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
                    report.status === "complete" ? "bg-emerald-500/10" : "bg-amber-500/10"
                  )}>
                    {report.status === "complete" ? (
                      <CheckCircle2 className="w-[18px] h-[18px] text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-[18px] h-[18px] text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-white truncate">{report.title}</span>
                      <span className="px-2 py-0.5 rounded-md text-[9px] bg-white/[0.04] text-white/40 font-medium flex-shrink-0">
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
          <div className="flex-1 overflow-y-auto scrollbar-premium p-5 space-y-5">
            {/* Report Header */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
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
            </div>

            {/* Score */}
            <div>
              <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 px-1">Infrastructure Score</h4>
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center justify-center py-3">
                  <div className="relative">
                    <svg className="w-28 h-28 -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="10"
                      />
                      <motion.circle
                        cx="56"
                        cy="56"
                        r="48"
                        fill="none"
                        stroke={selectedReport.score >= 95 ? "#10B981" : selectedReport.score >= 90 ? "#3B82F6" : "#F59E0B"}
                        strokeWidth="10"
                        strokeLinecap="round"
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

            {/* Key Metrics */}
            <div>
              <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 px-1">Key Metrics</h4>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
                {[
                  { label: "Total Detections", value: selectedReport.detections.toString() },
                  { label: "Risk Alerts", value: selectedReport.alerts.toString(), color: selectedReport.alerts > 5 ? "text-red-400" : selectedReport.alerts > 0 ? "text-amber-400" : "text-emerald-400" },
                  { label: "Coverage Area", value: "12.4 km²" },
                  { label: "Processing Time", value: "4.2 hours" },
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
                {[
                  { label: "Buildings", value: 234, color: "#3B82F6" },
                  { label: "Tracks", value: 156, color: "#F59E0B" },
                  { label: "Vegetation", value: 312, color: "#10B981" },
                  { label: "Water Bodies", value: 45, color: "#06B6D4" },
                  { label: "Other", value: 100, color: "#8B5CF6" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div 
                      className="w-2.5 h-2.5 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="flex-1 text-[12px] text-white/40">{item.label}</span>
                    <span className="text-[12px] font-medium text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Button className="w-full h-10 bg-white text-black hover:bg-white/90 rounded-xl text-[12px] font-medium shadow-lg shadow-white/10">
                <Download className="w-3.5 h-3.5 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="w-full h-10 border-white/[0.08] text-white/70 hover:bg-white/[0.04] hover:text-white rounded-xl text-[12px] font-medium">
                Push to DIGIT Registry
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
