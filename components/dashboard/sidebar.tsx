"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  ScanSearch, 
  GitCompare, 
  FileText, 
  Radio, 
  Settings,
  Globe,
  ChevronLeft,
  LogOut,
  Bell,
  User,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ScanSearch, label: "Detection", href: "/dashboard/detection" },
  { icon: GitCompare, label: "Change Detection", href: "/dashboard/change-detection" },
  { icon: FileText, label: "Reports", href: "/dashboard/reports" },
  { icon: Radio, label: "Drone Monitoring", href: "/dashboard/drone" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-[#080808] border-r border-white/[0.04]"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-[72px] border-b border-white/[0.04]">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] flex items-center justify-center border border-white/[0.06] flex-shrink-0 overflow-hidden">
          <Globe className="w-5 h-5 text-white/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <span className="text-[15px] font-semibold text-white tracking-tight">GeoVision AI</span>
              <span className="text-[10px] text-white/30 font-medium">Intelligence Platform</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-premium">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-white/[0.06] text-white" 
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavBg"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.08] to-transparent"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn(
                  "w-[18px] h-[18px] flex-shrink-0 relative z-10",
                  isActive && "text-white"
                )} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[13px] font-medium whitespace-nowrap relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !collapsed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 relative z-10"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* System Status */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-3"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/[0.08] to-transparent border border-emerald-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">AI Active</span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed">
                Neural engine operational. 12B parameters loaded.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse Toggle */}
      <div className="px-3 py-3 border-t border-white/[0.04]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full h-9 justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.03] rounded-lg"
        >
          <ChevronLeft className={cn(
            "w-4 h-4 transition-transform duration-200",
            collapsed && "rotate-180"
          )} />
        </Button>
      </div>
    </motion.aside>
  )
}

export function DashboardHeader() {
  return (
    <header className="h-[72px] border-b border-white/[0.04] bg-[#050505]/90 backdrop-blur-2xl flex items-center justify-between px-8">
      <div className="flex items-center gap-5">
        <h1 className="text-[17px] font-semibold text-white tracking-tight">Infrastructure Intelligence</h1>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.04] text-[11px] text-white/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">System Operational</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative w-10 h-10 text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-xl"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2.5 h-10 px-2.5 text-white/50 hover:text-white/80 hover:bg-white/[0.04] rounded-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.02] flex items-center justify-center border border-white/[0.06]">
                <User className="w-4 h-4 text-white/70" />
              </div>
              <span className="hidden md:block text-[13px] font-medium">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-[#0f0f0f] border-white/[0.06] rounded-xl p-1.5">
            <DropdownMenuItem className="text-white/60 hover:text-white focus:text-white focus:bg-white/[0.06] rounded-lg px-3 py-2.5 cursor-pointer">
              <User className="w-4 h-4 mr-2.5 text-white/40" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white/60 hover:text-white focus:text-white focus:bg-white/[0.06] rounded-lg px-3 py-2.5 cursor-pointer">
              <Settings className="w-4 h-4 mr-2.5 text-white/40" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.06] my-1.5" />
            <DropdownMenuItem className="text-white/60 hover:text-white focus:text-white focus:bg-white/[0.06] rounded-lg px-3 py-2.5 cursor-pointer">
              <LogOut className="w-4 h-4 mr-2.5 text-white/40" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
