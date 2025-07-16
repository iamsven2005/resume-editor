import { notFound } from "next/navigation"
import { PortfolioViewer } from "@/components/portfolio-viewer"
import { neon } from "@neondatabase/serverless"

interface PortfolioPageProps {
  params: {
    slug: string
  }
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

  try {
    // Fetch portfolio data
    const portfolios = await sql`
      SELECT 
        id,
        title,
        description,
        theme,
        resume_data,
        is_published,
        portfolio_url,
        created_at,
        updated_at
      FROM portfolios 
      WHERE portfolio_url = ${params.slug}
      LIMIT 1
    `

    if (portfolios.length === 0) {
      notFound()
    }

    const portfolio = portfolios[0]

    // Check if portfolio is published
    if (!portfolio.is_published) {
      notFound()
    }

    // Track portfolio view
    try {
      await sql`
        INSERT INTO portfolio_analytics (portfolio_id, event_type, timestamp, ip_address, user_agent)
        VALUES (${portfolio.id}, 'view', NOW(), '', '')
      `
    } catch (error) {
      console.error("Failed to track portfolio view:", error)
      // Don't fail the page load if analytics fails
    }

    return (
      <div className="min-h-screen">
        <PortfolioViewer
          data={portfolio.resume_data}
          theme={portfolio.theme as "modern" | "classic" | "minimal" | "creative"}
        />
      </div>
    )
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    notFound()
  }
}

export async function generateMetadata({ params }: PortfolioPageProps) {
  const sql = neon(process.env.NEON_DATABASE_URL!)

  try {
    const portfolios = await sql`
      SELECT title, description 
      FROM portfolios 
      WHERE portfolio_url = ${params.slug} AND is_published = true
      LIMIT 1
    `

    if (portfolios.length === 0) {
      return {
        title: "Portfolio Not Found",
      }
    }

    const portfolio = portfolios[0]

    return {
      title: portfolio.title || "Professional Portfolio",
      description: portfolio.description || "View this professional portfolio",
    }
  } catch (error) {
    return {
      title: "Portfolio",
    }
  }
}
