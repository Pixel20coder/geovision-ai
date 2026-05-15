"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  GitCompare, 
  Calendar, 
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Building2,
  TreePine,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

const changeData = [
  {
    id: 1,
    type: "building",
    label: "New Construction",
    change: "+12.4%",
    trend: "up",
    icon: Building2,
    color: "#3B82F6",
    description: "3 new structures detected near station area"
  },
  {
    id: 2,
    type: "vegetation",
    label: "Vegetation Loss",
    change: "-8.2%",
    trend: "down",
    icon: TreePine,
    color: "#10B981",
    description: "Cleared area along track corridor"
  },
  {
    id: 3,
    type: "water",
    label: "Water Body Change",
    change: "-2.1%",
    trend: "down",
    icon: Droplets,
    color: "#06B6D4",
    description: "Slight reduction in pond area"
  }
]

const timelineData = [
  { date: "Jan 2024", changes: 12 },
  { date: "Apr 2024", changes: 8 },
  { date: "Jul 2024", changes: 15 },
  { date: "Oct 2024", changes: 6 },
  { date: "Jan 2025", changes: 18 },
  { date: "Apr 2025", changes: 23 },
]

export default function ChangeDetectionPage() {
  const [sliderPosition, setSliderPosition] = useState([50])

  return (
    <div className="flex h-[calc(100vh-72px)]">
      {/* Main Comparison Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b border-white/[0.04] bg-[#080808] flex items-center justify-between px-5">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2.5 text-[12px]">
              <Calendar className="w-3.5 h-3.5 text-white/30" />
              <span className="text-white/40">Before:</span>
              <span className="text-white font-medium">Jan 2024</span>
            </div>
            <ArrowLeftRight className="w-4 h-4 text-white/20" />
            <div className="flex items-center gap-2.5 text-[12px]">
              <Calendar className="w-3.5 h-3.5 text-white/30" />
              <span className="text-white/40">After:</span>
              <span className="text-white font-medium">May 2025</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" className="h-8 px-3 text-[12px] text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg">
              <Download className="w-3.5 h-3.5 mr-2" />
              Export
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-[12px] text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg">
              <Share2 className="w-3.5 h-3.5 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Comparison View */}
        <div className="flex-1 relative overflow-hidden bg-[#050505]">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          
          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)"
          }} />
          
          <div className="absolute inset-10 flex items-center justify-center">
            <div className="relative w-full h-full max-w-5xl max-h-[600px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/[0.06]">
              {/* Before Image */}
              <div 
                className="absolute inset-0"
                style={{ clipPath: `inset(0 ${100 - sliderPosition[0]}% 0 0)` }}
              >
                <img
                  src="/images/5.png"
                  alt="Before"
                  className="w-full h-full object-cover filter grayscale-[30%]"
                />
                <div className="absolute top-5 left-5 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.08] text-[11px] font-mono text-white/80">
                  BEFORE — Jan 2024
                </div>
              </div>

              {/* After Image */}
              <div 
                className="absolute inset-0"
                style={{ clipPath: `inset(0 0 0 ${sliderPosition[0]}%)` }}
              >
                <img
                  src="/images/6.png"
                  alt="After"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-5 right-5 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.08] text-[11px] font-mono text-white/80">
                  AFTER — May 2025
                </div>
              </div>

              {/* Slider Handle */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white/80 cursor-ew-resize z-10"
                style={{ left: `${sliderPosition[0]}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-xl shadow-black/40">
                  <ArrowLeftRight className="w-5 h-5 text-black" />
                </div>
              </div>

              {/* Change Indicators */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="absolute top-[25%] left-[30%] w-24 h-16 border border-amber-500/60 rounded-lg bg-amber-500/10 backdrop-blur-sm"
              >
                <div className="absolute -top-7 left-0 text-[10px] bg-amber-500 text-black px-2.5 py-1 rounded-md font-semibold whitespace-nowrap">
                  New Building
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="absolute top-[55%] right-[25%] w-32 h-20 border border-red-500/60 rounded-lg bg-red-500/10 backdrop-blur-sm"
              >
                <div className="absolute -top-7 left-0 text-[10px] bg-red-500 text-white px-2.5 py-1 rounded-md font-semibold whitespace-nowrap">
                  Vegetation Loss
                </div>
              </motion.div>
            </div>
          </div>

          {/* Slider Control */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-6">
            <div className="rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-white/40 font-medium">Comparison</span>
                <span className="text-[12px] text-white font-mono">{sliderPosition[0]}%</span>
              </div>
              <Slider
                value={sliderPosition}
                onValueChange={setSliderPosition}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2.5 text-[10px] text-white/30 font-medium">
                <span>Before</span>
                <span>After</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Change Analysis */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="w-[380px] border-l border-white/[0.04] bg-[#080808] flex flex-col"
      >
        <div className="h-14 border-b border-white/[0.04] flex items-center px-5">
          <GitCompare className="w-4 h-4 text-white/40 mr-2.5" />
          <span className="text-[13px] font-semibold text-white">Change Analysis</span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-premium p-5 space-y-5">
          {/* Period Selector */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-white/30 hover:text-white/60 hover:bg-white/[0.04] rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1 flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-[10px] text-white/30 font-medium uppercase tracking-wider">From</div>
                  <div className="text-[13px] font-semibold text-white mt-0.5">Jan 2024</div>
                </div>
                <ArrowLeftRight className="w-4 h-4 text-white/20" />
                <div className="text-center">
                  <div className="text-[10px] text-white/30 font-medium uppercase tracking-wider">To</div>
                  <div className="text-[13px] font-semibold text-white mt-0.5">May 2025</div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-white/30 hover:text-white/60 hover:bg-white/[0.04] rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Change Summary */}
          <div>
            <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 px-1">Detected Changes</h4>
            <div className="space-y-2">
              {changeData.map((change) => (
                <motion.div
                  key={change.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: change.id * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.03] hover:border-white/[0.06] transition-all duration-200 cursor-pointer"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${change.color}15` }}
                  >
                    <change.icon className="w-[18px] h-[18px]" style={{ color: change.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-white">{change.label}</span>
                      <span className={cn(
                        "text-[11px] font-semibold",
                        change.trend === "up" ? "text-emerald-400" : "text-red-400"
                      )}>
                        {change.change}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/35 truncate mt-0.5">{change.description}</p>
                  </div>
                  {change.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 px-1">Change Timeline</h4>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03]">
              <div className="h-28 flex items-end gap-1.5">
                {timelineData.map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(item.changes / 25) * 100}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      className="w-full bg-gradient-to-t from-blue-500/20 to-blue-500/50 rounded-t hover:from-blue-500/30 hover:to-blue-500/70 transition-colors cursor-pointer"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3">
                {timelineData.map((item, i) => (
                  <div key={i} className="text-[9px] text-white/30 text-center flex-1 font-medium">
                    {item.date.split(" ")[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Alerts */}
          <div>
            <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 px-1">Impact Assessment</h4>
            <div className="space-y-2">
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/[0.08] to-transparent border border-amber-500/10"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-white">Encroachment Alert</div>
                  <div className="text-[11px] text-white/35 mt-0.5">Review new construction near tracks</div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/[0.08] to-transparent border border-emerald-500/10"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-white">Track Clear</div>
                  <div className="text-[11px] text-white/35 mt-0.5">No obstructions on right-of-way</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
