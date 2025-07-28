"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Zap, Globe, TrendingUp, Star, CheckCircle, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { OnboardingModal } from "./onboarding-modal"

interface LandingPageProps {
  onComplete: (resumeData: any) => void
}

export function LandingPage({ onComplete }: LandingPageProps) {
  const { user } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)

  const features = [
    {
      icon: FileText,
      title: "Professional Templates",
      description: "Choose from beautifully designed resume templates that get you noticed.",
    },
    {
      icon: Zap,
      title: "AI-Powered Suggestions",
      description: "Get intelligent recommendations to improve your resume content.",
    },
    {
      icon: Globe,
      title: "Online Portfolios",
      description: "Create stunning online portfolios to showcase your work.",
    },
    {
      icon: TrendingUp,
      title: "Resume Ranking",
      description: "Compare and rank your resumes against job requirements.",
    },
  ]

  const stats = [
    { number: "50K+", label: "Resumes Created" },
    { number: "95%", label: "Success Rate" },
    { number: "4.9/5", label: "User Rating" },
    { number: "24/7", label: "Support" },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      content: "This resume builder helped me land my dream job at a top tech company!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Marketing Manager",
      content: "The AI suggestions were incredibly helpful in improving my resume.",
      rating: 5,
    },
    {
      name: "Emily Davis",
      role: "Designer",
      content: "Beautiful templates and easy to use. Highly recommended!",
      rating: 5,
    },
  ]

  const handleGetStarted = () => {
    if (user) {
      setShowOnboarding(true)
    } else {
      // Trigger auth dialog or redirect to login
      window.location.href = "/login"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <Badge variant="secondary" className="px-4 py-2">
            <Star className="w-4 h-4 mr-2 fill-current" />
            #1 Resume Builder
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Build Your Perfect Resume in Minutes
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create professional resumes with AI-powered suggestions, beautiful templates, and tools that help you
              stand out from the competition.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
              View Examples
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              20 free resumes/month
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Professional templates
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600">{stat.number}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-muted-foreground">
              Powerful tools and features to create resumes that get results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Professionals Worldwide</h2>
            <p className="text-xl text-muted-foreground">See what our users have to say about their success</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">"{testimonial.content}"</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="py-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build Your Perfect Resume?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of professionals who have successfully landed their dream jobs
              </p>
              <Button size="lg" variant="secondary" onClick={handleGetStarted} className="text-lg px-8 py-6">
                Start Building Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} onComplete={onComplete} />
    </div>
  )
}
