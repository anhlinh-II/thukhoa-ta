"use client";
import { Button, Form, Input, Typography, message } from "antd";
import { GoogleOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import Link from "next/link";
import FloatingBubbles from "../../../components/ui/FloatingBubbles";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { loginAsync } from "../../../store/slices/authSlice";

export default function LoginPage() {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      await dispatch(loginAsync(values)).unwrap();
      message.success('Đăng nhập thành công!');
      // Redirect to dashboard or home
    } catch (error) {
      message.error('Đăng nhập thất bại!');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 rounded-lg mb-4">
              <span className="text-white font-bold text-xl">Q</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Login to your account</h2>
            <p className="text-gray-600">Enter your email below to login to your account</p>
          </div>

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="space-y-6"
          >
            <Form.Item
              name="email"
              label={<span className="text-gray-700 font-medium">Email</span>}
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" }
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="m@example.com"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <div className="flex justify-between items-center w-full">
                  <span className="text-gray-700 font-medium">Password</span>
                  <Link href="/forgot-password" className="text-sm text-purple-500 hover:text-purple-400">
                    Forgot your password?
                  </Link>
                </div>
              }
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter your password"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="rounded-lg h-12 font-medium"
            >
              Login
            </Button>
          </Form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            icon={<GoogleOutlined />}
            block
            size="large"
            className="border-gray-300 rounded-lg h-12 font-medium hover:bg-gray-50"
          >
            Login with Google
          </Button>

          {/* Sign up link */}
          <div className="text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <Link href="/register" className="text-purple-500 hover:text-purple-400 font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Background with floating bubbles */}
      <div className="flex-1 bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 relative overflow-hidden hidden lg:block">
        <FloatingBubbles className="absolute inset-0" />
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              American <span className="text-orange-500">Study</span>
            </h1>
            <p className="text-xl text-gray-600 font-light">
              Great Teachers, Great Schools
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
