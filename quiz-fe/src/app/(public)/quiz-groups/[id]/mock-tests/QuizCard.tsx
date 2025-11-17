"use client";

import React from "react";
import { Card, Typography, Tag, Divider, Button } from "antd";
import { FileTextOutlined, ClockCircleOutlined, TrophyOutlined, PlayCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Props {
  mockTest: any;
  index: number;
  onStart: (mockTest: any) => void;
}

export default function QuizCard({ mockTest, index, onStart }: Props) {
  return (
    <Card
      key={mockTest.id}
      hoverable
      className="group relative overflow-hidden rounded-2xl shadow-lg border-0 transform-gpu transition duration-400 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        willChange: 'transform, box-shadow',
        transition: 'transform 360ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 360ms cubic-bezier(0.22, 1, 0.36, 1)',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)'
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with Number Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <Text className="text-white font-bold text-sm">#{index + 1}</Text>
              </div>
              <Tag color="gold" className="font-semibold">
                <TrophyOutlined /> Mock Test
              </Tag>
            </div>
            <Title level={4} className="!text-white !mb-2 !mt-0 line-clamp-2">
              {mockTest.examName || mockTest.name}
            </Title>
          </div>
        </div>

        {/* Description */}
        {mockTest.description && (
          <Text className="text-white/90 text-sm block mb-4 line-clamp-2">
            {mockTest.description}
          </Text>
        )}

        <Divider className="!bg-white/20 !my-4" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <FileTextOutlined className="text-2xl text-white mb-1" />
            <div className="text-white font-bold text-lg">
              {mockTest.totalQuestions || 0}
            </div>
            <Text className="text-white/80 text-xs">Câu hỏi</Text>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <ClockCircleOutlined className="text-2xl text-white mb-1" />
            <div className="text-white font-bold text-lg">
              {mockTest.durationMinutes || 60}
            </div>
            <Text className="text-white/80 text-xs">Phút</Text>
          </div>
        </div>

        {/* Action Button */}
        <Button
          type="primary"
          size="large"
          block
          icon={<PlayCircleOutlined />}
          onClick={() => onStart(mockTest)}
          className="!bg-white !text-purple-600 hover:!bg-purple-50 !border-0 !h-12 !font-semibold !rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Bắt đầu làm bài
        </Button>
      </div>
    </Card>
  );
}
