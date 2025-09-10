-- SQL để thêm bản ghi mẫu cho quiz_group
-- Trước khi chạy, hãy kiểm tra xem có program nào trong bảng program chưa:
-- SELECT * FROM program LIMIT 5;

-- Nếu chưa có program, hãy tạo một program mẫu trước:
INSERT INTO program (name, description, slug, is_active, is_deleted, created_at, updated_at) 
VALUES ('Test Program', 'Program for testing quiz groups', 'test-program', true, false, NOW(), NOW());

-- Lấy ID của program vừa tạo (hoặc sử dụng ID của program có sẵn)
SET @program_id = LAST_INSERT_ID();

-- Thêm các quiz group mẫu
INSERT INTO quiz_group (program_id, name, description, slug, group_type, display_order, is_active, is_deleted, created_at, updated_at) 
VALUES 
    (@program_id, 'Java Fundamentals', 'Basic Java programming concepts', 'java-fundamentals', 'TOPIC', 1, true, false, NOW(), NOW()),
    (@program_id, 'Spring Boot Advanced', 'Advanced Spring Boot features', 'spring-boot-advanced', 'TOPIC', 2, true, false, NOW(), NOW()),
    (@program_id, 'Final Exam Format', 'Format for final examination', 'final-exam-format', 'FORMAT', 3, true, false, NOW(), NOW()),
    (@program_id, 'Practice Mock Test', 'Mock test for practice', 'practice-mock-test', 'MOCK_TEST', 4, true, false, NOW(), NOW());

-- Kiểm tra kết quả
SELECT qg.*, p.name as program_name 
FROM quiz_group qg 
JOIN program p ON qg.program_id = p.id 
WHERE qg.is_deleted = false
ORDER BY qg.display_order;
