import { Suspense } from 'react'
import CandidatesContent from './main'

export default function TopicsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading topics...</div>}>
      <CandidatesContent />
    </Suspense>
  )
}
