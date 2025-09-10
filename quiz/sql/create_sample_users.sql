-- ==========================================
-- SAMPLE DATA SCRIPT - TẠO DỮ LIỆU MẪU
-- ==========================================

-- Tạo sample users nếu chưa có
INSERT IGNORE INTO users (username, email, password, gender, is_active) VALUES
('admin_user', 'admin@quiz.com', '$2a$10$hash_password_here', 'MALE', true),
('moderator_user', 'moderator@quiz.com', '$2a$10$hash_password_here', 'FEMALE', true),
('normal_user', 'user@quiz.com', '$2a$10$hash_password_here', 'MALE', true),
('guest_user', 'guest@quiz.com', '$2a$10$hash_password_here', 'FEMALE', true);

-- Gán roles cho sample users
-- Admin user gets ADMIN role
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT 
    (SELECT id FROM users WHERE username = 'admin_user'),
    (SELECT id FROM roles WHERE authority = 'ADMIN');

-- Moderator user gets MODERATOR role  
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT 
    (SELECT id FROM users WHERE username = 'moderator_user'),
    (SELECT id FROM roles WHERE authority = 'MODERATOR');

-- Normal user gets USER role
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT 
    (SELECT id FROM users WHERE username = 'normal_user'),
    (SELECT id FROM roles WHERE authority = 'USER');

-- Guest user gets GUEST role
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT 
    (SELECT id FROM users WHERE username = 'guest_user'),
    (SELECT id FROM roles WHERE authority = 'GUEST');

-- Kiểm tra kết quả
SELECT 
    'Sample users created and assigned roles' AS status,
    COUNT(*) AS user_count
FROM users 
WHERE username IN ('admin_user', 'moderator_user', 'normal_user', 'guest_user');
