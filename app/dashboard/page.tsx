"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Layers, 
  AlertTriangle, 
  MapPin,
  Clock,
  Sparkles,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3x3,
  Eye,
  Crosshair,
  Activity,
  Upload,
  Satellite,
  Building2,
  Train,
  TreePine,
  Send,
  Droplets,
  Target,
  Zap,
  Shield,
  TrendingUp,
  BarChart3,
  Scan,
  Radio,
  CircleDot,
  Waypoints
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { queryCopilot } from "@/lib/api"

// Segmentation regions for animated overlays
const segmentationRegions = [
  { id: "seg-1", x: 15, y: 20, width: 25, height: 18, type: "urban", label: "Urban Zone A" },
  { id: "seg-2", x: 45, y: 35, width: 30, height: 25, type: "vegetation", label: "Green Corridor" },
  { id: "seg-3", x: 20, y: 55, width: 35, height: 20, type: "infrastructure", label: "Rail Network" },
  { id: "seg-4", x: 60, y: 15, width: 25, height: 22, type: "water", label: "Drainage Basin" },
]

// Live detection points on the map
const liveDetections = [
  { id: 1, x: 25, y: 30, type: "railway", label: "Track Section A-12", status: "nominal", confidence: 98, lastScan: "12s ago" },
  { id: 2, x: 45, y: 55, type: "building", label: "Station Complex", status: "nominal", confidence: 96, lastScan: "28s ago" },
  { id: 3, x: 70, y: 40, type: "vegetation", label: "Zone B Clearance", status: "warning", confidence: 89, lastScan: "5s ago" },
  { id: 4, x: 35, y: 70, type: "infrastructure", label: "Bridge Structure", status: "nominal", confidence: 94, lastScan: "45s ago" },
  { id: 5, x: 60, y: 25, type: "railway", label: "Junction Point", status: "nominal", confidence: 97, lastScan: "18s ago" },
]

// Active monitoring zones
const monitoringZones = [
  { id: "zone-1", x: 30, y: 40, radius: 80, label: "Primary Scan Area", active: true },
  { id: "zone-2", x: 65, y: 30, radius: 50, label: "Secondary Watch", active: true },
]

const getDetectionIcon = (type: string) => {
  switch (type) {
    case "railway": return Train
    case "building": return Building2
    case "vegetation": return TreePine
    case "infrastructure": return Layers
    default: return MapPin
  }
}

const getSegmentColor = (type: string) => {
  switch (type) {
    case "urban": return { fill: "rgba(148, 163, 184, 0.12)", stroke: "rgba(148, 163, 184, 0.4)" } // slate
    case "vegetation": return { fill: "rgba(45, 212, 191, 0.08)", stroke: "rgba(45, 212, 191, 0.35)" } // teal
    case "infrastructure": return { fill: "rgba(96, 165, 250, 0.1)", stroke: "rgba(96, 165, 250, 0.4)" } // blue
    case "water": return { fill: "rgba(34, 211, 238, 0.08)", stroke: "rgba(34, 211, 238, 0.3)" } // cyan
    default: return { fill: "rgba(255,255,255,0.05)", stroke: "rgba(255,255,255,0.2)" }
  }
}

// AI Copilot insights
const aiInsights = [
  { id: 1, type: "analysis", message: "High urban density detected in eastern sector. Building coverage at 67% — monitoring for encroachment.", timestamp: "Just now", priority: "normal" },
  { id: 2, type: "alert", message: "Potential drainage congestion risk identified near Track Section A-12. Recommend inspection within 72 hours.", timestamp: "2 min ago", priority: "high" },
  { id: 3, type: "insight", message: "Vegetation coverage in Zone B has decreased 8% since last scan. Clearance protocol may need adjustment.", timestamp: "5 min ago", priority: "medium" },
  { id: 4, type: "status", message: "3 anomalies flagged for manual review. Overall infrastructure integrity score: 94.2%", timestamp: "8 min ago", priority: "normal" },
]

export default function DashboardPage() {
  const [isScanning, setIsScanning] = useState(true)
  const [activeDetection, setActiveDetection] = useState<typeof liveDetections[0] | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [showGrid, setShowGrid] = useState(true)
  const [showSegmentation, setShowSegmentation] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [copilotInput, setCopilotInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [displayedInsights, setDisplayedInsights] = useState<typeof aiInsights>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  // Simulated scan animation - slower, more cinematic
  useEffect(() => {
    if (!isScanning) return
    const interval = setInterval(() => {
      setScanProgress(prev => (prev >= 100 ? 0 : prev + 0.3))
    }, 40)
    return () => clearInterval(interval)
  }, [isScanning])

  // Stream in AI insights with thinking effect
  useEffect(() => {
    const streamInsights = async () => {
      for (let i = 0; i < aiInsights.length; i++) {
        setAiThinking(true)
        await new Promise(r => setTimeout(r, 600))
        setAiThinking(false)
        setIsTyping(true)
        await new Promise(r => setTimeout(r, 400))
        setDisplayedInsights(prev => [...prev, aiInsights[i]])
        setIsTyping(false)
        await new Promise(r => setTimeout(r, 2000))
      }
    }
    streamInsights()
  }, [])

  // Track mouse position for coordinates
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mapRef.current) return
    const rect = mapRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })
  }

  const handleCopilotSubmit = async () => {
    if (!copilotInput.trim()) return
    const query = copilotInput
    setCopilotInput("")
    setAiThinking(true)
    try {
      const res = await queryCopilot(query)
      setAiThinking(false)
      setIsTyping(true)
      setTimeout(() => {
        setDisplayedInsights(prev => [...prev, {
          id: Date.now(),
          type: "response",
          message: res.response,
          timestamp: "Just now",
          priority: "normal"
        }])
        setIsTyping(false)
      }, 400)
    } catch {
      setAiThinking(false)
      setIsTyping(true)
      setTimeout(() => {
        setDisplayedInsights(prev => [...prev, {
          id: Date.now(),
          type: "response",
          message: `Analysis of "${query}": Infrastructure in queried region shows nominal conditions. No immediate action required. Confidence: 96%`,
          timestamp: "Just now",
          priority: "normal"
        }])
        setIsTyping(false)
      }, 800)
    }
  }

  return (
    <div className="h-[calc(100vh-72px)] flex flex-col">
      {/* Compact Top Bar - More muted colors */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-white/[0.04] bg-[#080808]/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-teal-400" />
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-teal-400"
              />
            </div>
            <span className="text-[12px] font-medium text-white/60">Live Monitoring</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1.5 text-[11px] text-white/40">
            <Satellite className="w-3.5 h-3.5" />
            <span>Sentinel-2 · 10m resolution</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1.5 text-[11px] text-white/40">
            <Clock className="w-3.5 h-3.5" />
            <span>Last sync: 30s ago</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/detection">
            <Button className="bg-slate-100 hover:bg-white text-slate-900 h-8 px-4 rounded-lg font-medium text-[12px]">
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload Imagery
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content - Map Hero + AI Copilot */}
      <div className="flex-1 flex overflow-hidden">
        {/* HERO MAP WORKSPACE */}
        <div 
          className="flex-1 relative" 
          ref={mapRef}
          onMouseMove={handleMouseMove}
        >
          {/* Map Container */}
          <div 
            className="absolute inset-0 bg-[#0a0a0a] overflow-hidden"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          >
            {/* Satellite Imagery Background */}
            <div className="absolute inset-0">
              <Image
                src="/images/3.png"
                alt="Satellite imagery"
                fill
                className="object-cover opacity-85"
                priority
              />
              {/* Cinematic overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
            </div>

            {/* Animated Segmentation Overlays */}
            <AnimatePresence>
              {showSegmentation && segmentationRegions.map((region, i) => {
                const colors = getSegmentColor(region.type)
                const isHovered = hoveredSegment === region.id
                return (
                  <motion.div
                    key={region.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      backgroundColor: isHovered ? colors.fill.replace('0.1', '0.2') : colors.fill
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${region.x}%`,
                      top: `${region.y}%`,
                      width: `${region.width}%`,
                      height: `${region.height}%`,
                      backgroundColor: colors.fill,
                      border: `1px solid ${colors.stroke}`,
                      borderRadius: '8px',
                    }}
                    onMouseEnter={() => setHoveredSegment(region.id)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  >
                    {/* Animated border glow */}
                    <motion.div
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                      className="absolute inset-0 rounded-lg"
                      style={{ 
                        boxShadow: `inset 0 0 20px ${colors.stroke}, 0 0 30px ${colors.fill}`
                      }}
                    />
                    
                    {/* Label on hover */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute -top-8 left-2 px-2 py-1 rounded-md bg-black/80 backdrop-blur-sm border border-white/10"
                        >
                          <span className="text-[10px] font-medium text-white/80">{region.label}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Active Monitoring Zones - Soft pulsing circles */}
            {monitoringZones.map((zone, i) => (
              <motion.div
                key={zone.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {/* Outer pulse */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.15, 0, 0.15]
                  }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 1.5 }}
                  className="absolute rounded-full border border-slate-400/20"
                  style={{
                    width: zone.radius * 2,
                    height: zone.radius * 2,
                    left: -zone.radius,
                    top: -zone.radius,
                  }}
                />
                {/* Inner glow */}
                <motion.div
                  animate={{ opacity: [0.08, 0.15, 0.08] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
                  className="absolute rounded-full"
                  style={{
                    width: zone.radius * 1.5,
                    height: zone.radius * 1.5,
                    left: -zone.radius * 0.75,
                    top: -zone.radius * 0.75,
                    background: `radial-gradient(circle, rgba(148,163,184,0.15) 0%, transparent 70%)`
                  }}
                />
                {/* Center dot */}
                <div className="w-2 h-2 rounded-full bg-slate-400/40 absolute -translate-x-1 -translate-y-1" />
              </motion.div>
            ))}

            {/* GIS Grid Overlay - More subtle */}
            <AnimatePresence>
              {showGrid && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px'
                  }}
                />
              )}
            </AnimatePresence>

            {/* AI Scan Sweep - Muted teal instead of neon green */}
            {isScanning && (
              <>
                {/* Primary scan line */}
                <motion.div
                  className="absolute left-0 right-0 pointer-events-none"
                  style={{ 
                    top: `${scanProgress}%`,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.6), transparent)',
                  }}
                />
                {/* Scan glow trail */}
                <motion.div
                  className="absolute left-0 right-0 pointer-events-none"
                  style={{ 
                    top: `${scanProgress}%`,
                    height: '40px',
                    marginTop: '-20px',
                    background: 'linear-gradient(180deg, transparent, rgba(45,212,191,0.08), transparent)',
                  }}
                />
                {/* Scan indicator */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                  style={{ top: `${scanProgress}%` }}
                >
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="w-3 h-3 rounded-full bg-teal-400/50 blur-sm"
                  />
                </motion.div>
              </>
            )}

            {/* Detection Points - Silver/Slate for nominal, keep amber for warnings */}
            {liveDetections.map((detection, i) => {
              const Icon = getDetectionIcon(detection.type)
              const isActive = activeDetection?.id === detection.id
              const isNominal = detection.status === "nominal"
              
              return (
                <motion.div
                  key={detection.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                  className="absolute cursor-pointer group"
                  style={{ left: `${detection.x}%`, top: `${detection.y}%` }}
                  onClick={() => setActiveDetection(isActive ? null : detection)}
                >
                  {/* Soft pulse ring */}
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                    className={cn(
                      "absolute -inset-3 rounded-full",
                      isNominal ? "bg-slate-400/25" : "bg-amber-500/25"
                    )}
                  />
                  
                  {/* Detection marker */}
                  <div className={cn(
                    "relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 backdrop-blur-sm",
                    isActive ? "scale-125" : "group-hover:scale-110",
                    isNominal 
                      ? "bg-slate-500/15 border border-slate-400/30" 
                      : "bg-amber-500/15 border border-amber-500/35"
                  )}>
                    <Icon className={cn(
                      "w-4 h-4",
                      isNominal ? "text-slate-300" : "text-amber-400"
                    )} />
                  </div>

                  {/* Metadata tooltip */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute left-10 top-0 z-50 min-w-[200px]"
                      >
                        <div className="p-4 rounded-xl bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center",
                              isNominal ? "bg-slate-500/20" : "bg-amber-500/20"
                            )}>
                              <Icon className={cn(
                                "w-4 h-4",
                                isNominal ? "text-slate-300" : "text-amber-400"
                              )} />
                            </div>
                            <div>
                              <span className="text-[12px] font-medium text-white block">{detection.label}</span>
                              <span className="text-[10px] text-white/35">{detection.lastScan}</span>
                            </div>
                          </div>
                          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-white/40">Confidence</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${detection.confidence}%` }}
                                    className={cn(
                                      "h-full rounded-full",
                                      isNominal ? "bg-slate-400" : "bg-amber-400"
                                    )}
                                  />
                                </div>
                                <span className="text-white/70 font-medium">{detection.confidence}%</span>
                              </div>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-white/40">Status</span>
                              <span className={cn(
                                "font-medium capitalize flex items-center gap-1.5",
                                isNominal ? "text-teal-400" : "text-amber-400"
                              )}>
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  isNominal ? "bg-teal-400" : "bg-amber-400"
                                )} />
                                {detection.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}

            {/* Crosshair center - More subtle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <Crosshair className="w-6 h-6 text-white/[0.07]" />
            </div>
          </div>

          {/* Floating Controls - Top Left */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
            <div className="flex items-center gap-1 p-1.5 rounded-xl bg-black/50 backdrop-blur-xl border border-white/[0.06]">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 rounded-lg transition-all",
                  isScanning ? "bg-teal-500/15 text-teal-400" : "text-white/40 hover:text-white hover:bg-white/5"
                )}
                onClick={() => setIsScanning(!isScanning)}
              >
                {isScanning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 rounded-lg transition-all",
                  showGrid ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
                )}
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 rounded-lg transition-all",
                  showSegmentation ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
                )}
                onClick={() => setShowSegmentation(!showSegmentation)}
              >
                <Waypoints className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Live Analysis Indicator - Top Right */}
          <div className="absolute top-4 right-[400px] z-20">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black/50 backdrop-blur-xl border border-white/[0.06]"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: isScanning ? 360 : 0 }}
                  transition={{ duration: 2, repeat: isScanning ? Infinity : 0, ease: "linear" }}
                >
                  <Scan className="w-4 h-4 text-teal-400" />
                </motion.div>
                <span className="text-[11px] font-medium text-white/60">AI Analysis</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-white/40">5 zones active</span>
              </div>
            </motion.div>
          </div>

          {/* Floating Controls - Bottom Left - Zoom */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-1 p-1.5 rounded-xl bg-black/50 backdrop-blur-xl border border-white/[0.06] z-20">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
              onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <div className="h-px bg-white/10 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
              onClick={() => setZoom(z => Math.max(z - 0.1, 0.8))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="h-px bg-white/10 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
              onClick={() => setZoom(1)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Floating Stats - Bottom Center */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-6 px-6 py-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/[0.06]"
            >
              <div className="text-center">
                <div className="text-[20px] font-semibold text-white">5</div>
                <div className="text-[10px] text-white/35 uppercase tracking-wider">Active</div>
              </div>
              <div className="h-8 w-px bg-white/[0.08]" />
              <div className="text-center">
                <div className="text-[20px] font-semibold text-slate-300">94%</div>
                <div className="text-[10px] text-white/35 uppercase tracking-wider">Confidence</div>
              </div>
              <div className="h-8 w-px bg-white/[0.08]" />
              <div className="text-center">
                <div className="text-[20px] font-semibold text-white">21.5<span className="text-[12px] text-white/30">km²</span></div>
                <div className="text-[10px] text-white/35 uppercase tracking-wider">Coverage</div>
              </div>
              <div className="h-8 w-px bg-white/[0.08]" />
              <div className="text-center">
                <div className="flex items-center gap-1.5">
                  {isScanning ? (
                    <>
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-teal-400"
                      />
                      <span className="text-[12px] font-medium text-teal-400">Scanning</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                      <span className="text-[12px] font-medium text-slate-400">Paused</span>
                    </>
                  )}
                </div>
                <div className="text-[10px] text-white/35 uppercase tracking-wider mt-0.5">{Math.round(scanProgress)}%</div>
              </div>
            </motion.div>
          </div>

          {/* Coordinates Display - Bottom Right of Map */}
          <div className="absolute bottom-4 right-[400px] z-20">
            <div className="px-3 py-2 rounded-lg bg-black/50 backdrop-blur-xl border border-white/[0.06]">
              <span className="text-[10px] font-mono text-white/40">
                {(19.0760 + (mousePos.y - 50) * 0.001).toFixed(4)}° N, {(72.8777 + (mousePos.x - 50) * 0.001).toFixed(4)}° E
              </span>
            </div>
          </div>
        </div>

        {/* AI COPILOT INTELLIGENCE PANEL - More muted colors */}
        <div className="w-[380px] border-l border-white/[0.04] bg-gradient-to-b from-[#0a0a0a] to-[#060606] flex flex-col flex-shrink-0">
          {/* Premium Panel Header */}
          <div className="relative px-6 py-5 border-b border-white/[0.04]">
            {/* Subtle gradient accent line - slate instead of green */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-400/30 to-transparent" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-400/15 to-slate-500/5 flex items-center justify-center border border-slate-400/15">
                    <Sparkles className="w-5 h-5 text-slate-300" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute -inset-1 rounded-xl border border-slate-400/20"
                  />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-white tracking-tight">GeoVision Intelligence</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    <span className="text-[11px] text-teal-400/70">Operational</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-medium text-white/50">Pro</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="px-5 py-4 border-b border-white/[0.04] bg-white/[0.01]">
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-[18px] font-semibold text-white">247</div>
                <div className="text-[9px] text-white/35 uppercase tracking-wider">Scans</div>
              </div>
              <div className="text-center">
                <div className="text-[18px] font-semibold text-teal-400">94%</div>
                <div className="text-[9px] text-white/35 uppercase tracking-wider">Health</div>
              </div>
              <div className="text-center">
                <div className="text-[18px] font-semibold text-amber-400">3</div>
                <div className="text-[9px] text-white/35 uppercase tracking-wider">Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-[18px] font-semibold text-white">18</div>
                <div className="text-[9px] text-white/35 uppercase tracking-wider">Assets</div>
              </div>
            </div>
          </div>

          {/* AI Insights Stream */}
          <div className="flex-1 overflow-y-auto scrollbar-premium">
            <div className="p-5 space-y-4">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em]">Intelligence Feed</h4>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-400/50" />
                  {aiThinking && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] text-slate-400/70"
                    >
                      Processing...
                    </motion.span>
                  )}
                </div>
              </div>

              {/* AI Thinking State */}
              <AnimatePresence>
                {aiThinking && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-slate-500/[0.06] to-transparent border border-slate-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          >
                            <CircleDot className="w-4 h-4 text-slate-400" />
                          </motion.div>
                        </div>
                      </div>
                      <div>
                        <span className="text-[12px] text-white/60">Analyzing spatial data...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Streamed Insights */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {displayedInsights.map((insight) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "p-4 rounded-xl border transition-all",
                        insight.type === "alert" && "bg-gradient-to-r from-amber-500/[0.06] to-transparent border-amber-500/12",
                        insight.type === "analysis" && "bg-gradient-to-r from-blue-500/[0.06] to-transparent border-blue-500/12",
                        insight.type === "insight" && "bg-gradient-to-r from-violet-500/[0.06] to-transparent border-violet-500/12",
                        insight.type === "status" && "bg-gradient-to-r from-teal-500/[0.06] to-transparent border-teal-500/12",
                        insight.type === "response" && "bg-gradient-to-r from-cyan-500/[0.06] to-transparent border-cyan-500/12"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                          insight.type === "alert" && "bg-amber-500/12",
                          insight.type === "analysis" && "bg-blue-500/12",
                          insight.type === "insight" && "bg-violet-500/12",
                          insight.type === "status" && "bg-teal-500/12",
                          insight.type === "response" && "bg-cyan-500/12"
                        )}>
                          {insight.type === "alert" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                          {insight.type === "analysis" && <BarChart3 className="w-4 h-4 text-blue-400" />}
                          {insight.type === "insight" && <TrendingUp className="w-4 h-4 text-violet-400" />}
                          {insight.type === "status" && <Shield className="w-4 h-4 text-teal-400" />}
                          {insight.type === "response" && <Sparkles className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-white/65 leading-relaxed">{insight.message}</p>
                          <span className="text-[10px] text-white/25 mt-2 block">{insight.timestamp}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 px-4 py-3"
                  >
                    <div className="flex items-center gap-1">
                      <motion.div 
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400"
                      />
                      <motion.div 
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400"
                      />
                      <motion.div 
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400"
                      />
                    </div>
                    <span className="text-[11px] text-white/25">Generating insight...</span>
                  </motion.div>
                )}
              </div>

              {/* Environmental Summary Card */}
              <div className="mt-6">
                <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">Environmental</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                    <TreePine className="w-4 h-4 text-teal-400 mx-auto mb-1.5" />
                    <div className="text-[13px] font-medium text-white">8.2 km²</div>
                    <div className="text-[9px] text-white/30 mt-0.5">Vegetation</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                    <Droplets className="w-4 h-4 text-cyan-400 mx-auto mb-1.5" />
                    <div className="text-[13px] font-medium text-white">5.1 km²</div>
                    <div className="text-[9px] text-white/30 mt-0.5">Water</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                    <Building2 className="w-4 h-4 text-blue-400 mx-auto mb-1.5" />
                    <div className="text-[13px] font-medium text-white">6.3 km²</div>
                    <div className="text-[9px] text-white/30 mt-0.5">Built-up</div>
                  </div>
                </div>
              </div>

              {/* DIGIT Sync Status */}
              <div className="mt-6">
                <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">Registry</h4>
                <div className="p-4 rounded-xl bg-gradient-to-br from-white/[0.02] to-transparent border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/12 flex items-center justify-center">
                        <Target className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <span className="text-[12px] font-medium text-white/75">DIGIT Registry</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      <span className="text-[10px] text-teal-400/80">Synced</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white/30">Last push</span>
                    <span className="text-white/45">2 hours ago · 18 assets</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Copilot Input */}
          <div className="p-4 border-t border-white/[0.04] bg-gradient-to-t from-black/50 to-transparent">
            <div className="relative">
              <input
                type="text"
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCopilotSubmit()}
                placeholder="Ask about infrastructure, risks, or analysis..."
                className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-slate-400/30 focus:bg-white/[0.04] transition-all"
              />
              <Button 
                size="sm" 
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 p-0 bg-slate-400/15 hover:bg-slate-400/25 text-slate-300 rounded-lg border border-slate-400/15"
                onClick={handleCopilotSubmit}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <span className="text-[10px] text-white/20">Powered by</span>
              <span className="text-[10px] text-slate-400/50 font-medium">GeoVision AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
