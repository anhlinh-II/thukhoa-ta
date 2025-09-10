"use client";
import { Button, Form, Input, Typography } from "antd";
import React from "react";

export default function RegisterPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f5" }}>
      <div style={{ width: 350, padding: 32, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #00000020" }}>
        <Typography.Title level={2} style={{ textAlign: "center" }}>Đăng ký</Typography.Title>
        <Form layout="vertical">
          <Form.Item label="Email" name="email" rules={[{ required: true, message: "Vui lòng nhập email!" }]}> 
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}> 
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item label="Xác nhận mật khẩu" name="confirm" rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu!" }]}> 
            <Input.Password placeholder="Xác nhận mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Đăng ký</Button>
          </Form.Item>
        </Form>
        <Typography.Link href="/login" style={{ display: "block", textAlign: "center" }}>
          Đã có tài khoản? Đăng nhập
        </Typography.Link>
      </div>
    </div>
  );
}
