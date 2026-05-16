import { Sidebar } from "@/components/backoffice/sidebar"

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#fbf8f5]">
      <Sidebar />
      <div className="ml-56 flex flex-1 flex-col">
        {children}
      </div>
    </div>
  )
}
