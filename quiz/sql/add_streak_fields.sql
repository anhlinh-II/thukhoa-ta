-- Add streak tracking fields to users table
ALTER TABLE users
ADD COLUMN current_streak INT DEFAULT 0,
ADD COLUMN longest_streak INT DEFAULT 0,
ADD COLUMN last_activity_date DATETIME NULL;

-- Add ranking fields to users table
ALTER TABLE users
ADD COLUMN ranking_points BIGINT DEFAULT 0,
ADD COLUMN total_quizzes_completed INT DEFAULT 0;

-- Update users_view to include streak and ranking fields
DROP VIEW IF EXISTS users_view;

CREATE VIEW users_view AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    u.avatar_url,
    u.dob,
    u.created_at,
    u.updated_at,
    u.gender,
    u.current_streak,
    u.longest_streak,
    u.last_activity_date,
    u.ranking_points,
    u.total_quizzes_completed
FROM users u
WHERE u.is_delete = 0 OR u.is_delete IS NULL;
