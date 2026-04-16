"use client";

import { Button, Form, Input, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FloatingBubbles from "@/share/components/ui/FloatingBubbles";
import { authService } from "@/share/services/authService";
import messageService from "@/share/services/messageService";

export default function ForgotPasswordPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string }) => {
    try {
      setLoading(true);
      const response = await authService.forgotPassword({ email: values.email });

      if (response.code === 1000) {
        messageService.success(
          "Yeu cau dat lai mat khau da duoc gui. Vui long kiem tra email.",
        );
        router.push("/auth/login");
        return;
      }

      messageService.error(response.message || "Gui yeu cau that bai");
    } catch (error: any) {
      messageService.error(
        error?.response?.data?.message || error?.message || "Co loi xay ra",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 rounded-lg mb-4">
              <span className="text-white font-bold text-xl">Q</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quen mat khau</h2>
            <p className="text-gray-600">Nhap email de nhan huong dan dat lai mat khau</p>
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-6">
            <Form.Item
              name="email"
              label={<span className="text-gray-700 font-medium">Email</span>}
              rules={[
                { required: true, message: "Vui long nhap email!" },
                { type: "email", message: "Email khong hop le!" },
              ]}
            >
              <Input placeholder="name@example.com" size="large" disabled={loading} />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="rounded-lg h-12 font-medium"
              disabled={loading}
            >
              {loading ? "Dang gui..." : "Gui yeu cau"}
            </Button>
          </Form>

          <div className="text-center mt-6">
            <span className="text-gray-600">Da nho mat khau? </span>
            <Link href="/auth/login" className="text-purple-500 hover:text-purple-400 font-medium">
              Quay lai dang nhap
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 relative overflow-hidden hidden lg:block">
        <FloatingBubbles className="absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Thu Khoa <span className="text-orange-500">TA</span>
            </h1>
            <p className="text-xl text-gray-600 font-light">
              Nen tang luyen thi tieng Anh truc tuyen hang dau Viet Nam
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
