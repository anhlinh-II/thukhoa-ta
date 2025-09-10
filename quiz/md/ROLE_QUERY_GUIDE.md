# HƯỚNG DẪN TRUY VẤN ROLE VÀ PERMISSION

## 📁 Files đã tạo:

1. **`role_permission_queries.sql`** - 15 queries chi tiết để phân tích role/permission
2. **`quick_role_check.sql`** - 10 queries đơn giản để kiểm tra nhanh  
3. **`create_sample_users.sql`** - Tạo users mẫu để test

## 🚀 Cách sử dụng:

### Bước 1: Mở MySQL client của bạn
```bash
# Ví dụ với MySQL Workbench, phpMyAdmin, hoặc command line
mysql -u root -p -h localhost -P 3311 -D quiz_db
```

### Bước 2: Chạy queries

#### ✅ **Kiểm tra nhanh** (chạy file `quick_role_check.sql`):
```sql
-- Copy và paste từng query trong file quick_role_check.sql
-- Hoặc:
source quick_role_check.sql;
```

#### 🔍 **Phân tích chi tiết** (chạy file `role_permission_queries.sql`):
```sql
-- Copy và paste query cần thiết
-- Hoặc chạy tất cả:
source role_permission_queries.sql;
```

## 📊 Các query hữu ích nhất:

### 1. Xem tất cả roles:
```sql
SELECT authority, description FROM roles ORDER BY authority;
```

### 2. Xem role có permission gì:
```sql
SELECT 
    r.authority,
    CONCAT(p.resource, ':', p.action) AS permission
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.authority;
```

### 3. Kiểm tra user cụ thể:
```sql
-- Thay 'username_here' bằng username thật
SELECT 
    u.username,
    r.authority AS role,
    CONCAT(p.resource, ':', p.action) AS permission
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = 'username_here';
```

### 4. Ma trận role-permission:
```sql
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
```

## 🎯 Mục đích các queries:

### **Queries 1-5**: Hiển thị cơ bản
- Xem roles, permissions, relationships

### **Queries 6-10**: Phân tích user
- User nào có role/permission gì
- Tìm admin, moderator

### **Queries 11-15**: Troubleshooting  
- Tìm user/role/permission không được assign
- Ma trận đầy đủ role-permission

## 🔧 Customization:

### Thay đổi username để check:
```sql
WHERE u.username = 'YOUR_USERNAME'
```

### Thay đổi role để check:
```sql  
WHERE r.authority = 'YOUR_ROLE'
```

### Thay đổi resource để check:
```sql
WHERE p.resource = 'USER'  -- hoặc QUIZ, QUIZ_CATEGORY, etc.
```

## 📈 Kết quả mong đợi:

Sau khi chạy setup_permissions.sql đầy đủ, bạn sẽ thấy:
- **5 roles**: SUPER_ADMIN, ADMIN, MODERATOR, USER, GUEST
- **29 permissions**: Covering USER, QUIZ, QUIZ_CATEGORY, ROLE, PERMISSION, SYSTEM
- **Role hierarchy**: SUPER_ADMIN > ADMIN > MODERATOR > USER > GUEST

## ⚠️ Lưu ý:

1. **Đảm bảo đã chạy setup scripts trước**
2. **Thay username/role thực tế** trong queries có placeholder
3. **Check connection string** phù hợp với setup của bạn
4. **Backup database** trước khi chạy scripts modify data
