"use client";
import { Button, Form, Input, Typography, message } from "antd";
import { GoogleOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FloatingBubbles from "@/share/components/ui/FloatingBubbles";
import { useLogin } from "@/share/hooks/useAuth";
import { authService } from "@/share/services/authService";
import { message as antdMessage } from "antd";

export default function LoginPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();

  useEffect(() => {
    // Reset form on mount
    form.resetFields();
  }, [form]);

  const onFinish = async (values: { username: string; password: string }) => {
    login(values, {
      onSuccess: () => {
        message.success('Đăng nhập thành công!');
        // Redirect to home
        router.push('/');
      },
      onError: (error: any) => {
        const errorMessage = error?.message || 'Đăng nhập thất bại!';
        message.error(errorMessage);
      },
    });
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập vào tài khoản của bạn</h2>
            <p className="text-gray-600">Nhập email hoặc tên đăng nhập của bạn bên dưới</p>
          </div>

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="space-y-6"
          >
            <Form.Item
              name="username"
              label={<span className="text-gray-700 font-medium">Email hoặc Tên đăng nhập</span>}
              rules={[
                { required: true, message: "Vui lòng nhập email hoặc tên đăng nhập!" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="m@gmail.com hoặc username"
                size="large"
                className="rounded-lg"
                disabled={isPending}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <div className="flex gap-2 items-center w-full">
                  <span className="text-gray-700 font-medium">Mật khẩu</span>
                  <span>-</span>
                  <Link href="/forgot-password" className="text-sm text-purple-500 hover:text-purple-400">
                    Quên mật khẩu?
                  </Link>
                </div>
              }
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Nhập mật khẩu"
                size="large"
                className="rounded-lg text-base"
                disabled={isPending}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              block
              size="large"
              className="rounded-lg h-12 font-medium"
              disabled={isPending}
            >
              {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </Form>

          {/* Divider */}
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Hoặc</span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            icon={<GoogleOutlined />}
            block
            size="large"
            className="border-gray-300 rounded-lg h-12 font-medium hover:bg-gray-50"
            disabled={isPending}
            onClick={async () => {
              try {
                // Still call backend for discovery/logging, but perform top-level
                // navigation to the backend's /oauth2/authorization/google endpoint
                // so Spring Security can create and store the AuthorizationRequest
                // in the user's session (avoids authorization_request_not_found).
                console.log('Requesting OAuth2 provider info from backend');
                await authService.getOAuth2Urls();

                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
                const backendOrigin = apiBase.replace(/\/api\/v1\/?$/, '');
                const authStartUrl = `${backendOrigin}/oauth2/authorization/google`;
                window.location.assign(authStartUrl);
              } catch (err: any) {
                antdMessage.error(err?.message || 'Lỗi khi khởi tạo đăng nhập Google');
              }
            }}
          >
            Đăng nhập với Google
          </Button>

          {/* Sign up link */}
          <div className="text-center mt-6">
            <span className="text-gray-600">Bạn chưa có tài khoản? </span>
            <Link href="/auth/register" className="text-purple-500 hover:text-purple-400 font-medium">
              Đăng ký ngay
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
              Thủ Khoa <span className="text-orange-500">TA</span>
            </h1>
            <p className="text-xl text-gray-600 font-light">
              Nền tảng luyện thi tiếng Anh trực tuyến hàng đầu Việt Nam
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
