"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Calendar, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface UserCredits {
  remaining_credits: number
  used_credits: number
  purchased_credits: number
  reset_date: string
  days_until_reset: number
}

interface ResumeCounterProps {
  onCreditsUpdate?: (credits: UserCredits) => void
}

export function ResumeCounter({ onCreditsUpdate }: ResumeCounterProps) {
  const { user } = useAuth()
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
const [minimized, setMinimized] = useState(false)

  const fetchCredits = async () => {
    if (!user) return

    try {
      const response = await fetch("/api/user/credits")
      if (response.ok) {
        const data = await response.json()
        setCredits(data)
        onCreditsUpdate?.(data)
      }
    } catch (error) {
      console.error("Error fetching credits:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCredits()
    }
  }, [user])

  // Expose refresh function globally for other components to use
  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).refreshCredits = fetchCredits
    }
  }, [])

  const handlePurchaseCredits = async () => {
    setPurchasing(true)
    try {
      const response = await fetch("/api/user/purchase-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credits: 20 }),
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        console.error("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Error purchasing credits:", error)
    } finally {
      setPurchasing(false)
    }
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading credits...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!credits) {
    return null
  }

  const totalCredits = 20 + credits.purchased_credits
  const progressPercentage = (credits.remaining_credits / totalCredits) * 100

  const getStatusBadge = () => {
    if (credits.remaining_credits === 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          No Credits
        </Badge>
      )
    } else if (credits.remaining_credits <= 5) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Low Credits
        </Badge>
      )
    } else {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Good
        </Badge>
      )
    }
  }

  return (
<Card className="w-full max-w-4xl mx-auto mb-6">
  <CardContent className="p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Resume Credits</h3>
        {getStatusBadge()}
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => setMinimized((prev) => !prev)}
        className="text-xs"
      >
        {minimized ? "Show" : "Hide"}
      </Button>
    </div>

    {!minimized && (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                Remaining: {credits.remaining_credits} / {totalCredits}
              </span>
              <span>{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Resets in {credits.days_until_reset} days</span>
            </div>
            <div>Used this month: {credits.used_credits}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {credits.remaining_credits === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Wait {credits.days_until_reset} days for reset or buy more
            </p>
          )}
          <Button
            onClick={handlePurchaseCredits}
            disabled={purchasing}
            variant={credits.remaining_credits <= 5 ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            {purchasing ? "Processing..." : "Buy 20 Credits ($5)"}
          </Button>
        </div>
      </div>
    )}
  </CardContent>
</Card>

  )
}
