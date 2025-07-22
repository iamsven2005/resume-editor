'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { User, UserSkill, mockSkills } from '@/app/jobs/jobBoardData'
import { Plus, X } from 'lucide-react'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (user: User) => void
  user: User | null
}

export function EditProfileModal({ isOpen, onClose, onSave, user }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    location: '',
    userType: 'seeker' as 'seeker' | 'employer' | 'both',
    avatarUrl: ''
  })

  const [selectedSkills, setSelectedSkills] = useState<UserSkill[]>([])
  const [skillToAdd, setSkillToAdd] = useState('')
  const [proficiency, setProficiency] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate')
  const [yearsExperience, setYearsExperience] = useState(0)

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        bio: user.bio,
        location: user.location,
        userType: user.userType,
        avatarUrl: user.avatarUrl || ''
      })
      setSelectedSkills(user.skills)
    }
  }, [user, isOpen])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (!skillToAdd) return

    const skill = mockSkills.find(s => s.id === skillToAdd)
    if (!skill) return

    const userSkill: UserSkill = {
      skill,
      proficiency,
      yearsExperience
    }

    setSelectedSkills(prev => [...prev, userSkill])
    setSkillToAdd('')
    setProficiency('intermediate')
    setYearsExperience(0)
  }

  const removeSkill = (skillId: string) => {
    setSelectedSkills(prev => prev.filter(s => s.skill.id !== skillId))
  }

  const handleSave = () => {
    if (!user || !formData.firstName || !formData.lastName || !formData.email) return

    const updatedUser: User = {
      ...user,
      ...formData,
      skills: selectedSkills
    }

    onSave(updatedUser)
    onClose()
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <Avatar className="w-24 h-24">
              <AvatarImage src={formData.avatarUrl} />
              <AvatarFallback className="text-2xl">
                {formData.firstName[0]}{formData.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name *</label>
                <Input
                  value={formData.firstName}
                  onChange={e => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name *</label>
                <Input
                  value={formData.lastName}
                  onChange={e => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Avatar URL (optional)</label>
              <Input
                value={formData.avatarUrl}
                onChange={e => handleInputChange('avatarUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">I am a...</label>
              <Select value={formData.userType} onValueChange={(value: any) => handleInputChange('userType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seeker">Job Seeker</SelectItem>
                  <SelectItem value="employer">Employer</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                placeholder="City, State"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                value={formData.bio}
                onChange={e => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Skills & Experience</label>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Select value={skillToAdd} onValueChange={setSkillToAdd}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSkills
                      .filter(skill => !selectedSkills.some(s => s.skill.id === skill.id))
                      .map(skill => (
                        <SelectItem key={skill.id} value={skill.id}>
                          {skill.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Select value={proficiency} onValueChange={(value: any) => setProficiency(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  value={yearsExperience}
                  onChange={e => setYearsExperience(parseInt(e.target.value) || 0)}
                  placeholder="Years"
                  min="0"
                  max="50"
                />

                <Button onClick={addSkill} disabled={!skillToAdd}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedSkills.map(userSkill => (
                  <Badge key={userSkill.skill.id} variant="secondary" className="flex items-center gap-2">
                    {userSkill.skill.name} ({userSkill.proficiency}, {userSkill.yearsExperience}y)
                    <button onClick={() => removeSkill(userSkill.skill.id)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!formData.firstName || !formData.lastName || !formData.email}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
