-- SQL script to add reset password fields to users table
ALTER TABLE users 
ADD COLUMN reset_password_token VARCHAR(255) NULL,
ADD COLUMN reset_password_token_expiry TIMESTAMP NULL;

-- Add index for better performance
CREATE INDEX idx_users_reset_token ON users(reset_password_token);
