-- Migration: create courses domain (courses, modules, lessons, enrollments, entitlements)
CREATE TABLE IF NOT EXISTS courses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) DEFAULT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(100),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_courses_slug (slug),
  INDEX idx_courses_published (is_published)
);

CREATE TABLE IF NOT EXISTS course_modules (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_module_course (course_id, display_order)
);

CREATE TABLE IF NOT EXISTS course_lessons (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  module_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content MEDIUMTEXT,
  resource_url VARCHAR(1024),
  lesson_type VARCHAR(50) DEFAULT 'lesson',
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
  INDEX idx_lesson_module (module_id, position)
);

CREATE TABLE IF NOT EXISTS course_enrollments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  payment_id VARCHAR(255) DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_enrollment_user (user_id),
  UNIQUE KEY uq_enrollment_user_course (course_id, user_id)
);

CREATE TABLE IF NOT EXISTS course_entitlements (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id BIGINT NOT NULL,
  feature VARCHAR(100) NOT NULL,
  allowed BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE,
  INDEX idx_entitlement_enrollment (enrollment_id, feature)
);

-- Optional mapping table if you later want to link quizzes to lessons
CREATE TABLE IF NOT EXISTS lesson_quizzes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  lesson_id BIGINT NOT NULL,
  quiz_id BIGINT NOT NULL,
  display_order INT DEFAULT 0,
  FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
  INDEX idx_lq_lesson (lesson_id, display_order)
);
