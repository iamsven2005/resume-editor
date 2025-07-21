import { notFound } from "next/navigation"
import { PortfolioViewer } from "@/components/portfolio-viewer"
import { neon } from "@neondatabase/serverless"

interface PageProps {
  params: {
    slug: string
  }
}

export default async function PortfolioPage({ params }: PageProps) {

  return (
  <div>
  {params.slug}
</div>
  )
}
