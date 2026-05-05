-- ============================================================
-- DegreeMap — LAU Beirut 2024-2025 Official Curriculum
-- Covers: Computer Engineering (COE), Electrical Engineering (ELE),
--         Mechatronics Engineering (MCE)
-- Source: catalog.lau.edu.lb/2024-2025
-- ============================================================

CREATE DATABASE IF NOT EXISTS degreemap_db;
USE degreemap_db;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  major ENUM('COE', 'ELE', 'MCE') NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  code VARCHAR(20) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  credits INT NOT NULL,
  department VARCHAR(10) NOT NULL,
  offered_semesters VARCHAR(20) DEFAULT 'both',
  course_type ENUM('required', 'elective', 'lab') DEFAULT 'required',
  description TEXT
);

-- Which courses are required for each major
CREATE TABLE IF NOT EXISTS major_requirements (
  major ENUM('COE', 'ELE', 'MCE') NOT NULL,
  course_code VARCHAR(20) NOT NULL,
  requirement_type ENUM('core', 'math_science', 'other_eng', 'elective', 'las') DEFAULT 'core',
  PRIMARY KEY (major, course_code),
  FOREIGN KEY (course_code) REFERENCES courses(code)
);

CREATE TABLE IF NOT EXISTS prerequisites (
  course_code VARCHAR(20) NOT NULL,
  prereq_code VARCHAR(20) NOT NULL,
  PRIMARY KEY (course_code, prereq_code),
  FOREIGN KEY (course_code) REFERENCES courses(code),
  FOREIGN KEY (prereq_code) REFERENCES courses(code)
);

CREATE TABLE IF NOT EXISTS completed_courses (
  user_id INT NOT NULL,
  course_code VARCHAR(20) NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, course_code),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_code) REFERENCES courses(code)
);

-- ============================================================
-- COURSES — MATH & SCIENCE (shared across all majors)
-- ============================================================
INSERT IGNORE INTO courses (code, name, credits, department, offered_semesters, course_type) VALUES
('MTH101', 'Calculus I',                         3, 'MTH', 'both', 'required'),
('MTH102', 'Calculus II',                        3, 'MTH', 'both', 'required'),
('MTH201', 'Calculus III',                       3, 'MTH', 'both', 'required'),
('MTH206', 'Calculus IV',                        3, 'MTH', 'both', 'required'),
('MTH207', 'Discrete Structures I',              3, 'MTH', 'both', 'required'),
('MTH304', 'Differential Equations',             3, 'MTH', 'both', 'required'),
('GNE331', 'Probability and Statistics',         3, 'GNE', 'both', 'required'),
('PHY101', 'General Physics I',                  3, 'PHY', 'both', 'required'),
('PHY102', 'General Physics II',                 3, 'PHY', 'both', 'required'),
('PHY201', 'Electricity and Magnetism',          3, 'PHY', 'both', 'required');

-- ============================================================
-- COURSES — GENERAL ENGINEERING (shared)
-- ============================================================
INSERT IGNORE INTO courses (code, name, credits, department, offered_semesters, course_type) VALUES
('COE201', 'Computer Proficiency',               1, 'COE', 'both', 'required'),
('GNE301', 'Professional Communication',         2, 'GNE', 'both', 'required'),
('GNE303', 'Engineering Ethics',                 2, 'GNE', 'both', 'required'),
('GNE335', 'Intro to Sustainable Engineering',   3, 'GNE', 'both', 'elective'),
('GNE337', 'Intro to Virtual and Augmented Reality', 3, 'GNE', 'both', 'elective'),
('GNE340', 'Engineering Entrepreneurship',       3, 'GNE', 'both', 'elective'),
('INE320', 'Engineering Economy',                3, 'INE', 'both', 'required'),
('INE428', 'Project Management',                 3, 'INE', 'both', 'required'),
('CIE200', 'Statics',                            3, 'CIE', 'both', 'required'),
('MEE211', 'Engineering Graphics',               1, 'MEE', 'both', 'required');

-- ============================================================
-- COURSES — COE (Computer Engineering)
-- ============================================================
INSERT IGNORE INTO courses (code, name, credits, department, offered_semesters, course_type) VALUES
('COE211', 'Computer Programming',               4, 'COE', 'both', 'required'),
('COE312', 'Data Structures',                    3, 'COE', 'both', 'required'),
('COE313', 'Data Structures Lab',                1, 'COE', 'both', 'lab'),
('COE321', 'Logic Design',                       3, 'COE', 'both', 'required'),
('COE322', 'Logic Design Lab',                   1, 'COE', 'both', 'lab'),
('COE323', 'Microprocessors',                    3, 'COE', 'both', 'required'),
('COE324', 'Microprocessors Lab',                1, 'COE', 'both', 'lab'),
('COE414', 'Operating Systems',                  3, 'COE', 'both', 'required'),
('COE415', 'Computer Programming II',            3, 'COE', 'both', 'required'),
('COE415B','Computer Programming II Lab',        1, 'COE', 'both', 'lab'),
('COE416', 'Software Engineering',               3, 'COE', 'both', 'required'),
('COE418', 'Database Systems',                   3, 'COE', 'both', 'required'),
('COE423', 'Computer Architecture',              3, 'COE', 'both', 'required'),
('COE424', 'Digital Systems',                    3, 'COE', 'both', 'required'),
('COE425', 'Digital Systems Lab',                1, 'COE', 'both', 'lab'),
('COE431', 'Computer Networks',                  3, 'COE', 'both', 'required'),
('COE493', 'Professionalism in Engineering',     3, 'COE', 'both', 'required'),
('COE498', 'Professional Experience',            6, 'COE', 'summer', 'required'),
('COE521', 'Embedded Systems',                   3, 'COE', 'both', 'required'),
('COE593', 'Computer Engineering Applications',  3, 'COE', 'both', 'required'),
('COE595', 'Capstone Design Project I',          3, 'COE', 'both', 'required'),
('COE596', 'Capstone Design Project II',         3, 'COE', 'both', 'required');

-- COE Technical Electives
INSERT IGNORE INTO courses (code, name, credits, department, offered_semesters, course_type) VALUES
('COE522', 'High Performance Computer Architecture', 3, 'COE', 'fall', 'elective'),
('COE527', 'VLSI Design',                        3, 'COE', 'spring', 'elective'),
('COE529', 'Testing for Digital Integrated Circuits', 3, 'COE', 'fall', 'elective'),
('COE543', 'Intelligent Data Processing & Applications', 3, 'COE', 'both', 'elective'),
('COE544', 'Intelligent Engineering Algorithms', 3, 'COE', 'both', 'elective'),
('COE545', 'Information Security',               3, 'COE', 'both', 'elective'),
('COE546', 'Machine Learning',                   3, 'COE', 'both', 'elective'),
('COE547', 'Deep Learning',                      3, 'COE', 'both', 'elective'),
('COE548', 'Large Language Models',              3, 'COE', 'spring', 'elective'),
('COE554', 'Computer Vision and Deep Learning',  3, 'COE', 'both', 'elective');

-- ============================================================
-- COURSES — ELE (Electrical Engineering)
-- ============================================================
INSERT IGNORE INTO courses (code, name, credits, department, offered_semesters, course_type) VALUES
('ELE300', 'Electric Circuits',                  3, 'ELE', 'both', 'required'),
('ELE303', 'Electrical Circuits Lab',            1, 'ELE', 'both', 'lab'),
('ELE391', 'Mathematical Methods in ELE',        3, 'ELE', 'both', 'required'),
('ELE401', 'Electronics I',                      3, 'ELE', 'both', 'required'),
('ELE402', 'Electronics I Lab',                  1, 'ELE', 'both', 'lab'),
('ELE411', 'Electromagnetic Fields',             3, 'ELE', 'both', 'required'),
('ELE413', 'Electromagnetic Waves',              3, 'ELE', 'both', 'required'),
('ELE420', 'Electromechanics',                   3, 'ELE', 'both', 'required'),
('ELE422', 'Power Systems',                      3, 'ELE', 'both', 'required'),
('ELE423', 'Electric Machines Lab',              1, 'ELE', 'both', 'lab'),
('ELE430', 'Signals and Systems',                3, 'ELE', 'both', 'required'),
('ELE442', 'Control Systems',                    3, 'ELE', 'both', 'required'),
('ELE443', 'Control Systems Lab',                1, 'ELE', 'both', 'lab'),
('ELE493', 'Professionalism in Engineering',     3, 'ELE', 'both', 'required'),
('ELE498', 'Professional Experience',            6, 'ELE', 'summer', 'required'),
('ELE501', 'Microelectronics',                   3, 'ELE', 'both', 'required'),
('ELE537', 'Communication Systems',              3, 'ELE', 'both', 'required'),
('ELE538', 'Noise in Communication Systems',     3, 'ELE', 'fall', 'required'),
('ELE540', 'Communication Systems Lab',          1, 'ELE', 'both', 'lab'),
('ELE593', 'Electrical Engineering Applications',3, 'ELE', 'both', 'required'),
('ELE595', 'Capstone Design Project I',          3, 'ELE', 'both', 'required'),
('ELE596', 'Capstone Design Project II',         3, 'ELE', 'both', 'required');

-- ELE Technical Electives
INSERT IGNORE INTO courses (code, name, credits, department, offered_semesters, course_type) VALUES
('ELE520', 'Electricity Markets & Renewable Energy', 3, 'ELE', 'spring', 'elective'),
('ELE521', 'Electrical Energy Storage Systems',  3, 'ELE', 'both', 'elective'),
('ELE525', 'Faulted Power Systems',              3, 'ELE', 'fall', 'elective'),
('ELE526', 'Renewable Energy Sources',           3, 'ELE', 'both', 'elective'),
('ELE529', 'Design & Operation of Smart Grids',  3, 'ELE', 'spring', 'elective'),
('ELE531', 'Optical Fiber Communications',       3, 'ELE', 'fall', 'elective'),
('ELE535', 'Information and Coding Theory',      3, 'ELE', 'spring', 'elective'),
('ELE539', 'Telecommunication Systems',          3, 'ELE', 'both', 'elective'),
('ELE552', 'Digital Image and Video Processing', 3, 'ELE', 'fall', 'elective'),
('ELE553', 'Reliability Evaluation of Engineering Systems', 3, 'ELE', 'spring', 'elective'),
('ELE557', 'Simulation of Electronic Circuits',  3, 'ELE', 'both', 'elective');

-- ============================================================
-- COURSES — MCE (Mechatronics Engineering)
-- ============================================================
INSERT IGNORE INTO courses (code, name, credits, department, offered_semesters, course_type) VALUES
('MCE211', 'Mechatronics Engineering Orientation', 1, 'MCE', 'fall', 'required'),
('MCE310', 'Mechatronics System Design I',       3, 'MCE', 'both', 'required'),
('MCE311', 'Mechatronics System Design I Lab',   1, 'MCE', 'both', 'lab'),
('MCE391', 'Instrumentation and Measurements',   3, 'MCE', 'both', 'required'),
('MCE392', 'Instrumentation and Measurements Lab', 1, 'MCE', 'both', 'lab'),
('MCE410', 'Mechatronics System Design II',      3, 'MCE', 'both', 'required'),
('MCE411', 'Mechatronics System Design II Lab',  1, 'MCE', 'both', 'lab'),
('MCE493', 'Professionalism in Engineering',     3, 'MCE', 'both', 'required'),
('MCE498', 'Professional Experience',            6, 'MCE', 'summer', 'required'),
('MCE593', 'Mechatronics Engineering Applications', 3, 'MCE', 'both', 'required'),
('MCE595', 'Capstone Design Project I',          3, 'MCE', 'both', 'required'),
('MCE596', 'Capstone Design Project II',         3, 'MCE', 'both', 'required');

-- MCE shared with MEE
INSERT IGNORE INTO courses (code, name, credits, department, offered_semesters, course_type) VALUES
('MEE201', 'Thermodynamics',                     3, 'MEE', 'both', 'required'),
('MEE221', 'Mechanics of Materials',             3, 'MEE', 'both', 'required'),
('MEE311', 'Dynamics',                           3, 'MEE', 'both', 'required'),
('MEE332', 'Manufacturing Processes',            3, 'MEE', 'both', 'required'),
('MEE445', 'Control Systems (MEE)',              3, 'MEE', 'both', 'required');

-- MCE Technical Electives
INSERT IGNORE INTO courses (code, name, credits, department, offered_semesters, course_type) VALUES
('MCE540', 'Biomechatronics',                    3, 'MCE', 'both', 'elective'),
('MCE550', 'Robotics & Intelligent Systems',     3, 'MCE', 'both', 'elective'),
('MCE552', 'Computer Vision & Image Processing', 3, 'MCE', 'spring', 'elective');

-- ============================================================
-- MAJOR REQUIREMENTS — COE (150 credits)
-- ============================================================
INSERT IGNORE INTO major_requirements (major, course_code, requirement_type) VALUES
-- Core COE courses
('COE', 'COE211', 'core'), ('COE', 'COE312', 'core'), ('COE', 'COE313', 'core'),
('COE', 'COE321', 'core'), ('COE', 'COE322', 'core'), ('COE', 'COE323', 'core'),
('COE', 'COE324', 'core'), ('COE', 'COE414', 'core'), ('COE', 'COE415', 'core'),
('COE', 'COE415B','core'), ('COE', 'COE416', 'core'), ('COE', 'COE418', 'core'),
('COE', 'COE423', 'core'), ('COE', 'COE424', 'core'), ('COE', 'COE425', 'core'),
('COE', 'COE431', 'core'), ('COE', 'COE493', 'core'), ('COE', 'COE498', 'core'),
('COE', 'COE521', 'core'), ('COE', 'COE593', 'core'), ('COE', 'COE595', 'core'),
('COE', 'COE596', 'core'),
-- ELE courses required for COE
('COE', 'ELE300', 'core'), ('COE', 'ELE303', 'core'), ('COE', 'ELE401', 'core'),
('COE', 'ELE402', 'core'), ('COE', 'ELE430', 'core'), ('COE', 'ELE442', 'core'),
('COE', 'ELE443', 'core'), ('COE', 'ELE537', 'core'), ('COE', 'ELE540', 'core'),
-- Math & Science
('COE', 'MTH201', 'math_science'), ('COE', 'MTH206', 'math_science'),
('COE', 'MTH207', 'math_science'), ('COE', 'MTH304', 'math_science'),
('COE', 'GNE331', 'math_science'), ('COE', 'PHY201', 'math_science'),
-- Other Engineering
('COE', 'COE201', 'other_eng'), ('COE', 'GNE301', 'other_eng'),
('COE', 'GNE303', 'other_eng'), ('COE', 'INE320', 'other_eng');

-- ============================================================
-- MAJOR REQUIREMENTS — ELE (150 credits)
-- ============================================================
INSERT IGNORE INTO major_requirements (major, course_code, requirement_type) VALUES
-- Core ELE courses
('ELE', 'COE211', 'core'), ('ELE', 'COE321', 'core'), ('ELE', 'COE322', 'core'),
('ELE', 'COE323', 'core'), ('ELE', 'COE324', 'core'), ('ELE', 'COE521', 'core'),
('ELE', 'ELE300', 'core'), ('ELE', 'ELE303', 'core'), ('ELE', 'ELE391', 'core'),
('ELE', 'ELE401', 'core'), ('ELE', 'ELE402', 'core'), ('ELE', 'ELE411', 'core'),
('ELE', 'ELE413', 'core'), ('ELE', 'ELE420', 'core'), ('ELE', 'ELE422', 'core'),
('ELE', 'ELE423', 'core'), ('ELE', 'ELE430', 'core'), ('ELE', 'ELE442', 'core'),
('ELE', 'ELE443', 'core'), ('ELE', 'ELE493', 'core'), ('ELE', 'ELE498', 'core'),
('ELE', 'ELE501', 'core'), ('ELE', 'ELE537', 'core'), ('ELE', 'ELE538', 'core'),
('ELE', 'ELE540', 'core'), ('ELE', 'ELE593', 'core'), ('ELE', 'ELE595', 'core'),
('ELE', 'ELE596', 'core'),
-- Math & Science
('ELE', 'MTH201', 'math_science'), ('ELE', 'MTH206', 'math_science'),
('ELE', 'MTH207', 'math_science'), ('ELE', 'MTH304', 'math_science'),
('ELE', 'GNE331', 'math_science'), ('ELE', 'PHY201', 'math_science'),
-- Other Engineering
('ELE', 'COE201', 'other_eng'), ('ELE', 'GNE301', 'other_eng'),
('ELE', 'GNE303', 'other_eng'), ('ELE', 'INE320', 'other_eng');

-- ============================================================
-- MAJOR REQUIREMENTS — MCE (150 credits)
-- ============================================================
INSERT IGNORE INTO major_requirements (major, course_code, requirement_type) VALUES
-- Core MCE
('MCE', 'COE211', 'core'), ('MCE', 'COE321', 'core'), ('MCE', 'COE322', 'core'),
('MCE', 'COE323', 'core'), ('MCE', 'COE324', 'core'),
('MCE', 'ELE300', 'core'), ('MCE', 'ELE303', 'core'), ('MCE', 'ELE401', 'core'),
('MCE', 'ELE402', 'core'), ('MCE', 'ELE430', 'core'), ('MCE', 'ELE442', 'core'),
('MCE', 'ELE443', 'core'),
('MCE', 'MCE211', 'core'), ('MCE', 'MCE310', 'core'), ('MCE', 'MCE311', 'core'),
('MCE', 'MCE391', 'core'), ('MCE', 'MCE392', 'core'), ('MCE', 'MCE410', 'core'),
('MCE', 'MCE411', 'core'), ('MCE', 'MCE493', 'core'), ('MCE', 'MCE498', 'core'),
('MCE', 'MCE593', 'core'), ('MCE', 'MCE595', 'core'), ('MCE', 'MCE596', 'core'),
('MCE', 'MEE201', 'core'), ('MCE', 'MEE221', 'core'), ('MCE', 'MEE311', 'core'),
('MCE', 'MEE332', 'core'),
-- Math & Science
('MCE', 'MTH201', 'math_science'), ('MCE', 'MTH206', 'math_science'),
('MCE', 'MTH207', 'math_science'), ('MCE', 'MTH304', 'math_science'),
('MCE', 'GNE331', 'math_science'), ('MCE', 'PHY201', 'math_science'),
-- Other Engineering
('MCE', 'COE201', 'other_eng'), ('MCE', 'CIE200', 'other_eng'),
('MCE', 'GNE301', 'other_eng'), ('MCE', 'GNE303', 'other_eng'),
('MCE', 'INE320', 'other_eng'), ('MCE', 'INE428', 'other_eng'),
('MCE', 'MEE211', 'other_eng');

-- ============================================================
-- PREREQUISITES
-- ============================================================

-- Math chain
INSERT IGNORE INTO prerequisites VALUES
('MTH102', 'MTH101'),
('MTH201', 'MTH102'),
('MTH206', 'MTH201'),
('MTH304', 'MTH102'),
('MTH207', 'MTH101');

-- Physics
INSERT IGNORE INTO prerequisites VALUES
('PHY102', 'PHY101'),
('PHY201', 'PHY102');

-- COE chain
INSERT IGNORE INTO prerequisites VALUES
('COE312', 'COE211'),
('COE313', 'COE211'),
('COE321', 'COE211'),
('COE322', 'COE321'),
('COE323', 'COE321'),
('COE324', 'COE323'),
('COE414', 'COE312'),
('COE415', 'COE312'),
('COE415B','COE415'),
('COE416', 'COE312'),
('COE418', 'COE312'),
('COE423', 'COE323'),
('COE424', 'COE321'),
('COE425', 'COE424'),
('COE431', 'COE312'),
('COE521', 'COE323'),
('COE593', 'COE416'),
('COE595', 'COE416'),
('COE596', 'COE595'),
-- COE Electives
('COE522', 'COE423'),
('COE527', 'COE424'),
('COE529', 'COE424'),
('COE543', 'COE312'),
('COE544', 'COE312'),
('COE545', 'COE431'),
('COE546', 'COE312'),
('COE547', 'COE546'),
('COE554', 'COE546');

-- ELE chain
INSERT IGNORE INTO prerequisites VALUES
('ELE300', 'PHY201'),
('ELE303', 'ELE300'),
('ELE391', 'MTH201'),
('ELE401', 'ELE300'),
('ELE402', 'ELE401'),
('ELE411', 'ELE300'),
('ELE411', 'MTH206'),
('ELE413', 'ELE411'),
('ELE420', 'ELE401'),
('ELE422', 'ELE420'),
('ELE423', 'ELE420'),
('ELE430', 'ELE300'),
('ELE430', 'MTH304'),
('ELE442', 'ELE430'),
('ELE443', 'ELE442'),
('ELE501', 'ELE401'),
('ELE537', 'ELE430'),
('ELE538', 'ELE537'),
('ELE540', 'ELE537'),
('ELE593', 'ELE537'),
('ELE595', 'ELE593'),
('ELE596', 'ELE595'),
-- ELE Electives
('ELE520', 'ELE422'),
('ELE521', 'ELE422'),
('ELE525', 'ELE422'),
('ELE526', 'ELE422'),
('ELE529', 'ELE422'),
('ELE531', 'ELE537'),
('ELE535', 'ELE430'),
('ELE539', 'ELE537'),
('ELE552', 'ELE430'),
('ELE557', 'ELE401');

-- MCE chain
INSERT IGNORE INTO prerequisites VALUES
('MCE310', 'COE211'),
('MCE310', 'ELE300'),
('MCE311', 'MCE310'),
('MCE391', 'ELE300'),
('MCE392', 'MCE391'),
('MCE410', 'MCE310'),
('MCE410', 'ELE442'),
('MCE411', 'MCE410'),
('MCE593', 'MCE410'),
('MCE595', 'MCE593'),
('MCE596', 'MCE595'),
('MEE221', 'CIE200'),
('MEE311', 'CIE200'),
('MEE332', 'MEE221'),
-- MCE Electives
('MCE540', 'ELE401'),
('MCE540', 'ELE442'),
('MCE550', 'MCE410'),
('MCE552', 'COE211');