"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Radio,
  Battery,
  Signal,
  Thermometer,
  Wind,
  Navigation,
  Camera,
  Play,
  Square,
  RotateCcw,
  Maximize2,
  MapPin,
  Clock,
  Compass,
  Gauge
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const drones = [
  { id: "DRN-001", name: "Eagle Eye 1", status: "active", battery: 78, altitude: 120, speed: 15.2 },
  { id: "DRN-002", name: "Sky Scout 2", status: "active", battery: 92, altitude: 85, speed: 12.8 },
  { id: "DRN-003", name: "Hawk Vision", status: "idle", battery: 100, altitude: 0, speed: 0 },
]

export default function DroneMonitoringPage() {
  const [selectedDrone, setSelectedDrone] = useState(drones[0])
  const [isRecording, setIsRecording] = useState(true)
  const [fps, setFps] = useState(30)
  const [telemetry, setTelemetry] = useState({
    lat: 19.0760,
    lng: 72.8777,
    heading: 45,
    altitude: 120,
    speed: 15.2,
    battery: 78
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        lat: prev.lat + (Math.random() - 0.5) * 0.0001,
        lng: prev.lng + (Math.random() - 0.5) * 0.0001,
        heading: (prev.heading + (Math.random() - 0.5) * 5) % 360,
        altitude: Math.max(50, Math.min(200, prev.altitude + (Math.random() - 0.5) * 2)),
        speed: Math.max(5, Math.min(25, prev.speed + (Math.random() - 0.5) * 1)),
        battery: Math.max(0, prev.battery - 0.01)
      }))
      setFps(Math.round(28 + Math.random() * 4))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-[calc(100vh-72px)]">
      {/* Main View */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b border-white/[0.04] bg-[#080808] flex items-center justify-between px-5">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[13px] text-white font-medium">{selectedDrone.name}</span>
            </div>
            <div className="h-4 w-px bg-white/[0.06]" />
            <div className="flex items-center gap-2 text-[12px] text-white/40">
              <Camera className="w-3.5 h-3.5" />
              <span className="font-mono">{fps} FPS</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-emerald-400">
              <Signal className="w-3.5 h-3.5" />
              <span className="font-medium">Strong</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
              className={cn(
                "h-8 px-3 text-[12px] rounded-lg",
                isRecording ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              )}
            >
              {isRecording ? <Square className="w-3.5 h-3.5 mr-2" /> : <Play className="w-3.5 h-3.5 mr-2" />}
              {isRecording ? "Stop" : "Start"}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-[12px] text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg">
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
              Reset
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Live Feed */}
        <div className="flex-1 relative overflow-hidden bg-[#050505]">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          
          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)"
          }} />
          
          {/* Simulated drone feed */}
          <div className="absolute inset-8">
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/[0.06]">
              <img
                src="/images/7.png"
                alt="Drone feed"
                className="w-full h-full object-cover opacity-85"
              />

              {/* AI Overlay */}
              <div className="absolute inset-0">
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-[30%] left-[20%] w-32 h-24 border border-emerald-500/60 rounded-lg bg-emerald-500/5"
                >
                  <div className="absolute -top-7 left-0 text-[10px] bg-emerald-500 text-black px-2.5 py-1 rounded-md font-semibold">
                    Track Segment 98%
                  </div>
                </motion.div>

                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute top-[50%] right-[30%] w-24 h-20 border border-blue-500/60 rounded-lg bg-blue-500/5"
                >
                  <div className="absolute -top-7 left-0 text-[10px] bg-blue-500 text-white px-2.5 py-1 rounded-md font-semibold">
                    Structure 94%
                  </div>
                </motion.div>
              </div>

              {/* HUD Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top bar */}
                <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.08] text-[11px] font-mono text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      REC
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.08] text-[11px] font-mono text-emerald-400">
                      AI OVERLAY ACTIVE
                    </div>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.08] text-[11px] font-mono text-white/70">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.08] text-[11px] font-mono text-white/70 flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-white/40" />
                        {telemetry.lat.toFixed(4)}, {telemetry.lng.toFixed(4)}
                      </div>
                      <div className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.08] text-[11px] font-mono text-white/70 flex items-center gap-2">
                        <Compass className="w-3 h-3 text-white/40" />
                        {Math.round(telemetry.heading)}°
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.08] text-[11px] font-mono text-white/70 flex items-center gap-2">
                        <Gauge className="w-3 h-3 text-white/40" />
                        {telemetry.speed.toFixed(1)} m/s
                      </div>
                      <div className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.08] text-[11px] font-mono text-white/70">
                        ALT: {Math.round(telemetry.altitude)}m
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-20 h-20 border border-white/15 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white/40 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Telemetry */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="w-[320px] border-l border-white/[0.04] bg-[#080808] flex flex-col"
      >
        <div className="h-14 border-b border-white/[0.04] flex items-center px-5">
          <Radio className="w-4 h-4 text-white/40 mr-2.5" />
          <span className="text-[13px] font-semibold text-white">Telemetry</span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-premium p-5 space-y-5">
          {/* Drone Selector */}
          <div>
            <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 px-1">Fleet Status</h4>
            <div className="space-y-1.5">
              {drones.map((drone) => (
                <div
                  key={drone.id}
                  onClick={() => setSelectedDrone(drone)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border",
                    selectedDrone.id === drone.id 
                      ? "bg-white/[0.05] border-white/[0.08]" 
                      : "bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/[0.04]"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    drone.status === "active" ? "bg-emerald-500" : "bg-white/20"
                  )} />
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-white">{drone.name}</div>
                    <div className="text-[10px] text-white/30 font-mono">{drone.id}</div>
                  </div>
                  <div className="text-[11px] text-white/40 font-medium">
                    {drone.battery}%
                  </div>
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
                  <Battery className="w-4 h-4 text-white/40" />
                  <span className="text-[22px] font-semibold text-white">{Math.round(telemetry.battery)}%</span>
                </div>
                <span className="text-[11px] text-white/30">~45 min</span>
              </div>
              <Progress value={telemetry.battery} className="h-1.5" />
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
                { icon: Clock, label: "Flight Time", value: "00:23:45" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[12px] text-white/40">
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </div>
                  <span className="text-[13px] font-medium text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Environment */}
          <div>
            <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 px-1">Environment</h4>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
              {[
                { icon: Thermometer, label: "Temperature", value: "28°C" },
                { icon: Wind, label: "Wind Speed", value: "8 km/h" },
                { icon: Signal, label: "Signal", value: "Strong", color: "text-emerald-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[12px] text-white/40">
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </div>
                  <span className={cn("text-[13px] font-medium", item.color || "text-white")}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Status */}
          <div>
            <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 px-1">Mission</h4>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center justify-between text-[12px] mb-3">
                <span className="text-white/40">Area Covered</span>
                <span className="text-white font-medium">2.4 km²</span>
              </div>
              <Progress value={68} className="h-1.5" />
              <p className="text-[11px] text-white/30 mt-2.5">68% of planned survey complete</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
