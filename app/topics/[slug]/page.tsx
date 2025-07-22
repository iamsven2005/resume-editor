import { Suspense } from "react"
import TopicDetailPage from "./TopicDetailPage"

export default function TopicPageWrapper({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading topic...</div>}>
      <TopicDetailPage slug={params.slug} />
    </Suspense>
  )
}
