"use client";
import { Button, Form, Input, Typography, message, Spin, Space, Checkbox, Divider, Select, DatePicker, Row, Col } from "antd";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authService, type RegisterRequest } from "@/services/authService";
import Link from "next/link";
import dayjs from "dayjs";

export default function RegisterPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const onFinish = async (values: any) => {
    // Validate passwords match
    if (values.password !== values.confirmPassword) {
      message.error("Mật khẩu không khớp!");
      return;
    }

    if (!agreeTerms) {
      message.error("Vui lòng đồng ý với điều khoản sử dụng!");
      return;
    }

    try {
      setLoading(true);
      const registerData: RegisterRequest = {
        email: values.email,
        password: values.password,
        username: values.username || values.email.split('@')[0], // Generate username from email if not provided
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        gender: values.gender,
        dob: values.dob ? values.dob.toISOString() : undefined,
      };

      const response = await authService.register(registerData);

      if (response.code === 1000) {
        message.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
        // Redirect to login or OTP verification page
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } else {
        message.error(response.message || "Đăng ký thất bại!");
      }
    } catch (error: any) {
      console.error("Register error:", error);
      message.error(error?.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f2f5",
      }}
    >
      <div
        style={{
          width: 500,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 32,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 8px #00000020",
        }}
      >
        <Typography.Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
          Tạo tài khoản
        </Typography.Title>

        <Spin spinning={loading}>
          <Form layout="vertical" form={form} onFinish={onFinish} autoComplete="off">
            {/* Email */}
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                placeholder="Email"
                type="email"
                size="large"
                disabled={loading}
              />
            </Form.Item>

            {/* Mật khẩu */}
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password
                placeholder="Nhập mật khẩu"
                size="large"
                disabled={loading}
              />
            </Form.Item>

            {/* Xác nhận mật khẩu */}
            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ]}
            >
              <Input.Password
                placeholder="Xác nhận mật khẩu"
                size="large"
                disabled={loading}
              />
            </Form.Item>

            {/* Họ và tên */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Tên"
                  name="firstName"
                  rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                >
                  <Input
                    placeholder="Tên"
                    size="large"
                    disabled={loading}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Họ"
                  name="lastName"
                  rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
                >
                  <Input
                    placeholder="Họ"
                    size="large"
                    disabled={loading}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Số điện thoại */}
            <Form.Item
              label="Số điện thoại"
              name="phone"
            >
              <Input
                placeholder="Số điện thoại"
                size="large"
                disabled={loading}
              />
            </Form.Item>

            {/* Giới tính */}
            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            >
              <Select
                placeholder="Chọn giới tính"
                size="large"
                disabled={loading}
                options={[
                  { label: "Nam", value: "MALE" },
                  { label: "Nữ", value: "FEMALE" },
                  { label: "Khác", value: "OTHER" },
                ]}
              />
            </Form.Item>

            {/* Ngày sinh */}
            <Form.Item
              label="Ngày sinh"
              name="dob"
            >
              <DatePicker
                placeholder="Chọn ngày sinh"
                size="large"
                disabled={loading}
                style={{ width: "100%" }}
                disabledDate={(current) => {
                  // Disable future dates and dates less than 5 years ago
                  const minDate = dayjs().subtract(100, 'years');
                  const maxDate = dayjs().subtract(5, 'years');
                  return current > maxDate || current < minDate;
                }}
              />
            </Form.Item>

            {/* Điều khoản */}
            <Form.Item>
              <Checkbox
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={loading}
              >
                <Space size={4}>
                  <span>Tôi đồng ý với</span>
                  <Typography.Link href="/terms">Điều khoản sử dụng</Typography.Link>
                </Space>
              </Checkbox>
            </Form.Item>

            {/* Submit */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                disabled={loading}
              >
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: "16px 0" }} />

          <div style={{ textAlign: "center" }}>
            <span>Đã có tài khoản? </span>
            <Typography.Link href="/auth/login">
              Đăng nhập ngay
            </Typography.Link>
          </div>
        </Spin>
      </div>
    </div>
  );
}
