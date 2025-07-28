"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FileText, Zap, Globe, TrendingUp, Star, CheckCircle, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface LandingModalProps {
  isOpen: boolean
  onClose: () => void
  onGetStarted: () => void
}

export function LandingModal({ isOpen, onClose, onGetStarted }: LandingModalProps) {
  const { user } = useAuth()

  const features = [
    {
      icon: FileText,
      title: "Professional Templates",
      description: "Beautiful resume templates that get you noticed.",
    },
    {
      icon: Zap,
      title: "AI-Powered Suggestions",
      description: "Get intelligent recommendations to improve your content.",
    },
    {
      icon: Globe,
      title: "Online Portfolios",
      description: "Create stunning portfolios to showcase your work.",
    },
    {
      icon: TrendingUp,
      title: "Resume Ranking",
      description: "Compare resumes against job requirements.",
    },
  ]

  const handleGetStarted = () => {
    onGetStarted()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Badge variant="secondary" className="px-4 py-2">
              <Star className="w-4 h-4 mr-2 fill-current" />
              #1 Resume Builder
            </Badge>
          </div>

          <DialogTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to SparkJob!
          </DialogTitle>

          <DialogDescription className="text-lg text-muted-foreground">
            Create professional resumes with AI-powered suggestions, beautiful templates, and tools that help you stand
            out from the competition.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">50K+</div>
              <div className="text-sm text-muted-foreground">Resumes Created</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">95%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">4.9/5</div>
              <div className="text-sm text-muted-foreground">User Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>20 free resumes per month</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Professional templates included</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>AI-powered content suggestions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Export to PDF, Word, and more</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button size="lg" onClick={handleGetStarted} className="flex-1">
              Create Your First Resume
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Explore Features
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-center text-muted-foreground">
            Get started in minutes • No credit card required • Cancel anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
