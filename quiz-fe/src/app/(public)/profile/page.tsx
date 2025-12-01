"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Avatar,
  Button,
  Tabs,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  List,
  Empty,
  Divider,
  Modal,
  Badge,
  Timeline,
  Tooltip,
  Spin
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FireOutlined,
  BookOutlined,
  SettingOutlined,
  LogoutOutlined,
  CameraOutlined,
  PictureOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  DashboardOutlined,
  RiseOutlined,
  FallOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  StarOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  RocketOutlined
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useQueryClient } from '@tanstack/react-query';
import dayjs from "dayjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { useAccount, useLogout } from "@/share/hooks/useAuth";
import apiClient from "@/share/services/api";
import fileService from "@/share/services/fileService";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartTitle,
  ChartTooltip,
  Legend,
  Filler
);

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export default function ProfilePage() {
  const { data: user, isLoading } = useAccount();
  const logout = useLogout();
  const router = useRouter();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  const normalizeAvatarUrl = (url?: string) => {
    if (!url) return url;
    try {
      if (!/^https?:\/\//i.test(url)) return url;

      const u = new URL(url);
      if (u.hostname.includes("googleusercontent.com") || u.hostname.includes("lh3.googleusercontent.com")) {
        if (u.searchParams.has("sz")) {
          u.searchParams.set("sz", "200");
        } else if (/\/s\d+-c\//.test(u.pathname)) {
          u.pathname = u.pathname.replace(/\/s\d+-c\//, "/s200-c/");
        }
        return u.toString();
      }

      return url;
    } catch (e) {
      return url;
    }
  };

  // Mock data - replace with real data from API
  const stats = {
    testsCompleted: 24,
    totalScore: 1850,
    averageScore: 77,
    studyTime: 48, // hours
    streak: 7, // days
    rank: 128,
  };

  const recentTests = [
    { id: 1, name: "IELTS Reading Test 1", score: 85, date: "2024-11-01", time: "45 phút" },
    { id: 2, name: "TOEIC Part 5-6", score: 92, date: "2024-10-28", time: "30 phút" },
    { id: 3, name: "Grammar Advanced", score: 78, date: "2024-10-25", time: "25 phút" },
  ];

  const achievements = [
    { id: 1, title: "First Test", icon: "🎯", description: "Hoàn thành bài test đầu tiên", unlocked: true },
    { id: 2, title: "Week Warrior", icon: "🔥", description: "Học 7 ngày liên tục", unlocked: true },
    { id: 3, title: "High Score", icon: "⭐", description: "Đạt điểm trên 90", unlocked: true },
    { id: 4, title: "Century", icon: "💯", description: "Hoàn thành 100 bài test", unlocked: false },
  ];

  // Dashboard data
  const weeklyProgress = [
    { day: "T2", tests: 3, score: 75, time: 45 },
    { day: "T3", tests: 5, score: 82, time: 60 },
    { day: "T4", tests: 2, score: 68, time: 30 },
    { day: "T5", tests: 4, score: 88, time: 55 },
    { day: "T6", tests: 6, score: 92, time: 75 },
    { day: "T7", tests: 3, score: 78, time: 40 },
    { day: "CN", tests: 4, score: 85, time: 50 },
  ];

  const categoryStats = [
    { name: "Reading", completed: 8, total: 15, avgScore: 85, color: "blue" },
    { name: "Listening", completed: 6, total: 12, avgScore: 78, color: "green" },
    { name: "Grammar", completed: 10, total: 18, avgScore: 92, color: "purple" },
    { name: "Vocabulary", completed: 5, total: 10, avgScore: 74, color: "orange" },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "test",
      title: "Hoàn thành IELTS Reading Test 1",
      score: 85,
      time: "2 giờ trước",
      icon: <CheckCircleOutlined className="text-green-500" />
    },
    {
      id: 2,
      type: "achievement",
      title: "Mở khóa thành tích 'Week Warrior'",
      time: "5 giờ trước",
      icon: <TrophyOutlined className="text-yellow-500" />
    },
    {
      id: 3,
      type: "streak",
      title: "Đạt chuỗi học tập 7 ngày",
      time: "1 ngày trước",
      icon: <FireOutlined className="text-orange-500" />
    },
    {
      id: 4,
      type: "test",
      title: "Hoàn thành TOEIC Part 5-6",
      score: 92,
      time: "2 ngày trước",
      icon: <CheckCircleOutlined className="text-green-500" />
    },
  ];

  const monthlyGoals = [
    { title: "Hoàn thành 30 bài test", current: 24, target: 30, unit: "bài" },
    { title: "Đạt điểm trung bình 85", current: 77, target: 85, unit: "điểm" },
    { title: "Học 50 giờ", current: 48, target: 50, unit: "giờ" },
  ];

  // Chart.js data configurations
  const weeklyScoreChartData = {
    labels: weeklyProgress.map(d => d.day),
    datasets: [
      {
        label: 'Điểm số',
        data: weeklyProgress.map(d => d.score),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Số bài test',
        data: weeklyProgress.map(d => d.tests * 10), // Scale for visibility
        borderColor: 'rgb(244, 63, 94)',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  const weeklyTimeChartData = {
    labels: weeklyProgress.map(d => d.day),
    datasets: [
      {
        label: 'Thời gian học (phút)',
        data: weeklyProgress.map(d => d.time),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(192, 132, 252, 0.8)',
          'rgba(232, 121, 249, 0.8)',
          'rgba(244, 114, 182, 0.8)',
          'rgba(251, 113, 133, 0.8)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(139, 92, 246)',
          'rgb(168, 85, 247)',
          'rgb(192, 132, 252)',
          'rgb(232, 121, 249)',
          'rgb(244, 114, 182)',
          'rgb(251, 113, 133)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const categoryChartData = {
    labels: categoryStats.map(c => c.name),
    datasets: [
      {
        label: 'Điểm trung bình',
        data: categoryStats.map(c => c.avgScore),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(168, 85, 247)',
          'rgb(251, 146, 60)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const performanceRadarData = {
    labels: ['Reading', 'Listening', 'Grammar', 'Vocabulary', 'Speaking', 'Writing'],
    datasets: [
      {
        label: 'Hiệu suất',
        data: [85, 78, 92, 74, 80, 88],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(99, 102, 241)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const handleUpdateProfile = async (values: any) => {
    try {
      // TODO: Call API to update profile
      console.log("Update profile:", values);
      message.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error) {
      message.error("Cập nhật thất bại!");
    }
  };

  useEffect(() => {
    const load = async () => {

      const fallback = [] as string[];
      for (let i = 1; i <= 7; i++) fallback.push(`/avatar/avatar${i}.jpg`);
      setAvatarOptions(fallback);
    };
    load();
  }, []);

  const handleChooseAvatar = async (path: string) => {
    // If path refers to the local bundled avatar (e.g. /avatar/avatar2.jpg),
    // fetch it from the frontend public folder, upload to storage via fileService,
    // then send the returned storage path to the user update endpoint.
    try {
      setUploadingAvatar(true);

      let finalPath = path;

      const isLocalAvatar = path.startsWith('/avatar') || path.startsWith('avatar/');
      if (isLocalAvatar) {
        try {
          const fetchPath = path.startsWith('/') ? path : `/${path}`;
          const resp = await fetch(fetchPath);
          if (!resp.ok) throw new Error(`Failed to fetch local avatar: ${resp.status}`);
          const blob = await resp.blob();
          const filename = fetchPath.substring(fetchPath.lastIndexOf('/') + 1) || `avatar.jpg`;
          const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });

          // Upload to backend/MinIO
          const uploadRes = await fileService.upload(file, 'user/avatar', String(user.id));
          finalPath = uploadRes?.result ?? uploadRes;
          if (!finalPath) throw new Error('Upload did not return a path');
        } catch (uploadErr) {
          console.error('Failed to upload default avatar to storage', uploadErr);
          message.error('Tải avatar lên bộ nhớ thất bại');
          setUploadingAvatar(false);
          return;
        }
      }

      // Update via existing user edit endpoint with the storage path (or original path if not uploaded)
      await apiClient.put(`/users/edit/${user.id}`, { avatarUrl: finalPath });
      // update react-query cache so UI updates without reload
      try {
        queryClient.setQueryData(['auth', 'account'], (old: any) => {
          if (!old) return old;
          return { ...old, avatar: finalPath };
        });
      } catch (e) {
        // fallback to reload
        console.error('Failed to update cache after choosing avatar', e);
        window.location.reload();
      }

      message.success('Cập nhật ảnh đại diện thành công');
      setShowAvatarPicker(false);
    } catch (err) {
      console.error(err);
      message.error('Cập nhật ảnh thất bại');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    Modal.confirm({
      title: "Đăng xuất",
      content: "Bạn có chắc chắn muốn đăng xuất?",
      okText: "Đăng xuất",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => {
        logout.mutate();
      },
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  // normalize avatar once (guard against undefined)
  const avatarUrl = normalizeAvatarUrl(user.avatar);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Profile Header */}
        <Card className="mb-6 rounded-2xl shadow-xl border-0 overflow-hidden">
          <div className="relative">
            {/* Content (removed bright linear background for a cleaner look) */}
            <div className="relative z-10 pb-6">
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} md={8} className="text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative group" style={{ width: 120, height: 120 }}>
                      <Avatar
                        size={120}
                        className="border-4 border-white shadow-xl"
                        style={{ backgroundColor: '#667eea' }}
                        src={undefined}
                      >
                        {avatarUrl ? (
                          /^https?:\/\//i.test(avatarUrl) ? (
                            <img
                              src={avatarUrl}
                              alt="avatar"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                          ) : (
                            <img
                              src={avatarUrl}
                              alt="avatar"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                          )
                        ) : (
                          <span className="text-4xl">{getInitials(user.name || user.username)}</span>
                        )}
                      </Avatar>

                      {/* Hover overlay (bottom half only) */}
                      <div
                        className="absolute left-0 right-0 bottom-0 h-1/2 flex items-center justify-center gap-2 transition-opacity duration-150 opacity-0 group-hover:opacity-100"
                        style={{
                          background: 'rgba(0,0,0,0.35)',
                          borderBottomLeftRadius: '9999px',
                          borderBottomRightRadius: '9999px',
                        }}
                      >
                        {/* Larger camera button for easier interaction */}
                        <button
                          className="bg-white  rounded-full shadow-lg w-11 h-11 flex items-center justify-center"
                          title="Chọn avatar mặc định"
                          onClick={() => setShowAvatarPicker(true)}
                        >
                          <CameraOutlined className="text-2xl" />
                        </button>
                      </div>

                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          try {
                            setUploadingAvatar(true);
                            // upload to backend -> MinIO
                            const res = await fileService.upload(f, 'user/avatar', String(user.id));
                            const path = res?.result ?? res;
                            if (!path) throw new Error('No path returned');
                            // update user via base PUT endpoint
                            await apiClient.put(`/users/edit/${user.id}`, { avatarUrl: path });
                            message.success('Cập nhật ảnh đại diện thành công');
                            // update react-query account cache so UI updates without reload
                            try {
                              queryClient.setQueryData(['auth', 'account'], (old: any) => {
                                if (!old) return old;
                                return { ...old, avatar: path };
                              });
                            } catch (err) {
                              console.error('Failed to update account cache', err);
                              window.location.reload();
                            }
                          } catch (err) {
                            console.error(err);
                            message.error('Cập nhật ảnh thất bại');
                          } finally {
                            setUploadingAvatar(false);
                            // reset input
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }
                        }}
                      />

                      {/* Avatar picker modal */}
                      <Modal
                        title="Chọn avatar mặc định"
                        open={showAvatarPicker}
                        onCancel={() => setShowAvatarPicker(false)}
                        footer={null}
                        centered
                      >
                        <div className="grid grid-cols-4 gap-3">
                          {avatarOptions.map((p, idx) => (
                            <div key={p} className="p-1 border rounded cursor-pointer hover:shadow-md flex items-center justify-center" onClick={() => handleChooseAvatar(p)}>
                              <img src={p} alt={p} className="w-20 h-20 object-cover rounded" />
                            </div>
                          ))}

                          {/* Upload cell (last cell) */}
                          <div className="p-1 border rounded cursor-pointer hover:shadow-md flex items-center justify-center" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-20 h-20 flex items-center justify-center rounded bg-gray-100 text-gray-600 text-2xl">
                              <span>+</span>
                            </div>
                          </div>
                        </div>
                      </Modal>
                    </div>
                    <div>
                      <Title level={3} className="!mb-1">
                        {user.name || user.username}
                      </Title>
                      {/* <Text type="secondary" className="flex items-center gap-1">
                        <MailOutlined /> {user.email}
                      </Text> */}
                      <div className="mt-2 flex gap-2 flex-wrap">
                        <Tag color="blue" icon={<TrophyOutlined />}>
                          Hạng {stats.rank}
                        </Tag>
                        <Tag color="gold" icon={<FireOutlined />}>
                          {stats.streak} ngày streak
                        </Tag>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Stats Cards */}
                <Col xs={24} md={16}>
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6}>
                      <div className="bg-white rounded-xl p-4 text-left shadow-md border-2 border-sky-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white">
                            <BookOutlined className="text-lg" />
                          </div>
                          <div>
                            <div className="text-xl font-semibold text-sky-700">{stats.testsCompleted}</div>
                            <Text type="secondary" className="text-xs">Bài đã làm</Text>
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div className="bg-white rounded-xl p-4 text-left shadow-md border-2 border-sky-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white">
                            <RiseOutlined className="text-lg" />
                          </div>
                          <div>
                            <div className="text-xl font-semibold text-sky-700">{stats.averageScore}</div>
                            <Text type="secondary" className="text-xs">Điểm TB</Text>
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div className="bg-white rounded-xl p-4 text-left shadow-md border-2 border-sky-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white">
                            <ClockCircleOutlined className="text-lg" />
                          </div>
                          <div>
                            <div className="text-xl font-semibold text-sky-700">{stats.studyTime}h</div>
                            <Text type="secondary" className="text-xs">Thời gian học</Text>
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div className="bg-white rounded-xl p-4 text-left shadow-md border-2 border-sky-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white">
                            <RocketOutlined className="text-lg" />
                          </div>
                          <div>
                            <div className="text-xl font-semibold text-sky-700">{stats.totalScore}</div>
                            <Text type="secondary" className="text-xs">Tổng điểm</Text>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </div>
        </Card>

        {/* Tabs Content */}
        <Card className="rounded-2xl shadow-lg border-0">
          <Tabs defaultActiveKey="dashboard" size="large">
            {/* Dashboard Tab */}
            <TabPane
              tab={<span><DashboardOutlined /> Dashboard</span>}
              key="dashboard"
            >
              <Row gutter={[24, 24]}>
                {/* Quick Stats */}
                <Col xs={24}>
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6}>
                      <Card className="text-center shadow-md rounded-xl border-0">
                        <Statistic
                          title={<span className="text-black text-opacity-90">Hôm nay</span>}
                          value={5}
                          suffix="bài"
                          valueStyle={{ color: 'black', fontWeight: 'bold' }}
                          prefix={<BookOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card className="text-center shadow-md rounded-xl border-0">
                        <Statistic
                          title={<span className="text-black text-opacity-90">Độ chính xác</span>}
                          value={87}
                          suffix="%"
                          valueStyle={{ color: '#000', fontWeight: 'bold' }}
                          prefix={<RiseOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card className="text-center shadow-md rounded-xl border-0">
                        <Statistic
                          title={<span className="text-black text-opacity-90">Thời gian</span>}
                          value={2.5}
                          suffix="giờ"
                          valueStyle={{ color: 'black', fontWeight: 'bold' }}
                          prefix={<ClockCircleOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card className="text-center shadow-md rounded-xl border-0">
                        <Statistic
                          title={<span className="text-black text-opacity-90">Cải thiện</span>}
                          value={12}
                          suffix="%"
                          valueStyle={{ color: 'black', fontWeight: 'bold' }}
                          prefix={<RocketOutlined />}
                        />
                      </Card>
                    </Col>
                  </Row>
                </Col>

                {/* Weekly Progress Chart */}
                <Col xs={24} lg={16}>
                  <Card
                    title={
                      <div className="flex items-center gap-2">
                        <LineChartOutlined className="text-blue-600" />
                        <span>Tiến độ tuần này</span>
                      </div>
                    }
                    className="shadow-md rounded-xl"
                  >
                    <div style={{ height: '300px' }}>
                      <Line data={weeklyScoreChartData} options={chartOptions} />
                    </div>

                    {/* Summary */}
                    <Divider />
                    <Row gutter={16} className="text-center">
                      <Col span={8}>
                        <Statistic
                          title="Tổng bài test"
                          value={27}
                          prefix={<BookOutlined />}
                          valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="Điểm TB"
                          value={81}
                          suffix="/100"
                          valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="Tổng thời gian"
                          value={355}
                          suffix="phút"
                          prefix={<ClockCircleOutlined />}
                          valueStyle={{ color: '#722ed1', fontSize: '20px' }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>

                {/* Recent Activities */}
                <Col xs={24} lg={8}>
                  <Card
                    title={
                      <div className="flex items-center gap-2">
                        <ThunderboltOutlined className="text-yellow-600" />
                        <span>Hoạt động gần đây</span>
                      </div>
                    }
                    className="shadow-md rounded-xl"
                  >
                    <Timeline
                      items={recentActivities.map(activity => ({
                        dot: activity.icon,
                        children: (
                          <div className="mb-2">
                            <Text strong className="block">{activity.title}</Text>
                            <div className="flex justify-between items-center">
                              <Text type="secondary" className="text-xs">{activity.time}</Text>
                              {activity.score && (
                                <Tag color="blue">{activity.score} điểm</Tag>
                              )}
                            </div>
                          </div>
                        )
                      }))}
                    />
                  </Card>
                </Col>

                {/* Category Statistics */}
                <Col xs={24} lg={14}>
                  <Card
                    title={
                      <div className="flex items-center gap-2">
                        <BarChartOutlined className="text-purple-600" />
                        <span>Thống kê theo danh mục</span>
                      </div>
                    }
                    className="shadow-md rounded-xl"
                  >
                    <div style={{ height: '300px' }}>
                      <Doughnut data={categoryChartData} options={doughnutOptions} />
                    </div>
                  </Card>
                </Col>

                {/* Monthly Goals */}
                <Col xs={24} lg={10}>
                  <Card
                    title={
                      <div className="flex items-center gap-2">
                        <StarOutlined className="text-yellow-600" />
                        <span>Mục tiêu tháng này</span>
                      </div>
                    }
                    className="shadow-md rounded-xl"
                  >
                    <div className="space-y-4">
                      {monthlyGoals.map((goal, index) => {
                        const progress = (goal.current / goal.target) * 100;
                        const isComplete = progress >= 100;
                        return (
                          <div key={index} className={`p-4 rounded-lg ${isComplete ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-50'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {isComplete && <CheckCircleOutlined className="text-green-600" />}
                                  <Text strong className={isComplete ? 'text-green-600' : ''}>
                                    {goal.title}
                                  </Text>
                                </div>
                                <Text type="secondary" className="text-sm">
                                  {goal.current}/{goal.target} {goal.unit}
                                </Text>
                              </div>
                              <Badge
                                count={`${Math.round(progress)}%`}
                                style={{
                                  backgroundColor: isComplete ? '#52c41a' : progress > 70 ? '#1890ff' : '#faad14'
                                }}
                              />
                            </div>
                            <Progress
                              percent={progress}
                              strokeColor={
                                isComplete ? '#52c41a' :
                                  progress > 70 ? { '0%': '#1890ff', '100%': '#69c0ff' } :
                                    { '0%': '#faad14', '100%': '#ffd666' }
                              }
                              showInfo={false}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <Divider />

                    {/* Motivational Card */}
                    {/* <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-center text-white">
                      <BulbOutlined className="text-3xl mb-2" />
                      <Text strong className="block text-white mb-1">
                        Bạn đã hoàn thành {((24 / 30) * 100).toFixed(0)}% mục tiêu!
                      </Text>
                      <Text className="text-white text-opacity-90 text-sm">
                        Còn 6 bài nữa là đạt mục tiêu tháng này!
                      </Text>
                    </div> */}
                  </Card>
                </Col>

                {/* Weekly Study Time Chart */}
                <Col xs={24} lg={12}>
                  <Card
                    title={
                      <div className="flex items-center gap-2">
                        <ClockCircleOutlined className="text-purple-600" />
                        <span>Thời gian học hàng tuần</span>
                      </div>
                    }
                    className="shadow-md rounded-xl"
                  >
                    <div style={{ height: '280px' }}>
                      <Bar data={weeklyTimeChartData} options={barChartOptions} />
                    </div>
                  </Card>
                </Col>

                {/* Performance Radar Chart */}
                <Col xs={24} lg={12}>
                  <Card
                    title={
                      <div className="flex items-center gap-2">
                        <PieChartOutlined className="text-green-600" />
                        <span>Phân tích hiệu suất</span>
                      </div>
                    }
                    className="shadow-md rounded-xl"
                  >
                    <div style={{ height: '280px' }}>
                      <Radar data={performanceRadarData} options={radarOptions} />
                    </div>
                  </Card>
                </Col>

                {/* Quick Actions */}
                <Col xs={24}>
                  <Card className="shadow-md rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50">
                    <Title level={5} className="!mb-4">
                      <RocketOutlined /> Hành động nhanh
                    </Title>
                    <Row gutter={[16, 16]}>
                      <Col xs={12} sm={6}>
                        <Button
                          type="primary"
                          size="large"
                          block
                          icon={<BookOutlined />}
                          className="h-auto py-4"
                          onClick={() => router.push('/programs')}
                        >
                          Làm bài test
                        </Button>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Button
                          size="large"
                          block
                          icon={<TrophyOutlined />}
                          className="h-auto py-4"
                          onClick={() => router.push('/leaderboard')}
                        >
                          Xếp hạng
                        </Button>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Button
                          size="large"
                          block
                          icon={<LineChartOutlined />}
                          className="h-auto py-4"
                        >
                          Thống kê
                        </Button>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Button
                          size="large"
                          block
                          icon={<StarOutlined />}
                          className="h-auto py-4"
                        >
                          Thành tích
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* Overview Tab */}
            <TabPane
              tab={<span><BookOutlined /> Tổng quan</span>}
              key="overview"
            >
              <Row gutter={[24, 24]}>
                {/* Recent Tests */}
                <Col xs={24} lg={14}>
                  <Card
                    title={
                      <div className="flex items-center gap-2">
                        <ClockCircleOutlined className="text-blue-600" />
                        <span>Bài test gần đây</span>
                      </div>
                    }
                    className="shadow-md rounded-xl"
                  >
                    <List
                      dataSource={recentTests}
                      renderItem={(test) => (
                        <List.Item className="hover:bg-gray-50 px-4 rounded-lg transition-colors">
                          <List.Item.Meta
                            avatar={
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                                {test.score}
                              </div>
                            }
                            title={test.name}
                            description={
                              <div className="flex gap-3 text-xs">
                                <span>📅 {test.date}</span>
                                <span>⏱️ {test.time}</span>
                              </div>
                            }
                          />
                          <Tag color={test.score >= 80 ? "success" : "warning"}>
                            {test.score >= 80 ? "Xuất sắc" : "Tốt"}
                          </Tag>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>

                {/* Achievements */}
                <Col xs={24} lg={10}>
                  <Card
                    title={
                      <div className="flex items-center gap-2">
                        <TrophyOutlined className="text-yellow-600" />
                        <span>Thành tích</span>
                      </div>
                    }
                    className="shadow-md rounded-xl"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`p-4 rounded-xl text-center transition-all ${achievement.unlocked
                            ? "bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-400"
                            : "bg-gray-100 opacity-50"
                            }`}
                        >
                          <div className="text-3xl mb-2">{achievement.icon}</div>
                          <Text strong className="text-xs block">{achievement.title}</Text>
                          <Text type="secondary" className="text-xs">
                            {achievement.description}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Study Progress */}
                  <Card className="mt-4 shadow-md rounded-xl">
                    <div className="text-center mb-4">
                      <FireOutlined className="text-4xl text-orange-500 mb-2" />
                      <Title level={4} className="!mb-1">Chuỗi học tập</Title>
                      <Text type="secondary">Học liên tục {stats.streak} ngày</Text>
                    </div>
                    <Progress
                      percent={(stats.streak / 30) * 100}
                      strokeColor={{
                        '0%': '#ff6b6b',
                        '100%': '#ffd93d',
                      }}
                      format={() => `${stats.streak}/30 ngày`}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* Profile Info Tab */}
            <TabPane
              tab={<span><UserOutlined /> Thông tin cá nhân</span>}
              key="info"
            >
              <Card className="shadow-md rounded-xl">
                <div className="flex justify-between items-center mb-6">
                  <Title level={4} className="!mb-0">Thông tin cá nhân</Title>
                  <Button
                    type={isEditing ? "default" : "primary"}
                    icon={<EditOutlined />}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Hủy" : "Chỉnh sửa"}
                  </Button>
                </div>

                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    name: user.name,
                    email: user.email,
                    username: user.username,
                  }}
                  onFinish={handleUpdateProfile}
                  disabled={!isEditing}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Họ và tên"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          size="large"
                          placeholder="Nhập họ và tên"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Username" name="username">
                        <Input
                          prefix={<UserOutlined />}
                          size="large"
                          disabled
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          { required: true, message: "Vui lòng nhập email" },
                          { type: "email", message: "Email không hợp lệ" }
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined />}
                          size="large"
                          placeholder="email@example.com"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Số điện thoại" name="phone">
                        <Input
                          prefix={<PhoneOutlined />}
                          size="large"
                          placeholder="0123456789"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={24}>
                      <Form.Item label="Bio" name="bio">
                        <Input.TextArea rows={3} placeholder="Viết một vài dòng giới thiệu về bạn (ví dụ: học IELTS, thích đọc sách...)" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Giới tính" name="gender">
                        <Select size="large" placeholder="Chọn giới tính">
                          <Select.Option value="MALE">
                            <ManOutlined /> Nam
                          </Select.Option>
                          <Select.Option value="FEMALE">
                            <WomanOutlined /> Nữ
                          </Select.Option>
                          <Select.Option value="OTHER">Khác</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Ngày sinh" name="dob">
                        <DatePicker
                          size="large"
                          style={{ width: '100%' }}
                          placeholder="Chọn ngày sinh"
                          format="DD/MM/YYYY"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {isEditing && (
                    <div className="flex gap-3 justify-end mt-6">
                      <Button
                        size="large"
                        onClick={() => setIsEditing(false)}
                      >
                        Hủy
                      </Button>
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        icon={<CheckCircleOutlined />}
                      >
                        Lưu thay đổi
                      </Button>
                    </div>
                  )}
                </Form>
              </Card>
            </TabPane>

            {/* Settings Tab */}
            <TabPane
              tab={<span><SettingOutlined /> Cài đặt</span>}
              key="settings"
            >
              <Card className="shadow-md rounded-xl">
                <Title level={4} className="!mb-6">Cài đặt tài khoản</Title>

                <div className="space-y-4">
                  <Card className="bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <Text strong className="block">Đổi mật khẩu</Text>
                        <Text type="secondary" className="text-sm">
                          Cập nhật mật khẩu để bảo mật tài khoản
                        </Text>
                      </div>
                      <Button type="primary">Đổi mật khẩu</Button>
                    </div>
                  </Card>

                  <Card className="bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <Text strong className="block">Thông báo</Text>
                        <Text type="secondary" className="text-sm">
                          Quản lý thông báo email và push notification
                        </Text>
                      </div>
                      <Button>Cài đặt</Button>
                    </div>
                  </Card>

                  <Card className="bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <Text strong className="block">Quyền riêng tư</Text>
                        <Text type="secondary" className="text-sm">
                          Quản lý quyền riêng tư và bảo mật
                        </Text>
                      </div>
                      <Button>Cài đặt</Button>
                    </div>
                  </Card>

                  <Divider />

                  <Card className="bg-red-50 border-red-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <Text strong className="block text-red-600">Đăng xuất</Text>
                        <Text type="secondary" className="text-sm">
                          Đăng xuất khỏi tài khoản
                        </Text>
                      </div>
                      <Button
                        danger
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                      >
                        Đăng xuất
                      </Button>
                    </div>
                  </Card>
                </div>
              </Card>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
