export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface UserSkill {
  skill: Skill;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  bio: string;
  location: string;
  userType: 'seeker' | 'employer' | 'both';
  skills: UserSkill[];
  isActive: boolean;
}

export interface Job {
  id: string;
  employerId: string;
  employer: User;
  title: string;
  description: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'freelance';
  location: string;
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  requiredSkills: Array<{
    skill: Skill;
    isRequired: boolean;
    minProficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  }>;
  isActive: boolean;
}

export interface Match {
  id: string;
  jobSeeker: User;
  employer: User;
  job: Job;
  status: 'active' | 'employer_declined' | 'seeker_declined' | 'hired';
}

// Mock Skills
export const mockSkills: Skill[] = [
  { id: '1', name: 'React', category: 'Frontend' },
  { id: '2', name: 'TypeScript', category: 'Programming' },
  { id: '3', name: 'Node.js', category: 'Backend' },
  { id: '4', name: 'Python', category: 'Programming' },
  { id: '5', name: 'Design Systems', category: 'Design' },
  { id: '6', name: 'Figma', category: 'Design' },
  { id: '7', name: 'SQL', category: 'Database' },
  { id: '8', name: 'AWS', category: 'Cloud' },
  { id: '9', name: 'Docker', category: 'DevOps' },
  { id: '10', name: 'GraphQL', category: 'API' },
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b75e91f0?w=150',
    bio: 'Frontend developer passionate about creating beautiful, accessible user interfaces. Love working with React and modern web technologies.',
    location: 'San Francisco, CA',
    userType: 'seeker',
    skills: [
      { skill: mockSkills[0], proficiency: 'expert', yearsExperience: 5 },
      { skill: mockSkills[1], proficiency: 'advanced', yearsExperience: 3 },
      { skill: mockSkills[4], proficiency: 'intermediate', yearsExperience: 2 },
    ],
    isActive: true,
  },
  {
    id: '2',
    firstName: 'Alex',
    lastName: 'Rodriguez',
    email: 'alex@techcorp.com',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    bio: 'Senior Engineering Manager at TechCorp. Building amazing teams and products that users love.',
    location: 'New York, NY',
    userType: 'employer',
    skills: [
      { skill: mockSkills[1], proficiency: 'expert', yearsExperience: 8 },
      { skill: mockSkills[2], proficiency: 'expert', yearsExperience: 6 },
    ],
    isActive: true,
  },
  {
    id: '3',
    firstName: 'Maya',
    lastName: 'Patel',
    email: 'maya@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    bio: 'Full-stack developer with expertise in Python and React. Love solving complex problems and building scalable applications.',
    location: 'Austin, TX',
    userType: 'seeker',
    skills: [
      { skill: mockSkills[3], proficiency: 'expert', yearsExperience: 4 },
      { skill: mockSkills[0], proficiency: 'advanced', yearsExperience: 3 },
      { skill: mockSkills[6], proficiency: 'intermediate', yearsExperience: 2 },
    ],
    isActive: true,
  },
  {
    id: '4',
    firstName: 'Jordan',
    lastName: 'Kim',
    email: 'jordan@design.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'UX/UI Designer focused on creating intuitive and delightful user experiences. Passionate about design systems and accessibility.',
    location: 'Seattle, WA',
    userType: 'seeker',
    skills: [
      { skill: mockSkills[5], proficiency: 'expert', yearsExperience: 5 },
      { skill: mockSkills[4], proficiency: 'advanced', yearsExperience: 4 },
    ],
    isActive: true,
  },
];

// Mock Jobs
export const mockJobs: Job[] = [
  {
    id: '1',
    employerId: '2',
    employer: mockUsers[1],
    title: 'Senior Frontend Developer',
    description: 'Join our dynamic team to build next-generation web applications using React and TypeScript. You will work on user-facing features that impact millions of users.',
    jobType: 'full-time',
    location: 'New York, NY',
    isRemote: true,
    salaryMin: 120000,
    salaryMax: 160000,
    currency: 'USD',
    requiredSkills: [
      { skill: mockSkills[0], isRequired: true, minProficiency: 'advanced' },
      { skill: mockSkills[1], isRequired: true, minProficiency: 'intermediate' },
      { skill: mockSkills[4], isRequired: false, minProficiency: 'beginner' },
    ],
    isActive: true,
  },
  {
    id: '2',
    employerId: '2',
    employer: mockUsers[1],
    title: 'UX Designer',
    description: 'Looking for a creative UX Designer to help us design intuitive and beautiful user experiences. Experience with design systems preferred.',
    jobType: 'full-time',
    location: 'San Francisco, CA',
    isRemote: false,
    salaryMin: 90000,
    salaryMax: 130000,
    currency: 'USD',
    requiredSkills: [
      { skill: mockSkills[5], isRequired: true, minProficiency: 'advanced' },
      { skill: mockSkills[4], isRequired: true, minProficiency: 'intermediate' },
    ],
    isActive: true,
  },
  {
    id: '3',
    employerId: '2',
    employer: mockUsers[1],
    title: 'Full Stack Developer',
    description: 'Seeking a versatile full-stack developer to work on both frontend and backend systems. Experience with Python and React required.',
    jobType: 'contract',
    location: 'Remote',
    isRemote: true,
    salaryMin: 80,
    salaryMax: 120,
    currency: 'USD',
    requiredSkills: [
      { skill: mockSkills[3], isRequired: true, minProficiency: 'advanced' },
      { skill: mockSkills[0], isRequired: true, minProficiency: 'intermediate' },
      { skill: mockSkills[6], isRequired: false, minProficiency: 'beginner' },
    ],
    isActive: true,
  },
];

// Mock Matches
export const mockMatches: Match[] = [
  {
    id: '1',
    jobSeeker: mockUsers[0],
    employer: mockUsers[1],
    job: mockJobs[0],
    status: 'active',
  },
];
