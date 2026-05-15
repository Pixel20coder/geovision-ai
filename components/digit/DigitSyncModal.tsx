"use client"

/**
 * DIGIT Registry Sync Modal
 * ============================
 * Enterprise-grade sync workflow + success confirmation.
 * Demonstrates DIGIT-compatible urban asset registry synchronization.
 */

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, Shield, Check, Database, Globe, FileCheck,
  Server, Link2, ClipboardCheck, BadgeCheck, AlertCircle,
  Building2, TreePine, Mountain, Copy, ExternalLink, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { syncToDigit, type PredictionResponse, type DigitSyncResponse } from "@/lib/api"
import { cn } from "@/lib/utils"

interface DigitSyncModalProps {
  isOpen: boolean
  onClose: () => void
  prediction: PredictionResponse
}

const syncSteps = [
  { icon: ClipboardCheck, label: "Validating detected assets", detail: "Verifying segmentation integrity and confidence thresholds" },
  { icon: Database, label: "Preparing geospatial payload", detail: "Encoding spatial coordinates and mask boundaries" },
  { icon: Server, label: "Mapping infrastructure metadata", detail: "Classifying assets per DIGIT ULB schema v4.2" },
  { icon: Globe, label: "Connecting to DIGIT Registry", detail: "Establishing secure bridge to governance layer" },
  { icon: Link2, label: "Synchronizing assets", detail: "Indexing detected infrastructure into registry" },
  { icon: BadgeCheck, label: "Registry updated", detail: "Assets verified and indexed successfully" },
]

const categoryIcons: Record<string, typeof Building2> = {
  urban_land: Building2, agriculture: TreePine, barren_land: Mountain,
}

export default function DigitSyncModal({ isOpen, onClose, prediction }: DigitSyncModalProps) {
  const [phase, setPhase] = useState<"syncing" | "success" | "error">("syncing")
  const [currentStep, setCurrentStep] = useState(0)
  const [syncResult, setSyncResult] = useState<DigitSyncResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [copied, setCopied] = useState(false)

  const runSync = useCallback(async () => {
    setPhase("syncing")
    setCurrentStep(0)
    setSyncResult(null)

    const stepTimer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= syncSteps.length - 2) { clearInterval(stepTimer); return prev }
        return prev + 1
      })
    }, 600)

    try {
      const result = await syncToDigit({
        request_id: prediction.request_id,
        detections: prediction.detections,
        analytics: prediction.analytics as unknown as Record<string, unknown>,
        environmental_summary: prediction.environmental_summary as unknown as Record<string, unknown>,
        risk_summary: prediction.risk_summary as unknown as Record<string, unknown>,
        scan_timestamp: prediction.timestamp,
      })
      clearInterval(stepTimer)
      setCurrentStep(syncSteps.length)
      setSyncResult(result)
      setTimeout(() => setPhase("success"), 400)
    } catch (err) {
      clearInterval(stepTimer)
      setErrorMsg(err instanceof Error ? err.message : "Sync failed")
      setPhase("error")
    }
  }, [prediction])

  useEffect(() => {
    if (isOpen) runSync()
  }, [isOpen, runSync])

  const copyRegistryId = () => {
    if (syncResult) {
      navigator.clipboard.writeText(syncResult.registry_id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget && phase !== "syncing") onClose() }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

          {phase !== "syncing" && (
            <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors z-10">
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* SYNCING */}
              {phase === "syncing" && (
                <motion.div key="syncing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                    </div>
                    <h2 className="text-base font-bold text-white uppercase tracking-widest">DIGIT Registry Sync</h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">DIGIT-Compatible Urban Asset Synchronization</p>
                  </div>
                  <div className="space-y-2">
                    {syncSteps.map((step, i) => {
                      const Icon = step.icon
                      const isDone = i < currentStep
                      const isActive = i === currentStep
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                          className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
                            isDone ? "border-emerald-500/20 bg-emerald-500/5" : isActive ? "border-white/10 bg-white/[0.03]" : "border-white/5 bg-transparent opacity-40"
                          )}
                        >
                          <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-white/5">
                            {isDone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : isActive ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Icon className="w-3.5 h-3.5 text-white/30" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-[11px] font-semibold", isDone ? "text-emerald-400" : isActive ? "text-white" : "text-white/40")}>{step.label}</p>
                            <p className="text-[9px] text-white/30 truncate">{step.detail}</p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* SUCCESS */}
              {phase === "success" && syncResult && (
                <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="text-center mb-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <BadgeCheck className="w-7 h-7 text-emerald-400" />
                    </motion.div>
                    <h2 className="text-base font-bold text-white">Assets Successfully Synced</h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">DIGIT-Compatible Registry Updated</p>
                  </div>

                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 mb-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] text-white/40 uppercase tracking-widest">Registry ID</span>
                      <button onClick={copyRegistryId} className="flex items-center gap-1.5 text-[9px] text-emerald-400 hover:text-white transition-colors">
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="text-lg font-mono font-bold text-emerald-400 tracking-wider">{syncResult.registry_id}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
                      <p className="text-[8px] text-white/40 uppercase tracking-widest mb-1">Status</p>
                      <p className="text-[11px] font-bold text-emerald-400">Verified</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
                      <p className="text-[8px] text-white/40 uppercase tracking-widest mb-1">Assets</p>
                      <p className="text-lg font-bold text-white">{syncResult.assets_indexed}</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
                      <p className="text-[8px] text-white/40 uppercase tracking-widest mb-1">Compliance</p>
                      <p className={cn("text-[11px] font-bold", syncResult.compliance_status === "FULLY_COMPLIANT" ? "text-emerald-400" : "text-amber-400")}>
                        {syncResult.compliance_status === "FULLY_COMPLIANT" ? "Compliant" : "Review"}
                      </p>
                    </div>
                  </div>

                  {syncResult.indexed_assets.length > 0 && (
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 mb-5">
                      <p className="text-[9px] text-white/40 uppercase tracking-widest mb-3">Indexed Assets</p>
                      <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-premium">
                        {syncResult.indexed_assets.map((asset) => {
                          const Icon = categoryIcons[asset.category] || Building2
                          return (
                            <div key={asset.asset_id} className="flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-2">
                                <Icon className="w-3 h-3 text-white/40" />
                                <span className="text-white font-mono text-[9px]">{asset.asset_id}</span>
                                <span className="text-white/40">{asset.asset_type}</span>
                              </div>
                              <span className={cn("text-[9px] font-semibold",
                                asset.compliance === "COMPLIANT" ? "text-emerald-400" : asset.compliance === "REVIEW_REQUIRED" ? "text-amber-400" : "text-white/40"
                              )}>
                                {asset.compliance === "COMPLIANT" ? "✓" : asset.compliance === "REVIEW_REQUIRED" ? "⚠" : "◎"}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[9px] text-white/30 mb-6">
                    <span>Zone: {syncResult.zone}</span>
                    <span>Protocol: {String(syncResult.metadata?.sync_protocol || "GeoVision-DIGIT-Bridge v1.0")}</span>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={onClose} className="flex-1 h-10 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-[10px] uppercase tracking-widest font-bold">
                      <FileCheck className="w-3.5 h-3.5 mr-2" /> Done
                    </Button>
                    <Button variant="outline" onClick={() => window.open(syncResult.registry_url, "_blank")}
                      className="h-10 px-5 border-white/10 text-white/40 hover:text-white hover:bg-white/5 rounded-xl text-[10px] uppercase tracking-widest">
                      <ExternalLink className="w-3.5 h-3.5 mr-2" /> View
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ERROR */}
              {phase === "error" && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <h2 className="text-base font-bold text-white mb-2">Sync Failed</h2>
                  <p className="text-[11px] text-white/40 mb-6">{errorMsg}</p>
                  <div className="flex gap-3">
                    <Button onClick={runSync} className="flex-1 h-10 bg-white/[0.06] border border-white/10 text-white hover:bg-white/[0.1] rounded-xl text-[10px] uppercase tracking-widest font-bold">Retry</Button>
                    <Button variant="outline" onClick={onClose} className="h-10 px-5 border-white/10 text-white/40 rounded-xl text-[10px] uppercase tracking-widest">Close</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-8 py-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[8px] text-white/20 uppercase tracking-widest">
              <Shield className="w-3 h-3" /> DIGIT-Compatible Synchronization Layer
            </div>
            <span className="text-[8px] text-white/15 font-mono">v1.0</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
