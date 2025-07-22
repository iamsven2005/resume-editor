'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Job, mockSkills, Skill } from '@/app/jobs/jobBoardData'
import { Plus, X } from 'lucide-react'

interface AddJobModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (job: Omit<Job, 'id' | 'employerId' | 'employer'>) => void
  currentUser: any
}

export function AddJobModal({ isOpen, onClose, onSave, currentUser }: AddJobModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    jobType: 'full-time' as Job['jobType'],
    location: '',
    isRemote: false,
    salaryMin: '',
    salaryMax: '',
    currency: 'USD'
  })

  const [selectedSkills, setSelectedSkills] = useState<Array<{
    skill: Skill
    isRequired: boolean
    minProficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  }>>([])

  const [skillToAdd, setSkillToAdd] = useState('')
  const [skillRequired, setSkillRequired] = useState(true)
  const [skillProficiency, setSkillProficiency] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate')

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (!skillToAdd) return

    const skill = mockSkills.find(s => s.id === skillToAdd)
    if (!skill) return

    const skillRequirement = {
      skill,
      isRequired: skillRequired,
      minProficiency: skillProficiency
    }

    setSelectedSkills(prev => [...prev, skillRequirement])
    setSkillToAdd('')
    setSkillRequired(true)
    setSkillProficiency('intermediate')
  }

  const removeSkill = (skillId: string) => {
    setSelectedSkills(prev => prev.filter(s => s.skill.id !== skillId))
  }

  const handleSave = () => {
    if (!formData.title || !formData.description || !formData.location) return

    const jobData = {
      ...formData,
      salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
      requiredSkills: selectedSkills,
      isActive: true
    }

    onSave(jobData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      jobType: 'full-time',
      location: '',
      isRemote: false,
      salaryMin: '',
      salaryMax: '',
      currency: 'USD'
    })
    setSelectedSkills([])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Post a New Job</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Job Title *</label>
              <Input
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Job Description *</label>
              <Textarea
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Job Type</label>
                <Select value={formData.jobType} onValueChange={(value: Job['jobType']) => handleInputChange('jobType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Location *</label>
                <Input
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  placeholder="City, State or Remote"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remote"
                checked={formData.isRemote}
                onCheckedChange={(checked) => handleInputChange('isRemote', !!checked)}
              />
              <label htmlFor="remote" className="text-sm font-medium">
                Remote work available
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Salary Range (optional)</label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  value={formData.salaryMin}
                  onChange={e => handleInputChange('salaryMin', e.target.value)}
                  placeholder="Min"
                />
                <Input
                  type="number"
                  value={formData.salaryMax}
                  onChange={e => handleInputChange('salaryMax', e.target.value)}
                  placeholder="Max"
                />
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Required Skills</label>

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

                <Select value={skillProficiency} onValueChange={(value: any) => setSkillProficiency(value)}>
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="required"
                    checked={skillRequired}
                    onCheckedChange={(checked) => setSkillRequired(!!checked)}
                  />
                  <label htmlFor="required" className="text-xs">Required</label>
                </div>

                <Button onClick={addSkill} disabled={!skillToAdd}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedSkills.map(skillReq => (
                  <Badge key={skillReq.skill.id} variant={skillReq.isRequired ? 'default' : 'outline'} className="flex items-center gap-2">
                    {skillReq.skill.name} ({skillReq.minProficiency})
                    {skillReq.isRequired && ' *'}
                    <button onClick={() => removeSkill(skillReq.skill.id)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!formData.title || !formData.description || !formData.location}
          >
            Post Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
