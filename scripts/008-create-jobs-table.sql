-- Create jobs table if it doesn't exist
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
    required_skills JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_is_remote ON jobs(is_remote);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Create a text search index for better search performance
CREATE INDEX IF NOT EXISTS idx_jobs_search ON jobs USING gin(to_tsvector('english', title || ' ' || description || ' ' || company));

-- Insert some sample data for testing
INSERT INTO jobs (title, description, company, location, job_type, salary_min, salary_max, currency, is_remote, required_skills, user_id, is_active) VALUES
('Senior Frontend Developer', 'We are looking for an experienced frontend developer to join our team. You will be responsible for building user interfaces using React and TypeScript.', 'TechCorp Inc', 'San Francisco, CA', 'full-time', 120000, 150000, 'USD', true, '["React", "TypeScript", "JavaScript", "CSS", "HTML"]', 1, true),
('Backend Engineer', 'Join our backend team to build scalable APIs and services. Experience with Node.js and databases required.', 'StartupXYZ', 'New York, NY', 'full-time', 100000, 130000, 'USD', false, '["Node.js", "PostgreSQL", "REST APIs", "Docker"]', 1, true),
('UI/UX Designer', 'Create beautiful and intuitive user experiences for our web and mobile applications.', 'Design Studio', 'Remote', 'contract', 80000, 100000, 'USD', true, '["Figma", "Adobe Creative Suite", "User Research", "Prototyping"]', 1, true),
('DevOps Engineer', 'Help us scale our infrastructure and improve our deployment processes.', 'CloudTech', 'Austin, TX', 'full-time', 110000, 140000, 'USD', true, '["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD"]', 1, true),
('Junior Developer', 'Great opportunity for a junior developer to learn and grow with our team.', 'Learning Corp', 'Boston, MA', 'full-time', 60000, 80000, 'USD', false, '["JavaScript", "HTML", "CSS", "Git"]', 1, true)
ON CONFLICT DO NOTHING;
