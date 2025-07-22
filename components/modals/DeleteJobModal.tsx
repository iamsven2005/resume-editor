'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import { Job } from '@/app/jobs/jobBoardData'

interface DeleteJobModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  job: Job | null
}

export function DeleteJobModal({ isOpen, onClose, onConfirm, job }: DeleteJobModalProps) {
  if (!job) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <DialogTitle className="text-xl">Delete Job Posting</DialogTitle>
          </div>
          <DialogDescription className="text-left pt-2">
            This action cannot be undone. This will permanently delete the job posting and remove it from all job seekers' feeds.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">{job.title}</h3>
            <div className="flex items-center gap-2">
              <Badge variant={job.jobType === 'full-time' ? 'default' : 'secondary'}>
                {job.jobType}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {job.isRemote ? 'Remote' : job.location}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {job.description}
            </p>
          </div>

          <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Warning: Deleting this job will also remove any pending applications and matches.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
