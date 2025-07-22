CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
  salary_min INTEGER,
  salary_max INTEGER,
  currency VARCHAR(3) DEFAULT 'USD',
  is_remote BOOLEAN DEFAULT FALSE,
  required_skills JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Insert sample data
INSERT INTO jobs (title, description, company, location, job_type, salary_min, salary_max, is_remote, required_skills, user_id) VALUES
('Senior Frontend Developer', 'We are looking for an experienced frontend developer to join our team. You will be responsible for building modern web applications using React, TypeScript, and other cutting-edge technologies.', 'TechCorp Inc.', 'San Francisco, CA', 'full-time', 120000, 160000, true, '[{"name": "React", "level": "advanced"}, {"name": "TypeScript", "level": "intermediate"}, {"name": "JavaScript", "level": "advanced"}]', 1),
('Full Stack Engineer', 'Join our startup as a full stack engineer. Work with Node.js, React, and PostgreSQL to build scalable web applications.', 'StartupXYZ', 'New York, NY', 'full-time', 100000, 140000, false, '[{"name": "Node.js", "level": "intermediate"}, {"name": "React", "level": "intermediate"}, {"name": "PostgreSQL", "level": "beginner"}]', 1),
('UI/UX Designer', 'We need a creative UI/UX designer to help us design beautiful and intuitive user interfaces for our products.', 'Design Studio', 'Remote', 'contract', 80000, 100000, true, '[{"name": "Figma", "level": "advanced"}, {"name": "Adobe Creative Suite", "level": "intermediate"}, {"name": "Prototyping", "level": "advanced"}]', 1),
('Backend Developer', 'Looking for a backend developer with experience in Python and Django to help build our API infrastructure.', 'DataFlow Solutions', 'Austin, TX', 'full-time', 90000, 120000, true, '[{"name": "Python", "level": "advanced"}, {"name": "Django", "level": "intermediate"}, {"name": "PostgreSQL", "level": "intermediate"}]', 1),
('DevOps Engineer', 'Join our team as a DevOps engineer. Experience with AWS, Docker, and Kubernetes required.', 'CloudTech', 'Seattle, WA', 'full-time', 110000, 150000, false, '[{"name": "AWS", "level": "advanced"}, {"name": "Docker", "level": "intermediate"}, {"name": "Kubernetes", "level": "intermediate"}]', 1);
