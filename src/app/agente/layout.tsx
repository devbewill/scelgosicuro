import { AgenteSidebar } from "@/components/agente/sidebar"

export default function AgenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-warm-white">
      <AgenteSidebar />
      <div className="ml-56 flex flex-1 flex-col">
        {children}
      </div>
    </div>
  )
}
