import { notFound } from "next/navigation"
import { neon } from "@neondatabase/serverless"
import { PortfolioViewer } from "@/components/portfolio-viewer"

const sql = neon(process.env.NEON_NEON_NEON_DATABASE_URL!)

interface PortfolioPageProps {
  params: {
    userId: string
    slug: string
  }
}

async function getPortfolio(userId: string, slug: string) {
  try {
    const result = await sql`
      SELECT p.*, u.name as user_name, u.email as user_email
      FROM portfolios p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ${userId} 
      AND p.is_published = true
      AND p.portfolio_url LIKE ${"%" + slug}
    `

    return result[0] || null
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return null
  }
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const portfolio = await getPortfolio(params.userId, params.slug)

  if (!portfolio) {
    notFound()
  }

  return <PortfolioViewer portfolio={portfolio} theme={portfolio.theme} />
}

export async function generateMetadata({ params }: PortfolioPageProps) {
  const portfolio = await getPortfolio(params.userId, params.slug)

  if (!portfolio) {
    return {
      title: "Portfolio Not Found",
    }
  }

  return {
    title: portfolio.title,
    description: portfolio.description || `Professional portfolio of ${portfolio.user_name}`,
    openGraph: {
      title: portfolio.title,
      description: portfolio.description || `Professional portfolio of ${portfolio.user_name}`,
      type: "website",
    },
  }
}
