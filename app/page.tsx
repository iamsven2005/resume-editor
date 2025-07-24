import { PanelLayoutManager } from "@/components/panel-layout-manager"
import { ResumeCounter } from "@/components/resume-counter"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <ResumeCounter />
        <PanelLayoutManager />
      </div>
    </div>
  )
}
