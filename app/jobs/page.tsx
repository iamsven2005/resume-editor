'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Users, 
  Briefcase, 
  Sparkles, 
  Plus,
  Settings,
  FileText,
  Menu,
  Edit,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SwipeCard } from './SwipeCard'
import { MatchModal } from './MatchModal'
import { ProfileSetup } from './ProfileSetup'
import { EditJobModal } from '@/components/modals/EditJobModal'
import { ViewApplicationsModal } from '@/components/modals/ViewApplicationsModal'
import { AddJobModal } from '@/components/modals/AddJobModal'
import { DeleteJobModal } from '@/components/modals/DeleteJobModal'
import { EditProfileModal } from '@/components/modals/EditProfileModal'
import { mockJobs, mockUsers, Job, User } from './jobBoardData'

const HomePage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'jobs' | 'users'>('jobs')
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [lastMatch, setLastMatch] = useState<{
    item: Job | User
    type: 'job' | 'user'
    direction: 'left' | 'right' | 'up'
  } | null>(null)

  // Job management state
  const [jobs, setJobs] = useState<Job[]>(mockJobs)
  const [users, setUsers] = useState<User[]>(mockUsers)

  const currentData = viewMode === 'jobs' ? jobs : users
  const [showAddJobModal, setShowAddJobModal] = useState(false)
  const [showEditJobModal, setShowEditJobModal] = useState(false)
  const [showDeleteJobModal, setShowDeleteJobModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [showApplicationsModal, setShowApplicationsModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    const currentItem = currentData[currentIndex]

    if (direction !== 'left') {
      setLastMatch({
        item: currentItem,
        type: viewMode === 'jobs' ? 'job' : 'user',
        direction
      })
      setShowMatchModal(true)
    }

    setCurrentIndex(prev => (prev + 1) % currentData.length)
  }

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'jobs' ? 'users' : 'jobs'))
    setCurrentIndex(0)
  }

  // Job management handlers
  const handleAddJob = (jobData: Omit<Job, 'id' | 'employerId' | 'employer'>) => {
    if (!currentUser) return

    const newJob: Job = {
      id: Date.now().toString(),
      employerId: currentUser.id,
      employer: currentUser,
      ...jobData
    }

    setJobs(prev => [...prev, newJob])
  }

  const handleEditJob = (updatedJob: Job) => {
    setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job))
  }

  const handleDeleteJob = () => {
    if (!selectedJob) return
    setJobs(prev => prev.filter(job => job.id !== selectedJob.id))
  }

  const handleEditProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser)
    setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user))
  }

  const userJobs = currentUser ? jobs.filter(job => job.employerId === currentUser.id) : []

  if (!currentUser) {
    return <ProfileSetup onComplete={setCurrentUser} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-background to-accent/10 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                JobSwipe
              </h1>
              <p className="text-muted-foreground">
                Find your perfect {viewMode === 'jobs' ? 'job' : 'talent'} match
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={toggleViewMode}>
                {viewMode === 'jobs' ? (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Find Talent
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Find Jobs
                  </>
                )}
              </Button>

              {/* Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setShowEditProfileModal(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowApplicationsModal(true)}>
                    <FileText className="w-4 h-4 mr-2" />
                    View Applications
                  </DropdownMenuItem>
                  {(currentUser.userType === 'employer' || currentUser.userType === 'both') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShowAddJobModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Post New Job
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar Stats */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Your Activity</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cards viewed</span>
                  <span className="font-medium">{currentIndex + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Matches</span>
                  <span className="font-medium text-green-500">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Super likes</span>
                  <span className="font-medium text-yellow-500">1</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium">{jobs.length} Active Jobs</div>
                    <div className="text-xs text-muted-foreground">Across all companies</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium">{users.length} Talents</div>
                    <div className="text-xs text-muted-foreground">Looking for opportunities</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* User's Jobs Management */}
            {(currentUser.userType === 'employer' || currentUser.userType === 'both') && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Your Job Posts</h3>
                  <Button size="sm" onClick={() => setShowAddJobModal(true)}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {userJobs.length > 0 ? (
                    userJobs.slice(0, 3).map(job => (
                      <div key={job.id} className="flex items-center justify-between text-sm">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{job.title}</div>
                          <Badge variant="outline" className="text-xs">
                            {job.jobType}
                          </Badge>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              setSelectedJob(job)
                              setShowEditJobModal(true)
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedJob(job)
                              setShowDeleteJobModal(true)
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No job posts yet. Click "Add" to create your first job posting.
                    </p>
                  )}
                  {userJobs.length > 3 && (
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                      View all {userJobs.length} jobs
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Swipe Area */}
          <div className="lg:col-span-2">
            <div className="text-center mb-6">
              <Badge variant="outline" className="text-sm px-4 py-1">
                {viewMode === 'jobs' ? 'Jobs' : 'Talent'} • {currentIndex + 1} of {currentData.length}
              </Badge>
            </div>

            {currentIndex < currentData.length ? (
              <SwipeCard
                data={currentData[currentIndex]}
                type={viewMode === 'jobs' ? 'job' : 'user'}
                onSwipe={handleSwipe}
              />
            ) : (
              <Card className="p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">You've seen all {viewMode}!</h3>
                <p className="text-muted-foreground mb-4">
                  {viewMode === 'jobs'
                    ? 'Check back later for new opportunities or explore talent.'
                    : 'Switch to jobs or check back for new talent.'}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={toggleViewMode}>
                    Switch to {viewMode === 'jobs' ? 'Talent' : 'Jobs'}
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentIndex(0)}>
                    Start Over
                  </Button>
                </div>
              </Card>
            )}

            {/* Swipe Instructions */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                💔 Pass • ⭐ Super Like • 💕 Like
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Swipe left to pass, up for super like, right to like
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <MatchModal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        matchedItem={lastMatch?.item || null}
        matchType={lastMatch?.type || null}
        swipeDirection={lastMatch?.direction || null}
      />

      <AddJobModal
        isOpen={showAddJobModal}
        onClose={() => setShowAddJobModal(false)}
        onSave={handleAddJob}
        currentUser={currentUser}
      />

      <EditJobModal
        isOpen={showEditJobModal}
        onClose={() => {
          setShowEditJobModal(false)
          setSelectedJob(null)
        }}
        onSave={handleEditJob}
        job={selectedJob}
      />

      <DeleteJobModal
        isOpen={showDeleteJobModal}
        onClose={() => {
          setShowDeleteJobModal(false)
          setSelectedJob(null)
        }}
        onConfirm={handleDeleteJob}
        job={selectedJob}
      />

      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        onSave={handleEditProfile}
        user={currentUser}
      />

      <ViewApplicationsModal
        isOpen={showApplicationsModal}
        onClose={() => setShowApplicationsModal(false)}
        currentUser={currentUser}
      />
    </div>
  )
}

export default HomePage
