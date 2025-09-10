# Chức năng Quên Mật Khẩu (Forgot Password)

## Tổng quan
Chức năng này cho phép người dùng reset mật khẩu thông qua email khi họ quên mật khẩu.

## Luồng hoạt động
1. Người dùng gửi email để yêu cầu reset mật khẩu
2. Hệ thống tạo token reset password và gửi email có link reset
3. Người dùng click vào link trong email để reset mật khẩu
4. Hệ thống validate token và cho phép người dùng đặt mật khẩu mới

## API Endpoints

### 1. Yêu cầu Reset Mật Khẩu
- **URL**: `POST /api/users/forgot-password`
- **Body**:
```json
{
    "email": "user@example.com"
}
```
- **Response**: 
  - 200: Thành công - Email đã được gửi
  - 404: Email không tồn tại

### 2. Reset Mật Khẩu
- **URL**: `POST /api/users/reset-password`
- **Body**:
```json
{
    "token": "reset-token-from-email",
    "password": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
}
```
- **Response**:
  - 200: Reset mật khẩu thành công
  - 400: Token không hợp lệ hoặc đã hết hạn
  - 400: Mật khẩu không khớp

## Yêu cầu Database
Thực hiện SQL script sau để thêm các field cần thiết:

```sql
ALTER TABLE users 
ADD COLUMN reset_password_token VARCHAR(255) NULL,
ADD COLUMN reset_password_token_expiry TIMESTAMP NULL;

CREATE INDEX idx_users_reset_token ON users(reset_password_token);
```

## Cấu hình Email
Đảm bảo cấu hình email trong `application.properties`:

```properties
# Email configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

## Test với Postman
Import file `forgot-password-api-tests.json` vào Postman để test các API.

## Bảo mật
- Token reset có thời hạn 1 giờ
- Token chỉ sử dụng được 1 lần
- Mật khẩu mới phải đáp ứng yêu cầu: ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt
