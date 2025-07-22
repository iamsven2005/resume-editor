import { Suspense } from 'react'
import TopicsPage from '@/components/TopicsPage'

export default function TopicsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading topics...</div>}>
      <TopicsPage />
    </Suspense>
  )
}
