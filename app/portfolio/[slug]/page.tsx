import { notFound } from "next/navigation"
import { PortfolioViewer } from "@/components/portfolio-viewer"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

interface PortfolioPageProps {
  params: {
    slug: string
  }
}

async function getPortfolio(slug: string) {
  try {
    const result = await sql`
      SELECT * FROM portfolios 
      WHERE portfolio_url = ${slug} AND is_published = true
    `

    if (result.length === 0) {
      return null
    }

    // Track portfolio view
    await sql`
      INSERT INTO portfolio_analytics (portfolio_id, event_type, timestamp)
      VALUES (${result[0].id}, 'view', NOW())
    `

    // Update view counts
    await sql`
      UPDATE portfolios 
      SET 
        total_views = total_views + 1,
        views_last_7_days = (
          SELECT COUNT(*) FROM portfolio_analytics 
          WHERE portfolio_id = ${result[0].id} 
          AND event_type = 'view' 
          AND timestamp >= NOW() - INTERVAL '7 days'
        ),
        views_last_30_days = (
          SELECT COUNT(*) FROM portfolio_analytics 
          WHERE portfolio_id = ${result[0].id} 
          AND event_type = 'view' 
          AND timestamp >= NOW() - INTERVAL '30 days'
        )
      WHERE id = ${result[0].id}
    `

    return result[0]
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return null
  }
}

export async function generateMetadata({ params }: PortfolioPageProps) {
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
      type: "website",
    },
  }
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const portfolio = await getPortfolio(params.slug)

  if (!portfolio) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <PortfolioViewer portfolio={portfolio} resumeData={portfolio.resume_data} />
    </div>
  )
}
