import { DashboardSidebar, DashboardHeader } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#050505]">
      <DashboardSidebar />
      <div className="pl-[260px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <DashboardHeader />
        <main className="min-h-[calc(100vh-72px)]">
          {children}
        </main>
      </div>
    </div>
  )
}
