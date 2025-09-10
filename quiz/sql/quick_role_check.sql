-- ==========================================
-- QUICK CHECK QUERIES - KIỂM TRA NHANH
-- ==========================================

-- 1. LIỆT KÊ TẤT CẢ ROLES
SELECT authority, description FROM roles ORDER BY authority;

-- 2. LIỆT KÊ TẤT CẢ PERMISSIONS  
SELECT resource, action, name FROM permissions ORDER BY resource, action;

-- 3. XEM ROLE CÓ PERMISSION GÌ (NGẮN GỌN)
SELECT 
    r.authority,
    CONCAT(p.resource, ':', p.action) AS permission
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.authority, p.resource;

-- 4. ĐẾM PERMISSION CỦA TỪNG ROLE
SELECT 
    r.authority,
    COUNT(*) AS permission_count
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.authority
ORDER BY permission_count DESC;

-- 5. XEM USER CÓ ROLE GÌ
SELECT 
    u.username,
    r.authority
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
ORDER BY u.username;

-- 6. KIỂM TRA CỤ THỂ 1 USER (thay username)
SELECT 
    u.username,
    r.authority AS role,
    CONCAT(p.resource, ':', p.action) AS permission
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = 'YOUR_USERNAME_HERE'
ORDER BY p.resource, p.action;

-- 7. KIỂM TRA CỤ THỂ 1 ROLE (thay role name)
SELECT 
    CONCAT(p.resource, ':', p.action) AS permission,
    p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.authority = 'ADMIN'
ORDER BY p.resource, p.action;

-- 8. XEM TẤT CẢ ADMIN USERS
SELECT DISTINCT
    u.username,
    u.email
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE r.authority IN ('ADMIN', 'SUPER_ADMIN');

-- 9. XEM USER NÀO CÓ THỂ TẠO QUIZ
SELECT DISTINCT
    u.username
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.resource = 'QUIZ' AND p.action IN ('CREATE', 'MANAGE');

-- 10. XEM USER NÀO CÓ THỂ XÓA USER KHÁC
SELECT DISTINCT
    u.username
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.resource = 'USER' AND p.action IN ('DELETE', 'MANAGE');
