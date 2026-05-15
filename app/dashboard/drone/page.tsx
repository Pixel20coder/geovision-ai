"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Radio, Battery, Signal, Thermometer, Wind, Navigation, Camera, Play, Square,
  RotateCcw, Maximize2, Minimize2, MapPin, Clock, Compass, Gauge, Pause, AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type MissionState = "idle" | "active" | "paused"

const fleetData = [
  { id: "DRN-001", name: "Eagle Eye 1", status: "active" as const, battery: 78, altitude: 120, speed: 15.2, lat: 19.0760, lng: 72.8777 },
  { id: "DRN-002", name: "Sky Scout 2", status: "active" as const, battery: 92, altitude: 85, speed: 12.8, lat: 28.6139, lng: 77.2090 },
  { id: "DRN-003", name: "Hawk Vision", status: "idle" as const, battery: 100, altitude: 0, speed: 0, lat: 13.0827, lng: 80.2707 },
]

const defaultTelemetry = (d: typeof fleetData[0]) => ({
  lat: d.lat, lng: d.lng, heading: 45, altitude: d.altitude, speed: d.speed,
  battery: d.battery, temp: 28 + Math.random() * 4, wind: 6 + Math.random() * 8,
  signal: 92 + Math.random() * 8,
})

export default function DroneMonitoringPage() {
  const [selectedDrone, setSelectedDrone] = useState(fleetData[0])
  const [mission, setMission] = useState<MissionState>("active")
  const [fps, setFps] = useState(30)
  const [telemetry, setTelemetry] = useState(defaultTelemetry(fleetData[0]))
  const [flightSeconds, setFlightSeconds] = useState(1425) // 23:45
  const [areaCovered, setAreaCovered] = useState(2.4)
  const [missionProgress, setMissionProgress] = useState(68)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [liveTime, setLiveTime] = useState(new Date())
  const feedRef = useRef<HTMLDivElement>(null)

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Telemetry simulation — only when active
  useEffect(() => {
    if (mission !== "active") return
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        lat: prev.lat + (Math.random() - 0.5) * 0.0001,
        lng: prev.lng + (Math.random() - 0.5) * 0.0001,
        heading: ((prev.heading + (Math.random() - 0.5) * 5) + 360) % 360,
        altitude: Math.max(50, Math.min(200, prev.altitude + (Math.random() - 0.5) * 2)),
        speed: Math.max(5, Math.min(25, prev.speed + (Math.random() - 0.5) * 1)),
        battery: Math.max(0, prev.battery - 0.01),
        temp: Math.max(20, Math.min(40, prev.temp + (Math.random() - 0.5) * 0.3)),
        wind: Math.max(2, Math.min(20, prev.wind + (Math.random() - 0.5) * 0.5)),
        signal: Math.max(70, Math.min(100, prev.signal + (Math.random() - 0.5) * 2)),
      }))
      setFps(Math.round(28 + Math.random() * 4))
      setFlightSeconds(s => s + 1)
      setAreaCovered(a => Math.min(5.0, a + 0.002))
      setMissionProgress(p => Math.min(100, p + 0.05))
    }, 1000)
    return () => clearInterval(interval)
  }, [mission])

  const formatTime = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0")
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0")
    const sec = String(s % 60).padStart(2, "0")
    return `${h}:${m}:${sec}`
  }

  const handleStart = useCallback(() => {
    setMission("active")
  }, [])

  const handleStop = useCallback(() => {
    setMission("paused")
  }, [])

  const handleReset = useCallback(() => {
    setMission("idle")
    setTelemetry(defaultTelemetry(selectedDrone))
    setFlightSeconds(0)
    setAreaCovered(0)
    setMissionProgress(0)
  }, [selectedDrone])

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      feedRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  const selectDrone = useCallback((drone: typeof fleetData[0]) => {
    setSelectedDrone(drone)
    setTelemetry(defaultTelemetry(drone))
    setMission(drone.status === "active" ? "active" : "idle")
    setFlightSeconds(drone.status === "active" ? Math.floor(Math.random() * 2000) : 0)
    setAreaCovered(drone.status === "active" ? +(Math.random() * 3 + 1).toFixed(1) : 0)
    setMissionProgress(drone.status === "active" ? Math.floor(Math.random() * 40 + 40) : 0)
  }, [])

  const signalLabel = telemetry.signal > 90 ? "Strong" : telemetry.signal > 75 ? "Good" : "Weak"
  const signalColor = telemetry.signal > 90 ? "text-emerald-400" : telemetry.signal > 75 ? "text-amber-400" : "text-red-400"
  const batteryRemain = Math.round((telemetry.battery / 100) * 58)

  return (
    <div className="flex h-[calc(100vh-72px)]">
      {/* Main View */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b border-white/[0.04] bg-[#080808] flex items-center justify-between px-5">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", mission === "active" ? "bg-emerald-500 animate-pulse" : mission === "paused" ? "bg-amber-500" : "bg-white/20")} />
              <span className="text-[13px] text-white font-medium">{selectedDrone.name}</span>
              <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase", mission === "active" ? "bg-emerald-500/15 text-emerald-400" : mission === "paused" ? "bg-amber-500/15 text-amber-400" : "bg-white/5 text-white/30")}>
                {mission}
              </span>
            </div>
            <div className="h-4 w-px bg-white/[0.06]" />
            <div className="flex items-center gap-2 text-[12px] text-white/40">
              <Camera className="w-3.5 h-3.5" />
              <span className="font-mono">{mission === "active" ? fps : 0} FPS</span>
            </div>
            <div className={cn("flex items-center gap-2 text-[12px]", signalColor)}>
              <Signal className="w-3.5 h-3.5" />
              <span className="font-medium">{signalLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {mission === "active" ? (
              <Button variant="ghost" size="sm" onClick={handleStop} className="h-8 px-3 text-[12px] text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg">
                <Pause className="w-3.5 h-3.5 mr-2" />Stop
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleStart} className="h-8 px-3 text-[12px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg">
                <Play className="w-3.5 h-3.5 mr-2" />Start
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 px-3 text-[12px] text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg">
              <RotateCcw className="w-3.5 h-3.5 mr-2" />Reset
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-8 w-8 p-0 text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Live Feed */}
        <div ref={feedRef} className="flex-1 relative overflow-hidden bg-[#050505]">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)" }} />
          
          {/* Idle state overlay */}
          <AnimatePresence>
            {mission === "idle" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-7 h-7 text-white/30" />
                  </div>
                  <div className="text-[15px] font-medium text-white/50 mb-2">Drone Standing By</div>
                  <div className="text-[12px] text-white/25 mb-5">Press Start to begin monitoring mission</div>
                  <Button onClick={handleStart} className="h-10 px-6 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-xl text-[13px]">
                    <Play className="w-4 h-4 mr-2" />Start Mission
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Paused overlay */}
          <AnimatePresence>
            {mission === "paused" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <div className="px-6 py-4 rounded-2xl bg-black/70 backdrop-blur-xl border border-amber-500/20 text-center">
                  <Pause className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <div className="text-[13px] font-medium text-amber-400">Mission Paused</div>
                  <div className="text-[11px] text-white/30 mt-1">Feed frozen · Telemetry held</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drone feed */}
          <div className={cn("absolute inset-8", isFullscreen && "inset-4")}>
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/[0.06]">
              <img src="/images/drone-railway-feed.png" alt="Railway corridor surveillance" className={cn("w-full h-full object-cover", mission === "active" ? "opacity-85" : "opacity-50 grayscale-[40%]")} />

              {/* AI Overlay — only when active */}
              {mission === "active" && (
                <div className="absolute inset-0">
                  <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="absolute top-[38%] left-[32%] w-[36%] h-[8%] border border-emerald-500/60 rounded-lg bg-emerald-500/5">
                    <div className="absolute -top-7 left-0 text-[10px] bg-emerald-500 text-black px-2.5 py-1 rounded-md font-semibold whitespace-nowrap">Track Segment 98%</div>
                  </motion.div>
                  <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="absolute top-[42%] left-[30%] w-[14%] h-[16%] border border-blue-500/60 rounded-lg bg-blue-500/5">
                    <div className="absolute -top-7 left-0 text-[10px] bg-blue-500 text-white px-2.5 py-1 rounded-md font-semibold whitespace-nowrap">Railway Bridge 94%</div>
                  </motion.div>
                  <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} className="absolute top-[30%] right-[18%] w-[18%] h-[22%] border border-amber-500/60 rounded-lg bg-amber-500/5">
                    <div className="absolute -top-7 left-0 text-[10px] bg-amber-500 text-black px-2.5 py-1 rounded-md font-semibold whitespace-nowrap">Encroachment Zone 87%</div>
                  </motion.div>
                  <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }} className="absolute top-[55%] left-[12%] w-[20%] h-[18%] border border-cyan-500/60 rounded-lg bg-cyan-500/5">
                    <div className="absolute -top-7 left-0 text-[10px] bg-cyan-500 text-black px-2.5 py-1 rounded-md font-semibold whitespace-nowrap">Vegetation 91%</div>
                  </motion.div>
                  {/* Scan line */}
                  <motion.div animate={{ top: ["0%", "100%"] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                </div>
              )}

              {/* HUD Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {mission === "active" && (
                      <div className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.08] text-[11px] font-mono text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />REC
                      </div>
                    )}
                    <div className={cn("px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.08] text-[11px] font-mono", mission === "active" ? "text-emerald-400" : "text-white/30")}>
                      {mission === "active" ? "AI OVERLAY ACTIVE" : mission === "paused" ? "PAUSED" : "STANDBY"}
                    </div>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.08] text-[11px] font-mono text-white/70">
                    {liveTime.toLocaleTimeString()}
                  </div>
                </div>

                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.08] text-[11px] font-mono text-white/70 flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-white/40" />{telemetry.lat.toFixed(4)}, {telemetry.lng.toFixed(4)}
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.08] text-[11px] font-mono text-white/70 flex items-center gap-2">
                      <Compass className="w-3 h-3 text-white/40" />{Math.round(telemetry.heading)}°
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.08] text-[11px] font-mono text-white/70 flex items-center gap-2">
                      <Gauge className="w-3 h-3 text-white/40" />{telemetry.speed.toFixed(1)} m/s
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.08] text-[11px] font-mono text-white/70">
                      ALT: {Math.round(telemetry.altitude)}m
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className={cn("w-20 h-20 border rounded-full flex items-center justify-center transition-colors", mission === "active" ? "border-white/15" : "border-white/5")}>
                    <div className={cn("w-2 h-2 rounded-full transition-colors", mission === "active" ? "bg-white/40" : "bg-white/10")} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Telemetry */}
      <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }} className="w-[320px] border-l border-white/[0.04] bg-[#080808] flex flex-col">
        <div className="h-14 border-b border-white/[0.04] flex items-center px-5">
          <Radio className="w-4 h-4 text-white/40 mr-2.5" />
          <span className="text-[13px] font-semibold text-white">Telemetry</span>
          <span className={cn("ml-auto px-2 py-0.5 rounded text-[9px] font-semibold", mission === "active" ? "bg-emerald-500/15 text-emerald-400" : mission === "paused" ? "bg-amber-500/15 text-amber-400" : "bg-white/5 text-white/30")}>
            {mission === "active" ? "LIVE" : mission === "paused" ? "HELD" : "OFF"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-premium p-5 space-y-5">
          {/* Fleet */}
          <div>
            <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 px-1">Fleet Status</h4>
            <div className="space-y-1.5">
              {fleetData.map((drone) => (
                <div key={drone.id} onClick={() => selectDrone(drone)} className={cn("flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border", selectedDrone.id === drone.id ? "bg-white/[0.05] border-white/[0.08]" : "bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/[0.04]")}>
                  <div className={cn("w-2 h-2 rounded-full", drone.status === "active" ? "bg-emerald-500" : "bg-white/20")} />
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-white">{drone.name}</div>
                    <div className="text-[10px] text-white/30 font-mono">{drone.id}</div>
                  </div>
                  <div className="text-[11px] text-white/40 font-medium">{drone.battery}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Battery */}
          <div>
            <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 px-1">Battery</h4>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Battery className={cn("w-4 h-4", telemetry.battery < 20 ? "text-red-400" : "text-white/40")} />
                  <span className={cn("text-[22px] font-semibold", telemetry.battery < 20 ? "text-red-400" : "text-white")}>{Math.round(telemetry.battery)}%</span>
                </div>
                <span className="text-[11px] text-white/30">~{batteryRemain} min</span>
              </div>
              <Progress value={telemetry.battery} className="h-1.5" />
              {telemetry.battery < 20 && (
                <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-red-400">
                  <AlertTriangle className="w-3 h-3" />Low battery — RTL recommended
                </div>
              )}
            </div>
          </div>

          {/* Flight Data */}
          <div>
            <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 px-1">Flight Data</h4>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
              {[
                { icon: Navigation, label: "Altitude", value: `${Math.round(telemetry.altitude)}m` },
                { icon: Gauge, label: "Speed", value: `${telemetry.speed.toFixed(1)} m/s` },
                { icon: Compass, label: "Heading", value: `${Math.round(telemetry.heading)}°` },
                { icon: Clock, label: "Flight Time", value: formatTime(flightSeconds) },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[12px] text-white/40"><item.icon className="w-3.5 h-3.5" />{item.label}</div>
                  <span className="text-[13px] font-medium text-white font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Environment */}
          <div>
            <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 px-1">Environment</h4>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
              {[
                { icon: Thermometer, label: "Temperature", value: `${Math.round(telemetry.temp)}°C` },
                { icon: Wind, label: "Wind Speed", value: `${Math.round(telemetry.wind)} km/h`, color: telemetry.wind > 15 ? "text-amber-400" : undefined },
                { icon: Signal, label: "Signal", value: `${Math.round(telemetry.signal)}%`, color: signalColor },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[12px] text-white/40"><item.icon className="w-3.5 h-3.5" />{item.label}</div>
                  <span className={cn("text-[13px] font-medium font-mono", item.color || "text-white")}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mission */}
          <div>
            <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 px-1">Mission</h4>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center justify-between text-[12px] mb-3">
                <span className="text-white/40">Area Covered</span>
                <span className="text-white font-medium font-mono">{areaCovered.toFixed(1)} km²</span>
              </div>
              <Progress value={missionProgress} className="h-1.5" />
              <p className="text-[11px] text-white/30 mt-2.5">{Math.round(missionProgress)}% of planned survey complete</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
