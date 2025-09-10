-- ==========================================
-- QUERIES ĐỂ XEM ROLE VÀ PERMISSION SYSTEM
-- ==========================================

-- 1. Xem tất cả roles hiện có
SELECT 
    r.id,
    r.authority,
    r.description
FROM roles r
ORDER BY r.authority;

-- 2. Xem tất cả permissions hiện có
SELECT 
    p.id,
    p.name,
    p.description,
    p.resource,
    p.action
FROM permissions p
ORDER BY p.resource, p.action;

-- 3. Xem role nào có permission gì (chi tiết)
SELECT 
    r.authority AS role_name,
    r.description AS role_description,
    p.name AS permission_name,
    p.description AS permission_description,
    p.resource,
    p.action
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.authority, p.resource, p.action;

-- 4. Xem role nào có permission gì (tóm tắt theo role)
SELECT 
    r.authority AS role_name,
    GROUP_CONCAT(
        CONCAT(p.resource, ':', p.action) 
        ORDER BY p.resource, p.action 
        SEPARATOR ', '
    ) AS permissions
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
GROUP BY r.id, r.authority
ORDER BY r.authority;

-- 5. Xem permission nào thuộc về role nào
SELECT 
    p.name AS permission_name,
    p.resource,
    p.action,
    GROUP_CONCAT(r.authority ORDER BY r.authority SEPARATOR ', ') AS roles_have_this_permission
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON rp.role_id = r.id
GROUP BY p.id, p.name, p.resource, p.action
ORDER BY p.resource, p.action;

-- 6. Xem user nào có role gì
SELECT 
    u.id AS user_id,
    u.username,
    u.email,
    GROUP_CONCAT(r.authority ORDER BY r.authority SEPARATOR ', ') AS user_roles
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.username, u.email
ORDER BY u.username;

-- 7. Xem user nào có permission gì (thông qua roles)
SELECT 
    u.username,
    u.email,
    r.authority AS role_name,
    p.resource,
    p.action,
    p.name AS permission_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY u.username, r.authority, p.resource, p.action;

-- 8. Đếm số lượng permission của mỗi role
SELECT 
    r.authority AS role_name,
    COUNT(p.id) AS total_permissions,
    COUNT(CASE WHEN p.resource = 'USER' THEN 1 END) AS user_permissions,
    COUNT(CASE WHEN p.resource = 'QUIZ' THEN 1 END) AS quiz_permissions,
    COUNT(CASE WHEN p.resource = 'QUIZ_CATEGORY' THEN 1 END) AS category_permissions,
    COUNT(CASE WHEN p.resource = 'ROLE' THEN 1 END) AS role_permissions,
    COUNT(CASE WHEN p.resource = 'PERMISSION' THEN 1 END) AS permission_permissions,
    COUNT(CASE WHEN p.resource = 'SYSTEM' THEN 1 END) AS system_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
GROUP BY r.id, r.authority
ORDER BY total_permissions DESC;

-- 9. Xem permissions theo resource
SELECT 
    p.resource,
    COUNT(*) AS total_permissions,
    GROUP_CONCAT(DISTINCT p.action ORDER BY p.action SEPARATOR ', ') AS actions_available,
    GROUP_CONCAT(DISTINCT r.authority ORDER BY r.authority SEPARATOR ', ') AS roles_with_access
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id
LEFT JOIN roles r ON rp.role_id = r.id
GROUP BY p.resource
ORDER BY p.resource;

-- 10. Kiểm tra user cụ thể có permission gì
-- (Thay 'username_here' bằng username thực tế)
SELECT DISTINCT
    u.username,
    p.resource,
    p.action,
    p.name AS permission_name,
    r.authority AS granted_by_role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = 'username_here'  -- Thay đổi username ở đây
ORDER BY p.resource, p.action;

-- 11. Kiểm tra role cụ thể có permission gì
-- (Thay 'ADMIN' bằng role authority thực tế)
SELECT 
    r.authority AS role_name,
    p.resource,
    p.action,
    p.name AS permission_name,
    p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.authority = 'ADMIN'  -- Thay đổi role ở đây
ORDER BY p.resource, p.action;

-- 12. Tìm user không có role nào
SELECT 
    u.id,
    u.username,
    u.email,
    'NO_ROLES' AS status
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL;

-- 13. Tìm role không có permission nào
SELECT 
    r.id,
    r.authority,
    r.description,
    'NO_PERMISSIONS' AS status
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE rp.role_id IS NULL;

-- 14. Tìm permission không được assign cho role nào
SELECT 
    p.id,
    p.name,
    p.resource,
    p.action,
    'UNASSIGNED' AS status
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.permission_id IS NULL;

-- 15. Ma trận Role-Permission (pivot table view)
SELECT 
    p.name AS permission_name,
    p.resource,
    p.action,
    MAX(CASE WHEN r.authority = 'SUPER_ADMIN' THEN '✓' ELSE '✗' END) AS SUPER_ADMIN,
    MAX(CASE WHEN r.authority = 'ADMIN' THEN '✓' ELSE '✗' END) AS ADMIN,
    MAX(CASE WHEN r.authority = 'MODERATOR' THEN '✓' ELSE '✗' END) AS MODERATOR,
    MAX(CASE WHEN r.authority = 'USER' THEN '✓' ELSE '✗' END) AS USER,
    MAX(CASE WHEN r.authority = 'GUEST' THEN '✓' ELSE '✗' END) AS GUEST
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id
LEFT JOIN roles r ON rp.role_id = r.id
GROUP BY p.id, p.name, p.resource, p.action
ORDER BY p.resource, p.action;
