-- ============================================================================
-- SIH 2026: Academia-Industry Collaboration Platform
-- Database Schema for Supabase / PostgreSQL
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (All roles)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'company', 'faculty', 'admin')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Institutions
CREATE TABLE IF NOT EXISTS institutions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  region VARCHAR(100),
  aicte_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Students
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution_id INT REFERENCES institutions(id) ON DELETE SET NULL,
  cgpa DECIMAL(4,2) CHECK (cgpa >= 0.0 AND cgpa <= 10.0),
  graduation_year INT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Companies
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  region VARCHAR(100),
  company_size VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Faculty
CREATE TABLE IF NOT EXISTS faculty (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution_id INT REFERENCES institutions(id) ON DELETE SET NULL,
  specialization VARCHAR(255),
  publications_count INT DEFAULT 0,
  research_focus TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Skills Taxonomy (P1 / P5 Taxonomy)
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  skill_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. High-Level Adaptive Assessment Sessions (P1 State Machine)
CREATE TABLE IF NOT EXISTS assessments (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(64) UNIQUE NOT NULL,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  domain_id VARCHAR(100) NOT NULL,
  overall_domain_score DECIMAL(5,2),
  llm_provider VARCHAR(50) DEFAULT 'GEMINI',
  is_completed BOOLEAN DEFAULT FALSE,
  ascii_tree_report TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Assessment Results (Turn-by-Turn 4D Rubric Scoring)
CREATE TABLE IF NOT EXISTS assessment_results (
  id SERIAL PRIMARY KEY,
  assessment_id INT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  concept_id VARCHAR(100) NOT NULL,
  concept_name VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  student_answer TEXT NOT NULL,
  is_follow_up BOOLEAN DEFAULT FALSE,
  
  -- 4D Dimension Rubric Scores
  correctness_score DECIMAL(5,2) NOT NULL,
  depth_score DECIMAL(5,2) NOT NULL,
  tradeoff_score DECIMAL(5,2) NOT NULL,
  applicability_score DECIMAL(5,2) NOT NULL,
  composite_score DECIMAL(5,2) NOT NULL,
  
  action_decision VARCHAR(50) NOT NULL CHECK (action_decision IN ('ADVANCE', 'FOLLOW_UP_PROBE', 'FLAG_GAP')),
  is_gap BOOLEAN DEFAULT FALSE,
  
  -- Diagnostic Metadata
  missing_concepts JSONB DEFAULT '[]'::jsonb,
  strengths JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  ai_reasoning TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Student Skill Profiles (Fixed: Composite Unique allows multiple skills per student)
CREATE TABLE IF NOT EXISTS student_skill_profiles (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_id INT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_score DECIMAL(5,2) NOT NULL,
  is_verified_gap BOOLEAN DEFAULT FALSE,
  last_assessed TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, skill_id)
);

-- 10. Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  required_skills_json JSONB DEFAULT '{}'::jsonb,
  region VARCHAR(100),
  sector VARCHAR(100),
  salary_range VARCHAR(100),
  posted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. Internships
CREATE TABLE IF NOT EXISTS internships (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  required_skills_json JSONB DEFAULT '{}'::jsonb,
  region VARCHAR(100),
  sector VARCHAR(100),
  stipend DECIMAL(10,2),
  duration_weeks INT,
  posted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Applications (With XOR Constraint)
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
  internship_id INT REFERENCES internships(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected')),
  applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_application_target CHECK (
    (job_id IS NOT NULL AND internship_id IS NULL) OR 
    (job_id IS NULL AND internship_id IS NOT NULL)
  )
);

-- 13. Internship Progress
CREATE TABLE IF NOT EXISTS internship_progress (
  id SERIAL PRIMARY KEY,
  application_id INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  week_number INT NOT NULL,
  progress_log TEXT,
  mentor_feedback TEXT,
  milestone_status VARCHAR(50) DEFAULT 'in_progress',
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 14. Skill Demand (P5 Analytics)
CREATE TABLE IF NOT EXISTS skill_demand (
  id SERIAL PRIMARY KEY,
  skill_id INT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  region VARCHAR(100) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  demand_count INT DEFAULT 0,
  month DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(skill_id, region, sector, month)
);

-- 15. Institutional Expertise (P6 Collaboration)
CREATE TABLE IF NOT EXISTS institutional_expertise (
  id SERIAL PRIMARY KEY,
  institution_id INT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  faculty_id INT REFERENCES faculty(id) ON DELETE SET NULL,
  lab_name VARCHAR(255),
  lab_infrastructure TEXT,
  project_title VARCHAR(255),
  project_funding DECIMAL(15,2),
  project_status VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Performance Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_institution_id ON students(institution_id);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_user_id ON faculty(user_id);

CREATE INDEX IF NOT EXISTS idx_assessments_student_id ON assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment_id ON assessment_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_student_skill_profiles_student_id ON student_skill_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skill_profiles_skill_id ON student_skill_profiles(skill_id);

CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_region_sector ON jobs(region, sector);
CREATE INDEX IF NOT EXISTS idx_internships_company_id ON internships(company_id);
CREATE INDEX IF NOT EXISTS idx_internships_region_sector ON internships(region, sector);

CREATE INDEX IF NOT EXISTS idx_jobs_required_skills_gin ON jobs USING GIN (required_skills_json);
CREATE INDEX IF NOT EXISTS idx_internships_required_skills_gin ON internships USING GIN (required_skills_json);

CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship_id ON applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_skill_demand_region_sector ON skill_demand(region, sector);
CREATE INDEX IF NOT EXISTS idx_institutional_expertise_institution_id ON institutional_expertise(institution_id);