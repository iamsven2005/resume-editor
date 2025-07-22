'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock3,
  MessageCircle,
  Eye
} from 'lucide-react'
import { Job, User, Match } from '@/app/jobs/jobBoardData'

interface Application {
  id: string
  job: Job
  applicant: User
  status: 'pending' | 'accepted' | 'rejected' | 'interviewed'
  appliedAt: Date
  message?: string
}

interface ViewApplicationsModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User
}

// Mock applications data
const mockApplications: Application[] = [
  {
    id: '1',
    job: {
      id: '1',
      employerId: '2',
      employer: {
        id: '2',
        firstName: 'Alex',
        lastName: 'Rodriguez',
        email: 'alex@techcorp.com',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        bio: 'Senior Engineering Manager at TechCorp.',
        location: 'New York, NY',
        userType: 'employer',
        skills: [],
        isActive: true,
      },
      title: 'Senior Frontend Developer',
      description: 'Join our dynamic team to build next-generation web applications.',
      jobType: 'full-time',
      location: 'New York, NY',
      isRemote: true,
      salaryMin: 120000,
      salaryMax: 160000,
      currency: 'USD',
      requiredSkills: [],
      isActive: true,
    },
    applicant: {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b75e91f0?w=150',
      bio: 'Frontend developer passionate about creating beautiful interfaces.',
      location: 'San Francisco, CA',
      userType: 'seeker',
      skills: [],
      isActive: true,
    },
    status: 'pending',
    appliedAt: new Date('2025-01-10'),
    message: 'I am very interested in this position and believe my React expertise would be a great fit.'
  },
  {
    id: '2',
    job: {
      id: '2',
      employerId: '2',
      employer: {
        id: '2',
        firstName: 'Alex',
        lastName: 'Rodriguez',
        email: 'alex@techcorp.com',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        bio: 'Senior Engineering Manager at TechCorp.',
        location: 'New York, NY',
        userType: 'employer',
        skills: [],
        isActive: true,
      },
      title: 'UX Designer',
      description: 'Looking for a creative UX Designer.',
      jobType: 'full-time',
      location: 'San Francisco, CA',
      isRemote: false,
      salaryMin: 90000,
      salaryMax: 130000,
      currency: 'USD',
      requiredSkills: [],
      isActive: true,
    },
    applicant: {
      id: '4',
      firstName: 'Jordan',
      lastName: 'Kim',
      email: 'jordan@design.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      bio: 'UX/UI Designer focused on creating intuitive user experiences.',
      location: 'Seattle, WA',
      userType: 'seeker',
      skills: [],
      isActive: true,
    },
    status: 'accepted',
    appliedAt: new Date('2025-01-08'),
  }
]

export function ViewApplicationsModal({ isOpen, onClose, currentUser }: ViewApplicationsModalProps) {
  const [selectedTab, setSelectedTab] = useState('received')

  const receivedApplications = mockApplications.filter(app => 
    app.job.employerId === currentUser.id
  )

  const sentApplications = mockApplications.filter(app => 
    app.applicant.id === currentUser.id
  )

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return <Clock3 className="w-4 h-4 text-yellow-500" />
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'interviewed':
        return <Eye className="w-4 h-4 text-blue-500" />
    }
  }

  const getStatusText = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return 'Under Review'
      case 'accepted':
        return 'Accepted'
      case 'rejected':
        return 'Not Selected'
      case 'interviewed':
        return 'Interview Scheduled'
    }
  }

  const getStatusVariant = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary' as const
      case 'accepted':
        return 'default' as const
      case 'rejected':
        return 'destructive' as const
      case 'interviewed':
        return 'outline' as const
    }
  }

  const renderApplicationCard = (application: Application, isReceived: boolean) => (
    <Card key={application.id} className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={isReceived ? application.applicant.avatarUrl : application.job.employer.avatarUrl} />
            <AvatarFallback>
              {isReceived 
                ? `${application.applicant.firstName[0]}${application.applicant.lastName[0]}`
                : `${application.job.employer.firstName[0]}${application.job.employer.lastName[0]}`
              }
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-semibold">
              {isReceived 
                ? `${application.applicant.firstName} ${application.applicant.lastName}`
                : application.job.title
              }
            </h3>
            <p className="text-sm text-muted-foreground">
              {isReceived 
                ? `Applied for ${application.job.title}`
                : `${application.job.employer.firstName} ${application.job.employer.lastName}`
              }
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Applied {application.appliedAt.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <Badge variant={getStatusVariant(application.status)} className="flex items-center gap-1">
          {getStatusIcon(application.status)}
          {getStatusText(application.status)}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>{application.job.isRemote ? 'Remote' : application.job.location}</span>
        </div>
        
        {application.job.salaryMin && application.job.salaryMax && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>
              ${application.job.salaryMin.toLocaleString()} - ${application.job.salaryMax.toLocaleString()} {application.job.currency}
            </span>
          </div>
        )}
      </div>

      {application.message && (
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm">{application.message}</p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Message
        </Button>
        {isReceived && application.status === 'pending' && (
          <>
            <Button size="sm" variant="default">
              Accept
            </Button>
            <Button size="sm" variant="outline">
              Decline
            </Button>
          </>
        )}
      </div>
    </Card>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Users className="w-6 h-6" />
            Job Applications
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">
              Applications Received ({receivedApplications.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Applications Sent ({sentApplications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="flex-1 overflow-y-auto space-y-4 mt-4">
            {receivedApplications.length > 0 ? (
              receivedApplications.map(app => renderApplicationCard(app, true))
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground">
                  When people apply to your job postings, they'll appear here.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="flex-1 overflow-y-auto space-y-4 mt-4">
            {sentApplications.length > 0 ? (
              sentApplications.map(app => renderApplicationCard(app, false))
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Applications Sent</h3>
                <p className="text-muted-foreground">
                  Start swiping on jobs to send your applications!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
