"use client"

import { motion } from "framer-motion"
import { 
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Key,
  ChevronRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const settingsSections = [
  {
    icon: User,
    title: "Profile",
    description: "Manage your account settings and preferences",
    items: [
      { label: "Name", value: "Admin User", type: "text" },
      { label: "Email", value: "admin@geovision.ai", type: "text" },
      { label: "Organization", value: "Indian Railways", type: "text" },
    ]
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Configure alert and notification preferences",
    items: [
      { label: "Email notifications", enabled: true },
      { label: "Push notifications", enabled: true },
      { label: "Risk alerts", enabled: true },
      { label: "Weekly digest", enabled: false },
    ]
  },
  {
    icon: Shield,
    title: "Security",
    description: "Manage security settings and access controls",
    items: [
      { label: "Two-factor authentication", enabled: true },
      { label: "Session timeout (minutes)", value: "30", type: "number" },
    ]
  },
  {
    icon: Database,
    title: "Data & Storage",
    description: "Manage data retention and storage settings",
    items: [
      { label: "Auto-delete after (days)", value: "365", type: "number" },
      { label: "Compress uploaded images", enabled: true },
    ]
  },
]

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-[#111] border-white/[0.06]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-white">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.items.map((item, j) => (
                  <div key={j} className="flex items-center justify-between py-2">
                    <Label className="text-muted-foreground">{item.label}</Label>
                    {item.type ? (
                      <Input
                        type={item.type}
                        defaultValue={item.value}
                        className="w-48 bg-white/[0.04] border-white/[0.06] text-white"
                      />
                    ) : (
                      <Switch defaultChecked={item.enabled} />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* API Keys */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-[#111] border-white/[0.06]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
                  <Key className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-white">API Keys</CardTitle>
                  <CardDescription>Manage API keys for external integrations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                <div>
                  <div className="text-sm font-medium text-white">Production API Key</div>
                  <div className="text-xs text-muted-foreground font-mono">gv_prod_****************************a1b2</div>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                  Regenerate
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                <div>
                  <div className="text-sm font-medium text-white">DIGIT Registry Token</div>
                  <div className="text-xs text-muted-foreground font-mono">digit_****************************c3d4</div>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end"
        >
          <Button className="bg-white text-black hover:bg-white/90">
            Save Changes
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
