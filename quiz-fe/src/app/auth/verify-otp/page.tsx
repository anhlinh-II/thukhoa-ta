"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, message, Spin } from "antd";
import { useLogin } from "@/share/hooks/useAuth";
import { authService } from "@/share/services/authService";
import FloatingBubbles from "@/share/components/ui/FloatingBubbles";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [seconds, setSeconds] = useState<number>(300);
  const [loading, setLoading] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const loginMutation = useLogin();

  /**
   * Đọc query param từ client-side (fix prerender error)
   */
  useEffect(() => {
    // Read query param on client only to avoid CSR bailout / prerender errors
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const param = params.get("email");
      if (param) setEmail(param);
    } catch (e) {
      // ignore
    }
  }, []);

  /**
   * Timer countdown
   */
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const handleResend = async () => {
    if (!email) return message.error("Không có email để gửi lại OTP");

    try {
      setLoading(true);
      const resp = await authService.regenerateOtp(email);

      if (resp?.code === 1000) {
        message.success("Đã gửi lại OTP");

        setSeconds(300);
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = window.setInterval(() => {
          setSeconds((s) => Math.max(0, s - 1));
        }, 1000);
      } else {
        message.error(resp?.message || "Gửi lại OTP thất bại");
      }
    } catch (err) {
      console.error(err);
      message.error("Có lỗi khi gửi lại OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!email) return message.error("Không có email để xác thực");
    if (!otp.trim()) return message.error("Vui lòng nhập OTP");

    try {
      setLoading(true);

      const resp = await authService.verifyOtp(email, otp.trim());

      if (resp?.code === 1000) {
        message.success("Xác thực thành công!");

        let pending: { email?: string; password?: string } | null = null;

        try {
          const raw = sessionStorage.getItem("pending_register");
          if (raw) pending = JSON.parse(raw);
        } catch {}

        if (pending?.password) {
          loginMutation.mutate(
            {
              username: pending.email || email,
              password: pending.password,
            },
            {
              onSuccess: () => {
                sessionStorage.removeItem("pending_register");
                router.push("/");
              },
              onError: () => router.push("/auth/login"),
            }
          );
        } else {
          router.push("/auth/login");
        }
      } else {
        message.error(resp?.message || "OTP không hợp lệ");
      }
    } catch (err) {
      console.error(err);
      message.error("Có lỗi khi xác thực OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 rounded-lg mb-4">
              <span className="text-white font-bold text-xl">Q</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Xác thực OTP</h2>
            <p className="text-gray-600">
              Vui lòng nhập OTP đã gửi tới <strong>{email}</strong>
            </p>
          </div>

          <Spin spinning={loading}>
            <div className="space-y-4">
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                size="large"
                placeholder="Nhập mã OTP"
              />

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Thời gian còn lại: <strong>{formatTime(seconds)}</strong>
                </div>
                <Button type="link" disabled={seconds > 0} onClick={handleResend}>
                  Gửi lại OTP
                </Button>
              </div>

              <div className="flex space-x-3">
                <Button block onClick={() => router.push("/auth/register")}>
                  Quay lại đăng ký
                </Button>
                <Button type="primary" block onClick={handleVerify}>
                  Xác nhận
                </Button>
              </div>
            </div>
          </Spin>
        </div>
      </div>

      <div className="flex-1 bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 relative overflow-hidden hidden lg:block">
        <FloatingBubbles className="absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Thủ Khoa <span className="text-orange-500">TA</span>
            </h1>
            <p className="text-lg text-gray-600">Xác thực tài khoản để tiếp tục</p>
          </div>
        </div>
      </div>
    </div>
  );
}
