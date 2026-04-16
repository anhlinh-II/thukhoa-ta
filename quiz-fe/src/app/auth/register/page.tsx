"use client";
import { Button, Form, Input, Typography, Spin, Space, Checkbox, Divider, Select, DatePicker, Row, Col } from "antd";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import FloatingBubbles from "@/share/components/ui/FloatingBubbles";
import { RegisterRequest, authService } from "@/share/services/authService";
import { useRegister } from "@/share/hooks/useAuth";
import messageService from "@/share/services/messageService";

export default function RegisterPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [checkingEmail, setCheckingEmail] = useState<boolean>(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const emailTimerRef = useRef<number | null>(null);
  const { mutateAsync: registerMutation } = useRegister();

  const onFinish = async (values: any) => {
    console.log('Register onFinish called', values);
    try {
      messageService.info('Submitting registration...');
    } catch (e) {}
    // ensure we have access to all form fields (step 1 + step 2)
    const allValues = form.getFieldsValue(true);
    const emailVal: string = (values.email ?? allValues.email ?? '') as string;

    // basic validation: email must exist before proceeding
    if (!emailVal) {
      messageService.error('Vui lòng nhập email!');
      return;
    }

    // Validate passwords match
    const password = (values.password ?? allValues.password) as string | undefined;
    const confirmPassword = (values.confirmPassword ?? allValues.confirmPassword) as string | undefined;
    if (password !== confirmPassword) {
      messageService.error("Mật khẩu không khớp!");
      return;
    }

    if (!agreeTerms) {
      messageService.error("Vui lòng đồng ý với điều khoản sử dụng!");
      return;
    }

    try {
      setLoading(true);
      // build register payload using values from both steps
      const registerData: RegisterRequest = {
        email: emailVal,
        password: password || '',
        username: (values.username ?? allValues.username) || (emailVal.includes('@') ? emailVal.split('@')[0] : emailVal),
        firstName: (values.firstName ?? allValues.firstName) as string | undefined,
        lastName: (values.lastName ?? allValues.lastName) as string | undefined,
        phone: (values.phone ?? allValues.phone) as string | undefined,
  gender: (values.gender ?? allValues.gender) as any,
        dob: ((values.dob ?? allValues.dob) ? (values.dob ?? allValues.dob).toISOString() : undefined) as string | undefined,
      };

      const result = await registerMutation(registerData);

      if (result) {
        messageService.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
        try {
          sessionStorage.setItem('pending_register', JSON.stringify({ email: registerData.email, password: registerData.password }));
        } catch (e) {
        }
        setTimeout(() => {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(registerData.email || '')}`);
        }, 800);
      }
    } catch (error: any) {
      console.error("Register error:", error);
      messageService.error(error?.message || error?.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const checkEmailExists = async (email: string) => {
    try {
      const resp = await authService.checkEmailExists(email);
      if (resp.code !== 1000) {
        return false;
      }
      return !!resp.result.exists;
    } catch (err) {
      console.error('Email check error', err);
      return true;
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = (e.target.value || '').trim();
    setEmailExists(null);
    if (emailTimerRef.current) {
      window.clearTimeout(emailTimerRef.current);
      emailTimerRef.current = null;
    }

    if (!v) {
      setCheckingEmail(false);
      return;
    }

    setCheckingEmail(true);
    emailTimerRef.current = window.setTimeout(async () => {
      try {
        const exists = await checkEmailExists(v);
        setEmailExists(exists);
        if (exists) {
          form.setFields([{ name: 'email', errors: ['Email đã tồn tại'] }]);
        } else {
          form.setFields([{ name: 'email', errors: [] }]);
        }
      } catch (err) {
        setEmailExists(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (emailTimerRef.current) {
        window.clearTimeout(emailTimerRef.current);
      }
    };
  }, []);

  const handleNext = async () => {
    try {
      // validate first step fields
      const values = await form.validateFields(['username', 'email', 'password', 'confirmPassword']);
      // check password match
      if (values.password !== values.confirmPassword) {
        messageService.error('Mật khẩu không khớp!');
        return;
      }

      const email = values.email as string;
      const exists = await checkEmailExists(email);
      if (exists) {
        messageService.error('Email đã tồn tại, vui lòng dùng email khác');
        return;
      }

      const username = values.username || (values.email || '').split('@')[0];
      form.setFieldsValue({ username });
      setStep(2);
    } catch (err) {
      // validation errors are handled by antd form
      console.error('Next validation error', err);
    }
  };

  const handleBack = () => setStep(1);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form (white background) */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 rounded-lg mb-4">
              <span className="text-white font-bold text-xl">Q</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Tạo tài khoản</h2>
            <p className="text-gray-600">Tạo tài khoản để bắt đầu luyện tập</p>
          </div>

          <Spin spinning={loading}>
            <Form layout="vertical" form={form} onFinish={onFinish} autoComplete="off">
            {step === 1 && (
              <>
                {/* Username */}
                <Form.Item
                  label="Tên đăng nhập"
                  name="username"
                  rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                >
                  <Input placeholder="Tên đăng nhập" size="large" disabled={loading} />
                </Form.Item>

                {/* Email */}
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                  validateStatus={checkingEmail ? 'validating' : emailExists === true ? 'error' : emailExists === false ? 'success' : undefined}
                  help={emailExists === true ? 'Email đã tồn tại' : undefined}
                >
                  <Input placeholder="Email" type="email" size="large" disabled={loading} onChange={handleEmailChange} />
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
                  <Input.Password placeholder="Nhập mật khẩu" size="large" disabled={loading} />
                </Form.Item>

                {/* Xác nhận mật khẩu */}
                <Form.Item
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu!" }]}
                >
                  <Input.Password placeholder="Xác nhận mật khẩu" size="large" disabled={loading} />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" block size="large" onClick={handleNext} loading={loading}>
                    Tiếp theo
                  </Button>
                </Form.Item>
              </>
            )}

            {step === 2 && (
              <>
                {/* Họ và tên */}
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Tên" name="firstName" rules={[{ required: true, message: "Vui lòng nhập tên!" }]}>
                      <Input placeholder="Tên" size="large" disabled={loading} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Họ" name="lastName" rules={[{ required: true, message: "Vui lòng nhập họ!" }]}>
                      <Input placeholder="Họ" size="large" disabled={loading} />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Số điện thoại */}
                <Form.Item label="Số điện thoại" name="phone">
                  <Input placeholder="Số điện thoại" size="large" disabled={loading} />
                </Form.Item>

                {/* Giới tính */}
                <Form.Item label="Giới tính" name="gender" rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}>
                  <Select placeholder="Chọn giới tính" size="large" disabled={loading} options={[{ label: "Nam", value: "MALE" }, { label: "Nữ", value: "FEMALE" }, { label: "Khác", value: "OTHER" }]} />
                </Form.Item>

                {/* Ngày sinh */}
                <Form.Item label="Ngày sinh" name="dob">
                  <DatePicker placeholder="Chọn ngày sinh" size="large" disabled={loading} style={{ width: "100%" }} disabledDate={(current) => {
                    const minDate = dayjs().subtract(100, 'years');
                    const maxDate = dayjs().subtract(5, 'years');
                    return current > maxDate || current < minDate;
                  }} />
                </Form.Item>

                {/* Điều khoản */}
                <Form.Item>
                  <Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} disabled={loading}>
                    <Space size={4}>
                      <span>Tôi đồng ý với</span>
                      <Typography.Link href="/terms">Điều khoản sử dụng</Typography.Link>
                    </Space>
                  </Checkbox>
                </Form.Item>

                <Form.Item>
                  <Row gutter={12}>
                    <Col span={12}>
                      <Button block onClick={handleBack} disabled={loading}>
                        Quay lại
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button type="primary" htmlType="submit" block size="large" loading={loading} disabled={loading}>
                        Đăng ký
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>
              </>
            )}
            </Form>

            <Divider className="my-4" />

            <div className="text-center">
              <span className="text-gray-600">Đã có tài khoản? </span>
              <Typography.Link href="/auth/login" className="text-purple-500">
                Đăng nhập ngay
              </Typography.Link>
            </div>
          </Spin>
        </div>
      </div>

      {/* Right side - Background with floating bubbles */}
      <div className="flex-1 bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 relative overflow-hidden hidden lg:block">
        <FloatingBubbles className="absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Thủ Khoa <span className="text-orange-500">TA</span></h1>
            <p className="text-lg text-gray-600 font-light">Nền tảng luyện thi tiếng Anh trực tuyến</p>
          </div>
        </div>
      </div>
    </div>
  );
}
