"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Avatar,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  Select,
  Tabs,
  Progress,
  Button,
  Space,
  Badge,
} from "antd";
import {
  TrophyOutlined,
  CrownOutlined,
  FireOutlined,
  RiseOutlined,
  UserOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useAccount } from "@/share/hooks/useAuth";
import { userService } from '@/share/services/user_service/user.service';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar?: string;
  score: number;
  tests: number;
  accuracy: number;
  streak: number;
  change?: number; // Rank change from last week
}

export default function LeaderboardPage() {
  const { data: currentUser } = useAccount();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "alltime">("week");
  const [category, setCategory] = useState<"all" | "reading" | "listening" | "writing">("all");

  // State for users fetched from API (fallback to mock if API fails)
  const [topUsers, setTopUsers] = useState<LeaderboardUser[] | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const confettiCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const confettiLaunchedRef = React.useRef(false);

  const currentUserId = currentUser?.id ? String(currentUser.id) : undefined;

  const currentUserRank = (topUsers || []).find((u) => u.id === currentUserId) || {
    rank: 128,
    id: currentUser?.id || "current",
    name: currentUser?.name || "Bạn",
    score: 1850,
    tests: 24,
    accuracy: 77,
    streak: 7,
  };

  const stats = {
    totalUsers: 1250,
    avgScore: 1820,
    topScore: 2850,
    yourRank: currentUserRank.rank,
  };

  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        // Attempt to fetch paged user views from backend
        const res = await userService.getViewsPagedWithFilter({ skip: 0, take: 100, columns: "*" });
        // Map backend view to LeaderboardUser with sensible defaults for missing fields
        const mapped: LeaderboardUser[] = (res.data || []).map((u: any, idx: number) => ({
          rank: idx + 1,
          id: String(u.id || `u-${idx}`),
          name: u.fullName || u.username || u.firstName || `Người dùng ${idx + 1}`,
          avatar: u.avatarUrl || u.avatar || undefined,
          score: u.score ?? Math.max(1000, (res.summary && res.summary.topScore) || 2000 - idx * 10),
          tests: u.tests ?? Math.max(1, 50 - idx),
          accuracy: u.accuracy ?? Math.max(50, 95 - idx),
          streak: u.streak ?? Math.max(0, 30 - idx),
          change: (Math.floor(Math.random() * 21) - 10),
        }));

        setTopUsers(mapped);
        // Launch confetti once when leaderboard loads with data
        if (!confettiLaunchedRef.current) {
          confettiLaunchedRef.current = true;
          // small delay so UI settles
          setTimeout(() => setConfettiActive(true), 250);
        }
      } catch (err) {
        console.error('Failed to load users, falling back to mock', err);
        // Fallback mock
        const fallback: LeaderboardUser[] = [
          { rank: 1, id: '1', name: 'Nguyễn Văn A', avatar: undefined, score: 2850, tests: 45, accuracy: 95, streak: 30, change: 2 },
          { rank: 2, id: '2', name: 'Trần Thị B', avatar: undefined, score: 2720, tests: 42, accuracy: 92, streak: 28, change: -1 },
          { rank: 3, id: '3', name: 'Lê Văn C', avatar: undefined, score: 2650, tests: 40, accuracy: 90, streak: 25, change: 1 },
          ...Array.from({ length: 47 }, (_, i) => ({
            rank: i + 4,
            id: `${i + 4}`,
            name: `Học viên ${i + 4}`,
            avatar: undefined,
            score: 2500 - i * 50,
            tests: 38 - i,
            accuracy: Math.max(50, 88 - i),
            streak: Math.max(0, 20 - i),
            change: Math.floor(Math.random() * 21) - 10,
          })),
        ];
        setTopUsers(fallback);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <CrownOutlined className="text-yellow-500 text-2xl" />;
      case 2:
        return <TrophyOutlined className="text-gray-400 text-2xl" />;
      case 3:
        return <TrophyOutlined className="text-orange-600 text-2xl" />;
      default:
        return null;
    }
  };

  const getMedalBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600";
      case 2:
        return "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500";
      case 3:
        return "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600";
      default:
        return "bg-gradient-to-br from-purple-500 to-blue-500";
    }
  };

  // --- Confetti / Fireworks (simple canvas confetti) ---
  const startConfetti = (canvas: HTMLCanvasElement, duration = 3000, particleCount = 120) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'];

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotate: number;
      vr: number;
    };

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(2, 8);
      particles.push({
        x: W / 2 + rand(-200, 200),
        y: H * 0.25 + rand(-50, 50),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rand(2, 6),
        size: Math.floor(rand(6, 14)),
        color: colors[Math.floor(rand(0, colors.length))],
        rotate: rand(0, Math.PI * 2),
        vr: rand(-0.2, 0.2),
      });
    }

    let start = performance.now();
    let raf = 0;

    const draw = (now: number) => {
      const t = now - start;
      // resize handling
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
      }

      ctx.clearRect(0, 0, W, H);

      for (let p of particles) {
        p.vy += 0.12; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rotate += p.vr;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotate);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      if (t < duration) {
        raf = requestAnimationFrame(draw);
      } else {
        // fade out
        let fadeStart = performance.now();
        const fade = (now2: number) => {
          const ft = (now2 - fadeStart) / 600;
          ctx.clearRect(0, 0, W, H);
          ctx.globalAlpha = Math.max(1 - ft, 0);
          for (let p of particles) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotate);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            ctx.restore();
          }
          ctx.globalAlpha = 1;
          if (ft < 1) requestAnimationFrame(fade);
        };
        requestAnimationFrame(fade);
      }
    };

    raf = requestAnimationFrame(draw);

    // stop after duration + fade
    setTimeout(() => {
      cancelAnimationFrame(raf);
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } catch (e) {}
    }, duration + 800);
  };

  React.useEffect(() => {
    if (!confettiActive) return;
    const canvas = confettiCanvasRef.current || document.querySelector('#leaderboard-confetti') as HTMLCanvasElement | null;
    if (canvas) startConfetti(canvas, 3000, 140);
    const timer = setTimeout(() => setConfettiActive(false), 3800);
    return () => clearTimeout(timer);
  }, [confettiActive]);

  const columns = [
    {
      title: "Hạng",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      render: (rank: number, record: LeaderboardUser) => (
        <div className="flex items-center gap-2">
          {rank <= 3 ? (
            <div className="flex items-center justify-center w-10 h-10">
              {getMedalIcon(rank)}
            </div>
          ) : (
            <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg font-bold text-gray-600">
              {rank}
            </div>
          )}
          {record.change !== undefined && (
            <div className={`text-xs ${record.change > 0 ? "text-green-600" : record.change < 0 ? "text-red-600" : "text-gray-400"}`}>
              {record.change > 0 && "↑"}
              {record.change < 0 && "↓"}
              {Math.abs(record.change)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Người dùng",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: LeaderboardUser) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            src={record.avatar}
            className={getMedalBg(record.rank)}
          >
            {getInitials(name)}
          </Avatar>
          <div>
            <Text strong>{name}</Text>
            {record.rank <= 3 && (
              <Tag color="gold" className="ml-2">
                TOP {record.rank}
              </Tag>
            )}
            {record.id === currentUser?.id && (
              <Tag color="blue" className="ml-2">
                Bạn
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Điểm",
      dataIndex: "score",
      key: "score",
      width: 120,
      sorter: (a: LeaderboardUser, b: LeaderboardUser) => b.score - a.score,
      render: (score: number) => (
        <div className="flex items-center gap-1">
          <StarOutlined className="text-yellow-500" />
          <Text strong className="text-lg">{score.toLocaleString()}</Text>
        </div>
      ),
    },
    {
      title: "Bài test",
      dataIndex: "tests",
      key: "tests",
      width: 100,
      render: (tests: number) => (
        <Text type="secondary">{tests} bài</Text>
      ),
    },
    {
      title: "Độ chính xác",
      dataIndex: "accuracy",
      key: "accuracy",
      width: 150,
      render: (accuracy: number) => (
        <div className="flex items-center gap-2">
          <Progress
            percent={accuracy}
            size="small"
            strokeColor={{
              "0%": "#108ee9",
              "100%": "#87d068",
            }}
            format={(percent) => `${percent}%`}
          />
        </div>
      ),
    },
    {
      title: "Streak",
      dataIndex: "streak",
      key: "streak",
      width: 100,
      render: (streak: number) => (
        <div className="flex items-center gap-1">
          <FireOutlined className="text-orange-500" />
          <Text>{streak} ngày</Text>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-white py-8">
      {/* Confetti canvas overlay */}
      <canvas id="leaderboard-confetti" ref={confettiCanvasRef} className="pointer-events-none fixed inset-0 z-[9999]" />
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        {/* <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <TrophyOutlined className="text-4xl text-white" />
            </div>
          </div>
        </div> */}

        {/* Top 3 Podium */}
        <div className="mb-6 shadow-xl rounded-2xl border-0 overflow-hidden">
          <div className="bg-sky-500 py-2 mb-6">
            <Title level={3} className="text-white text-center !mb-0">
              <CrownOutlined className="mr-2" />
              Top 3 Người Dẫn Đầu
            </Title>
          </div>
          
          <div className="flex justify-center items-end gap-6 py-8">
            {/* 2nd Place (left) */}
            {topUsers?.[1] ? (
              (() => {
                const u = topUsers[1];
                return (
                  <div className="flex flex-col items-center flex-1 max-w-[220px]">
                    <div className="relative mb-2">
                      <Avatar
                        size={84}
                        src={u.avatar}
                        className="border-4 border-white shadow-xl bg-gray-200"
                      >
                        {getInitials(u.name)}
                      </Avatar>
                      <div className="absolute -top-2 -right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow">2</div>
                    </div>
                    <Text strong className="text-sm mt-1">{u.name}</Text>
                    <div className="w-full rounded-t-2xl mt-4 p-6 text-center shadow-lg" style={{ height: 150, background: 'linear-gradient(180deg,#9aa5b3,#6f7783)' }}>
                      <TrophyOutlined className="text-3xl text-white mb-2" />
                      <Text strong className="text-white text-xl block">{u.score}</Text>
                      <Text className="text-white/80 text-sm">điểm</Text>
                    </div>
                  </div>
                );
              })()
            ) : null}

            {/* 1st Place (center) */}
            {topUsers?.[0] ? (
              (() => {
                const u = topUsers[0];
                return (
                  <div className="flex flex-col items-center flex-1 max-w-[240px]">
                    <div className="relative mb-2">
                      <Avatar
                        size={110}
                        src={u.avatar}
                        className="border-6 border-white shadow-2xl bg-sky-100"
                      >
                        {getInitials(u.name)}
                      </Avatar>
                      <div className="absolute -top-3 -right-2 w-7 h-7 bg-yellow-400 text-white rounded-full flex items-center justify-center text-base shadow"><CrownOutlined /></div>
                    </div>
                    <Text strong className="text-base mt-1">{u.name}</Text>
                    <div className="w-full rounded-t-3xl mt-4 p-8 text-center shadow-2xl" style={{ height: 190, background: 'linear-gradient(180deg,#f5b100,#d69b00)' }}>
                      <CrownOutlined className="text-4xl text-white mb-2" />
                      <Text strong className="text-white text-2xl block">{u.score}</Text>
                      <Text className="text-white/90 text-sm">điểm</Text>
                    </div>
                  </div>
                );
              })()
            ) : null}

            {/* 3rd Place (right) */}
            {topUsers?.[2] ? (
              (() => {
                const u = topUsers[2];
                return (
                  <div className="flex flex-col items-center flex-1 max-w-[220px]">
                    <div className="relative mb-2">
                      <Avatar
                        size={84}
                        src={u.avatar}
                        className="border-4 border-white shadow-xl bg-gray-200"
                      >
                        {getInitials(u.name)}
                      </Avatar>
                      <div className="absolute -top-2 -right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow">3</div>
                    </div>
                    <Text strong className="text-sm mt-1">{u.name}</Text>
                    <div className="w-full rounded-t-2xl mt-4 p-6 text-center shadow-lg" style={{ height: 140, background: 'linear-gradient(180deg,#ff8a00,#ff5e00)' }}>
                      <TrophyOutlined className="text-3xl text-white mb-2" />
                      <Text strong className="text-white text-xl block">{u.score}</Text>
                      <Text className="text-white/80 text-sm">điểm</Text>
                    </div>
                  </div>
                );
              })()
            ) : null}
          </div>
        </div>

        {/* Your Rank Card */}
        {currentUser && (
          <Card className="mb-6 shadow-lg rounded-xl border-2 border-sky-300 bg-gradient-to-r from-sky-50 to-white">
            <Row align="middle" gutter={16}>
                  <Col>
                    <Avatar
                      size={64}
                      src={currentUser?.avatar}
                      className="bg-gradient-to-br from-purple-500 to-blue-500"
                    >
                      {getInitials(currentUserRank.name)}
                    </Avatar>
                  </Col>
              <Col flex={1}>
                <div>
                  <Text type="secondary" className="text-sm">Hạng của bạn</Text>
                  <div className="flex items-center gap-3">
                    <Title level={3} className="!mb-0">#{currentUserRank.rank}</Title>
                    <Text strong className="text-xl">{currentUserRank.name}</Text>
                  </div>
                </div>
              </Col>
              <Col>
                <Statistic
                  title="Điểm"
                  value={currentUserRank.score}
                  prefix={<StarOutlined className="text-sky-500" />}
                  valueStyle={{ color: "#0ea5e9" }}
                />
              </Col>
              <Col>
                <Statistic
                  title="Bài test"
                  value={currentUserRank.tests}
                  suffix="bài"
                />
              </Col>
              <Col>
                <div className="text-center">
                  <Text type="secondary" className="text-sm block">Độ chính xác</Text>
                  <Text strong className="text-2xl text-sky-600">{currentUserRank.accuracy}%</Text>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {/* Filters and Table */}
        <Card className="shadow-xl rounded-2xl border-0">
          <Tabs 
            defaultActiveKey="overall"
            tabBarExtraContent={
              <Space>
                <Select
                  value={timeRange}
                  onChange={setTimeRange}
                  style={{ width: 150 }}
                  options={[
                    { label: "Tuần này", value: "week" },
                    { label: "Tháng này", value: "month" },
                    { label: "Tất cả", value: "alltime" },
                  ]}
                />
                <Select
                  value={category}
                  onChange={setCategory}
                  style={{ width: 150 }}
                  options={[
                    { label: "Tất cả", value: "all" },
                    { label: "Reading", value: "reading" },
                    { label: "Listening", value: "listening" },
                    { label: "Writing", value: "writing" },
                  ]}
                />
              </Space>
            }
          >
            <TabPane
              tab={
                <span>
                  <TrophyOutlined />
                  Bảng xếp hạng tổng
                </span>
              }
              key="overall"
            >
              {loadingUsers && !topUsers ? (
                <div className="py-12 flex items-center justify-center">
                  <div className="text-sky-500">Đang tải bảng xếp hạng...</div>
                </div>
              ) : (
              <Table
                columns={columns}
                dataSource={topUsers || []}
                rowKey="id"
                pagination={{
                  pageSize: 20,
                  showSizeChanger: false,
                  showTotal: (total) => `Tổng ${total} người`,
                }}
                rowClassName={(record) =>
                  record.id === currentUserId ? "bg-blue-50" : ""
                }
              />
              )}
            </TabPane>
            
            <TabPane
              tab={
                <span>
                  <ThunderboltOutlined />
                  Top Streak
                </span>
              }
              key="streak"
            >
              <Table
                columns={columns}
                dataSource={[...(topUsers || [])].sort((a, b) => b.streak - a.streak)}
                rowKey="id"
                pagination={{
                  pageSize: 20,
                  showSizeChanger: false,
                }}
              />
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
