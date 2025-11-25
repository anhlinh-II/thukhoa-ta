-- Create table for quiz comments
CREATE TABLE IF NOT EXISTS quiz_comment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  quiz_id BIGINT NOT NULL,
  parent_id BIGINT NULL,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  is_flagged TINYINT(1) NOT NULL DEFAULT 0,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(255) NULL,
  updated_by VARCHAR(255) NULL,
  CONSTRAINT fk_quiz_comment_quiz FOREIGN KEY (quiz_id) REFERENCES quiz_mock_test(id) ON DELETE CASCADE,
  CONSTRAINT fk_quiz_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_quiz_comment_parent FOREIGN KEY (parent_id) REFERENCES quiz_comment(id) ON DELETE CASCADE,
  INDEX idx_quiz_comment_quiz_id (quiz_id),
  INDEX idx_quiz_comment_user_id (user_id),
  INDEX idx_quiz_comment_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Note: If your MySQL does not support JSON, change `metadata JSON` to `metadata TEXT`.
