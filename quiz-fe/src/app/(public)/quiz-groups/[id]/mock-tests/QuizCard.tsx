"use client";

import React from "react";
import { Card, Typography, Tag, Divider, Button } from "antd";
import { FileTextOutlined, ClockCircleOutlined, TrophyOutlined, PlayCircleOutlined, CheckCircleOutlined, StarOutlined, ThunderboltOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Props {
  mockTest: any;
  index: number;
  onStart: (mockTest: any) => void;
  onBattle?: (mockTest: any) => void;
}

export default function QuizCard({ mockTest, index, onStart, onBattle }: Props) {
  const fakeAttempts = Math.floor(Math.random() * 50) + 10;
  const fakeAvgScore = (Math.random() * 3 + 7).toFixed(1);

  return (
    <Card
      key={mockTest.id}
      hoverable
      className="group relative overflow-hidden rounded-xl shadow-md border border-sky-200/30 hover:border-sky-300 transition-all duration-300 ease-out hover:shadow-xl"
      style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
        transition: 'all 300ms ease-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)';
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with Number Badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <Text className="text-white font-bold text-xs">#{index + 1}</Text>
              </div>
              <Tag color="gold" className="text-xs font-semibold">
                <TrophyOutlined className="text-xs" /> Mock Test
              </Tag>
            </div>
            <Title level={5} className="!text-white !mb-1 !mt-0 line-clamp-2 !text-base">
              {mockTest.examName || mockTest.name}
            </Title>
          </div>
        </div>

        {/* Description */}
        {mockTest.description && (
          <Text
            className="text-white/90 text-xs block mb-3 line-clamp-2"
            onClick={() => onStart(mockTest)}
            style={{ cursor: 'pointer' }}
          >
            {mockTest.description}
          </Text>
        )}

        <Divider className="!bg-white/20 !my-3" />

        {/* Stats Grid - 4 columns */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/10 backdrop-blur flex items-center justify-center gap-4 rounded-lg p-2 text-center">
            <FileTextOutlined className="text-lg text-white mb-0.5" />
            <div>
              <div className="text-white font-bold text-sm">
              {mockTest.totalQuestions || 0}
            </div>
            <Text className="text-white/80 text-[10px]">Câu hỏi</Text>
            </div>
          </div>
          <div className="bg-white/10 flex items-center justify-center gap-4 backdrop-blur rounded-lg p-2 text-center">
            <ClockCircleOutlined className="text-lg text-white mb-0.5" />
            <div>
              <div className="text-white font-bold text-sm">
              {mockTest.durationMinutes || 60}
            </div>
            <Text className="text-white/80 text-[10px]">Phút</Text>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur flex items-center justify-center gap-4 rounded-lg p-2 text-center">
            <CheckCircleOutlined className="text-lg text-white mb-0.5" />
            <div>
              <div className="text-white font-bold text-sm">
              {fakeAttempts}
            </div>
            <Text className="text-white/80 text-[10px]">Lượt làm</Text>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg flex items-center justify-center gap-4 p-2 text-center">
            <StarOutlined className="text-lg text-white mb-0.5" />
            <div>
              <div className="text-white font-bold text-sm">
              {fakeAvgScore}
            </div>
            <Text className="text-white/80 text-[10px]">Điểm TB</Text>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="primary"
            size="middle"
            block
            icon={<PlayCircleOutlined />}
            onClick={() => onStart(mockTest)}
            className="!bg-white !text-sky-600 hover:!bg-sky-50 !border-0 !h-10 !font-semibold !rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Chi tiết
          </Button>
          {onBattle && (
            <Button
              size="middle"
              block
              icon={<ThunderboltOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onBattle(mockTest);
              }}
              className="!bg-yellow-400 !text-yellow-900 hover:!bg-yellow-300 !border-0 !h-10 !font-semibold !rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Battle
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
