import { notFound } from "next/navigation"
import { neon } from "@neondatabase/serverless"
import { PortfolioViewer } from "@/components/portfolio-viewer"
import type { Metadata } from "next"

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

async function trackPortfolioView(portfolioId: string, userAgent?: string) {
  try {
    // Update total views
    await sql`
      UPDATE portfolios 
      SET total_views = total_views + 1
      WHERE id = ${portfolioId}
    `

    // Track analytics (simplified - in production you'd want more sophisticated tracking)
    await sql`
      INSERT INTO portfolio_analytics (portfolio_id, view_date, user_agent)
      VALUES (${portfolioId}, CURRENT_DATE, ${userAgent || "unknown"})
      ON CONFLICT (portfolio_id, view_date) 
      DO UPDATE SET view_count = portfolio_analytics.view_count + 1
    `
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

  // Track the view (in a real app, you'd want to do this client-side to avoid bot traffic)
  await trackPortfolioView(portfolio.id)

  return (
    <div className="min-h-screen bg-background">
      <PortfolioViewer portfolio={portfolio} />
    </div>
  )
}
