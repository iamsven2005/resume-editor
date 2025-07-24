"use client"

import { useAuth } from "@/contexts/auth-context"
import { PanelLayoutManager } from "@/components/panel-layout-manager"
import { ResumeCounter } from "@/components/resume-counter"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {user && <ResumeCounter />}
        <PanelLayoutManager />
      </div>
    </div>
  )
}
