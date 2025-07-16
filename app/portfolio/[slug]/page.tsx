import { notFound } from "next/navigation"
import { PortfolioViewer } from "@/components/portfolio-viewer"
import { neon } from "@neondatabase/serverless"

interface PageProps {
  params: {
    slug: string
  }
}

async function getPortfolio(slug: string) {
  try {
    const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

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
      WHERE portfolio_url = ${slug} AND is_published = true
    `

    if (portfolios.length === 0) {
      return null
    }

    const portfolio = portfolios[0]

    // Track portfolio view
    try {
      await sql`
        INSERT INTO portfolio_analytics (portfolio_id, event_type, timestamp)
        VALUES (${portfolio.id}, 'view', NOW())
      `
    } catch (error) {
      console.error("Failed to track portfolio view:", error)
    }

    return portfolio
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return null
  }
}

export default async function PortfolioPage({ params }: PageProps) {
  const portfolio = await getPortfolio(params.slug)

  if (!portfolio) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <PortfolioViewer resumeData={portfolio.resume_data} theme={portfolio.theme || "modern"} />
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const portfolio = await getPortfolio(params.slug)

  if (!portfolio) {
    return {
      title: "Portfolio Not Found",
    }
  }

  const name = portfolio.resume_data?.personalInfo?.name || "Professional"
  const title = portfolio.resume_data?.personalInfo?.title || "Portfolio"

  return {
    title: `${name} - ${title}`,
    description: portfolio.description || `Professional portfolio of ${name}`,
  }
}
