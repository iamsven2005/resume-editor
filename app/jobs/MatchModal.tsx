'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageCircle } from 'lucide-react'
import { Job, User } from './jobBoardData'

interface MatchModalProps {
  isOpen: boolean
  onClose: () => void
  matchedItem: Job | User | null
  matchType: 'job' | 'user' | null
  swipeDirection: 'left' | 'right' | 'up' | null
}

export function MatchModal({
  isOpen,
  onClose,
  matchedItem,
  matchType,
  swipeDirection
}: MatchModalProps) {
  if (!matchedItem || !matchType || !swipeDirection) return null

  const getTitle = () => {
    if (swipeDirection === 'right') return "It's a Match! 💕"
    if (swipeDirection === 'up') return 'Super Like! ⭐'
    return 'Not a Match'
  }

  const getDescription = () => {
    if (swipeDirection === 'left') return 'Maybe next time!'

    if (matchType === 'job') {
      const job = matchedItem as Job
      return swipeDirection === 'right'
        ? `You liked ${job.title} at ${job.employer.firstName} ${job.employer.lastName}'s company!`
        : `You super liked ${job.title}! This will boost your application.`
    } else {
      const user = matchedItem as User
      return swipeDirection === 'right'
        ? `You and ${user.firstName} ${user.lastName} liked each other!`
        : `You super liked ${user.firstName} ${user.lastName}!`
    }
  }

  const renderContent = () => {
    if (matchType === 'job') {
      const job = matchedItem as Job
      return (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Avatar className="w-20 h-20">
              <AvatarImage src={job.employer.avatarUrl} />
              <AvatarFallback className="text-2xl">
                {job.employer.firstName[0]}
                {job.employer.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h3 className="text-xl font-bold">{job.title}</h3>
            <p className="text-muted-foreground">
              {job.employer.firstName} {job.employer.lastName}
            </p>
            <Badge variant="outline" className="mt-2">
              {job.jobType}
            </Badge>
          </div>
        </div>
      )
    } else {
      const user = matchedItem as User
      return (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-2xl">
                {user.firstName[0]}
                {user.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h3 className="text-xl font-bold">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-muted-foreground">{user.location}</p>
            <Badge variant="outline" className="mt-2">
              {user.userType === 'seeker'
                ? 'Job Seeker'
                : user.userType === 'employer'
                ? 'Employer'
                : 'Both'}
            </Badge>
          </div>
        </div>
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">{getTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {renderContent()}

          <p className="text-center text-muted-foreground">{getDescription()}</p>

          {swipeDirection !== 'left' ? (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Continue Swiping
              </Button>
              <Button className="flex-1 gap-2" onClick={onClose}>
                <MessageCircle className="w-4 h-4" />
                Send Message
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={onClose}>
              Continue Swiping
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
