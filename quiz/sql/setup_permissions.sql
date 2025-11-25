-- Create tables for roles and permissions
CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    INDEX idx_resource_action (resource, action),
    INDEX idx_name (name)
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    authority VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255) NOT NULL,
    INDEX idx_authority (authority)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Insert default permissions
INSERT IGNORE INTO permissions (name, description, resource, action) VALUES
-- User permissions
('USER_CREATE', 'Create new users', 'USER', 'CREATE'),
('USER_READ', 'View user information', 'USER', 'READ'),
('USER_UPDATE', 'Update user information', 'USER', 'UPDATE'),
('USER_DELETE', 'Delete users', 'USER', 'DELETE'),
('USER_MANAGE', 'Full user management', 'USER', 'MANAGE'),

-- Quiz permissions
('QUIZ_CREATE', 'Create new quizzes', 'QUIZ', 'CREATE'),
('QUIZ_READ', 'View quizzes', 'QUIZ', 'READ'),
('QUIZ_UPDATE', 'Update quizzes', 'QUIZ', 'UPDATE'),
('QUIZ_DELETE', 'Delete quizzes', 'QUIZ', 'DELETE'),
('QUIZ_MANAGE', 'Full quiz management', 'QUIZ', 'MANAGE'),

-- Quiz Category permissions
('QUIZ_CATEGORY_CREATE', 'Create quiz categories', 'QUIZ_CATEGORY', 'CREATE'),
('QUIZ_CATEGORY_READ', 'View quiz categories', 'QUIZ_CATEGORY', 'READ'),
('QUIZ_CATEGORY_UPDATE', 'Update quiz categories', 'QUIZ_CATEGORY', 'UPDATE'),
('QUIZ_CATEGORY_DELETE', 'Delete quiz categories', 'QUIZ_CATEGORY', 'DELETE'),
('QUIZ_CATEGORY_MANAGE', 'Full quiz category management', 'QUIZ_CATEGORY', 'MANAGE'),

-- Role permissions
('ROLE_CREATE', 'Create new roles', 'ROLE', 'CREATE'),
('ROLE_READ', 'View roles', 'ROLE', 'READ'),
('ROLE_UPDATE', 'Update roles', 'ROLE', 'UPDATE'),
('ROLE_DELETE', 'Delete roles', 'ROLE', 'DELETE'),
('ROLE_MANAGE', 'Full role management', 'ROLE', 'MANAGE'),

-- Permission permissions
('PERMISSION_CREATE', 'Create new permissions', 'PERMISSION', 'CREATE'),
('PERMISSION_READ', 'View permissions', 'PERMISSION', 'READ'),
('PERMISSION_UPDATE', 'Update permissions', 'PERMISSION', 'UPDATE'),
('PERMISSION_DELETE', 'Delete permissions', 'PERMISSION', 'DELETE'),
('PERMISSION_MANAGE', 'Full permission management', 'PERMISSION', 'MANAGE'),

-- System permissions
('SYSTEM_MANAGE', 'System administration', 'SYSTEM', 'MANAGE'),
('SYSTEM_VIEW_ALL', 'View all system data', 'SYSTEM', 'VIEW_ALL'),
('SYSTEM_EXPORT', 'Export system data', 'SYSTEM', 'EXPORT'),
('SYSTEM_IMPORT', 'Import system data', 'SYSTEM', 'IMPORT');

-- Insert default roles
INSERT IGNORE INTO roles (authority, description) VALUES
('SUPER_ADMIN', 'Super Administrator with full system access'),
('ADMIN', 'Administrator with management access'),
('MODERATOR', 'Moderator with limited management access'),
('USER', 'Regular user with basic access'),
('GUEST', 'Guest user with read-only access');

-- Assign permissions to SUPER_ADMIN (all permissions)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE authority = 'SUPER_ADMIN'),
    p.id
FROM permissions p;

-- Assign permissions to ADMIN
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE authority = 'ADMIN'),
    p.id
FROM permissions p
WHERE p.resource IN ('USER', 'QUIZ', 'QUIZ_CATEGORY') 
   AND p.action IN ('CREATE', 'READ', 'UPDATE', 'DELETE');

-- Assign permissions to MODERATOR
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE authority = 'MODERATOR'),
    p.id
FROM permissions p
WHERE p.resource IN ('QUIZ', 'QUIZ_CATEGORY') 
   AND p.action IN ('CREATE', 'READ', 'UPDATE')
   OR (p.resource = 'USER' AND p.action = 'READ');

-- Assign permissions to USER
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE authority = 'USER'),
    p.id
FROM permissions p
WHERE p.action = 'READ'
   OR (p.resource = 'QUIZ' AND p.action = 'CREATE');

-- Assign permissions to GUEST
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE authority = 'GUEST'),
    p.id
FROM permissions p
WHERE p.action = 'READ' AND p.resource IN ('QUIZ', 'QUIZ_CATEGORY');

-- Add default user role if not exists
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT 
    u.id,
    (SELECT id FROM roles WHERE authority = 'USER')
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id
);

-- Permissions for quiz comments
INSERT IGNORE INTO permissions (name, description, resource, action) VALUES
('QUIZ_COMMENT_CREATE', 'Create comments under a quiz', 'QUIZ_COMMENT', 'CREATE'),
('QUIZ_COMMENT_READ', 'Read comments under a quiz', 'QUIZ_COMMENT', 'READ'),
('QUIZ_COMMENT_UPDATE', 'Update own comment', 'QUIZ_COMMENT', 'UPDATE'),
('QUIZ_COMMENT_DELETE', 'Delete own comment', 'QUIZ_COMMENT', 'DELETE'),
('QUIZ_COMMENT_MODERATE', 'Moderate and manage comments', 'QUIZ_COMMENT', 'MODERATE');

