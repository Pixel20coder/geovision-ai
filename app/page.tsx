"use client"

import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { 
  Satellite, 
  Brain, 
  Shield, 
  BarChart3, 
  Layers, 
  Zap,
  ArrowRight,
  ChevronDown,
  Globe,
  Train,
  Building2,
  Radio,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

// Dynamic imports for 3D scenes to avoid SSR issues
const GlobeScene = dynamic(
  () => import("@/components/3d/globe-scene").then(mod => ({ default: mod.GlobeScene })),
  { ssr: false }
)

const FeatureScene = dynamic(
  () => import("@/components/3d/feature-scene").then(mod => ({ default: mod.FeatureScene })),
  { ssr: false }
)

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : "100%" }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-0 z-50 bg-[#050505]/98 backdrop-blur-xl ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <div className="flex flex-col h-full p-6">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">GeoVision AI</span>
          </div>
          <button onClick={onClose} className="p-2 text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex flex-col gap-6 text-2xl">
          <a href="#features" onClick={onClose} className="text-white hover:text-emerald-400 transition-colors">Features</a>
          <a href="#solutions" onClick={onClose} className="text-white hover:text-emerald-400 transition-colors">Solutions</a>
          <a href="#technology" onClick={onClose} className="text-white hover:text-emerald-400 transition-colors">Technology</a>
          <a href="#contact" onClick={onClose} className="text-white hover:text-emerald-400 transition-colors">Contact</a>
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <Button variant="outline" className="w-full border-white/20 text-white py-6">
            Sign In
          </Button>
          <Link href="/dashboard" className="w-full">
            <Button className="w-full bg-white text-black hover:bg-white/90 py-6">
              Launch Platform
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#050505] text-foreground overflow-x-hidden">
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-40 glass"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-semibold text-white">GeoVision AI</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
            <a href="#technology" className="hover:text-white transition-colors">Technology</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" className="hidden sm:inline-flex text-muted-foreground hover:text-white">
              Sign In
            </Button>
            <Link href="/dashboard" className="hidden sm:block">
              <Button className="bg-white text-black hover:bg-white/90 text-sm sm:text-base">
                Launch Platform
                <ArrowRight className="w-4 h-4 ml-2 hidden sm:block" />
              </Button>
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 sm:pt-20 overflow-hidden">
        {/* 3D Globe Background */}
        <div className="absolute inset-0 opacity-60 sm:opacity-80">
          <Suspense fallback={<div className="w-full h-full bg-[#050505]" />}>
            <GlobeScene />
          </Suspense>
        </div>

        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-[#050505]/80 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full glass mb-6 sm:mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs sm:text-sm text-muted-foreground">Powering Smart Infrastructure Nationwide</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight text-balance"
            >
              AI-Powered Spatial
              <br />
              <span className="gradient-text">Intelligence</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-10 max-w-3xl mx-auto text-pretty px-4"
            >
              Transform satellite imagery into actionable insights for 
              Indian Railways and Smart Cities with advanced computer vision.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
            >
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-white/90 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg">
                  Start Detection
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg">
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mt-12 sm:mt-20 pt-8 sm:pt-10 border-t border-white/10"
            >
              {[
                { value: "99.7%", label: "Detection Accuracy" },
                { value: "500K+", label: "Images Processed" },
                { value: "200+", label: "Railway Stations" },
                { value: "50ms", label: "Inference Time" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs sm:text-sm">Explore</span>
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12 sm:mb-20"
          >
            <motion.span variants={fadeInUp} className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
              Core Capabilities
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-4 mb-4 sm:mb-6 text-balance">
              Enterprise-Grade Intelligence
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive suite of AI tools designed for infrastructure monitoring and urban planning at scale.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {[
              {
                icon: Satellite,
                title: "Satellite Analysis",
                description: "Process high-resolution satellite imagery with semantic segmentation for land use classification."
              },
              {
                icon: Brain,
                title: "AI Detection Engine",
                description: "State-of-the-art computer vision models trained on millions of Indian infrastructure samples."
              },
              {
                icon: Layers,
                title: "Change Detection",
                description: "Automated temporal analysis to detect infrastructure changes and urban expansion over time."
              },
              {
                icon: Radio,
                title: "Drone Integration",
                description: "Real-time drone telemetry processing with live AI overlay for on-site inspection."
              },
              {
                icon: Shield,
                title: "DIGIT Registry Sync",
                description: "Seamless integration with government DIGIT platform for asset registration and compliance."
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                description: "Comprehensive insights with customizable reports, risk assessments, and executive summaries."
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="group p-6 sm:p-8 rounded-2xl glass hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Technology Section with 3D */}
      <section id="technology" className="py-20 sm:py-32 relative overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 opacity-40 sm:opacity-60">
          <Suspense fallback={null}>
            <FeatureScene />
          </Suspense>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12 sm:mb-20"
          >
            <motion.span variants={fadeInUp} className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
              Advanced Technology
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-4 mb-4 sm:mb-6 text-balance">
              Powered by Neural Networks
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Our proprietary AI models are trained on petabytes of geospatial data, delivering unmatched accuracy.
            </motion.p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { value: "12B+", label: "Parameters", desc: "Neural network scale" },
              { value: "99.7%", label: "Accuracy", desc: "Object detection" },
              { value: "47ms", label: "Latency", desc: "Real-time inference" },
              { value: "1PB+", label: "Training Data", desc: "Satellite imagery" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 sm:p-8 text-center"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-2">{item.value}</div>
                <div className="text-base sm:text-lg font-semibold text-white mb-1">{item.label}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center"
          >
            <div>
              <motion.span variants={fadeInUp} className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
                Industry Solutions
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-4 mb-4 sm:mb-6 text-balance">
                Built for Critical Infrastructure
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10">
                Purpose-built solutions for the unique challenges of railway operations and urban governance.
              </motion.p>

              <motion.div variants={staggerContainer} className="space-y-4 sm:space-y-6">
                {[
                  {
                    icon: Train,
                    title: "Indian Railways",
                    description: "Track monitoring, station area analysis, encroachment detection, and right-of-way management."
                  },
                  {
                    icon: Building2,
                    title: "Smart Cities",
                    description: "Urban planning support, land use classification, drainage analysis, and green cover monitoring."
                  },
                  {
                    icon: Globe,
                    title: "Government Bodies",
                    description: "Compliance reporting, asset inventory, environmental monitoring, and policy planning support."
                  }
                ].map((solution, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    className="flex gap-4 sm:gap-5 p-4 sm:p-6 rounded-xl glass"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center flex-shrink-0">
                      <solution.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">{solution.title}</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">{solution.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Detection Preview */}
              <div className="relative rounded-2xl overflow-hidden glass p-2">
                <div className="rounded-xl overflow-hidden bg-[#0A0A0A] aspect-[4/3] relative">
                  {/* Simulated satellite image placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-blue-900/20 to-slate-900/40" />
                  
                  {/* Grid overlay */}
                  <div className="absolute inset-0 grid-pattern opacity-30" />
                  
                  {/* Scan animation */}
                  <motion.div
                    animate={{ y: ["-100%", "200%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent"
                  />

                  {/* Detection boxes */}
                  <div className="absolute top-[20%] left-[15%] w-16 sm:w-24 h-12 sm:h-16 border-2 border-emerald-500/70 rounded">
                    <div className="absolute -top-5 sm:-top-6 left-0 text-[10px] sm:text-xs bg-emerald-500 text-black px-1.5 sm:px-2 py-0.5 rounded">
                      Building 94%
                    </div>
                  </div>
                  <div className="absolute top-[45%] left-[40%] w-20 sm:w-32 h-10 sm:h-12 border-2 border-blue-500/70 rounded">
                    <div className="absolute -top-5 sm:-top-6 left-0 text-[10px] sm:text-xs bg-blue-500 text-black px-1.5 sm:px-2 py-0.5 rounded">
                      Track 98%
                    </div>
                  </div>
                  <div className="absolute top-[60%] right-[20%] w-14 sm:w-20 h-14 sm:h-20 border-2 border-amber-500/70 rounded">
                    <div className="absolute -top-5 sm:-top-6 left-0 text-[10px] sm:text-xs bg-amber-500 text-black px-1.5 sm:px-2 py-0.5 rounded">
                      Vegetation 89%
                    </div>
                  </div>

                  {/* Corner indicators */}
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 text-[10px] sm:text-xs text-emerald-500 font-mono">
                    LIVE DETECTION
                  </div>
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center gap-1 sm:gap-2">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">PROCESSING</span>
                  </div>
                </div>
              </div>

              {/* Floating stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-4 sm:-bottom-6 -left-2 sm:-left-6 glass rounded-xl p-3 sm:p-4"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-white">47ms</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Avg. Inference</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 sm:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-white/[0.02] to-transparent" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 text-balance">
              Ready to Transform Your Infrastructure Intelligence?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto">
              Join leading government bodies and enterprises using GeoVision AI for critical infrastructure monitoring.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-white/90 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg">
                  Launch Platform
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg">
                Request Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="text-base sm:text-lg font-semibold text-white">GeoVision AI</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              2026 GeoVision AI
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
