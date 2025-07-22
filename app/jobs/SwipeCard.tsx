'use client'

import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Clock, DollarSign, Heart, X, Star } from 'lucide-react'
import { Job, User } from './jobBoardData'

interface SwipeCardProps {
  data: Job | User
  type: 'job' | 'user'
  onSwipe: (direction: 'left' | 'right' | 'up') => void
}

export function SwipeCard({ data, type, onSwipe }: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    startPos.current = { x: e.clientX, y: e.clientY }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    const touch = e.touches[0]
    startPos.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - startPos.current.x
    const deltaY = e.clientY - startPos.current.y
    setDragOffset({ x: deltaX, y: deltaY })
    setRotation(deltaX * 0.1)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const touch = e.touches[0]
    const deltaX = touch.clientX - startPos.current.x
    const deltaY = touch.clientY - startPos.current.y
    setDragOffset({ x: deltaX, y: deltaY })
    setRotation(deltaX * 0.1)
  }

  const handleRelease = () => {
    if (!isDragging) return
    setIsDragging(false)

    const threshold = 100

    if (Math.abs(dragOffset.x) > threshold) {
      onSwipe(dragOffset.x > 0 ? 'right' : 'left')
    } else if (dragOffset.y < -threshold) {
      onSwipe('up')
    }

    setDragOffset({ x: 0, y: 0 })
    setRotation(0)
  }

  const renderJobCard = (job: Job) => (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">{job.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="w-6 h-6">
              <AvatarImage src={job.employer.avatarUrl} />
              <AvatarFallback>{job.employer.firstName[0]}{job.employer.lastName[0]}</AvatarFallback>
            </Avatar>
            <span>{job.employer.firstName} {job.employer.lastName}</span>
          </div>
        </div>
        <Badge variant={job.jobType === 'full-time' ? 'default' : 'secondary'}>
          {job.jobType}
        </Badge>
      </div>

      <p className="text-muted-foreground leading-relaxed">{job.description}</p>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>{job.isRemote ? 'Remote' : job.location}</span>
          {job.isRemote && job.location !== 'Remote' && (
            <span className="text-muted-foreground">• {job.location}</span>
          )}
        </div>

        {job.salaryMin && job.salaryMax && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>
              ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} {job.currency}
              {job.jobType === 'contract' && '/hour'}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Required Skills:</p>
        <div className="flex flex-wrap gap-2">
          {job.requiredSkills.map(skillReq => (
            <Badge
              key={skillReq.skill.id}
              variant={skillReq.isRequired ? 'default' : 'outline'}
              className="text-xs"
            >
              {skillReq.skill.name}
              {skillReq.isRequired && ' *'}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )

  const renderUserCard = (user: User) => (
    <div className="p-6 space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback className="text-lg">{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground">
            {user.firstName} {user.lastName}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{user.location}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {user.userType === 'seeker' ? 'Job Seeker' : user.userType === 'employer' ? 'Employer' : 'Both'}
          </Badge>
        </div>
      </div>

      <p className="text-muted-foreground leading-relaxed">{user.bio}</p>

      <div className="space-y-2">
        <p className="text-sm font-medium">Skills & Experience:</p>
        <div className="space-y-2">
          {user.skills.map(userSkill => (
            <div key={userSkill.skill.id} className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {userSkill.skill.name}
              </Badge>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {userSkill.proficiency}
                </Badge>
                <span>{userSkill.yearsExperience}y exp</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative">
      <Card
        ref={cardRef}
        className={`w-full max-w-sm mx-auto cursor-grab transition-transform duration-200 ${
          isDragging ? 'cursor-grabbing scale-105' : ''
        }`}
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleRelease}
      >
        {type === 'job' ? renderJobCard(data as Job) : renderUserCard(data as User)}
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full"
          onClick={() => onSwipe('left')}
        >
          <X className="w-5 h-5 text-destructive" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full"
          onClick={() => onSwipe('up')}
        >
          <Star className="w-5 h-5 text-yellow-500" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full"
          onClick={() => onSwipe('right')}
        >
          <Heart className="w-5 h-5 text-green-500" />
        </Button>
      </div>
    </div>
  )
}
