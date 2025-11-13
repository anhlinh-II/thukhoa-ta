"use client";

import React, { useState } from "react";
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

  // Mock data - Replace with real API calls
  const topUsers: LeaderboardUser[] = [
    {
      rank: 1,
      id: "1",
      name: "Nguyễn Văn A",
      avatar: undefined,
      score: 2850,
      tests: 45,
      accuracy: 95,
      streak: 30,
      change: 2,
    },
    {
      rank: 2,
      id: "2",
      name: "Trần Thị B",
      avatar: undefined,
      score: 2720,
      tests: 42,
      accuracy: 92,
      streak: 28,
      change: -1,
    },
    {
      rank: 3,
      id: "3",
      name: "Lê Văn C",
      avatar: undefined,
      score: 2650,
      tests: 40,
      accuracy: 90,
      streak: 25,
      change: 1,
    },
    ...Array.from({ length: 47 }, (_, i) => ({
      rank: i + 4,
      id: `${i + 4}`,
      name: `Học viên ${i + 4}`,
      avatar: undefined,
      score: 2500 - i * 50,
      tests: 38 - i,
      accuracy: 88 - i,
      streak: 20 - i,
      change: Math.floor(Math.random() * 21) - 10,
    })),
  ];

  const currentUserRank = topUsers.find((u) => u.id === currentUser?.id) || {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <TrophyOutlined className="text-4xl text-white" />
            </div>
          </div>
          <Title level={1} className="!mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Bảng Xếp Hạng
          </Title>
          <Text type="secondary" className="text-lg">
            Cạnh tranh và vươn lên vị trí cao nhất
          </Text>
        </div>

        {/* Stats Overview */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-lg rounded-xl border-0 bg-gradient-to-br from-blue-500 to-purple-600">
              <Statistic
                title={<Text className="text-white/80">Số người tham gia</Text>}
                value={stats.totalUsers}
                valueStyle={{ color: "#fff", fontSize: "2rem" }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-lg rounded-xl border-0 bg-gradient-to-br from-green-500 to-teal-600">
              <Statistic
                title={<Text className="text-white/80">Điểm trung bình</Text>}
                value={stats.avgScore}
                valueStyle={{ color: "#fff", fontSize: "2rem" }}
                prefix={<RiseOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-lg rounded-xl border-0 bg-gradient-to-br from-yellow-500 to-orange-600">
              <Statistic
                title={<Text className="text-white/80">Điểm cao nhất</Text>}
                value={stats.topScore}
                valueStyle={{ color: "#fff", fontSize: "2rem" }}
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-lg rounded-xl border-0 bg-gradient-to-br from-pink-500 to-red-600">
              <Statistic
                title={<Text className="text-white/80">Hạng của bạn</Text>}
                value={stats.yourRank}
                valueStyle={{ color: "#fff", fontSize: "2rem" }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Top 3 Podium */}
        <Card className="mb-6 shadow-xl rounded-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-6 -m-6 mb-6">
            <Title level={3} className="text-white text-center !mb-0">
              <CrownOutlined className="mr-2" />
              Top 3 Người Dẫn Đầu
            </Title>
          </div>
          
          <div className="flex justify-center items-end gap-4 py-8">
            {/* 2nd Place */}
            {topUsers[1] && (
              <div className="flex flex-col items-center flex-1 max-w-[200px]">
                <Badge count={2} className="mb-2">
                  <Avatar
                    size={80}
                    className="bg-gradient-to-br from-gray-300 to-gray-500 border-4 border-white shadow-xl"
                  >
                    <span className="text-2xl">{getInitials(topUsers[1].name)}</span>
                  </Avatar>
                </Badge>
                <Text strong className="text-lg mt-2">{topUsers[1].name}</Text>
                <div className="w-full bg-gradient-to-br from-gray-300 to-gray-500 rounded-t-xl mt-4 p-4 text-center shadow-xl" style={{ height: 140 }}>
                  <TrophyOutlined className="text-4xl text-white mb-2" />
                  <Text strong className="text-white text-xl block">{topUsers[1].score}</Text>
                  <Text className="text-white/80 text-sm">điểm</Text>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topUsers[0] && (
              <div className="flex flex-col items-center flex-1 max-w-[200px]">
                <Badge count={<CrownOutlined className="text-yellow-500" />} className="mb-2">
                  <Avatar
                    size={100}
                    className="bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-white shadow-2xl"
                  >
                    <span className="text-3xl">{getInitials(topUsers[0].name)}</span>
                  </Avatar>
                </Badge>
                <Text strong className="text-xl mt-2">{topUsers[0].name}</Text>
                <div className="w-full bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-t-xl mt-4 p-6 text-center shadow-2xl" style={{ height: 180 }}>
                  <CrownOutlined className="text-5xl text-white mb-2" />
                  <Text strong className="text-white text-2xl block">{topUsers[0].score}</Text>
                  <Text className="text-white/90 text-sm">điểm</Text>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topUsers[2] && (
              <div className="flex flex-col items-center flex-1 max-w-[200px]">
                <Badge count={3} className="mb-2">
                  <Avatar
                    size={80}
                    className="bg-gradient-to-br from-orange-400 to-orange-600 border-4 border-white shadow-xl"
                  >
                    <span className="text-2xl">{getInitials(topUsers[2].name)}</span>
                  </Avatar>
                </Badge>
                <Text strong className="text-lg mt-2">{topUsers[2].name}</Text>
                <div className="w-full bg-gradient-to-br from-orange-400 to-orange-600 rounded-t-xl mt-4 p-4 text-center shadow-xl" style={{ height: 120 }}>
                  <TrophyOutlined className="text-4xl text-white mb-2" />
                  <Text strong className="text-white text-xl block">{topUsers[2].score}</Text>
                  <Text className="text-white/80 text-sm">điểm</Text>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Your Rank Card */}
        {currentUser && (
          <Card className="mb-6 shadow-lg rounded-xl border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
            <Row align="middle" gutter={16}>
              <Col>
                <Avatar
                  size={64}
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
                  prefix={<StarOutlined className="text-yellow-500" />}
                  valueStyle={{ color: "#1890ff" }}
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
                  <Text strong className="text-2xl text-green-600">{currentUserRank.accuracy}%</Text>
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
              <Table
                columns={columns}
                dataSource={topUsers}
                rowKey="id"
                pagination={{
                  pageSize: 20,
                  showSizeChanger: false,
                  showTotal: (total) => `Tổng ${total} người`,
                }}
                rowClassName={(record) =>
                  record.id === currentUser?.id ? "bg-blue-50" : ""
                }
              />
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
                dataSource={[...topUsers].sort((a, b) => b.streak - a.streak)}
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
