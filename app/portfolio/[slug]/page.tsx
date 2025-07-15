import { notFound } from "next/navigation"
import { neon } from "@neondatabase/serverless"
import { PortfolioViewer } from "@/components/portfolio-viewer"
import type { Metadata } from "next"
import { headers } from "next/headers"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

interface Portfolio {
  id: string
  title: string
  description?: string
  theme: string
  resume_data: any
  is_published: boolean
  portfolio_url: string
  total_views: number
  unique_visitors: number
  views_last_7_days: number
  views_last_30_days: number
  created_at: string
  updated_at: string
}

async function getPortfolio(slug: string): Promise<Portfolio | null> {
  try {
    console.log("Fetching portfolio with slug:", slug)

    const result = await sql`
      SELECT * FROM portfolios 
      WHERE portfolio_url = ${slug} AND is_published = true
    `

    if (result.length === 0) {
      console.log("Portfolio not found or not published")
      return null
    }

    const portfolio = result[0] as Portfolio

    // Parse resume_data if it's a string
    if (typeof portfolio.resume_data === "string") {
      try {
        portfolio.resume_data = JSON.parse(portfolio.resume_data)
      } catch (error) {
        console.error("Error parsing resume_data:", error)
      }
    }

    return portfolio
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return null
  }
}

async function trackPortfolioView(portfolioId: string, request?: any) {
  try {
    console.log("Tracking portfolio view for:", portfolioId)

    // Get request headers for analytics
    const headersList = headers()
    const userAgent = headersList.get("user-agent") || "Unknown"
    const forwardedFor = headersList.get("x-forwarded-for")
    const realIp = headersList.get("x-real-ip")
    const visitorIp = forwardedFor?.split(",")[0] || realIp || "Unknown"

    // Determine device type from user agent
    let deviceType = "Desktop"
    if (userAgent.toLowerCase().includes("mobile")) {
      deviceType = "Mobile"
    } else if (userAgent.toLowerCase().includes("tablet")) {
      deviceType = "Tablet"
    }

    // Extract browser info
    let browser = "Unknown"
    if (userAgent.includes("Chrome")) browser = "Chrome"
    else if (userAgent.includes("Firefox")) browser = "Firefox"
    else if (userAgent.includes("Safari")) browser = "Safari"
    else if (userAgent.includes("Edge")) browser = "Edge"

    // Extract OS info
    let os = "Unknown"
    if (userAgent.includes("Windows")) os = "Windows"
    else if (userAgent.includes("Mac")) os = "macOS"
    else if (userAgent.includes("Linux")) os = "Linux"
    else if (userAgent.includes("Android")) os = "Android"
    else if (userAgent.includes("iOS")) os = "iOS"

    // Insert analytics record
    await sql`
      INSERT INTO portfolio_analytics (
        portfolio_id, visitor_ip, user_agent, device_type, 
        browser, os, pages_viewed, session_duration, created_at
      )
      VALUES (
        ${portfolioId}, ${visitorIp}, ${userAgent}, ${deviceType},
        ${browser}, ${os}, 1, 0, CURRENT_TIMESTAMP
      )
    `

    console.log("Portfolio view tracked successfully")
  } catch (error) {
    console.error("Error tracking portfolio view:", error)
    // Don't fail the page load if analytics fail
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const portfolio = await getPortfolio(params.slug)

  if (!portfolio) {
    return {
      title: "Portfolio Not Found",
      description: "The requested portfolio could not be found.",
    }
  }

  return {
    title: `${portfolio.title} - Portfolio`,
    description: portfolio.description || `View ${portfolio.title}'s professional portfolio`,
    openGraph: {
      title: `${portfolio.title} - Portfolio`,
      description: portfolio.description || `View ${portfolio.title}'s professional portfolio`,
      type: "profile",
    },
  }
}

export default async function PortfolioPage({ params }: { params: { slug: string } }) {
  const portfolio = await getPortfolio(params.slug)

  if (!portfolio) {
    notFound()
  }

  // Track the view with enhanced analytics
  await trackPortfolioView(portfolio.id)

  return (
    <div className="min-h-screen bg-background">
      <PortfolioViewer portfolio={portfolio} />
    </div>
  )
}
