-- Users Table (All roles)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'company', 'faculty', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution_id INT,
  cgpa DECIMAL(3,2),
  graduation_year INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  region VARCHAR(100),
  company_size VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Institutions
CREATE TABLE institutions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  region VARCHAR(100),
  aicte_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty
CREATE TABLE faculty (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution_id INT REFERENCES institutions(id),
  specialization VARCHAR(255),
  publications_count INT DEFAULT 0,
  research_focus TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  domain VARCHAR(100),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessments
CREATE TABLE assessments (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  domain VARCHAR(100) NOT NULL,
  score DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Results Details
CREATE TABLE assessment_results (
  id SERIAL PRIMARY KEY,
  assessment_id INT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id VARCHAR(255),
  student_answer TEXT,
  evaluation_score DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Skill Profiles
CREATE TABLE student_skill_profiles (
  id SERIAL PRIMARY KEY,
  student_id INT UNIQUE NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_id INT NOT NULL REFERENCES skills(id),
  proficiency_score DECIMAL(5,2),
  last_assessed TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  required_skills_json JSONB,
  region VARCHAR(100),
  sector VARCHAR(100),
  salary_range VARCHAR(100),
  posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Internships
CREATE TABLE internships (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  required_skills_json JSONB,
  region VARCHAR(100),
  sector VARCHAR(100),
  stipend DECIMAL(10,2),
  duration_weeks INT,
  posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
  internship_id INT REFERENCES internships(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected')),
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Internship Progress
CREATE TABLE internship_progress (
  id SERIAL PRIMARY KEY,
  application_id INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  week_number INT,
  progress_log TEXT,
  mentor_feedback TEXT,
  milestone_status VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skill Demand (For Analytics - P5 uses)
CREATE TABLE skill_demand (
  id SERIAL PRIMARY KEY,
  skill_id INT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  region VARCHAR(100),
  sector VARCHAR(100),
  demand_count INT DEFAULT 0,
  month DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(skill_id, region, sector, month)
);

-- Institutional Expertise Graph (For Collaboration - P6 uses)
CREATE TABLE institutional_expertise (
  id SERIAL PRIMARY KEY,
  institution_id INT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  faculty_id INT REFERENCES faculty(id) ON DELETE CASCADE,
  lab_name VARCHAR(255),
  lab_infrastructure TEXT,
  project_title VARCHAR(255),
  project_funding DECIMAL(15,2),
  project_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_institution_id ON students(institution_id);
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_faculty_user_id ON faculty(user_id);
CREATE INDEX idx_assessments_student_id ON assessments(student_id);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_region_sector ON jobs(region, sector);
CREATE INDEX idx_internships_company_id ON internships(company_id);
CREATE INDEX idx_internships_region_sector ON internships(region, sector);
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_internship_id ON applications(internship_id);
CREATE INDEX idx_skill_demand_region_sector ON skill_demand(region, sector);
CREATE INDEX idx_student_skill_profiles_student_id ON student_skill_profiles(student_id);
CREATE INDEX idx_institutional_expertise_institution_id ON institutional_expertise(institution_id);