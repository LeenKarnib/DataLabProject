-- ============================================================
-- DegreeMap — Clean Schema
-- Lebanese American University Beirut 2024-2025
-- Structure supports COE, ELE, MCE
-- Data seeded for COE only (ELE and MCE to be added later)
-- ============================================================

DROP DATABASE IF EXISTS degreemap_db;
CREATE DATABASE degreemap_db;
USE degreemap_db;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(100) UNIQUE NOT NULL,
  major         ENUM('COE','ELE','MCE') NOT NULL,
  password      VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
  code              VARCHAR(20) PRIMARY KEY,
  name              VARCHAR(120) NOT NULL,
  credits           INT NOT NULL,
  department        VARCHAR(10) NOT NULL,
  offered_semesters ENUM('both','fall','spring','summer') DEFAULT 'both',
  course_type       ENUM('required','elective','lab') DEFAULT 'required',
  year_standing     INT DEFAULT 1,
  description       TEXT
);

CREATE TABLE major_requirements (
  major            ENUM('COE','ELE','MCE') NOT NULL,
  course_code      VARCHAR(20) NOT NULL,
  requirement_type ENUM('core','math_science','other_eng','elective','las') DEFAULT 'core',
  PRIMARY KEY (major, course_code),
  FOREIGN KEY (course_code) REFERENCES courses(code)
);

CREATE TABLE prerequisites (
  course_code VARCHAR(20) NOT NULL,
  prereq_code VARCHAR(20) NOT NULL,
  PRIMARY KEY (course_code, prereq_code),
  FOREIGN KEY (course_code) REFERENCES courses(code),
  FOREIGN KEY (prereq_code) REFERENCES courses(code)
);

CREATE TABLE completed_courses (
  user_id       INT NOT NULL,
  course_code   VARCHAR(20) NOT NULL,
  completed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, course_code),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_code) REFERENCES courses(code)
);

CREATE TABLE IF NOT EXISTS user_plans (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT          NOT NULL,
  major         VARCHAR(10)  NOT NULL,
  course_code   VARCHAR(20)  NOT NULL,
  semester_label VARCHAR(20) NOT NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_course (user_id, course_code),
  FOREIGN KEY (user_id)     REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (course_code) REFERENCES courses(code) ON DELETE CASCADE
);

-- ============================================================
-- COURSES — ENGLISH & LAS
-- ============================================================
INSERT INTO courses (code, name, credits, department, offered_semesters, course_type, year_standing) VALUES
-- ('ENG101',  'English I',                          3, 'ENG',  'both',   'required', 1),
-- ('ENG102',  'English II',                         3, 'ENG',  'both',   'required', 1),
('ENG202',  'Advanced Academic English',          3, 'ENG',  'fall',   'required', 1),
('COM203',  'Art of Public Communication',        3, 'COM',  'summer',   'required', 1),
('LAS001',  'Liberal Arts & Sciences Elective 1', 3, 'LAS',  'spring',   'elective', 1),
('LAS002',  'Liberal Arts & Sciences Elective 2', 3, 'LAS',  'spring',   'elective', 1),
('LAS003',  'Liberal Arts & Sciences Elective 3', 3, 'LAS',  'summer',   'elective', 1),
('LAS004',  'Liberal Arts & Sciences Elective 4', 3, 'LAS',  'fall',   'elective', 2),
('FREE001', 'Free Elective',                      3, 'FREE', 'summer',   'elective', 1);

-- ============================================================
-- COURSES — MATH & SCIENCE
-- ============================================================
INSERT INTO courses (code, name, credits, department, offered_semesters, course_type, year_standing) VALUES
('MTH201', 'Calculus III',               3, 'MTH', 'fall',   'required', 1),
('MTH206', 'Calculus IV',                3, 'MTH', 'spring', 'required', 1),
('MTH207', 'Discrete Structures I',      3, 'MTH', 'fall',   'required', 1),
('MTH304', 'Differential Equations',     3, 'MTH', 'spring', 'required', 1),
('GNE331', 'Probability and Statistics', 3, 'GNE', 'both',   'required', 2),
('PHY201', 'Electricity and Magnetism',  3, 'PHY', 'fall',   'required', 1);

-- ============================================================
-- COURSES — GENERAL ENGINEERING
-- ============================================================
INSERT INTO courses (code, name, credits, department, offered_semesters, course_type, year_standing) VALUES
('COE201', 'Computer Proficiency',             1, 'COE', 'fall',   'required', 1),
('GNE212', 'Engineering Mechanics',            3, 'GNE', 'both',   'required', 1),
('GNE301', 'Professional Communication',       2, 'GNE', 'summer',   'required', 2),
('GNE303', 'Engineering Ethics',               2, 'GNE', 'summer',   'required', 2),
('GNE000', 'SOE Signature Course',             3, 'GNE', 'spring',   'required', 4),
('INE320', 'Engineering Economy',              3, 'INE', 'summer',   'required', 2);

-- ============================================================
-- COURSES — COE CORE
-- ============================================================
INSERT INTO courses (code, name, credits, department, offered_semesters, course_type, year_standing) VALUES
('COE211',  'Computer Programming',            3, 'COE', 'spring',   'required', 1),
('COE312',  'Data Structures',                 3, 'COE', 'fall',   'required', 2),
('COE313',  'Data Structures Lab',             1, 'COE', 'spring', 'lab',      2),
('COE321',  'Logic Design',                    3, 'COE', 'fall',   'required', 2),
('COE322',  'Logic Design Lab',                1, 'COE', 'spring', 'lab',      2),
('COE323',  'Microprocessors',                 3, 'COE', 'spring', 'required', 2),
('COE324',  'Microprocessors Lab',             1, 'COE', 'fall',   'lab',      3),
('COE414',  'Operating Systems',               3, 'COE', 'fall',   'required', 4),
('COE415',  'Computer Programming II',         3, 'COE', 'spring', 'required', 2),
('COE415B', 'Computer Programming II Lab',     1, 'COE', 'fall',   'lab',      3),
('COE416',  'Software Engineering',            3, 'COE', 'spring', 'required', 3),
('COE418',  'Database Systems',                3, 'COE', 'fall',   'required', 3),
('COE423',  'Computer Architecture',           3, 'COE', 'fall',   'required', 2),
('COE424',  'Digital Systems',                 3, 'COE', 'spring', 'required', 3),
('COE425',  'Digital Systems Lab',             1, 'COE', 'fall',   'lab',      4),
('COE431',  'Computer Networks',               3, 'COE', 'spring', 'required', 4),
('COE493',  'Professionalism in Engineering',  3, 'COE', 'fall',   'required', 3),
('COE498',  'Professional Experience',         6, 'COE', 'summer', 'required', 3),
('COE521',  'Embedded Systems',                3, 'COE', 'fall',   'required', 4),
('COE593',  'COE Application',                 3, 'COE', 'fall',   'required', 4),
('COE595',  'Capstone Design Project I',       3, 'COE', 'fall',   'required', 4),
('COE596',  'Capstone Design Project II',      3, 'COE', 'spring', 'required', 4);

-- COE courses needed from ELE dept
INSERT INTO courses (code, name, credits, department, offered_semesters, course_type, year_standing) VALUES
('ELE300',  'Electric Circuits',               3, 'ELE', 'fall',   'required', 2),
('ELE303',  'Electrical Circuits Lab',         1, 'ELE', 'fall',   'lab',      2),
('ELE401',  'Electronics I',                   3, 'ELE', 'spring', 'required', 2),
('ELE402',  'Electronics I Lab',               1, 'ELE', 'spring', 'lab',      2),
('ELE430',  'Signals and Systems',             3, 'ELE', 'spring', 'required', 2),
('ELE442',  'Control Systems',                 3, 'ELE', 'fall',   'required', 4),
('ELE443',  'Control Systems Lab',             1, 'ELE', 'fall',   'lab',      4),
('ELE537',  'Communication Systems',           3, 'ELE', 'fall',   'required', 3),
('ELE540',  'Communication Systems Lab',       1, 'ELE', 'spring', 'lab',      3);

-- ============================================================
-- COURSES — COE TECHNICAL ELECTIVE PLACEHOLDERS
-- ============================================================
INSERT INTO courses (code, name, credits, department, offered_semesters, course_type, year_standing) VALUES
('COE_TE1', 'COE Technical Elective 1', 3, 'COE', 'both', 'elective', 3),
('COE_TE2', 'COE Technical Elective 2', 3, 'COE', 'spring', 'elective', 3),
('COE_TE3', 'COE Technical Elective 3', 3, 'COE', 'spring', 'elective', 3),
('COE_TE4', 'COE Technical Elective 4', 3, 'COE', 'spring', 'elective', 3),
('ECE_TE5', 'ECE Technical Elective 5', 3, 'COE', 'spring', 'elective', 4),
('ECE_TE6', 'ECE Technical Elective 6', 3, 'COE', 'spring', 'elective', 4);
-- ============================================================
-- MAJOR REQUIREMENTS — COE (150 credits)
-- core: 79  math_science: 18  other_eng: 14  las: 24  elective: 15
-- ============================================================
INSERT INTO major_requirements (major, course_code, requirement_type) VALUES
-- Core COE
('COE', 'COE211',  'core'),
('COE', 'COE312',  'core'),
('COE', 'COE313',  'core'),
('COE', 'COE321',  'core'),
('COE', 'COE322',  'core'),
('COE', 'COE323',  'core'),
('COE', 'COE324',  'core'),
('COE', 'COE414',  'core'),
('COE', 'COE415',  'core'),
('COE', 'COE415B', 'core'),
('COE', 'COE416',  'core'),
('COE', 'COE418',  'core'),
('COE', 'COE423',  'core'),
('COE', 'COE424',  'core'),
('COE', 'COE425',  'core'),
('COE', 'COE431',  'core'),
('COE', 'COE493',  'core'),
('COE', 'COE498',  'core'),
('COE', 'COE521',  'core'),
('COE', 'COE593',  'core'),
('COE', 'COE595',  'core'),
('COE', 'COE596',  'core'),
-- ELE courses required for COE
('COE', 'ELE300',  'core'),
('COE', 'ELE303',  'core'),
('COE', 'ELE401',  'core'),
('COE', 'ELE402',  'core'),
('COE', 'ELE430',  'core'),
('COE', 'ELE442',  'core'),
('COE', 'ELE443',  'core'),
('COE', 'ELE537',  'core'),
('COE', 'ELE540',  'core'),
-- Math & Science
('COE', 'MTH201',  'math_science'),
('COE', 'MTH206',  'math_science'),
('COE', 'MTH207',  'math_science'),
('COE', 'MTH304',  'math_science'),
('COE', 'GNE331',  'math_science'),
('COE', 'PHY201',  'math_science'),
-- Other Engineering
('COE', 'COE201',  'other_eng'),
('COE', 'GNE212',  'other_eng'),
('COE', 'GNE301',  'other_eng'),
('COE', 'GNE303',  'other_eng'),
('COE', 'GNE000',  'other_eng'),
('COE', 'INE320',  'other_eng'),
-- LAS
('COE', 'ENG202',  'las'),
('COE', 'COM203',  'las'),
('COE', 'LAS001',  'las'),
('COE', 'LAS002',  'las'),
('COE', 'LAS003',  'las'),
('COE', 'LAS004',  'las'),
-- Electives
('COE', 'FREE001', 'elective'),
('COE', 'COE_TE1', 'elective'),
('COE', 'COE_TE2', 'elective'),
('COE', 'COE_TE3', 'elective'),
('COE', 'COE_TE4', 'elective'),
('COE', 'ECE_TE5', 'elective'),
('COE', 'ECE_TE6', 'elective');
-- ============================================================
-- PREREQUISITES
-- ============================================================

-- English chain
INSERT INTO prerequisites VALUES
('COM203', 'ENG202');

-- Math chain
INSERT INTO prerequisites VALUES
('MTH206', 'MTH201');

-- COE chain
INSERT INTO prerequisites VALUES
('COE312',  'COE211'),
('COE313',  'COE312'),
('COE321',  'COE211'),
('COE321',  'MTH207'),
('COE322',  'COE321'),
('COE323',  'COE321'),
('COE324',  'COE323'),
('COE414',  'COE312'),
('COE414',  'COE323'),
('COE415',  'COE211'),
('COE415B', 'COE415'),
('COE416',  'COE418'),
('COE416',  'COE415'),
('COE418',  'COE211'),
('COE423',  'COE323'),
('COE424',  'COE321'),
('COE425',  'COE424'),
('COE431',  'COE312'),
('COE493',  'COE312'),
('COE521',  'COE323'),
('COE593',  'COE416'),
('COE595',  'COE593'),
('COE596',  'COE595');

-- ELE chain (courses required by COE)
INSERT INTO prerequisites VALUES
('ELE300',  'PHY201'),
('ELE300',  'MTH304'),
-- ('ELE303',  'ELE300'),
('ELE401',  'ELE300'),
-- ('ELE402',  'ELE401'),
('ELE402',  'ELE303'),
('ELE430',  'ELE300'),
('ELE430',  'MTH206'),
('ELE442',  'ELE430'),
('ELE443',  'ELE442'),
('ELE537',  'ELE430'),
('ELE537',  'GNE331'),
('ELE540',  'ELE537');


-- ============================================================
-- VERIFY
-- ============================================================
SELECT SUM(c.credits)
FROM courses c JOIN major_requirements mr ON c.code = mr.course_code
WHERE mr.major = 'COE';
-- Expected: 150

SELECT mr.requirement_type, COUNT(*) as count, SUM(c.credits) as credits
FROM courses c JOIN major_requirements mr ON c.code = mr.course_code
WHERE mr.major = 'COE'
GROUP BY mr.requirement_type;